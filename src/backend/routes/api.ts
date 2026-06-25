import type { NextFunction, Request, Response } from "express";
import { Router } from "express";
import { classifyMessage } from "../../agent/classifyMessage";
import { scoreLead } from "../../agent/leadScoring";
import { suggestMemoryUpdate } from "../../agent/memorySuggestions";
import { assessRisk } from "../../agent/riskAssessment";
import { draftReplyWithContext } from "../../agent/draftReplyWithContext";
import { generateTasks } from "../../agent/taskGenerator";
import { buildKnowledgeQuery, searchKnowledge } from "../../agent/knowledgeSearch";
import { retrieveKnowledgeForAgent } from "../../knowledge/retrieval";
import type { AgentTask, InboxMessage, KnowledgeEntry, Lead, ManagedAsset, MemoryEntry } from "../../shared/types";
import { aiRouter } from "../../ai/aiRouter";
import { activeAgentId } from "../data/agents";
import { findAgentKnowledgeProfile } from "../data/agentProfiles";
import { findKnowledgeTaxonomy } from "../data/knowledgeTaxonomy";
import { repository } from "../data/repository";

const router = Router();
const now = () => new Date().toISOString();
const routeId = (req: Request) => String(req.params.id);
const byAgent = <T extends { agentId?: string }>(items: T[], agentId?: unknown) => agentId ? items.filter((item) => item.agentId === String(agentId)) : items;
const asyncRoute = (handler: (req: Request, res: Response) => Promise<void>) => (req: Request, res: Response, next: NextFunction) => {
  handler(req, res).catch(next);
};


router.get("/agents", asyncRoute(async (_req, res) => {
  res.json(await repository.listAgents());
}));
router.get("/agents/:slug", asyncRoute(async (req, res) => {
  const agent = await repository.findAgentBySlug(String(req.params.slug));
  if (!agent) { res.status(404).json({ error: "Agent not found" }); return; }
  res.json(agent);
}));
router.get("/agents/:slug/profile", asyncRoute(async (req, res) => {
  const agent = await repository.findAgentBySlug(String(req.params.slug));
  if (!agent) { res.status(404).json({ error: "Agent not found" }); return; }
  res.json({ agent, profile: findAgentKnowledgeProfile(agent.slug) });
}));
router.get("/agents/:slug/knowledge-taxonomy", asyncRoute(async (req, res) => {
  const agent = await repository.findAgentBySlug(String(req.params.slug));
  if (!agent) { res.status(404).json({ error: "Agent not found" }); return; }
  res.json({ agent, taxonomy: findKnowledgeTaxonomy(agent.slug) });
}));
router.get("/agents/:slug/context", asyncRoute(async (req, res) => {
  const agent = await repository.findAgentBySlug(String(req.params.slug));
  if (!agent) { res.status(404).json({ error: "Agent not found" }); return; }
  const [knowledge, memory, assets, tasks, approvals] = await Promise.all([
    repository.listKnowledge(),
    repository.listMemory(),
    repository.listAssets(),
    repository.listTasks(),
    repository.listApprovals()
  ]);
  res.json({
    agent,
    profile: findAgentKnowledgeProfile(agent.slug),
    knowledge: byAgent(knowledge, agent.id),
    memory: byAgent(memory, agent.id),
    assets: byAgent(assets, agent.id),
    tasks: byAgent(tasks, agent.id).slice(0, 10),
    approvals: byAgent(approvals, agent.id).filter((item) => item.status === "pending"),
    safety: {
      draftOnly: true,
      requiresApproval: [
        "off-market yacht identity",
        "owner identity",
        "exact location",
        "commercial terms",
        "commission language",
        "document disclosure",
        "legal/tax/flag advice",
        "binding offer language"
      ]
    }
  });
}));
router.get("/agents/:slug/workspace", asyncRoute(async (req, res) => {
  const agent = await repository.findAgentBySlug(String(req.params.slug));
  if (!agent) { res.status(404).json({ error: "Agent not found" }); return; }
  const [messages, leads, tasks, approvals, memory, knowledge, assets, activity] = await Promise.all([
    repository.listMessages(),
    repository.listLeads(),
    repository.listTasks(),
    repository.listApprovals(),
    repository.listMemory(),
    repository.listKnowledge(),
    repository.listAssets(),
    repository.listActivity()
  ]);
  res.json({
    agent,
    counts: {
      inbox: byAgent(messages, agent.id).length,
      leads: byAgent(leads, agent.id).length,
      tasks: byAgent(tasks, agent.id).length,
      approvals: byAgent(approvals, agent.id).filter((item) => item.status === "pending").length,
      memory: byAgent(memory, agent.id).length,
      knowledge: byAgent(knowledge, agent.id).length,
      assets: byAgent(assets, agent.id).length
    },
    recent: {
      memory: byAgent(memory, agent.id).slice(0, 5),
      tasks: byAgent(tasks, agent.id).slice(0, 5),
      approvals: byAgent(approvals, agent.id).slice(0, 5),
      activity: byAgent(activity, agent.id).slice(0, 5)
    }
  });
}));

router.get("/assets", asyncRoute(async (req, res) => {
  res.json(byAgent(await repository.listAssets(), req.query.agentId));
}));
router.post("/assets", asyncRoute(async (req, res) => {
  const asset: ManagedAsset = { id: crypto.randomUUID(), agentId: req.body.agentId || activeAgentId, type: "other", name: "New Asset", status: "draft", metadata: {}, createdAt: now(), updatedAt: now(), ...req.body };
  const created = await repository.createAsset(asset);
  await repository.logActivity("admin", "asset_created", `${asset.type}: ${asset.name}`, asset.agentId);
  res.status(201).json(created);
}));
router.patch("/assets/:id", asyncRoute(async (req, res) => {
  const asset = await repository.updateAsset(routeId(req), { ...req.body, updatedAt: now() });
  if (!asset) { res.status(404).json({ error: "Asset not found" }); return; }
  await repository.logActivity("admin", "asset_updated", `${asset.type}: ${asset.name}`, asset.agentId);
  res.json(asset);
}));

router.get("/settings/ai-providers", (_req, res) => {
  res.json(aiRouter.settings());
});
router.get("/dashboard/summary", asyncRoute(async (_req, res) => {
  res.json(await repository.dashboardSummary());
}));

router.get("/inbox", asyncRoute(async (req, res) => {
  res.json(byAgent(await repository.listMessages(), req.query.agentId));
}));

router.post("/inbox/message", asyncRoute(async (req, res) => {
  const message: InboxMessage = { id: crypto.randomUUID(), agentId: req.body.agentId || activeAgentId, status: "new", createdAt: now(), ...req.body };
  const created = await repository.createMessage(message);
  await repository.logActivity("admin", "message_created", `Manual message from ${message.senderName}`, message.agentId);
  res.status(201).json(created);
}));

router.post("/inbox/:id/classify", asyncRoute(async (req, res) => {
  const message = await repository.findMessage(routeId(req));
  if (!message) { res.status(404).json({ error: "Message not found" }); return; }

  message.classification = classifyMessage(message);
  message.riskLevel = assessRisk(message);
  message.status = "classified";
  await repository.updateMessage(message);

  const leadScore = scoreLead(message);
  const leads = await repository.listLeads();
  const existingLead = leads.find((lead) => lead.agentId === (message.agentId || activeAgentId) && lead.name.toLowerCase() === message.senderName.toLowerCase());
  if (existingLead) {
    await repository.updateLead(existingLead.id, {
      leadScore,
      relationshipHistory: [`Message classified as ${message.classification} on ${now()}`, ...existingLead.relationshipHistory]
    });
  } else {
    await repository.createLead({
      id: crypto.randomUUID(),
      agentId: message.agentId || activeAgentId,
      name: message.senderName,
      company: message.senderCompany,
      role: message.senderRole,
      source: message.source,
      status: "new",
      leadScore,
      interestType: message.classification,
      notes: message.body.slice(0, 240),
      lastContactDate: now().slice(0, 10),
      relationshipHistory: [`Created from inbox message ${message.id}`]
    });
  }

  const tasks = generateTasks(message, leadScore);
  await repository.createTasks(tasks);
  await repository.createApproval({
    id: crypto.randomUUID(),
    agentId: message.agentId || activeAgentId,
    type: "suggested lead score",
    title: `Approve lead score ${leadScore} for ${message.senderName}`,
    payload: `Classification: ${message.classification}\nRisk: ${message.riskLevel}\nMemory: ${suggestMemoryUpdate(message)}`,
    status: "pending",
    riskLevel: message.riskLevel,
    relatedMessageId: message.id,
    createdAt: now()
  });
  await repository.logActivity("agent", "message_classified", `${message.senderName}: ${message.classification}, score ${leadScore}, risk ${message.riskLevel}`, message.agentId);
  res.json({ message, leadScore, tasksCreated: tasks.length });
}));

router.post("/inbox/:id/suggest-reply", asyncRoute(async (req, res) => {
  const message = await repository.findMessage(routeId(req));
  if (!message) { res.status(404).json({ error: "Message not found" }); return; }

  const classification = message.classification || classifyMessage(message);
  const riskLevel = message.riskLevel || assessRisk(message);
  const leadScore = scoreLead(message);
  const agentId = message.agentId || activeAgentId;

  const [knowledgeResults, allMemory] = await Promise.all([
    retrieveKnowledgeForAgent({
      agentId,
      query: buildKnowledgeQuery({ ...message, classification }),
      limit: 5,
      includeGlobal: true
    }),
    repository.listMemory()
  ]);

  const agentMemory = byAgent(allMemory, agentId);
  const senderLower = message.senderName.toLowerCase();
  const senderMatches = agentMemory.filter(m =>
    m.personName.toLowerCase().includes(senderLower) || senderLower.includes(m.personName.toLowerCase())
  );
  const contextMemory = [
    ...senderMatches,
    ...agentMemory.filter(m => !senderMatches.includes(m))
  ].slice(0, 5);

  const result = await draftReplyWithContext({
    message,
    classification,
    riskLevel,
    leadScore,
    knowledgeResults,
    memoryEntries: contextMemory
  });

  message.status = "reply suggested";
  await repository.updateMessage(message);

  const approval = await repository.createApproval({
    id: crypto.randomUUID(),
    agentId,
    type: "suggested reply",
    title: `Reply draft for ${message.senderName}`,
    payload: JSON.stringify(result),
    status: "pending",
    riskLevel: result.riskLevel,
    relatedMessageId: message.id,
    createdAt: now()
  });
  await repository.logActivity("agent", "reply_drafted", `Draft prepared for ${message.senderName} via ${result.provider}${result.mocked ? " (mocked)" : ""}`, message.agentId);
  res.json({ approval, draft: result });
}));

router.get("/leads", asyncRoute(async (req, res) => {
  res.json(byAgent(await repository.listLeads(), req.query.agentId));
}));
router.post("/leads", asyncRoute(async (req, res) => {
  const lead: Lead = { id: crypto.randomUUID(), agentId: req.body.agentId || activeAgentId, relationshipHistory: [], leadScore: "C", status: "new", ...req.body };
  const created = await repository.createLead(lead);
  await repository.logActivity("admin", "lead_created", lead.name, lead.agentId);
  res.status(201).json(created);
}));
router.patch("/leads/:id", asyncRoute(async (req, res) => {
  const lead = await repository.updateLead(routeId(req), req.body);
  if (!lead) { res.status(404).json({ error: "Lead not found" }); return; }
  await repository.logActivity("admin", "lead_updated", lead.name, lead.agentId);
  res.json(lead);
}));
router.post("/leads/:id/score", asyncRoute(async (req, res) => {
  const lead = await repository.updateLead(routeId(req), { leadScore: req.body.leadScore });
  if (!lead) { res.status(404).json({ error: "Lead not found" }); return; }
  await repository.logActivity("agent", "lead_scored", `${lead.name}: ${lead.leadScore}`, lead.agentId);
  res.json(lead);
}));

router.get("/tasks", asyncRoute(async (req, res) => {
  res.json(byAgent(await repository.listTasks(), req.query.agentId));
}));
router.post("/tasks", asyncRoute(async (req, res) => {
  const task: AgentTask = { id: crypto.randomUUID(), agentId: req.body.agentId || activeAgentId, createdAt: now(), status: "new", priority: "medium", ...req.body };
  const created = await repository.createTask(task);
  await repository.logActivity("admin", "task_created", task.title, task.agentId);
  res.status(201).json(created);
}));
router.patch("/tasks/:id", asyncRoute(async (req, res) => {
  const task = await repository.updateTask(routeId(req), req.body);
  if (!task) { res.status(404).json({ error: "Task not found" }); return; }
  await repository.logActivity("admin", "task_updated", task.title, task.agentId);
  res.json(task);
}));

router.get("/approvals", asyncRoute(async (req, res) => {
  res.json(byAgent(await repository.listApprovals(), req.query.agentId));
}));
router.post("/approvals/:id/approve", asyncRoute(async (req, res) => {
  const approval = await repository.updateApproval(routeId(req), { payload: req.body.payload, status: "approved" });
  if (!approval) { res.status(404).json({ error: "Approval not found" }); return; }
  await repository.logActivity("admin", "approval_approved", approval.title, approval.agentId);
  res.json(approval);
}));
router.post("/approvals/:id/reject", asyncRoute(async (req, res) => {
  const approval = await repository.updateApproval(routeId(req), { status: "rejected" });
  if (!approval) { res.status(404).json({ error: "Approval not found" }); return; }
  await repository.logActivity("admin", "approval_rejected", approval.title, approval.agentId);
  res.json(approval);
}));

router.get("/memory", asyncRoute(async (req, res) => {
  res.json(byAgent(await repository.listMemory(), req.query.agentId));
}));
router.post("/memory", asyncRoute(async (req, res) => {
  const entry: MemoryEntry = { id: crypto.randomUUID(), agentId: req.body.agentId || activeAgentId, pastInteractions: [], trustLevel: "unknown", updatedAt: now(), ...req.body };
  const created = await repository.createMemory(entry);
  await repository.logActivity("admin", "memory_created", entry.personName, entry.agentId);
  res.status(201).json(created);
}));
router.patch("/memory/:id", asyncRoute(async (req, res) => {
  const entry = await repository.updateMemory(routeId(req), { ...req.body, updatedAt: now() });
  if (!entry) { res.status(404).json({ error: "Memory entry not found" }); return; }
  await repository.logActivity("admin", "memory_updated", entry.personName, entry.agentId);
  res.json(entry);
}));

router.get("/knowledge", asyncRoute(async (req, res) => {
  const entries = byAgent(await repository.listKnowledge(), req.query.agentId);
  res.json(req.query.q ? searchKnowledge(entries, String(req.query.q)) : entries);
}));
router.post("/knowledge", asyncRoute(async (req, res) => {
  const entry: KnowledgeEntry = { id: crypto.randomUUID(), agentId: req.body.agentId || activeAgentId, createdAt: now(), updatedAt: now(), tags: [], reliabilityLevel: "medium", ...req.body };
  const created = await repository.createKnowledge(entry);
  await repository.logActivity("admin", "knowledge_created", entry.title, entry.agentId);
  res.status(201).json(created);
}));
router.patch("/knowledge/:id", asyncRoute(async (req, res) => {
  const entry = await repository.updateKnowledge(routeId(req), { ...req.body, updatedAt: now() });
  if (!entry) { res.status(404).json({ error: "Knowledge entry not found" }); return; }
  await repository.logActivity("admin", "knowledge_updated", entry.title, entry.agentId);
  res.json(entry);
}));
router.delete("/knowledge/:id", asyncRoute(async (req, res) => {
  const deleted = await repository.deleteKnowledge(routeId(req));
  if (!deleted) { res.status(404).json({ error: "Knowledge entry not found" }); return; }
  await repository.logActivity("admin", "knowledge_deleted", routeId(req));
  res.status(204).send();
}));

router.get("/activity", asyncRoute(async (req, res) => {
  res.json(byAgent(await repository.listActivity(), req.query.agentId));
}));

router.get("/system/persistence", (_req, res) => {
  res.json({ mode: repository.usesSupabase ? "supabase" : "memory" });
});

router.use((error: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error(error);
  res.status(500).json({ error: error.message || "Internal server error" });
});

export default router;














