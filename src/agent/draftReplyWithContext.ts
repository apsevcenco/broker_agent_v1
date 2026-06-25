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
  riskLevel: RiskLevel;
  knowledgeUsed: Array<{ title: string; category: string; reliability: string }>;
  memoryUsed: Array<{ personName: string; trustLevel: string; context: string }>;
  approvalRequired: boolean;
  safetyNotes: string;
  provider: string;
  mocked: boolean;
}

function buildPrompt(input: DraftReplyInput): string {
  const { message, classification, riskLevel, leadScore, knowledgeResults, memoryEntries } = input;

  const knowledgeSection = knowledgeResults.length
    ? knowledgeResults.slice(0, 5).map((k, i) =>
        `${i + 1}. [${k.reliabilityLevel.toUpperCase()}] ${k.title}\n   ${k.summary}`
      ).join("\n")
    : "No specific knowledge entries matched this enquiry.";

  const memorySection = memoryEntries.length
    ? memoryEntries.slice(0, 4).map((m) =>
        `- ${m.personName} (${m.role}, trust: ${m.trustLevel}): ${m.relationshipStatus}` +
        (m.warnings ? ` | ⚠ ${m.warnings}` : "") +
        (m.agentLearnedObservations ? ` | ${m.agentLearnedObservations}` : "") +
        (m.knownYachtInterests ? ` | Interests: ${m.knownYachtInterests}` : "")
      ).join("\n")
    : "No relationship memory found for this sender.";

  return `You are the Yacht Broker Agent for a Luxury Mobility AI Operating System.
You operate in DRAFT-ONLY mode. This reply will NOT be sent without explicit human admin approval.

━━━ INCOMING MESSAGE ━━━
From: ${message.senderName}${message.senderCompany ? ` (${message.senderCompany})` : ""} | Role: ${message.senderRole}
Source: ${message.source} | Urgency: ${message.urgency}${message.relatedYacht ? ` | Yacht: ${message.relatedYacht}` : ""}${message.relatedDeal ? ` | Deal: ${message.relatedDeal}` : ""}

${message.body}

━━━ AGENT ASSESSMENT ━━━
Classification: ${classification}
Lead Score: ${leadScore}
Risk Level: ${riskLevel}

━━━ VERIFIED KNOWLEDGE (use to inform reply) ━━━
${knowledgeSection}

━━━ RELATIONSHIP MEMORY ━━━
${memorySection}

━━━ MANDATORY SAFETY RULES (do not violate) ━━━
- DRAFT ONLY — no external sending without admin approval
- Never disclose: yacht identity, owner name, exact location, off-market asset details
- Never include: commission figures, commercial terms, financial guarantees
- Never provide: legal advice, tax guidance, flag-state binding opinions
- Never send: NDAs, commission agreements, binding offers, document links
- Acknowledge uncertainty where information is incomplete
- If risk level is high or critical, be especially cautious and brief

━━━ TASK ━━━
Write a professional, discreet draft reply for the Yacht Broker Agent.
- Acknowledge the enquiry by type
- Request appropriate qualification information for this classification
- Define one clear, controlled next step
- Use a senior, discreet, concise tone
- Do not disclose any confidential information
- Do not use filler phrases like "I hope this message finds you well"

Output the draft reply text only. No headings, no explanations, no metadata.`;
}

function buildSafetyNotes(input: DraftReplyInput): string {
  const notes: string[] = [];
  const body = input.message.body.toLowerCase();

  if (requiresApproval(body)) notes.push("Message contains terms requiring approval before any external use.");
  if (input.riskLevel === "critical") notes.push("Critical risk — admin review mandatory before any action.");
  else if (input.riskLevel === "high") notes.push("High risk — careful admin review required.");
  if (agentRules.noYachtIdentityDisclosureWithoutApproval) notes.push("Yacht identity withheld.");
  if (agentRules.noOwnerIdentityDisclosureWithoutApproval) notes.push("Owner identity withheld.");
  if (agentRules.externalMessagesAreDraftsOnlyInV1) notes.push("Draft only — requires admin approval before sending.");

  return notes.join(" ");
}

function templateFallback(input: DraftReplyInput, reason: string): DraftReplyResult {
  const fallbackEntries = mapResultsToKnowledgeEntries(input.knowledgeResults);
  const draft = suggestReply(input.message, input.classification, fallbackEntries);
  return {
    draft,
    riskLevel: input.riskLevel,
    knowledgeUsed: input.knowledgeResults.slice(0, 5).map((k) => ({
      title: k.title,
      category: k.category || "General",
      reliability: k.reliabilityLevel
    })),
    memoryUsed: input.memoryEntries.slice(0, 4).map((m) => ({
      personName: m.personName,
      trustLevel: m.trustLevel,
      context: [m.relationshipStatus, m.warnings, m.agentLearnedObservations].filter(Boolean).join(" | ")
    })),
    approvalRequired: true,
    safetyNotes: `[${reason}] ${buildSafetyNotes(input)}`,
    provider: "template",
    mocked: true
  };
}

export async function draftReplyWithContext(input: DraftReplyInput): Promise<DraftReplyResult> {
  const { riskLevel, knowledgeResults, memoryEntries } = input;

  const knowledgeUsed = knowledgeResults.slice(0, 5).map((k) => ({
    title: k.title,
    category: k.category || "General",
    reliability: k.reliabilityLevel
  }));

  const memoryUsed = memoryEntries.slice(0, 4).map((m) => ({
    personName: m.personName,
    trustLevel: m.trustLevel,
    context: [m.relationshipStatus, m.warnings, m.agentLearnedObservations].filter(Boolean).join(" | ")
  }));

  const safetyNotes = buildSafetyNotes(input);

  try {
    const aiResult = await aiRouter.generateText({
      taskType: "conversation_reply",
      prompt: buildPrompt(input),
      context: { classification: input.classification, riskLevel, leadScore: input.leadScore }
    });

    if (aiResult.mocked) {
      // No real AI provider configured — use template as meaningful draft
      return templateFallback(input, "Template draft — configure an AI provider for LLM-generated replies");
    }

    return {
      draft: aiResult.text,
      riskLevel,
      knowledgeUsed,
      memoryUsed,
      approvalRequired: true,
      safetyNotes,
      provider: aiResult.provider,
      mocked: false
    };
  } catch {
    return templateFallback(input, "Template fallback — AI provider error");
  }
}
