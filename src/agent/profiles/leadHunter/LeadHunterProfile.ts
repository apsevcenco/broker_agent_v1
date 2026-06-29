import type { ReasoningProfile } from "../ReasoningProfile";
import type { IntelligenceContext } from "../../core/IntelligenceContext";
import type { IntelligenceResponse } from "../../core/IntelligenceResponse";
import type { ToolRequest, ToolRequestPriority, ToolRiskLevel } from "../../core/ToolRequest";
import { RecommendedDecision } from "../../core/RecommendedDecision";
import { buildToolPlan } from "../../core/ToolPlan";
import { resolvePolicy } from "../../core/ToolRegistry";

type BusinessLine = "yacht_sale" | "yacht_charter" | "car_rental" | "mixed";

type LeadHunterCampaign = {
  campaignName?: string;
  businessLine?: BusinessLine;
  offerBrief?: string;
  targetSegments?: string;
  geography?: string;
  sourceUrl?: string;
  searchQuery?: string;
  activeAgentIds?: string[];
};

const BUSINESS_LABEL: Record<BusinessLine, string> = {
  yacht_sale: "Yacht Sale",
  yacht_charter: "Yacht Charter",
  car_rental: "Luxury Car Rental",
  mixed: "Luxury Mobility Lead"
};

const LINE_TERMS: Record<BusinessLine, string[]> = {
  yacht_sale: ["yacht", "superyacht", "motor yacht", "family office", "acquisition", "broker", "manager", "wealth", "off-market", "seller", "sale"],
  yacht_charter: ["yacht charter", "charter", "concierge", "travel advisor", "itinerary", "mediterranean", "summer", "broker", "family office"],
  car_rental: ["car rental", "chauffeur", "vip transfer", "airport transfer", "wedding", "event", "rolls", "bentley", "ferrari", "lamborghini", "hotel", "villa", "private aviation"],
  mixed: ["luxury", "mobility", "concierge", "family office", "vip", "yacht", "charter", "chauffeur", "rental"]
};

const HIGH_RISK_TERMS = ["scrape", "dm everyone", "mass message", "bypass", "private profile", "login", "password", "paid database", "personal phone", "contact list"];
const JUNK_TERMS = ["directory", "yellow pages", "seo", "top 10", "blog", "news", "magazine", "wikipedia", "job", "career"];

function includesAny(text: string, terms: string[]) {
  return terms.some((term) => text.includes(term));
}

function campaign(context: IntelligenceContext): LeadHunterCampaign {
  return (context.metadata?.campaign || context.metadata || {}) as LeadHunterCampaign;
}

function normalizeLine(value: unknown, text: string): BusinessLine {
  if (value === "yacht_sale" || value === "yacht_charter" || value === "car_rental" || value === "mixed") return value;
  if (includesAny(text, LINE_TERMS.car_rental)) return "car_rental";
  if (includesAny(text, LINE_TERMS.yacht_charter)) return "yacht_charter";
  if (includesAny(text, LINE_TERMS.yacht_sale)) return "yacht_sale";
  return "mixed";
}

function routeFor(line: BusinessLine, activeAgentIds: string[] = []) {
  if (line === "yacht_sale") return { routedAgentId: "yacht-broker-agent", handoffPending: null };
  if (line === "yacht_charter") {
    return activeAgentIds.includes("charter-agent")
      ? { routedAgentId: "charter-agent", handoffPending: null }
      : { routedAgentId: null, handoffPending: "charter handoff pending" };
  }
  if (line === "car_rental") {
    return activeAgentIds.includes("car-rental-agent")
      ? { routedAgentId: "car-rental-agent", handoffPending: null }
      : { routedAgentId: null, handoffPending: "car rental handoff pending" };
  }
  return { routedAgentId: "client-acquisition-agent", handoffPending: null };
}

function scoreCandidate(text: string, line: BusinessLine, camp: LeadHunterCampaign) {
  let points = 0;
  const reasons: string[] = [];

  const terms = LINE_TERMS[line];
  const matched = terms.filter((term) => text.includes(term)).slice(0, 5);
  points += matched.length * 10;
  if (matched.length) reasons.push(`matched commercial terms: ${matched.join(", ")}`);

  const segments = String(camp.targetSegments || "").toLowerCase().split(/[,;\n]/).map((s) => s.trim()).filter(Boolean);
  const matchedSegments = segments.filter((segment) => text.includes(segment)).slice(0, 4);
  points += matchedSegments.length * 12;
  if (matchedSegments.length) reasons.push(`matched target segment: ${matchedSegments.join(", ")}`);

  const places = String(camp.geography || "").toLowerCase().split(/[,;\n]/).map((s) => s.trim()).filter(Boolean);
  const matchedPlaces = places.filter((place) => text.includes(place)).slice(0, 4);
  points += matchedPlaces.length * 8;
  if (matchedPlaces.length) reasons.push(`matched geography: ${matchedPlaces.join(", ")}`);

  if (/contact|enquiry|request|need|looking for|concierge|broker|advisor|manager|office|client|vip/.test(text)) {
    points += 12;
    reasons.push("contains commercial intent or relevant role signal");
  }
  if (includesAny(text, JUNK_TERMS)) points -= 18;
  if (text.length < 120) points -= 8;

  const relevanceScore = points >= 58 ? "A" : points >= 40 ? "B" : points >= 24 ? "C" : "D";
  const confidence = Math.max(0.25, Math.min(0.92, points / 80));
  return {
    relevanceScore,
    confidence: Number(confidence.toFixed(2)),
    reason: reasons.length ? reasons.join("; ") : "weak or generic public signal"
  };
}

function riskLevel(text: string) {
  if (includesAny(text, HIGH_RISK_TERMS)) return "high";
  if (/outreach|contact|message|dm|linkedin|instagram|whatsapp|email/.test(text)) return "medium";
  return "low";
}

function categoryFor(line: BusinessLine, text: string) {
  if (line === "car_rental") {
    if (/chauffeur|driver|transfer|airport/.test(text)) return "chauffeur / VIP transfer";
    if (/wedding|event/.test(text)) return "event transport";
    return "luxury car rental";
  }
  if (line === "yacht_charter") return "charter partner / client signal";
  if (line === "yacht_sale") {
    if (/broker/.test(text)) return "broker / acquisition advisor";
    if (/family office|wealth/.test(text)) return "family office / wealth advisor";
    return "yacht sale prospect";
  }
  return "luxury mobility prospect";
}

function missingItems(line: BusinessLine, text: string) {
  const items: string[] = [];
  if (!/date|today|tomorrow|week|month|summer|q[1-4]|202\d/.test(text)) items.push("timing");
  if (!/monaco|dubai|cannes|miami|london|paris|med|italy|france|switzerland|nice|antibes|saint-tropez/.test(text)) items.push("geography");
  if (line === "car_rental") {
    if (!/chauffeur|self-drive|driver|transfer/.test(text)) items.push("chauffeur or self-drive need");
    if (!/rolls|bentley|ferrari|lamborghini|suv|sedan|fleet|vehicle/.test(text)) items.push("vehicle class");
  }
  if (line === "yacht_sale" && !/buyer|seller|mandate|acquisition|family office|broker/.test(text)) items.push("buyer/seller role");
  if (line === "yacht_charter" && !/guests|itinerary|charter|broker|concierge|travel/.test(text)) items.push("charter context");
  return items.slice(0, 5);
}

function draftTone(line: BusinessLine) {
  if (line === "yacht_sale") return "discreet off-market broker outreach";
  if (line === "yacht_charter") return "availability and discreet charter support outreach";
  if (line === "car_rental") return "luxury mobility, chauffeur, VIP transfer and event transport outreach";
  return "discreet luxury mobility outreach";
}

function safetyNotes(line: BusinessLine) {
  if (line === "yacht_sale") return "No owner name, yacht identity, exact location or full specs before qualification and NDA approval.";
  if (line === "yacht_charter") return "No fake availability, no guaranteed yacht, and no sensitive owner details.";
  if (line === "car_rental") return "No fake fleet availability, no guaranteed price, and no automatic booking confirmation.";
  return "No autonomous outreach, no scraping, no platform bypass, and no unapproved claims.";
}

function buildDraft(params: {
  line: BusinessLine;
  label: string;
  category: string;
  score: string;
  confidence: number;
  reason: string;
  missing: string[];
  camp: LeadHunterCampaign;
  handoffPending: string | null;
}) {
  const missing = params.missing.length ? params.missing.join(", ") : "no major qualification gaps from the public signal";
  const handoff = params.handoffPending ? ` Specialist handoff status: ${params.handoffPending}.` : "";
  return [
    `Candidate summary: ${params.label} / ${params.category}. Score ${params.score}, confidence ${params.confidence}.`,
    `Campaign: ${params.camp.campaignName || "Lead Hunter campaign"}. Offer: ${params.camp.offerBrief || "not specified"}`,
    `Reason: ${params.reason}. Missing: ${missing}.${handoff}`,
    `Draft outreach (${draftTone(params.line)}): Thank you for the context. We work with selected luxury mobility requirements in this segment and may be able to support discreetly. If relevant, could you confirm the requirement, timing, location, client profile and preferred next step? We will not assume availability, pricing or confidential details before qualification and approval.`
  ].join("\n\n");
}

function toolRequest(tool: string, reason: string, priority: ToolRequestPriority, risk: ToolRiskLevel, input: Record<string, unknown>): ToolRequest {
  const policy = resolvePolicy(tool);
  const prefix = tool.split(".")[0];
  const category = prefix === "crm" ? "CRM" : prefix === "outreach" ? "EMAIL" : prefix === "search" ? "SEARCH" : prefix === "prepare" ? "DOCUMENT" : prefix === "case" ? "INTERNAL" : "TASK";
  return {
    id: crypto.randomUUID(),
    tool,
    category: category as ToolRequest["category"],
    reason,
    priority,
    approvalRequired: true,
    status: "proposed",
    riskLevel: risk || policy.riskLevel,
    createdAt: new Date().toISOString(),
    input,
    expectedOutput: "Prepared for admin review only. No external contact or tool execution happens without approval."
  };
}

export const LeadHunterProfile: ReasoningProfile = {
  id: "lead-hunter",
  name: "Lead Hunter Agent",
  domain: "client-acquisition",
  version: "1.1.0",
  description: "Finds and qualifies public luxury mobility lead signals, routes them honestly, and prepares compliant outreach drafts. Draft-only in V1.",

  async execute(context: IntelligenceContext): Promise<IntelligenceResponse> {
    const { message, knowledge, memory } = context;
    const camp = campaign(context);
    const text = [message.body, camp.offerBrief, camp.targetSegments, camp.geography].join(" ").toLowerCase();
    const line = normalizeLine(camp.businessLine, text);
    const label = BUSINESS_LABEL[line];
    const category = categoryFor(line, text);
    const route = routeFor(line, camp.activeAgentIds || []);
    const scoring = scoreCandidate(text, line, camp);
    const risk = riskLevel(text);
    const missing = missingItems(line, text);
    const draft = buildDraft({ line, label, category, score: scoring.relevanceScore, confidence: scoring.confidence, reason: scoring.reason, missing, camp, handoffPending: route.handoffPending });

    const decision = scoring.relevanceScore === "D"
      ? RecommendedDecision.ARCHIVE
      : risk === "high"
        ? RecommendedDecision.PROCEED_WITH_CAUTION
        : RecommendedDecision.PROCEED;

    const baseInput = {
      businessLine: line,
      leadCategory: category,
      targetSegment: camp.targetSegments,
      campaignName: camp.campaignName,
      sourceUrl: camp.sourceUrl,
      routedAgentId: route.routedAgentId,
      handoffPending: route.handoffPending,
      score: scoring.relevanceScore,
      confidence: scoring.confidence
    };

    const toolRequests: ToolRequest[] = [
      toolRequest("crm.createLead", "Create lead candidate only after admin approval.", "high", "low", { ...baseInput, name: message.senderName, notes: message.body }),
      toolRequest("case.createOrAttach", "Create or attach a Case for this candidate if approved. Do not execute automatically.", "medium", "medium", { ...baseInput, sourceMessageId: message.id }),
      toolRequest("outreach.prepareDraft", "Prepare outreach draft for admin review. Do not send automatically.", "high", "medium", { ...baseInput, draft }),
      toolRequest("task.reviewLeadCandidate", "Review source, relevance, risk and handoff before contact.", "medium", "low", { ...baseInput, missingQualificationItems: missing })
    ];

    if (camp.offerBrief && /teaser|material|deck|brochure|opportunity|off-market/.test(camp.offerBrief.toLowerCase())) {
      toolRequests.push(toolRequest("prepare.teaserForApproval", "Prepare teaser/materials only for approval; do not share externally.", "medium", "medium", { ...baseInput, offerBrief: camp.offerBrief }));
    }

    const toolPlan = buildToolPlan(
      toolRequests,
      `${toolRequests.length} proposed action(s). Lead Hunter Outreach Preparation V1 is approval-only and sends nothing automatically.`
    );

    return {
      profileId: "lead-hunter",
      agentId: message.agentId,
      createdAt: new Date().toISOString(),
      perception: {
        conversationType: "Lead Signal",
        conversationStage: "Outreach Preparation",
        urgency: message.urgency,
        senderProfile: `${message.senderName} (${message.senderRole})`,
        intentSummary: `${label} candidate from ${message.source}`
      },
      reasoning: {
        leadScore: scoring.relevanceScore,
        leadScoreReason: scoring.reason,
        riskLevel: risk,
        riskReason: `${safetyNotes(line)} Outbound acquisition context requires approval before any contact.`,
        missingQualificationItems: missing,
        knowledgeUsed: knowledge.slice(0, 5).map((k, i) => ({ title: k.title, category: k.category ?? "General", reliability: k.reliabilityLevel, relevance: i === 0 ? "high" : "medium" })),
        memoryUsed: memory.slice(0, 4).map((m) => ({ personName: m.personName, trustLevel: m.trustLevel, context: [m.relationshipStatus, m.warnings, m.agentLearnedObservations].filter(Boolean).join(" | "), relevance: "useful" })),
        adminReasoningSummary: `Business line: ${line}\nLead category: ${category}\nTarget segment: ${camp.targetSegments || "not specified"}\nRouted agent: ${route.routedAgentId || "none"}\nHandoff pending: ${route.handoffPending || "no"}\nScore: ${scoring.relevanceScore}\nConfidence: ${scoring.confidence}\nReason: ${scoring.reason}\nRisk: ${risk}`
      },
      decision: {
        recommendation: decision,
        rationale: route.handoffPending ? `Prepare candidate; ${route.handoffPending}.` : `Prepare candidate and route to ${route.routedAgentId}.`,
        safetyNotes: `${safetyNotes(line)} Draft only. No automatic sending, posting, scraping, or restricted-source access in V1.`,
        approvalRequired: true
      },
      planning: {
        suggestedNextActions: ["Review candidate", "Approve or reject lead creation", "Approve or reject case create/attach", "Edit outreach draft", route.handoffPending || "Route to specialist agent"],
        executionPlan: {
          estimatedDuration: "5-10 minutes human review",
          blockers: missing.slice(0, 3),
          steps: toolRequests.map((request, index) => ({ type: request.tool === "crm.createLead" ? "create_lead" : request.tool === "outreach.prepareDraft" ? "send_draft" : "create_task", description: request.reason, priority: index + 1, requiresApproval: true, data: { tool: request.tool, input: request.input } }))
        }
      },
      execution: { draftContent: draft, draftProvider: "rule-based", draftMocked: false, toolPlan },
      learning: {
        updates: {
          memoryUpdates: [],
          knowledgeCandidates: [],
          experienceCandidates: [{ conversationType: label, outcome: "lead_candidate_prepared", lessonsLearned: ["Lead Hunter Outreach V1 keeps lead creation and outreach approval-only."] }],
          relationshipUpdates: [{ personName: message.senderName, changeType: "new_signal", details: `${label} candidate detected from ${message.source}.` }]
        }
      },
      draft: {
        draft,
        candidateSummary: `${label} / ${category}`,
        businessLine: line,
        leadCategory: category,
        targetSegment: camp.targetSegments,
        routedAgentId: route.routedAgentId,
        handoffPending: route.handoffPending,
        relevanceScore: scoring.relevanceScore,
        confidence: scoring.confidence,
        reason: scoring.reason,
        riskLevel: risk,
        sourceUrl: camp.sourceUrl,
        recommendedNextAction: route.handoffPending ? route.handoffPending : "review and route after approval",
        missingQualificationItems: missing,
        outreachMode: "draft_only"
      }
    };
  }
};