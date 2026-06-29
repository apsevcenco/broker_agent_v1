import type { NextFunction, Request, Response } from "express";
import { Router } from "express";
import type { InboxMessage } from "../../shared/types";
import { CoreIntelligenceEngine } from "../../agent/core/CoreIntelligenceEngine";
import { repository } from "../data/repository";

const router = Router();
const LEAD_HUNTER_AGENT_ID = "client-acquisition-agent";
const now = () => new Date().toISOString();
const asyncRoute = (handler: (req: Request, res: Response) => Promise<void>) =>
  (req: Request, res: Response, next: NextFunction) => handler(req, res).catch(next);

type BusinessLine = "yacht_sale" | "yacht_charter" | "car_rental" | "mixed";
type RelevanceScore = "A" | "B" | "C" | "D";

type LeadCampaignRequest = {
  campaignName?: string;
  businessLine?: BusinessLine;
  offerBrief?: string;
  targetSegments?: string;
  geography?: string;
  maxResults?: number;
  searchQueries?: string[];
  topic?: string;
  limit?: number;
  perQuery?: number;
};

type LeadCampaign = Required<Pick<LeadCampaignRequest, "businessLine">> & {
  campaignName: string;
  offerBrief: string;
  targetSegments: string;
  geography: string;
  maxResults: number;
  searchQueries: string[];
};

type SearchResult = {
  title: string;
  url: string;
  snippet: string;
  query: string;
};

type SearchQuality = {
  accepted: boolean;
  relevanceScore: RelevanceScore;
  confidence: number;
  reason: string;
};

const DEFAULT_QUERIES_BY_LINE: Record<BusinessLine, string[]> = {
  yacht_sale: [
    '"family office" "yacht" "acquisition"',
    '"looking for" "motor yacht" "broker"',
    '"sell my yacht" "broker"',
    '"superyacht" "acquisition" "advisor"'
  ],
  yacht_charter: [
    '"looking for" "yacht charter" "Mediterranean"',
    '"luxury travel advisor" "yacht charter"',
    '"concierge" "yacht charter" "Monaco"',
    '"private client" "yacht charter"'
  ],
  car_rental: [
    '"need" "luxury car rental" "Monaco"',
    '"looking for" "Rolls-Royce" "chauffeur"',
    '"VIP transfer" "Cannes"',
    '"wedding" "luxury car rental"'
  ],
  mixed: [
    '"family office" "yacht" "acquisition"',
    '"looking for" "yacht charter" "Mediterranean"',
    '"need" "luxury car rental" "Monaco"',
    '"VIP transport" "Cannes"'
  ]
};

const LINE_TERMS: Record<BusinessLine, string[]> = {
  yacht_sale: ["yacht", "superyacht", "motor yacht", "family office", "acquisition", "broker", "manager", "wealth", "off-market", "seller", "sale"],
  yacht_charter: ["yacht charter", "charter", "concierge", "travel advisor", "itinerary", "mediterranean", "summer", "broker", "family office"],
  car_rental: ["car rental", "chauffeur", "vip transfer", "airport transfer", "wedding", "event", "rolls", "bentley", "ferrari", "lamborghini", "hotel", "villa", "private aviation"],
  mixed: ["luxury", "mobility", "concierge", "family office", "vip", "yacht", "charter", "chauffeur", "rental"]
};

const INTENT_TERMS = ["looking for", "need", "request", "enquiry", "client", "principal", "family office", "advisor", "concierge", "broker", "manager", "vip", "private client"];
const JUNK_TERMS = ["directory", "yellow pages", "top 10", "best 10", "seo", "wikipedia", "jobs", "career", "vacancy", "press release", "magazine", "news", "blog"];

function asBusinessLine(value: unknown): BusinessLine {
  return value === "yacht_sale" || value === "yacht_charter" || value === "car_rental" || value === "mixed" ? value : "mixed";
}

function splitList(value?: string) {
  return String(value || "").split(/[,;\n]/).map((item) => item.trim()).filter(Boolean);
}

function normalizeCampaign(body: LeadCampaignRequest): LeadCampaign {
  const businessLine = asBusinessLine(body.businessLine);
  const customQueries = Array.isArray(body.searchQueries)
    ? body.searchQueries.map((item) => String(item).trim()).filter(Boolean)
    : [];
  const topic = typeof body.topic === "string" && body.topic.trim() ? [body.topic.trim()] : [];
  const envQueries = process.env.LEAD_HUNTER_QUERIES
    ?.split("\n")
    .map((item) => item.trim())
    .filter(Boolean) || [];
  const defaultQueries = DEFAULT_QUERIES_BY_LINE[businessLine];
  const searchQueries = (customQueries.length ? customQueries : topic.length ? topic : envQueries.length ? envQueries : defaultQueries).slice(0, 8);

  return {
    campaignName: String(body.campaignName || "Lead Hunter Campaign").trim(),
    businessLine,
    offerBrief: String(body.offerBrief || "").trim(),
    targetSegments: String(body.targetSegments || "").trim(),
    geography: String(body.geography || "").trim(),
    maxResults: Math.min(Math.max(Number(body.maxResults ?? body.limit) || 8, 1), 20),
    searchQueries
  };
}

function composeFallbackQuery(campaign: LeadCampaign) {
  const parts = [
    campaign.businessLine.replace("_", " "),
    campaign.targetSegments,
    campaign.geography,
    campaign.offerBrief
  ].filter(Boolean);
  return parts.join(" ").trim();
}

function dedupe(results: SearchResult[]) {
  const seen = new Set<string>();
  const unique: SearchResult[] = [];
  const duplicates: SearchResult[] = [];
  for (const result of results) {
    const key = (result.url || `${result.title}:${result.snippet}`).toLowerCase();
    if (seen.has(key)) {
      duplicates.push(result);
      continue;
    }
    seen.add(key);
    unique.push(result);
  }
  return { unique, duplicates };
}

function scoreSearchResult(result: SearchResult, campaign: LeadCampaign): SearchQuality {
  const text = [result.title, result.url, result.snippet, result.query].join(" ").toLowerCase();
  const lineTerms = campaign.businessLine === "mixed"
    ? [...LINE_TERMS.yacht_sale, ...LINE_TERMS.yacht_charter, ...LINE_TERMS.car_rental]
    : LINE_TERMS[campaign.businessLine];
  const targetTerms = splitList(campaign.targetSegments).map((item) => item.toLowerCase());
  const geographyTerms = splitList(campaign.geography).map((item) => item.toLowerCase());
  let points = 0;
  const reasons: string[] = [];

  const matchedLine = lineTerms.filter((term) => text.includes(term)).slice(0, 5);
  points += matchedLine.length * 12;
  if (matchedLine.length) reasons.push(`matched business terms: ${matchedLine.join(", ")}`);

  const matchedTarget = targetTerms.filter((term) => text.includes(term)).slice(0, 4);
  points += matchedTarget.length * 14;
  if (matchedTarget.length) reasons.push(`matched target segment: ${matchedTarget.join(", ")}`);

  const matchedGeo = geographyTerms.filter((term) => text.includes(term)).slice(0, 4);
  points += matchedGeo.length * 10;
  if (matchedGeo.length) reasons.push(`matched geography: ${matchedGeo.join(", ")}`);

  if (INTENT_TERMS.some((term) => text.includes(term))) {
    points += 14;
    reasons.push("contains commercial intent or role signal");
  }

  if (JUNK_TERMS.some((term) => text.includes(term))) {
    points -= 24;
    reasons.push("generic directory/news/SEO result risk");
  }

  if (!result.url || text.length < 120) points -= 10;

  const relevanceScore: RelevanceScore = points >= 58 ? "A" : points >= 40 ? "B" : points >= 24 ? "C" : "D";
  const confidence = Number(Math.max(0.2, Math.min(0.94, points / 85)).toFixed(2));
  return {
    accepted: relevanceScore !== "D",
    relevanceScore,
    confidence,
    reason: reasons.length ? reasons.join("; ") : "weak or generic public web signal"
  };
}

async function serperSearch(query: string, limit: number): Promise<SearchResult[]> {
  const key = process.env.SERPER_API_KEY;
  if (!key) return [];

  const response = await fetch("https://google.serper.dev/search", {
    method: "POST",
    headers: {
      "X-API-KEY": key,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ q: query, num: Math.min(Math.max(limit, 1), 10) })
  });

  if (!response.ok) {
    throw new Error(`Serper search failed: ${response.status} ${await response.text()}`);
  }

  const data = await response.json() as { organic?: Array<{ title?: string; link?: string; snippet?: string }> };
  return (data.organic || []).map((item) => ({
    title: item.title || "Untitled result",
    url: item.link || "",
    snippet: item.snippet || "",
    query
  })).filter((item) => item.url || item.snippet);
}

async function activeAgentIds() {
  const agents = await repository.listAgents();
  return agents.filter((agent) => agent.status === "active").map((agent) => agent.id);
}

async function runLeadHunterOnResult(result: SearchResult, campaign: LeadCampaign, quality: SearchQuality, enabledAgentIds: string[]) {
  const body = [
    `Campaign: ${campaign.campaignName}`,
    `Business line: ${campaign.businessLine}`,
    `Offer brief: ${campaign.offerBrief || "not specified"}`,
    `Target segments: ${campaign.targetSegments || "not specified"}`,
    `Geography: ${campaign.geography || "not specified"}`,
    `Public web lead signal from search query: ${result.query}`,
    `Title: ${result.title}`,
    `URL: ${result.url}`,
    `Snippet: ${result.snippet}`,
    `Search quality: ${quality.relevanceScore} (${quality.confidence}) - ${quality.reason}`
  ].join("\n");

  const message: InboxMessage = await repository.createMessage({
    id: crypto.randomUUID(),
    agentId: LEAD_HUNTER_AGENT_ID,
    source: "website",
    senderName: result.title.slice(0, 80) || "Public Web Signal",
    senderRole: "unknown",
    body,
    urgency: quality.relevanceScore === "A" ? "high" : "medium",
    status: "new",
    classification: "Lead Signal",
    riskLevel: "medium",
    createdAt: now()
  });

  const intelligence = await CoreIntelligenceEngine.execute("lead-hunter", {
    message,
    knowledge: [],
    memory: [],
    relationshipMemory: [],
    assets: [],
    agent: null,
    capabilities: ["knowledge", "memory", "inbox", "tasks", "crm"],
    companyId: "internal",
    caseProfile: "lead-hunter",
    caseStatus: "open",
    participants: [],
    metadata: {
      campaign: {
        ...campaign,
        sourceUrl: result.url,
        searchQuery: result.query,
        activeAgentIds: enabledAgentIds,
        initialRelevanceScore: quality.relevanceScore,
        initialConfidence: quality.confidence,
        initialReason: quality.reason
      },
      generatedBy: "lead-search-runner-v2"
    }
  });

  const approvalPayload = {
    ...intelligence.draft,
    draft: typeof intelligence.draft.draft === "string" ? intelligence.draft.draft : intelligence.execution.draftContent,
    candidateSummary: intelligence.draft.candidateSummary,
    sourceUrl: result.url,
    businessLine: campaign.businessLine,
    searchQuality: quality,
    sourceResult: result,
    intelligence
  };

  const approval = await repository.createApproval({
    id: crypto.randomUUID(),
    agentId: LEAD_HUNTER_AGENT_ID,
    type: "lead candidate",
    title: `Lead candidate from web: ${result.title.slice(0, 80)}`,
    payload: JSON.stringify(approvalPayload),
    status: "pending",
    riskLevel: intelligence.reasoning.riskLevel as "low" | "medium" | "high" | "critical",
    relatedMessageId: message.id,
    createdAt: now()
  });

  await repository.logActivity(
    "agent",
    "lead_search_candidate_created",
    `${intelligence.draft.leadCategory || "Lead"}: ${result.title}`,
    LEAD_HUNTER_AGENT_ID
  );

  return { message, approval, intelligence, quality };
}

router.get("/status", (_req, res) => {
  res.json({
    provider: "serper",
    configured: Boolean(process.env.SERPER_API_KEY),
    mode: "public_web_only",
    autoContact: false,
    approvalRequired: true,
    supportedBusinessLines: ["yacht_sale", "yacht_charter", "car_rental", "mixed"]
  });
});

router.post("/run", asyncRoute(async (req, res) => {
  const campaign = normalizeCampaign(req.body || {});
  const queries = campaign.searchQueries.length ? campaign.searchQueries : [composeFallbackQuery(campaign)].filter(Boolean);

  if (!process.env.SERPER_API_KEY) {
    res.json({
      setupRequired: true,
      provider: "serper",
      envVar: "SERPER_API_KEY",
      message: "Add SERPER_API_KEY in Render backend environment variables to enable public web lead search.",
      mode: "public_web_only",
      autoContact: false,
      approvalRequired: true,
      campaign,
      queries,
      created: 0,
      results: []
    });
    return;
  }

  const perQuery = Math.min(Math.max(Number(req.body.perQuery) || 4, 1), 10);
  const rawResults = (await Promise.all(queries.map((query) => serperSearch(query, perQuery)))).flat();
  const { unique, duplicates } = dedupe(rawResults);
  const accepted: Array<{ result: SearchResult; quality: SearchQuality }> = [];
  const filtered: Array<{ result: SearchResult; reason: string; relevanceScore?: RelevanceScore }> = duplicates.map((result) => ({ result, reason: "duplicate URL or result" }));

  for (const result of unique) {
    const quality = scoreSearchResult(result, campaign);
    if (quality.accepted) accepted.push({ result, quality });
    else filtered.push({ result, reason: quality.reason, relevanceScore: quality.relevanceScore });
  }

  const enabledAgentIds = await activeAgentIds();
  const selected = accepted.slice(0, campaign.maxResults);
  const created = [];

  for (const item of selected) {
    created.push(await runLeadHunterOnResult(item.result, campaign, item.quality, enabledAgentIds));
  }

  res.json({
    setupRequired: false,
    provider: "serper",
    mode: "public_web_only",
    autoContact: false,
    approvalRequired: true,
    campaign,
    queries,
    found: rawResults.length,
    accepted: accepted.length,
    filtered: filtered.length,
    processed: selected.length,
    created: created.length,
    activeAgentIds: enabledAgentIds,
    approvals: created.map((item) => ({ id: item.approval.id, title: item.approval.title, riskLevel: item.approval.riskLevel, score: item.intelligence.draft.relevanceScore, handoffPending: item.intelligence.draft.handoffPending })),
    results: selected.map((item) => item.result),
    filteredResults: filtered.slice(0, 20)
  });
}));

router.use((error: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error("[LeadHunterSearch]", error);
  res.status(500).json({ error: error.message || "Lead Hunter search error" });
});

export default router;
