import { Router } from "express";
import { classifyMessage } from "../../agent/classifyMessage";
import { scoreLead } from "../../agent/leadScoring";
import { suggestMemoryUpdate } from "../../agent/memorySuggestions";
import { assessRisk } from "../../agent/riskAssessment";
import { suggestReply } from "../../agent/suggestReply";
import { generateTasks } from "../../agent/taskGenerator";
import { searchKnowledge } from "../../agent/knowledgeSearch";
import type { InboxMessage, KnowledgeEntry, Lead, MemoryEntry } from "../../shared/types";
import { dashboardSummary, logActivity, store } from "../data/store";

const router = Router();
const now = () => new Date().toISOString();

router.get("/dashboard/summary", (_req, res) => res.json(dashboardSummary()));

router.get("/inbox", (_req, res) => res.json(store.messages));
router.post("/inbox/message", (req, res) => {
  const message: InboxMessage = { id: crypto.randomUUID(), status: "new", createdAt: now(), ...req.body };
  store.messages.unshift(message);
  logActivity("admin", "message_created", `Manual message from ${message.senderName}`);
  res.status(201).json(message);
});

router.post("/inbox/:id/classify", (req, res) => {
  const message = store.messages.find((item) => item.id === req.params.id);
  if (!message) return res.status(404).json({ error: "Message not found" });
  message.classification = classifyMessage(message);
  message.riskLevel = assessRisk(message);
  message.status = "classified";
  const score = scoreLead(message);
  const existingLead = store.leads.find((lead) => lead.name.toLowerCase() === message.senderName.toLowerCase());
  if (existingLead) {
    existingLead.leadScore = score;
    existingLead.relationshipHistory.unshift(`Message classified as ${message.classification} on ${now()}`);
  } else {
    store.leads.unshift({
      id: crypto.randomUUID(),
      name: message.senderName,
      company: message.senderCompany,
      role: message.senderRole,
      source: message.source,
      status: "new",
      leadScore: score,
      interestType: message.classification,
      notes: message.body.slice(0, 240),
      lastContactDate: now().slice(0, 10),
      relationshipHistory: [`Created from inbox message ${message.id}`]
    });
  }
  const tasks = generateTasks(message, score);
  store.tasks.unshift(...tasks);
  store.approvals.unshift({
    id: crypto.randomUUID(),
    type: "suggested lead score",
    title: `Approve lead score ${score} for ${message.senderName}`,
    payload: `Classification: ${message.classification}\nRisk: ${message.riskLevel}\nMemory: ${suggestMemoryUpdate(message)}`,
    status: "pending",
    riskLevel: message.riskLevel,
    relatedMessageId: message.id,
    createdAt: now()
  });
  logActivity("agent", "message_classified", `${message.senderName}: ${message.classification}, score ${score}, risk ${message.riskLevel}`);
  res.json({ message, leadScore: score, tasksCreated: tasks.length });
});

router.post("/inbox/:id/suggest-reply", (req, res) => {
  const message = store.messages.find((item) => item.id === req.params.id);
  if (!message) return res.status(404).json({ error: "Message not found" });
  const classification = message.classification || classifyMessage(message);
  const draft = suggestReply(message, classification);
  message.status = "reply suggested";
  const approval = {
    id: crypto.randomUUID(),
    type: "suggested reply",
    title: `Reply draft for ${message.senderName}`,
    payload: draft,
    status: "pending" as const,
    riskLevel: message.riskLevel || assessRisk(message),
    relatedMessageId: message.id,
    createdAt: now()
  };
  store.approvals.unshift(approval);
  logActivity("agent", "reply_drafted", `Draft reply prepared for ${message.senderName}`);
  res.json(approval);
});

router.get("/leads", (_req, res) => res.json(store.leads));
router.post("/leads", (req, res) => {
  const lead: Lead = { id: crypto.randomUUID(), relationshipHistory: [], leadScore: "C", status: "new", ...req.body };
  store.leads.unshift(lead);
  logActivity("admin", "lead_created", lead.name);
  res.status(201).json(lead);
});
router.patch("/leads/:id", (req, res) => {
  const lead = store.leads.find((item) => item.id === req.params.id);
  if (!lead) return res.status(404).json({ error: "Lead not found" });
  Object.assign(lead, req.body);
  logActivity("admin", "lead_updated", lead.name);
  res.json(lead);
});
router.post("/leads/:id/score", (req, res) => {
  const lead = store.leads.find((item) => item.id === req.params.id);
  if (!lead) return res.status(404).json({ error: "Lead not found" });
  lead.leadScore = req.body.leadScore || lead.leadScore;
  logActivity("agent", "lead_scored", `${lead.name}: ${lead.leadScore}`);
  res.json(lead);
});

router.get("/tasks", (_req, res) => res.json(store.tasks));
router.post("/tasks", (req, res) => {
  const task = { id: crypto.randomUUID(), createdAt: now(), status: "new", priority: "medium", ...req.body };
  store.tasks.unshift(task);
  logActivity("admin", "task_created", task.title);
  res.status(201).json(task);
});
router.patch("/tasks/:id", (req, res) => {
  const task = store.tasks.find((item) => item.id === req.params.id);
  if (!task) return res.status(404).json({ error: "Task not found" });
  Object.assign(task, req.body);
  logActivity("admin", "task_updated", task.title);
  res.json(task);
});

router.get("/approvals", (_req, res) => res.json(store.approvals));
router.post("/approvals/:id/approve", (req, res) => {
  const approval = store.approvals.find((item) => item.id === req.params.id);
  if (!approval) return res.status(404).json({ error: "Approval not found" });
  approval.payload = req.body.payload || approval.payload;
  approval.status = "approved";
  logActivity("admin", "approval_approved", approval.title);
  res.json(approval);
});
router.post("/approvals/:id/reject", (req, res) => {
  const approval = store.approvals.find((item) => item.id === req.params.id);
  if (!approval) return res.status(404).json({ error: "Approval not found" });
  approval.status = "rejected";
  logActivity("admin", "approval_rejected", approval.title);
  res.json(approval);
});

router.get("/memory", (_req, res) => res.json(store.memory));
router.post("/memory", (req, res) => {
  const entry: MemoryEntry = { id: crypto.randomUUID(), pastInteractions: [], trustLevel: "unknown", updatedAt: now(), ...req.body };
  store.memory.unshift(entry);
  logActivity("admin", "memory_created", entry.personName);
  res.status(201).json(entry);
});
router.patch("/memory/:id", (req, res) => {
  const entry = store.memory.find((item) => item.id === req.params.id);
  if (!entry) return res.status(404).json({ error: "Memory entry not found" });
  Object.assign(entry, req.body, { updatedAt: now() });
  logActivity("admin", "memory_updated", entry.personName);
  res.json(entry);
});

router.get("/knowledge", (req, res) => res.json(req.query.q ? searchKnowledge(store.knowledge, String(req.query.q)) : store.knowledge));
router.post("/knowledge", (req, res) => {
  const entry: KnowledgeEntry = { id: crypto.randomUUID(), createdAt: now(), updatedAt: now(), tags: [], reliabilityLevel: "medium", ...req.body };
  store.knowledge.unshift(entry);
  logActivity("admin", "knowledge_created", entry.title);
  res.status(201).json(entry);
});
router.patch("/knowledge/:id", (req, res) => {
  const entry = store.knowledge.find((item) => item.id === req.params.id);
  if (!entry) return res.status(404).json({ error: "Knowledge entry not found" });
  Object.assign(entry, req.body, { updatedAt: now() });
  logActivity("admin", "knowledge_updated", entry.title);
  res.json(entry);
});
router.delete("/knowledge/:id", (req, res) => {
  const index = store.knowledge.findIndex((item) => item.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: "Knowledge entry not found" });
  const [entry] = store.knowledge.splice(index, 1);
  logActivity("admin", "knowledge_deleted", entry.title);
  res.status(204).send();
});

router.get("/activity", (_req, res) => res.json(store.activity));

export default router;
