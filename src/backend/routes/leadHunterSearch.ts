import type { NextFunction, Request, Response } from "express";
import { Router } from "express";
import type { AgentTask, ApprovalItem, InboxMessage } from "../../shared/types";
import { CoreIntelligenceEngine } from "../../agent/core/CoreIntelligenceEngine";
import { repository } from "../data/repository";
import { CommercialIntelligenceEngine, DEFAULT_QUERIES_BY_MODE } from "../../platform/cie";
import type {
  BusinessLine,
  CIECandidate,
  RelevanceScore,
  SearchMode,
  SearchQuality,
  SearchResult
} from "../../platform/cie";

const router = Router();
const LEAD_HUNTER_AGENT_ID = "client-acquisition-agent";
const now = () => new Date().toISOString();
const asyncRoute = (handler: (req: Request, res: Response) => Promise<void>) =>
  (req: Request, res: Response, next: NextFunction) => handler(req, res).catch(next);

type LeadCampaignRequest = {
  campaignName?: string;
  businessLine?: BusinessLine;
  searchMode?: SearchMode;
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
  searchMode: SearchMode;
  offerBrief: string;
  targetSegments: string;
  geography: string;
  maxResults: number;
  searchQueries: string[];
};


function asBusinessLine(value: unknown): BusinessLine {
  return value === "yacht_sale" || value === "yacht_charter" || value === "car_rental" || value === "mixed" ? value : "mixed";
}

function splitList(value?: string) {
  return String(value || "").split(/[,;\n]/).map((item) => item.trim()).filter(Boolean);
}

function normalizeCampaign(body: LeadCampaignRequest): LeadCampaign {
  const businessLine = asBusinessLine(body.businessLine);
  const VALID_MODES: SearchMode[] = ["company_discovery", "demand_discovery", "partner_discovery", "market_intelligence"];
  const searchMode: SearchMode = VALID_MODES.includes(body.searchMode as SearchMode) ? body.searchMode as SearchMode : "company_discovery";
  const customQueries = Array.isArray(body.searchQueries)
    ? body.searchQueries.map((item) => String(item).trim()).filter(Boolean)
    : [];
  const topic = typeof body.topic === "string" && body.topic.trim() ? [body.topic.trim()] : [];
  const envQueries = process.env.LEAD_HUNTER_QUERIES
    ?.split("\n")
    .map((item) => item.trim())
    .filter(Boolean) || [];
  const defaultQueries = DEFAULT_QUERIES_BY_MODE[searchMode][businessLine];
  const searchQueries = (customQueries.length ? customQueries : topic.length ? topic : envQueries.length ? envQueries : defaultQueries).slice(0, 8);

  return {
    campaignName: String(body.campaignName || "Lead Hunter Campaign").trim(),
    businessLine,
    searchMode,
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

// Maps a CIECandidate to the legacy SearchQuality shape for backward-compatible metadata.
function candidateToQuality(candidate: CIECandidate): SearchQuality {
  const gradeToScore: Record<string, number> = { A: 0.9, B: 0.7, C: 0.5, D: 0.2 };
  return {
    accepted: candidate.accepted,
    relevanceScore: candidate.opportunityScore as RelevanceScore,
    confidence: gradeToScore[candidate.opportunityScore] ?? 0.5,
    reason: [
      `Classification: ${candidate.classification}`,
      candidate.evidence?.demandPhrase ? `Demand: "${candidate.evidence.demandPhrase}"` : null,
      candidate.evidence?.locationPhrase ? `Location: "${candidate.evidence.locationPhrase}"` : null,
      candidate.freshness.hasFreshness ? `Freshness: "${candidate.freshness.phrase}"` : null,
      candidate.recommendation
    ].filter(Boolean).join(" | ")
  };
}

async function runLeadHunterOnResult(
  result: SearchResult,
  campaign: LeadCampaign,
  candidate: CIECandidate,
  enabledAgentIds: string[]
) {
  const quality = candidateToQuality(candidate);
  const body = [
    `Campaign: ${campaign.campaignName}`,
    `Business line: ${campaign.businessLine}`,
    `Search mode: ${campaign.searchMode}`,
    `Offer brief: ${campaign.offerBrief || "not specified"}`,
    `Target segments: ${campaign.targetSegments || "not specified"}`,
    `Geography: ${campaign.geography || "not specified"}`,
    `Public web lead signal from search query: ${result.query}`,
    `Title: ${result.title}`,
    `URL: ${result.url}`,
    `Snippet: ${result.snippet}`,
    `CIE Classification: ${candidate.classification}`,
    `Opportunity score: ${candidate.opportunityScore} | Confidence: ${candidate.confidence} | Urgency: ${candidate.urgency}`,
    `Recommendation: ${candidate.recommendation}`,
    candidate.evidence.demandPhrase ? `Demand evidence: "${candidate.evidence.demandPhrase}"` : null,
    candidate.evidence.locationPhrase ? `Location evidence: "${candidate.evidence.locationPhrase}"` : null,
    candidate.freshness.hasFreshness ? `Freshness signal: "${candidate.freshness.phrase}"` : null
  ].filter(Boolean).join("\n");

  const urgencyToLevel = (u: string) =>
    u === "immediate" || u === "high" ? "high" : "medium";

  const message: InboxMessage = await repository.createMessage({
    id: crypto.randomUUID(),
    agentId: LEAD_HUNTER_AGENT_ID,
    source: "website",
    senderName: result.title.slice(0, 80) || "Public Web Signal",
    senderRole: "unknown",
    body,
    urgency: urgencyToLevel(candidate.urgency),
    status: "new",
    classification: "Lead Signal",
    riskLevel: candidate.opportunityScore === "A" ? "high" : "medium",
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
      cieCandidate: {
        classification: candidate.classification,
        opportunityScore: candidate.opportunityScore,
        confidence: candidate.confidence,
        urgency: candidate.urgency,
        commercialPotential: candidate.commercialPotential,
        recommendation: candidate.recommendation,
        evidence: candidate.evidence,
        geoRelevance: candidate.geoRelevance,
        freshness: candidate.freshness
      },
      generatedBy: "cie-v1"
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

router.get("/results", asyncRoute(async (req, res) => {
  const includeArchived = String(req.query.includeArchived || "") === "true";
  const allApprovals = await repository.listApprovals();
  const candidates = allApprovals.filter(a => a.agentId === LEAD_HUNTER_AGENT_ID && a.type === "lead candidate");

  const results = candidates.map(approval => {
    let payload: Record<string, any> = {};
    try { payload = JSON.parse(approval.payload); } catch { /* skip */ }
    if (!includeArchived && payload.cleanupArchived === true) return null;

    const intel     = payload.intelligence || {};
    const draft     = intel.draft || {};
    const reasoning = intel.reasoning || {};
    const decision  = intel.decision  || {};
    const sourceResult   = payload.sourceResult   || {};
    const searchQuality  = payload.searchQuality  || {};

    return {
      id:             approval.id,
      approvalId:     approval.id,
      approvalStatus: approval.status,
      riskLevel:      approval.riskLevel,
      createdAt:      approval.createdAt,

      companyOrPerson:    sourceResult.title || approval.title?.replace(/^Lead candidate from web:\s*/i, "") || "Unknown",
      businessLine:       payload.businessLine || draft.businessLine || "mixed",
      leadCategory:       payload.leadCategory || draft.leadCategory || "",
      targetSegment:      payload.targetSegment || draft.targetSegment || "",
      leadScore:          payload.relevanceScore || draft.relevanceScore || reasoning.leadScore || "",
      confidence:         payload.confidence    ?? draft.confidence    ?? searchQuality.confidence ?? null,

      sourceUrl:          payload.sourceUrl     || draft.sourceUrl     || sourceResult.url || "",
      searchQuery:        sourceResult.query    || "",
      snippet:            sourceResult.snippet  || "",
      searchQualityReason: searchQuality.reason || draft.reason || "",

      recommendation:     decision.recommendation || "",
      rationale:          decision.rationale      || "",

      candidateSummary:      payload.candidateSummary      || draft.candidateSummary || "",
      recommendedNextAction: draft.recommendedNextAction   || "",
      missingItems:          (payload.missingQualificationItems || reasoning.missingQualificationItems || draft.missingQualificationItems || []) as string[],
      draft:                 typeof payload.draft === "string" ? payload.draft : (typeof intel.execution?.draftContent === "string" ? intel.execution.draftContent : ""),
      handoffPending:        draft.handoffPending  || null,
      routedAgentId:         draft.routedAgentId   || null,
      leadScoreReason:       reasoning.leadScoreReason || "",
      riskReason:            reasoning.riskReason      || "",

      toolPlan: intel.execution?.toolPlan || null,

      searchMode:             draft.searchMode            || "company_discovery",
      demandLevel:            draft.demandLevel           || null,
      urgency:                draft.urgency               || null,
      commercialPriority:     draft.commercialPriority    || null,
      estimatedRevenue:       draft.estimatedRevenue      || null,
      bookingWindow:          draft.bookingWindow         || null,
      closingProbability:     draft.closingProbability    || null,
      repeatPotential:        draft.repeatPotential       || null,
      requestType:            draft.requestType           || null,
      operatorRecommendation: draft.operatorRecommendation || null,

      caseId:     null,
      caseStatus: null
    };
  }).filter((item) => item !== null);

  res.json(results);
}));

router.get("/status", (_req, res) => {
  const key = process.env.SERPER_API_KEY ?? "";
  const configured = key.length > 0;
  const keyDiag = configured
    ? {
        exists: true,
        length: key.length,
        first4: key.slice(0, 4),
        last4: key.slice(-4),
        hasLeadingSpace: key !== key.trimStart(),
        hasTrailingSpace: key !== key.trimEnd()
      }
    : { exists: false, length: 0, first4: null, last4: null, hasLeadingSpace: false, hasTrailingSpace: false };

  res.json({
    provider: "serper",
    configured,
    endpoint: "https://google.serper.dev/search",
    method: "POST",
    authHeader: "X-API-KEY",
    contentType: "application/json",
    keyDiagnostics: keyDiag,
    mode: "public_web_only",
    autoContact: false,
    approvalRequired: true,
    supportedBusinessLines: ["yacht_sale", "yacht_charter", "car_rental", "mixed"]
  });
});


type LeadHunterCleanupScope = "rejected" | "low_quality" | "pending" | "all";

function parseApprovalPayload(approval: ApprovalItem): Record<string, any> {
  try {
    const parsed = JSON.parse(approval.payload);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function cleanupScore(payload: Record<string, any>): string {
  return String(
    payload.searchQuality?.relevanceScore ||
    payload.relevanceScore ||
    payload.intelligence?.draft?.relevanceScore ||
    payload.intelligence?.reasoning?.leadScore ||
    ""
  ).toUpperCase();
}

function cleanupClassification(payload: Record<string, any>): string {
  return String(
    payload.intelligence?.draft?.classification ||
    payload.intelligence?.metadata?.cieCandidate?.classification ||
    payload.intelligence?.reasoning?.classification ||
    payload.cieCandidate?.classification ||
    ""
  ).toLowerCase();
}

function shouldCleanupApproval(approval: ApprovalItem, payload: Record<string, any>, scope: LeadHunterCleanupScope): boolean {
  if (payload.cleanupArchived === true) return false;
  if (approval.agentId !== LEAD_HUNTER_AGENT_ID || approval.type !== "lead candidate") return false;

  if (scope === "all") return true;
  if (scope === "pending") return approval.status === "pending";
  if (scope === "rejected") return approval.status === "rejected";

  const score = cleanupScore(payload);
  const classification = cleanupClassification(payload);
  const lowQualityClassifications = new Set(["provider_page", "job_ad", "old_expired", "generic_directory", "irrelevant", "unclear"]);

  return approval.status === "rejected" || ["C", "D", "SPAM"].includes(score) || lowQualityClassifications.has(classification);
}

async function archiveRelatedRecords(approval: ApprovalItem, tasks: AgentTask[]) {
  const archived: { messages: number; tasks: number } = { messages: 0, tasks: 0 };
  if (approval.relatedMessageId) {
    const message = await repository.findMessage(approval.relatedMessageId);
    if (message && message.status !== "archived") {
      await repository.updateMessage({ ...message, status: "archived" });
      archived.messages += 1;
    }

    const relatedTasks = tasks.filter(task => task.relatedMessageId === approval.relatedMessageId && !["completed", "rejected", "failed"].includes(task.status));
    for (const task of relatedTasks) {
      await repository.updateTask(task.id, { status: "rejected" });
      archived.tasks += 1;
    }
  }
  return archived;
}

router.post("/cleanup", asyncRoute(async (req, res) => {
  const requestedScope = String(req.body?.scope || "low_quality") as LeadHunterCleanupScope;
  const allowedScopes: LeadHunterCleanupScope[] = ["rejected", "low_quality", "pending", "all"];
  const scope = allowedScopes.includes(requestedScope) ? requestedScope : "low_quality";
  const reason = String(req.body?.reason || `Lead Hunter cleanup: ${scope}`).slice(0, 240);
  const archivedAt = now();

  const [approvals, tasks] = await Promise.all([
    repository.listApprovals(),
    repository.listTasks()
  ]);

  const targets = approvals
    .map(approval => ({ approval, payload: parseApprovalPayload(approval) }))
    .filter(({ approval, payload }) => shouldCleanupApproval(approval, payload, scope));

  const summary = {
    scope,
    approvalsArchived: 0,
    messagesArchived: 0,
    tasksRejected: 0
  };

  for (const { approval, payload } of targets) {
    const nextPayload = {
      ...payload,
      cleanupArchived: true,
      cleanup: {
        archivedAt,
        archivedBy: "human_operator",
        reason,
        scope,
        previousStatus: approval.status
      }
    };

    await repository.updateApproval(approval.id, {
      status: "done",
      payload: JSON.stringify(nextPayload)
    });
    summary.approvalsArchived += 1;

    const related = await archiveRelatedRecords(approval, tasks);
    summary.messagesArchived += related.messages;
    summary.tasksRejected += related.tasks;
  }

  await repository.logActivity(
    "admin",
    "lead_hunter_cleanup",
    `${summary.approvalsArchived} lead candidate approval(s) archived, ${summary.messagesArchived} message(s) archived, ${summary.tasksRejected} task(s) rejected. Scope: ${scope}`,
    LEAD_HUNTER_AGENT_ID
  );

  res.json(summary);
}));
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

  const cieContext = {
    businessLine: campaign.businessLine,
    searchMode: campaign.searchMode,
    geography: campaign.geography,
    targetSegments: campaign.targetSegments,
    offerBrief: campaign.offerBrief
  };
  const cieResult = CommercialIntelligenceEngine.process(rawResults, cieContext);

  const enabledAgentIds = await activeAgentIds();
  const toProcess = cieResult.accepted.slice(0, campaign.maxResults);
  const created = [];

  for (const candidate of toProcess) {
    const rawResult: SearchResult = {
      title: candidate.title,
      url: candidate.sourceUrl,
      snippet: candidate.snippet,
      query: candidate.query
    };
    created.push(await runLeadHunterOnResult(rawResult, campaign, candidate, enabledAgentIds));
  }

  // Build filteredResults in the same shape as before for UI compatibility
  const filteredResults = cieResult.rejected.slice(0, 20).map(c => ({
    result: { title: c.title, url: c.sourceUrl, snippet: c.snippet, query: c.query } as SearchResult,
    reason: c.rejectionReason || c.classification,
    relevanceScore: c.opportunityScore as RelevanceScore,
    classification: c.classification
  }));

  res.json({
    setupRequired: false,
    provider: "serper",
    mode: "public_web_only",
    autoContact: false,
    approvalRequired: true,
    campaign,
    queries,
    found: rawResults.length,
    accepted: cieResult.accepted.length,
    filtered: cieResult.rejected.length,
    processed: toProcess.length,
    created: created.length,
    activeAgentIds: enabledAgentIds,
    cieStats: cieResult.stats,
    approvals: created.map((item) => ({
      id: item.approval.id,
      title: item.approval.title,
      riskLevel: item.approval.riskLevel,
      score: item.intelligence.draft.relevanceScore,
      handoffPending: item.intelligence.draft.handoffPending
    })),
    results: toProcess.map(c => ({
      title: c.title, url: c.sourceUrl, snippet: c.snippet, query: c.query
    })),
    filteredResults
  });
}));

router.use((error: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error("[LeadHunterSearch]", error);
  res.status(500).json({ error: error.message || "Lead Hunter search error" });
});

export default router;
