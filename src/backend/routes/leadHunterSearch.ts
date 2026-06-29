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

const DEFAULT_QUERIES = [
  '"need" "luxury car rental" "Monaco"',
  '"looking for" "Rolls-Royce" "chauffeur"',
  '"need" "supercar rental" "Dubai"',
  '"looking for" "yacht charter" "Mediterranean"',
  '"family office" "yacht" "acquisition"',
  '"need" "VIP transport" "Cannes"'
];

type SearchResult = {
  title: string;
  url: string;
  snippet: string;
  query: string;
};

function configuredQueries(topic?: string) {
  if (topic?.trim()) return [topic.trim()];
  const envQueries = process.env.LEAD_HUNTER_QUERIES
    ?.split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
  return envQueries?.length ? envQueries : DEFAULT_QUERIES;
}

function dedupe(results: SearchResult[]) {
  const seen = new Set<string>();
  return results.filter((result) => {
    const key = result.url || `${result.title}:${result.snippet}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
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

async function runLeadHunterOnResult(result: SearchResult) {
  const body = [
    `Public web lead signal from search query: ${result.query}`,
    `Title: ${result.title}`,
    `URL: ${result.url}`,
    `Snippet: ${result.snippet}`
  ].join("\n");

  const message: InboxMessage = await repository.createMessage({
    id: crypto.randomUUID(),
    agentId: LEAD_HUNTER_AGENT_ID,
    source: "website",
    senderName: result.title.slice(0, 80) || "Public Web Signal",
    senderRole: "unknown",
    body,
    urgency: "medium",
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
    metadata: { sourceUrl: result.url, searchQuery: result.query, generatedBy: "lead-search-runner-v1" }
  });

  const approvalPayload = {
    ...intelligence.draft,
    draft: typeof intelligence.draft.draft === "string" ? intelligence.draft.draft : intelligence.execution.draftContent,
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

  return { message, approval, intelligence };
}

router.get("/status", (_req, res) => {
  res.json({
    provider: "serper",
    configured: Boolean(process.env.SERPER_API_KEY),
    mode: "public_web_only",
    autoContact: false,
    approvalRequired: true
  });
});

router.post("/run", asyncRoute(async (req, res) => {
  if (!process.env.SERPER_API_KEY) {
    res.json({
      setupRequired: true,
      provider: "serper",
      envVar: "SERPER_API_KEY",
      message: "Add SERPER_API_KEY in Render environment variables to enable public web lead search.",
      created: 0,
      results: []
    });
    return;
  }

  const limit = Math.min(Math.max(Number(req.body.limit) || 5, 1), 20);
  const perQuery = Math.min(Math.max(Number(req.body.perQuery) || 3, 1), 10);
  const queries = configuredQueries(typeof req.body.topic === "string" ? req.body.topic : undefined).slice(0, 8);
  const rawResults = (await Promise.all(queries.map((query) => serperSearch(query, perQuery)))).flat();
  const results = dedupe(rawResults).slice(0, limit);
  const created = [];

  for (const result of results) {
    created.push(await runLeadHunterOnResult(result));
  }

  res.json({
    setupRequired: false,
    provider: "serper",
    mode: "public_web_only",
    queries,
    found: rawResults.length,
    processed: results.length,
    created: created.length,
    approvals: created.map((item) => ({ id: item.approval.id, title: item.approval.title, riskLevel: item.approval.riskLevel })),
    results
  });
}));

router.use((error: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error("[LeadHunterSearch]", error);
  res.status(500).json({ error: error.message || "Lead Hunter search error" });
});

export default router;
