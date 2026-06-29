import type { NextFunction, Request, Response } from "express";
import { Router } from "express";
import { classifyMessage } from "../../agent/classifyMessage";
import { scoreLead } from "../../agent/leadScoring";
import { suggestMemoryUpdate } from "../../agent/memorySuggestions";
import { assessRisk } from "../../agent/riskAssessment";
import { CoreIntelligenceEngine } from "../../agent/core/CoreIntelligenceEngine";
import { buildIntelligenceContext } from "../../agent/core/IntelligenceContextBuilder";
import { generateTasks } from "../../agent/taskGenerator";
import { searchKnowledge } from "../../agent/knowledgeSearch";
import { appendCaseEvent } from "../../agent/case/CaseEventService";
import { findOrCreateParticipant } from "../../agent/case/CaseParticipantService";
import { resolveCase } from "../../agent/case/CaseRuntimeService";
import type { AgentTask, InboxMessage, KnowledgeEntry, Lead, ManagedAsset, MemoryEntry } from "../../shared/types";
import { aiRouter } from "../../ai/aiRouter";
import { activeAgentId, defaultAgentDefinitions } from "../data/agents";
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

  const agentId        = message.agentId || activeAgentId;
  const classification = message.classification || classifyMessage(message);
  const agentDef       = defaultAgentDefinitions.find(a => a.id === agentId || a.slug === agentId);
  const profileId      = agentDef?.slug === "client-acquisition" || agentId === "client-acquisition-agent" ? "lead-hunter" : "yacht-broker";
  const caseProfile    = profileId;

  // ── Case Runtime V1 setup (non-blocking) ──────────────────────────────────
  let caseId:           string | undefined;
  let triggeringEventId: string | undefined;
  let caseStatus        = "open";
  const participantSummaries: Array<{ id: string; name: string; role: string; status: string }> = [];

  try {
    const resolved = await resolveCase(message, caseProfile, classification);
    caseId     = resolved.caseId;
    caseStatus = resolved.caseStatus;

    const participant = await findOrCreateParticipant({
      caseId,
      name: message.senderName,
      role: message.senderRole
    });
    participantSummaries.push({
      id:     participant.id,
      name:   participant.name,
      role:   participant.role,
      status: participant.status
    });

    const trigEvt = await appendCaseEvent({
      caseId,
      eventType:         "message.received",
      actorType:         "participant",
      actorId:           participant.id,
      summary:           `Message received from ${message.senderName} via ${message.source}`,
      payload:           { messageId: message.id, senderName: message.senderName, senderRole: message.senderRole, source: message.source, urgency: message.urgency, classification },
      relatedEntityType: "message",
      relatedEntityId:   message.id
    });
    triggeringEventId = trigEvt.id;
    console.log(`[CIE] case=${caseId} triggeringEvent=${triggeringEventId}`);
  } catch (err) {
    console.error("[CaseRuntime] Setup failed (non-critical):", (err as Error).message);
  }

  // ── Build context and run CIE ─────────────────────────────────────────────
  const context = await buildIntelligenceContext({
    message,
    agentId,
    caseId:            caseId ?? "",
    triggeringEventId: triggeringEventId ?? "",
    caseProfile,
    caseStatus,
    participants:      participantSummaries,
    classification
  });

  const intelligence = await CoreIntelligenceEngine.execute(profileId, context);

  // ── Post-CIE events (non-blocking) ───────────────────────────────────────
  let intelligenceEventId: string | undefined;
  let decisionEventId:     string | undefined;
  let toolPlanEventId:     string | null = null;

  if (caseId) {
    try {
      const toolPlan = intelligence.execution.toolPlan;

      const [intEvt, decEvt] = await Promise.all([
        appendCaseEvent({
          caseId,
          eventType: "intelligence.generated",
          actorType: "agent",
          actorId:   agentId,
          summary:   `CIE intelligence via ${intelligence.profileId} (${intelligence.execution.draftProvider})`,
          payload:   {
            profileId:          intelligence.profileId,
            provider:           intelligence.execution.draftProvider,
            mocked:             intelligence.execution.draftMocked,
            leadScore:          intelligence.reasoning.leadScore,
            riskLevel:          intelligence.reasoning.riskLevel,
            recommendation:     intelligence.decision.recommendation,
            knowledgeUsedCount: intelligence.reasoning.knowledgeUsed.length,
            memoryUsedCount:    intelligence.reasoning.memoryUsed.length,
            toolRequestCount:   toolPlan?.toolRequests.length ?? 0
          }
        }),
        appendCaseEvent({
          caseId,
          eventType: "decision.proposed",
          actorType: "agent",
          actorId:   agentId,
          summary:   `Decision proposed: ${intelligence.decision.recommendation}`,
          payload:   {
            recommendation:  intelligence.decision.recommendation,
            rationale:       intelligence.decision.rationale,
            riskLevel:       intelligence.reasoning.riskLevel,
            safetyNotes:     intelligence.decision.safetyNotes,
            approvalRequired: intelligence.decision.approvalRequired
          }
        })
      ]);

      intelligenceEventId = intEvt.id;
      decisionEventId     = decEvt.id;

      if (toolPlan && toolPlan.toolRequests.length > 0) {
        const tpEvt = await appendCaseEvent({
          caseId,
          eventType: "toolplan.created",
          actorType: "agent",
          actorId:   agentId,
          summary:   `ToolPlan: ${toolPlan.toolRequests.length} action(s), highest risk ${toolPlan.highestRiskLevel}`,
          payload:   {
            toolRequestCount: toolPlan.toolRequests.length,
            highestRiskLevel: toolPlan.highestRiskLevel,
            requiresApproval: toolPlan.requiresApproval,
            summary:          toolPlan.summary,
            toolRequests:     toolPlan.toolRequests.map(r => ({ tool: r.tool, category: r.category, priority: r.priority, riskLevel: r.riskLevel }))
          }
        });
        toolPlanEventId = tpEvt.id;
      }

      console.log(`[CIE] Events: intelligence=${intelligenceEventId} decision=${decisionEventId}${toolPlanEventId ? ` toolplan=${toolPlanEventId}` : ""}`);
    } catch (err) {
      console.error("[CaseRuntime] Post-CIE events failed (non-critical):", (err as Error).message);
    }
  }

  // ── Approval ──────────────────────────────────────────────────────────────
  message.status = "reply suggested";
  await repository.updateMessage(message);

  const approvalPayload = {
    ...intelligence.draft,
    draft: typeof intelligence.draft.draft === "string"
      ? intelligence.draft.draft
      : intelligence.execution.draftContent,
    caseId,
    triggeringEventId,
    intelligenceEventId,
    decisionEventId,
    toolPlanEventId,
    intelligence
  };

  const approval = await repository.createApproval({
    id:               crypto.randomUUID(),
    agentId,
    type:             "suggested reply",
    title:            `${profileId === "lead-hunter" ? "Lead candidate" : "Reply draft"} for ${message.senderName}`,
    payload:          JSON.stringify(approvalPayload),
    status:           "pending",
    riskLevel:        intelligence.reasoning.riskLevel as "low" | "medium" | "high" | "critical",
    relatedMessageId: message.id,
    createdAt:        now()
  });

  if (caseId) {
    try {
      await appendCaseEvent({
        caseId,
        eventType:         "approval.created",
        actorType:         "system",
        summary:           `Approval pending: ${approval.title}`,
        payload:           { approvalId: approval.id, type: approval.type, title: approval.title, riskLevel: approval.riskLevel, status: approval.status },
        relatedEntityType: "approval",
        relatedEntityId:   approval.id
      });
    } catch (err) {
      console.error("[CaseRuntime] approval.created event failed (non-critical):", (err as Error).message);
    }
  }

  await repository.logActivity(
    "agent",
    "reply_drafted",
    `Draft via CIE/${intelligence.profileId} (${intelligence.execution.draftProvider}${intelligence.execution.draftMocked ? ", mocked" : ""})${caseId ? ` | case=${caseId}` : ""}`,
    message.agentId
  );
  res.json({ approval, draft: intelligence.draft, intelligence, caseId });
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

router.get("/cases", asyncRoute(async (_req, res) => {
  const [cases, allEvents, allParticipants] = await Promise.all([
    repository.listCases(),
    repository.listCaseEvents(),
    repository.listCaseParticipants()
  ]);

  const eventsByCaseId = new Map<string, typeof allEvents>();
  for (const e of allEvents) {
    const list = eventsByCaseId.get(e.caseId) ?? [];
    list.push(e);
    eventsByCaseId.set(e.caseId, list);
  }

  const participantCountByCaseId = new Map<string, number>();
  for (const p of allParticipants) {
    participantCountByCaseId.set(p.caseId, (participantCountByCaseId.get(p.caseId) ?? 0) + 1);
  }

  const enriched = cases.map(c => {
    const events = eventsByCaseId.get(c.id) ?? [];
    const latest = events[0]; // store uses unshift / selectRows orders newest-first
    return {
      ...c,
      eventCount: events.length,
      participantCount: participantCountByCaseId.get(c.id) ?? 0,
      latestEvent: latest
        ? { eventType: latest.eventType, summary: latest.summary, createdAt: latest.createdAt }
        : undefined
    };
  });

  res.json(enriched);
}));

router.get("/cases/:id", asyncRoute(async (req, res) => {
  const caseId = routeId(req);
  const caseRecord = await repository.findCaseById(caseId);
  if (!caseRecord) { res.status(404).json({ error: "Case not found" }); return; }

  const [events, participants, allApprovals, allMessages] = await Promise.all([
    repository.findCaseEventsByCaseId(caseId),
    repository.findCaseParticipantsByCaseId(caseId),
    repository.listApprovals(),
    repository.listMessages()
  ]);

  // Approvals linked via approval.created events
  const approvalIds = new Set(
    events
      .filter(e => e.relatedEntityType === "approval" && e.relatedEntityId)
      .map(e => e.relatedEntityId as string)
  );
  const approvals = allApprovals.filter(a => approvalIds.has(a.id));

  // Messages linked via message.received events
  const messageIds = new Set(
    events
      .filter(e => e.eventType === "message.received" && e.relatedEntityId)
      .map(e => e.relatedEntityId as string)
  );
  const messages = allMessages.filter(m => messageIds.has(m.id));

  // Latest intelligence from most recent approval that carries it
  let latestIntelligence: unknown = null;
  let latestDraft: string | null = null;
  for (const approval of approvals) {
    try {
      const p = JSON.parse(approval.payload);
      if (p?.intelligence) {
        latestIntelligence = p.intelligence;
        const d = p.draft ?? p.intelligence?.execution?.draftContent;
        latestDraft = typeof d === "string" ? d : null;
        break;
      }
    } catch { /* skip malformed payload */ }
  }

  // Tool plan from toolplan.created event payload (summary only)
  const toolPlanEvent = events.find(e => e.eventType === "toolplan.created");

  // Assigned agents — deduplicated slugs from caseProfile + event actorIds,
  // names resolved from the existing agent registry (no new registry created)
  const seenSlugs = new Set<string>();
  const assignedAgents: { slug: string; name: string }[] = [];
  // Match by slug OR by id so actorId ("yacht-broker-agent") and caseProfile
  // slug ("yacht-broker") resolve to the same canonical entry
  const addAgentId = (rawId: string) => {
    if (!rawId) return;
    const def = defaultAgentDefinitions.find(a => a.slug === rawId || a.id === rawId);
    const canonicalSlug = def?.slug ?? rawId;
    if (seenSlugs.has(canonicalSlug)) return;
    seenSlugs.add(canonicalSlug);
    assignedAgents.push({ slug: canonicalSlug, name: def?.name ?? rawId });
  };
  addAgentId(caseRecord.caseProfile);
  for (const e of events) {
    if (e.actorType === "agent" && e.actorId) addAgentId(e.actorId);
  }

  res.json({
    case: caseRecord,
    events,
    participants,
    approvals,
    messages,
    latestIntelligence,
    latestDraft,
    latestToolPlan: toolPlanEvent?.payload ?? null,
    assignedAgents
  });
}));

router.get("/approvals", asyncRoute(async (req, res) => {
  res.json(byAgent(await repository.listApprovals(), req.query.agentId));
}));
router.post("/approvals/:id/approve", asyncRoute(async (req, res) => {
  const patch: Record<string, unknown> = { status: "approved" };
  if (req.body.payload !== undefined) patch.payload = req.body.payload;
  const approval = await repository.updateApproval(routeId(req), patch);
  if (!approval) { res.status(404).json({ error: "Approval not found" }); return; }
  await repository.logActivity("admin", "approval_approved", approval.title, approval.agentId);
  try {
    const p = typeof approval.payload === "string" ? JSON.parse(approval.payload) : approval.payload;
    if (p?.caseId) {
      await appendCaseEvent({
        caseId: p.caseId,
        eventType: "approval.decided",
        actorType: "human_operator",
        actorId: "system",
        summary: `Approval approved: ${approval.title}`,
        payload: { approvalId: approval.id, decision: "approved", title: approval.title, riskLevel: approval.riskLevel },
        relatedEntityType: "approval",
        relatedEntityId: approval.id
      });
    }
  } catch { /* malformed payload or missing caseId */ }
  res.json(approval);
}));
router.post("/approvals/:id/reject", asyncRoute(async (req, res) => {
  const approval = await repository.updateApproval(routeId(req), { status: "rejected" });
  if (!approval) { res.status(404).json({ error: "Approval not found" }); return; }
  await repository.logActivity("admin", "approval_rejected", approval.title, approval.agentId);
  try {
    const p = typeof approval.payload === "string" ? JSON.parse(approval.payload) : approval.payload;
    if (p?.caseId) {
      await appendCaseEvent({
        caseId: p.caseId,
        eventType: "approval.decided",
        actorType: "human_operator",
        actorId: "system",
        summary: `Approval rejected: ${approval.title}`,
        payload: { approvalId: approval.id, decision: "rejected", title: approval.title, riskLevel: approval.riskLevel },
        relatedEntityType: "approval",
        relatedEntityId: approval.id
      });
    }
  } catch { /* malformed payload or missing caseId */ }
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















