import type { NextFunction, Request, Response } from "express";
import { Router } from "express";
import type { KnowledgeReview, KnowledgeSource } from "../../knowledge/knowledgeTypes";
import { createImportPlan, listImportPlans } from "../../knowledge/importPlanner";
import { chunkText } from "../../knowledge/chunking";
import { retrieveKnowledgeForAgent } from "../../knowledge/retrieval";
import { approveKnowledgeItem, createReviewRequest, listReviews, rejectKnowledgeItem } from "../../knowledge/reviewWorkflow";
import { listSources, createSource, getSource, updateSource } from "../../knowledge/sourceLibrary";

const router = Router();
const now = () => new Date().toISOString();
const asyncRoute = (handler: (req: Request, res: Response) => Promise<void>) =>
  (req: Request, res: Response, next: NextFunction) => handler(req, res).catch(next);

// --- Sources ---

router.get("/sources", asyncRoute(async (req, res) => {
  res.json(await listSources(req.query.agentId ? String(req.query.agentId) : undefined));
}));

router.post("/sources", asyncRoute(async (req, res) => {
  const source: KnowledgeSource = {
    id: crypto.randomUUID(),
    scope: "agent",
    sourceType: "manual",
    language: "en",
    reliabilityLevel: "medium",
    status: "draft",
    metadata: {},
    createdAt: now(),
    updatedAt: now(),
    ...req.body
  };
  res.status(201).json(await createSource(source));
}));

router.get("/sources/:id", asyncRoute(async (req, res) => {
  const source = await getSource(String(req.params.id));
  if (!source) { res.status(404).json({ error: "Source not found" }); return; }
  res.json(source);
}));

router.patch("/sources/:id", asyncRoute(async (req, res) => {
  const source = await updateSource(String(req.params.id), req.body);
  if (!source) { res.status(404).json({ error: "Source not found" }); return; }
  res.json(source);
}));

// --- Chunking ---

router.post("/chunk-text", (req, res) => {
  const { text, maxCharacters } = req.body;
  if (typeof text !== "string" || !text.trim()) {
    res.status(400).json({ error: "text must be a non-empty string" });
    return;
  }
  const chunks = chunkText(text, maxCharacters ? Number(maxCharacters) : 1000);
  res.json({ count: chunks.length, chunks });
});

// --- Retrieval ---

router.post("/retrieve", asyncRoute(async (req, res) => {
  const { agentId, query, limit, includeGlobal } = req.body;
  if (!agentId || !query) {
    res.status(400).json({ error: "agentId and query are required" });
    return;
  }
  const results = await retrieveKnowledgeForAgent({
    agentId: String(agentId),
    query: String(query),
    limit: Number(limit) || 10,
    includeGlobal: includeGlobal !== false
  });
  res.json(results);
}));

// --- Import Plans ---

router.post("/import-plan", asyncRoute(async (req, res) => {
  const plan = await createImportPlan({
    id: crypto.randomUUID(),
    agentId: req.body.agentId || undefined,
    topic: String(req.body.topic || "Untitled"),
    category: String(req.body.category || "General"),
    sourceUrls: Array.isArray(req.body.sourceUrls) ? req.body.sourceUrls : [],
    notes: req.body.notes || undefined,
    reliabilityExpectation: req.body.reliabilityExpectation || "medium",
    status: "planned",
    createdAt: now()
  });
  res.status(201).json(plan);
}));

router.get("/import-plans", asyncRoute(async (req, res) => {
  res.json(await listImportPlans(req.query.agentId ? String(req.query.agentId) : undefined));
}));

// --- Reviews ---

router.get("/reviews", asyncRoute(async (req, res) => {
  res.json(await listReviews(req.query.status as any || undefined));
}));

router.post("/reviews", asyncRoute(async (req, res) => {
  const review: KnowledgeReview = {
    id: crypto.randomUUID(),
    sourceId: req.body.sourceId || undefined,
    knowledgeEntryId: req.body.knowledgeEntryId || undefined,
    reviewer: String(req.body.reviewer || "admin"),
    status: "pending",
    notes: req.body.notes || undefined,
    createdAt: now(),
    updatedAt: now()
  };
  res.status(201).json(await createReviewRequest(review));
}));

router.post("/reviews/:id/approve", asyncRoute(async (req, res) => {
  const review = await approveKnowledgeItem(String(req.params.id), req.body.notes);
  if (!review) { res.status(404).json({ error: "Review not found" }); return; }
  res.json(review);
}));

router.post("/reviews/:id/reject", asyncRoute(async (req, res) => {
  const review = await rejectKnowledgeItem(String(req.params.id), req.body.notes);
  if (!review) { res.status(404).json({ error: "Review not found" }); return; }
  res.json(review);
}));

router.use((error: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error("[KnowledgeEngine]", error);
  res.status(500).json({ error: error.message || "Knowledge engine error" });
});

export default router;
