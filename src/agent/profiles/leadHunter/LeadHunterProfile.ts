import type { ReasoningProfile } from "../ReasoningProfile";
import type { IntelligenceContext } from "../../core/IntelligenceContext";
import type { IntelligenceResponse } from "../../core/IntelligenceResponse";
import type { ToolRequest, ToolRequestPriority, ToolRiskLevel } from "../../core/ToolRequest";
import { RecommendedDecision } from "../../core/RecommendedDecision";
import { buildToolPlan } from "../../core/ToolPlan";
import { resolvePolicy } from "../../core/ToolRegistry";

const CAR_TERMS = ["car rental", "luxury car", "supercar", "rolls-royce", "rolls royce", "bentley", "ferrari", "lamborghini", "chauffeur", "airport transfer", "vip transport", "wedding car"];
const YACHT_BUY_TERMS = ["buy yacht", "acquire yacht", "acquisition", "looking for yacht", "purchase", "family office", "50m", "superyacht"];
const YACHT_SELL_TERMS = ["sell yacht", "selling yacht", "owner wants to sell", "mandate", "off-market sale"];
const YACHT_CHARTER_TERMS = ["yacht charter", "charter yacht", "apa", "weekly charter", "summer charter"];
const HIGH_RISK_TERMS = ["scrape", "dm everyone", "mass message", "bypass", "private profile", "login", "password", "paid database", "personal phone", "contact list"];

function includesAny(text: string, terms: string[]) {
  return terms.some((term) => text.includes(term));
}

function sentenceCase(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function detectDomain(text: string) {
  if (includesAny(text, CAR_TERMS)) return "Luxury Car Rental";
  if (includesAny(text, YACHT_CHARTER_TERMS)) return "Yacht Charter";
  if (includesAny(text, YACHT_SELL_TERMS)) return "Yacht Sale";
  if (includesAny(text, YACHT_BUY_TERMS)) return "Yacht Purchase";
  return "Luxury Mobility Lead";
}

function targetAgent(domain: string) {
  if (domain === "Luxury Car Rental") return "car-rental-agent";
  if (domain === "Yacht Charter") return "charter-agent";
  if (domain === "Yacht Sale" || domain === "Yacht Purchase") return "yacht-broker-agent";
  return "client-acquisition-agent";
}

function leadScore(text: string, domain: string) {
  let score = 0;
  if (domain !== "Luxury Mobility Lead") score += 2;
  if (/budget|eur|usd|aed|\$|€/.test(text)) score += 2;
  if (/date|tomorrow|today|week|month|summer|event|show|wedding|monaco|dubai|cannes|miami/.test(text)) score += 2;
  if (/family office|principal|ceo|owner|vip|client|buyer|charterer/.test(text)) score += 2;
  if (/phone|email|linkedin|contact|dm|message/.test(text)) score += 1;
  if (score >= 7) return "A";
  if (score >= 5) return "B";
  if (score >= 3) return "C";
  return "D";
}

function missingItems(domain: string, text: string) {
  const items: string[] = [];
  if (!/date|today|tomorrow|week|month|summer|q[1-4]|202\d/.test(text)) items.push("Timing / required dates");
  if (!/budget|eur|usd|aed|\$|€/.test(text)) items.push("Budget or target price range");
  if (!/monaco|dubai|cannes|miami|london|paris|med|italy|france|balearics|location/.test(text)) items.push("Location / operating area");

  if (domain === "Luxury Car Rental") {
    if (!/chauffeur|self-drive|driver/.test(text)) items.push("Self-drive or chauffeur requirement");
    if (!/rolls|bentley|ferrari|lamborghini|suv|sedan|supercar|class/.test(text)) items.push("Preferred vehicle class or model");
  } else if (domain === "Yacht Purchase") {
    if (!/size|m |metre|meter|builder|feadship|benetti|amels|heesen/.test(text)) items.push("Yacht size / builder criteria");
    if (!/pof|proof of funds|financing/.test(text)) items.push("Proof-of-funds / financing process");
  } else if (domain === "Yacht Charter") {
    if (!/guests|cabins|apa|itinerary/.test(text)) items.push("Guests, itinerary and APA expectations");
  }

  return items.slice(0, 6);
}

function riskLevel(text: string) {
  if (includesAny(text, HIGH_RISK_TERMS)) return "high";
  if (/outreach|contact|message|dm|linkedin|instagram|whatsapp|email/.test(text)) return "medium";
  return "low";
}

function buildDraft(params: {
  senderName: string;
  domain: string;
  score: string;
  missing: string[];
  source: string;
}) {
  const car = params.domain === "Luxury Car Rental";
  const intro = car
    ? "I noticed a potential luxury car rental requirement and would treat it as a lead candidate rather than an immediate sales message."
    : "I noticed a potential luxury mobility requirement and would treat it as a lead candidate for review before any outreach.";
  const angle = car
    ? "The relevant qualification points are location, dates, vehicle class, chauffeur versus self-drive, delivery/pickup, passenger profile, occasion and budget."
    : "The relevant qualification points are intent, timing, budget, authority, location, source credibility and whether a specialist agent should take over.";
  const missingText = params.missing.length ? params.missing.join("; ") : "No major qualification gaps detected from the signal.";

  return `${intro}\n\nLead category: ${params.domain}. Preliminary lead score: ${params.score}. Source: ${params.source}.\n\n${angle}\n\nMissing or unconfirmed: ${missingText}.\n\nSuggested outreach draft: Thank you for sharing this requirement. We may be able to help with a discreet luxury mobility solution. To understand whether this is a fit, could you confirm the required dates, location, preferred specification, budget range and whether you would like chauffeur/service support or only sourcing options?`;
}

function toolRequest(tool: string, reason: string, priority: ToolRequestPriority, risk: ToolRiskLevel, input: Record<string, unknown>): ToolRequest {
  const policy = resolvePolicy(tool);
  const entry = tool.split(".")[0].toUpperCase();
  const category = entry === "CRM" ? "CRM" : entry === "EMAIL" ? "EMAIL" : entry === "SEARCH" ? "SEARCH" : entry === "SOCIAL" ? "SOCIAL" : "TASK";
  return {
    id: crypto.randomUUID(),
    tool,
    category: category as ToolRequest["category"],
    reason,
    priority,
    approvalRequired: policy.requiresApproval,
    status: "proposed",
    riskLevel: risk,
    createdAt: new Date().toISOString(),
    input,
    expectedOutput: "Prepared for admin review only. No external contact or tool execution happens without approval."
  };
}

export const LeadHunterProfile: ReasoningProfile = {
  id: "lead-hunter",
  name: "Lead Hunter Agent",
  domain: "client-acquisition",
  version: "1.0.0",
  description: "Finds and qualifies public luxury mobility lead signals, routes them to the right agent, and prepares compliant outreach drafts. Draft-only in V1.",

  async execute(context: IntelligenceContext): Promise<IntelligenceResponse> {
    const { message, knowledge, memory } = context;
    const text = message.body.toLowerCase();
    const domain = detectDomain(text);
    const routedAgentId = targetAgent(domain);
    const score = leadScore(text, domain);
    const risk = riskLevel(text);
    const missing = missingItems(domain, text);
    const decision = risk === "high"
      ? RecommendedDecision.PROCEED_WITH_CAUTION
      : score === "D"
        ? RecommendedDecision.NEED_MORE_INFORMATION
        : RecommendedDecision.PROCEED;
    const draft = buildDraft({ senderName: message.senderName, domain, score, missing, source: message.source });

    const toolRequests: ToolRequest[] = [
      toolRequest("crm.createLead", `Create lead candidate and route to ${routedAgentId}.`, "high", "low", {
        name: message.senderName,
        company: message.senderCompany ?? undefined,
        role: message.senderRole,
        source: message.source,
        category: domain,
        leadScore: score,
        routedAgentId,
        notes: message.body
      }),
      toolRequest("email.prepareDraft", "Prepare outreach draft for admin review. Do not send automatically.", "medium", "medium", {
        recipientName: message.senderName,
        category: domain,
        draft
      }),
      toolRequest("task.create", "Human review required before any outreach or assignment.", "medium", "low", {
        title: `Review ${domain} lead candidate for ${message.senderName}`,
        routedAgentId,
        missingQualificationItems: missing
      })
    ];

    if (message.source === "LinkedIn" || message.source === "Instagram" || /linkedin|instagram|forum|reddit|facebook/.test(text)) {
      toolRequests.unshift(toolRequest("social.searchLead", "Review public source context only; no scraping, joining chats, or contact.", "medium", "medium", {
        source: message.source,
        signalText: message.body.slice(0, 500),
        allowedMode: "public_source_review_only"
      }));
    } else {
      toolRequests.unshift(toolRequest("search.webResearch", "Optional public web research to verify the lead signal and company context.", "medium", "medium", {
        query: `${message.senderName} ${message.senderCompany ?? ""} ${domain}`.trim(),
        allowedMode: "public_web_only"
      }));
    }

    const toolPlan = buildToolPlan(
      toolRequests,
      `${toolRequests.length} proposed action(s). Lead Hunter V1 is research and draft only; all actions require admin approval.`
    );

    return {
      profileId: "lead-hunter",
      agentId: message.agentId,
      createdAt: new Date().toISOString(),
      perception: {
        conversationType: "Lead Signal",
        conversationStage: "Lead Candidate Review",
        urgency: message.urgency,
        senderProfile: `${message.senderName} (${message.senderRole})`,
        intentSummary: `${domain} signal from ${message.source}`
      },
      reasoning: {
        leadScore: score,
        leadScoreReason: `${sentenceCase(domain)} signal with ${missing.length ? `${missing.length} missing qualification item(s)` : "enough context for initial review"}.`,
        riskLevel: risk,
        riskReason: risk === "high"
          ? "Signal mentions restricted or unsafe acquisition behavior; manual review required."
          : "Outbound acquisition context requires human approval before contact.",
        missingQualificationItems: missing,
        knowledgeUsed: knowledge.slice(0, 5).map((k, i) => ({
          title: k.title,
          category: k.category ?? "General",
          reliability: k.reliabilityLevel,
          relevance: i === 0 ? "high" : "medium"
        })),
        memoryUsed: memory.slice(0, 4).map((m) => ({
          personName: m.personName,
          trustLevel: m.trustLevel,
          context: [m.relationshipStatus, m.warnings, m.agentLearnedObservations].filter(Boolean).join(" | "),
          relevance: "useful"
        })),
        adminReasoningSummary: `Lead category: ${domain}\nRouted agent: ${routedAgentId}\nLead score: ${score}\nRisk: ${risk}\nMissing: ${missing.length ? missing.join("; ") : "none"}\nSafety: no autonomous outreach, no scraping, no platform bypass.`
      },
      decision: {
        recommendation: decision,
        rationale: `Create a lead candidate and review outreach before any contact. Route to ${routedAgentId}.`,
        safetyNotes: "Draft only. No automatic sending, posting, chat joining, scraping, or restricted-source access in V1.",
        approvalRequired: true
      },
      planning: {
        suggestedNextActions: [
          "Verify public source context",
          "Create lead candidate",
          "Prepare outreach draft",
          "Route to specialist agent",
          "Request human approval before contact"
        ],
        executionPlan: {
          estimatedDuration: "5-10 minutes human review",
          blockers: missing.slice(0, 3),
          steps: toolRequests.map((request, index) => ({
            type: request.tool === "crm.createLead" ? "create_lead" : request.tool === "email.prepareDraft" ? "send_draft" : "create_task",
            description: request.reason,
            priority: index + 1,
            requiresApproval: true,
            data: { tool: request.tool, input: request.input }
          }))
        }
      },
      execution: {
        draftContent: draft,
        draftProvider: "rule-based",
        draftMocked: false,
        toolPlan
      },
      learning: {
        updates: {
          memoryUpdates: [],
          knowledgeCandidates: [],
          experienceCandidates: [{ conversationType: domain, outcome: "lead_candidate_created", lessonsLearned: ["Lead Hunter V1 keeps acquisition research draft-only until approval."] }],
          relationshipUpdates: [{ personName: message.senderName, changeType: "new_signal", details: `${domain} lead signal detected from ${message.source}.` }]
        }
      },
      draft: {
        draft,
        leadCategory: domain,
        routedAgentId,
        leadScore: score,
        riskLevel: risk,
        missingQualificationItems: missing,
        source: message.source,
        outreachMode: "draft_only"
      }
    };
  }
};
