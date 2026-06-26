import type { InboxMessage, LeadScore, MemoryEntry, RiskLevel } from "../shared/types";
import type { RetrievalResult } from "../knowledge/knowledgeTypes";
import { aiRouter } from "../ai/aiRouter";
import { mapResultsToKnowledgeEntries } from "../knowledge/retrieval";
import { agentRules, requiresApproval } from "./rules";
import { suggestReply } from "./suggestReply";

export interface DraftReplyInput {
  message: InboxMessage;
  classification: string;
  riskLevel: RiskLevel;
  leadScore: LeadScore;
  knowledgeResults: RetrievalResult[];
  memoryEntries: MemoryEntry[];
}

export interface DraftReplyResult {
  draft: string;
  conversationType: string;
  conversationStage: string;
  leadScore: string;
  leadScoreReason: string;
  riskLevel: RiskLevel;
  riskReason: string;
  missingQualificationItems: string[];
  suggestedNextActions: string[];
  knowledgeUsed: Array<{
    title: string;
    category: string;
    reliability: string;
    relevance: "high" | "medium" | "background";
  }>;
  memoryUsed: Array<{
    personName: string;
    trustLevel: string;
    context: string;
    relevance: "critical" | "useful" | "historical";
  }>;
  safetyNotes: string;
  approvalRequired: boolean;
  adminReasoningSummary: string;
  provider: string;
  mocked: boolean;
}

// Raw JSON structure returned by PBRE call
interface PBREResponse {
  conversationType: string;
  conversationStage: string;
  leadScore: string;
  leadScoreReason: string;
  riskLevel: string;
  riskReason: string;
  missingQualificationItems: string[];
  suggestedNextActions: string[];
  knowledgeRelevance: Record<string, string>;
  memoryRelevance: Record<string, string>;
  draft: string;
  safetyNotes: string;
  adminReasoningSummary: string;
}

const CONVERSATION_TYPES = [
  "Buyer Inquiry", "Seller Inquiry", "Broker Inquiry",
  "Captain", "Management Company", "Surveyor", "Shipyard",
  "Lawyer", "Charter Request", "Unknown"
] as const;

const CONVERSATION_STAGES = [
  "Initial Contact", "Qualification", "NDA", "Disclosure",
  "Inspection", "Offer", "Negotiation", "Survey", "Closing", "After Sale"
] as const;

const VALID_RISK: Set<string> = new Set(["low", "medium", "high", "critical"]);
const VALID_K_REL: Set<string> = new Set(["high", "medium", "background"]);
const VALID_M_REL: Set<string> = new Set(["critical", "useful", "historical"]);

function buildSystemPrompt(): string {
  return `You are the Professional Brokerage Reasoning Engine (PBRE) for a Luxury Mobility AI Operating System.

Your task: analyse yacht brokerage enquiries and produce structured intelligence — reasoning assessment plus a professional draft reply — in a single JSON response.

BROKER PERSONA:
You write and reason as a 20-year senior superyacht broker specialising in off-market transactions, NDA processes, owner mandates, and buyer qualification. You are familiar with how qualified buyers behave versus window-shoppers, how brokers fish for listings, and how sellers test the market. You understand survey, negotiation, inspection and closing stages. You are commercially aware, discreet, calm, and direct.

DRAFT REPLY RULES:
- 3-5 sentences for standard enquiries; for complex professional advisory questions use 5-8 concise bullets or short paragraphs with practical substance
- Never disclose: yacht identity, owner name or nationality, exact location, off-market listing details, commission figures
- Never promise: specific yachts, prices, delivery timelines, or legal/tax opinions
- For flag, VAT/tax, class, insurance, commercial-use or regulatory questions: list the facts needed for specialist review, explain boundaries, and do not recommend a final flag, tax, legal or compliance position
- For flag/VAT/class/insurance/commercial-use questions, give a useful broker-level framework: explain how use profile, cruising area, ownership structure, import/VAT status, charter plans, class history, crew model, insurance warranties and resale strategy interact
- Do not answer complex advisory questions with only "speak to specialists"; provide the safe professional overview first, then say which points require tax/legal/flag/class/insurance review
- Answer professional yacht-industry questions directly at a high level when safe; do not use NDA as the default response to ordinary questions
- Request NDA only when the next step requires controlled disclosure of specific yacht identity, owner identity, exact location, private documents, data room access, off-market listing details, or when the client explicitly asks to proceed under NDA
- Never commit to sending: NDAs, commission agreements, contracts, or binding offers — those go to admin approval
- Ask only for qualification items that are actually missing — do not interrogate or ask what is already known
- Define exactly one controlled next step per reply
- Write in direct, formal broker language — no filler phrases ("I hope this finds you well"), no AI disclaimers, no apologies

COMPLEX ADVISORY REPLY SHAPE:
When the client asks a professional multi-part question, the draft should normally include:
1. A direct acknowledgement of the commercial context.
2. A concise framework of the key considerations, not a generic deferral.
3. The specific facts still needed from the client.
4. Clear boundaries on legal/tax/flag/class/insurance advice.
5. One controlled next step.
RETURN FORMAT:
Return ONLY a valid JSON object. No markdown fences. No preamble. No trailing text.
All string values must be properly JSON-escaped.`;
}

function buildUserPrompt(input: DraftReplyInput): string {
  const { message, classification, riskLevel, leadScore, knowledgeResults, memoryEntries } = input;

  const convTypeList = CONVERSATION_TYPES.map(t => `"${t}"`).join(", ");
  const convStageList = CONVERSATION_STAGES.map(s => `"${s}"`).join(", ");

  const knowledgeLines = knowledgeResults.slice(0, 5).map((k, i) =>
    `  [${i}] [${k.reliabilityLevel.toUpperCase()}] ${k.title} (${k.category ?? "General"}) — ${k.summary}`
  );

  const memoryLines = memoryEntries.slice(0, 4).map((m, i) =>
    `  [${i}] ${m.personName} (${m.role}, trust: ${m.trustLevel}) — ${m.relationshipStatus}` +
    (m.knownYachtInterests ? ` | Interests: ${m.knownYachtInterests}` : "") +
    (m.preferredCommunicationStyle ? ` | Communication style: ${m.preferredCommunicationStyle}` : "") +
    (m.dealHistory ? ` | Deal history: ${m.dealHistory}` : "") +
    (m.warnings ? ` | ⚠ Warning: ${m.warnings}` : "") +
    (m.agentLearnedObservations ? ` | Agent notes: ${m.agentLearnedObservations}` : "")
  );

  const kSection = knowledgeLines.length
    ? `KNOWLEDGE BASE (retrieved entries — rate each by relevance to this specific enquiry):
${knowledgeLines.join("\n")}
→ "knowledgeRelevance": {"0": "high"|"medium"|"background", ...} — omit entries with no relevance to this enquiry`
    : "KNOWLEDGE BASE: No entries matched this enquiry.";

  const mSection = memoryLines.length
    ? `RELATIONSHIP MEMORY (known contacts — rate each by relevance):
${memoryLines.join("\n")}
→ "memoryRelevance": {"0": "critical"|"useful"|"historical", ...} — omit entries with no relevance`
    : "RELATIONSHIP MEMORY: No entries found for this sender.";

  return `INCOMING ENQUIRY:
From: ${message.senderName}${message.senderCompany ? ` (${message.senderCompany})` : ""} | Role: ${message.senderRole}
Source: ${message.source} | Urgency: ${message.urgency}${message.relatedYacht ? ` | Yacht ref: ${message.relatedYacht}` : ""}${message.relatedDeal ? ` | Deal: ${message.relatedDeal}` : ""}

MESSAGE TEXT:
${message.body}

PRELIMINARY SYSTEM SIGNALS (for your consideration — override with your own reasoning):
  Classification: ${classification}
  Lead score: ${leadScore}
  Risk: ${riskLevel}

${kSection}

${mSection}

TASK — Analyse this enquiry and return a JSON object with EXACTLY these fields:

{
  "conversationType": one of [${convTypeList}],
  "conversationStage": one of [${convStageList}],
  "leadScore": "A" | "B" | "C" | "D"
    (A = highly qualified: budget confirmed, builders/size specified, POF discussed, decision maker identified;
     B = partially qualified: intent clear, key signals present, some qualification missing;
     C = early stage: intent present, minimal qualification signals;
     D = unqualified, spam, or no actionable information),
  "leadScoreReason": "which qualification signals ARE present and which key ones are MISSING — be specific, reference the message",
  "riskLevel": "low" | "medium" | "high" | "critical"
    (low = general discussion; medium = off-market interest, no sensitive requests;
     high = commission, mandate, document requests; critical = owner identity, yacht identity, legal/financial commitments),
  "riskReason": "what specifically drives this risk level — reference the actual message content, not a generic description",
  "missingQualificationItems": [
    list ONLY items that are genuinely missing and needed to qualify this specific enquiry type —
    for a Buyer Inquiry: preferred builders, yacht size, commercial/private use, delivery timeframe, cruising area, budget confirmation, proof of funds process, broker representation, purchase authority;
    for a Seller Inquiry: ownership authority, documentation readiness, current location, reason for sale, urgency, mandate status, confidentiality requirements;
    for Broker Inquiry: mandate confirmation, buyer qualification, confidentiality expectations;
    omit items already answered in the message
  ],
  "suggestedNextActions": [
    ordered list of concrete broker actions - e.g. "Answer question professionally", "Create lead in CRM",
    "Schedule qualification call", "Request proof of funds", "Request specialist review",
    "Prepare teaser", "Wait for owner approval", "Add memory note", "Create task", "Review survey";
    use "Request NDA" only when controlled disclosure is actually required now
  ],
  "knowledgeRelevance": {"<index>": "high"|"medium"|"background"},
  "memoryRelevance": {"<index>": "critical"|"useful"|"historical"},
  "draft": "the complete professional draft reply, written in the senior broker voice, ready for admin review and approval - do NOT include any internal notes, risk levels, or metadata in the draft itself. For complex flag, VAT/tax, class, insurance, commercial-use or regulatory enquiries, provide a substantive broker-level overview before recommending specialist review. Cover the main considerations relevant to the question, name the facts needed for review, and state that final advice requires the relevant specialist; do not recommend a final jurisdiction, flag or tax position.",
  "safetyNotes": "what was withheld from the draft and why — be specific about constraints applied",
  "adminReasoningSummary": "structured multi-line summary for admin review only:\\n\\nConversation Type: ...\\nConversation Stage: ...\\n\\nLead Score: X\\nReason: [specific signals present and missing]\\n\\nRisk: [level]\\nReason: [specific risk drivers from this message]\\n\\nDraft approach: [what the draft does and why, what next step it proposes and why that step is appropriate now]"
}`;
}

function safetyNotesSummary(input: DraftReplyInput): string {
  const notes: string[] = [];
  if (requiresApproval(input.message.body.toLowerCase())) notes.push("High-risk terms detected.");
  if (agentRules.noYachtIdentityDisclosureWithoutApproval) notes.push("Yacht identity withheld.");
  if (agentRules.noOwnerIdentityDisclosureWithoutApproval) notes.push("Owner identity withheld.");
  if (agentRules.externalMessagesAreDraftsOnlyInV1) notes.push("Draft only — admin approval required before sending.");
  return notes.join(" ");
}

function templateFallback(input: DraftReplyInput, reason: string): DraftReplyResult {
  const draft = suggestReply(input.message, input.classification, mapResultsToKnowledgeEntries(input.knowledgeResults));
  return {
    draft,
    conversationType: "Unknown",
    conversationStage: "Initial Contact",
    leadScore: input.leadScore,
    leadScoreReason: "Template fallback — LLM scoring unavailable.",
    riskLevel: input.riskLevel,
    riskReason: "Preliminary keyword assessment — LLM reasoning unavailable.",
    missingQualificationItems: [],
    suggestedNextActions: ["Review message manually", "Create lead if qualified", "Add memory note"],
    knowledgeUsed: input.knowledgeResults.slice(0, 5).map((k, i) => ({
      title: k.title,
      category: k.category ?? "General",
      reliability: k.reliabilityLevel,
      relevance: (i === 0 ? "high" : i === 1 ? "medium" : "background") as "high" | "medium" | "background"
    })),
    memoryUsed: input.memoryEntries.slice(0, 4).map((m) => ({
      personName: m.personName,
      trustLevel: m.trustLevel,
      context: [m.relationshipStatus, m.warnings, m.agentLearnedObservations].filter(Boolean).join(" | "),
      relevance: "useful" as const
    })),
    safetyNotes: `[${reason}] ${safetyNotesSummary(input)}`,
    approvalRequired: true,
    adminReasoningSummary: `[${reason}]\n\nConversation Stage: Unknown\nLead Score: ${input.leadScore} (system keyword)\nRisk: ${input.riskLevel} (system keyword)`,
    provider: "template",
    mocked: true
  };
}

export async function draftReplyWithContext(input: DraftReplyInput): Promise<DraftReplyResult> {
  try {
    const aiResult = await aiRouter.generateText({
      taskType: "conversation_reply",
      prompt: buildUserPrompt(input),
      context: {
        systemPrompt: buildSystemPrompt(),
        jsonMode: true,
        model: "gpt-4o"
      }
    });

    if (aiResult.mocked) {
      return templateFallback(input, "Template draft — configure an AI provider for PBRE reasoning");
    }

    // Strip markdown fences the model might include despite the instruction
    const raw = aiResult.text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();

    let parsed: PBREResponse;
    try {
      parsed = JSON.parse(raw) as PBREResponse;
    } catch {
      return templateFallback(input, "PBRE parse error — LLM returned non-JSON output");
    }

    const riskLevel = VALID_RISK.has(parsed.riskLevel)
      ? (parsed.riskLevel as RiskLevel)
      : input.riskLevel;

    const kRel = parsed.knowledgeRelevance ?? {};
    const mRel = parsed.memoryRelevance ?? {};

    return {
      draft: parsed.draft ?? "",
      conversationType: (CONVERSATION_TYPES as readonly string[]).includes(parsed.conversationType)
        ? parsed.conversationType
        : "Unknown",
      conversationStage: (CONVERSATION_STAGES as readonly string[]).includes(parsed.conversationStage)
        ? parsed.conversationStage
        : "Initial Contact",
      leadScore: /^[ABCD]$/.test(parsed.leadScore ?? "") ? parsed.leadScore : input.leadScore,
      leadScoreReason: parsed.leadScoreReason ?? "",
      riskLevel,
      riskReason: parsed.riskReason ?? "",
      missingQualificationItems: Array.isArray(parsed.missingQualificationItems)
        ? parsed.missingQualificationItems
        : [],
      suggestedNextActions: Array.isArray(parsed.suggestedNextActions)
        ? parsed.suggestedNextActions
        : [],
      knowledgeUsed: input.knowledgeResults.slice(0, 5).map((k, i) => ({
        title: k.title,
        category: k.category ?? "General",
        reliability: k.reliabilityLevel,
        relevance: (VALID_K_REL.has(kRel[String(i)]) ? kRel[String(i)] : "medium") as "high" | "medium" | "background"
      })),
      memoryUsed: input.memoryEntries.slice(0, 4).map((m, i) => ({
        personName: m.personName,
        trustLevel: m.trustLevel,
        context: [m.relationshipStatus, m.warnings, m.agentLearnedObservations].filter(Boolean).join(" | "),
        relevance: (VALID_M_REL.has(mRel[String(i)]) ? mRel[String(i)] : "useful") as "critical" | "useful" | "historical"
      })),
      safetyNotes: parsed.safetyNotes ?? safetyNotesSummary(input),
      approvalRequired: true,
      adminReasoningSummary: parsed.adminReasoningSummary ?? "",
      provider: aiResult.provider,
      mocked: false
    };
  } catch {
    return templateFallback(input, "Template fallback — AI provider error");
  }
}
