import type { ActivityLog, AgentTask, ApprovalItem, InboxMessage, KnowledgeEntry, Lead, MemoryEntry } from "../../shared/types";
import { dashboardSummary as memoryDashboardSummary, logActivity as memoryLogActivity, store } from "./store";
import { supabase } from "./supabaseClient";
import {
  activityFromRow,
  activityToRow,
  approvalFromRow,
  approvalToRow,
  knowledgeFromRow,
  knowledgeToRow,
  leadFromRow,
  leadToRow,
  memoryFromRow,
  memoryToRow,
  messageFromRow,
  messageToRow,
  taskFromRow,
  taskToRow
} from "./mappers";

async function selectRows<T>(table: string, mapper: (row: any) => T): Promise<T[]> {
  if (!supabase) return [];
  const { data, error } = await supabase.from(table).select("*").order("created_at", { ascending: false });
  if (error) throw error;
  return (data || []).map(mapper);
}

async function insertRow<T>(table: string, row: Record<string, unknown>, mapper: (row: any) => T): Promise<T> {
  if (!supabase) throw new Error("Supabase is not configured");
  const { data, error } = await supabase.from(table).insert(row).select("*").single();
  if (error) throw error;
  return mapper(data);
}

async function updateRow<T>(table: string, id: string, patch: Record<string, unknown>, mapper: (row: any) => T): Promise<T | null> {
  if (!supabase) throw new Error("Supabase is not configured");
  const { data, error } = await supabase.from(table).update(patch).eq("id", id).select("*").maybeSingle();
  if (error) throw error;
  return data ? mapper(data) : null;
}

export const repository = {
  usesSupabase: Boolean(supabase),

  async dashboardSummary() {
    if (!supabase) return memoryDashboardSummary();
    const [messages, leads, tasks, approvals, knowledge, activity] = await Promise.all([
      this.listMessages(),
      this.listLeads(),
      this.listTasks(),
      this.listApprovals(),
      this.listKnowledge(),
      this.listActivity()
    ]);
    return {
      totalLeads: leads.length,
      hotLeads: leads.filter((lead) => lead.leadScore === "A+" || lead.leadScore === "A").length,
      pendingTasks: tasks.filter((task) => ["new", "in progress", "waiting approval"].includes(task.status)).length,
      pendingApprovals: approvals.filter((approval) => approval.status === "pending").length,
      recentConversations: messages.slice(0, 5),
      agentAlerts: approvals.filter((approval) => approval.riskLevel === "critical" && approval.status === "pending"),
      knowledgeBaseStatus: { entries: knowledge.length, categories: [...new Set(knowledge.map((entry) => entry.category))].length },
      recentAgentActivity: activity.slice(0, 8),
      persistence: "supabase"
    };
  },

  async logActivity(actor: ActivityLog["actor"], action: string, details: string) {
    const activity: ActivityLog = { id: crypto.randomUUID(), actor, action, details, createdAt: new Date().toISOString() };
    if (!supabase) return memoryLogActivity(actor, action, details);
    await insertRow("agent_activity_logs", activityToRow(activity), activityFromRow);
  },

  async listMessages() {
    return supabase ? selectRows("messages", messageFromRow) : store.messages;
  },
  async createMessage(message: InboxMessage) {
    if (!supabase) { store.messages.unshift(message); return message; }
    return insertRow("messages", messageToRow(message), messageFromRow);
  },
  async updateMessage(message: InboxMessage) {
    if (!supabase) return message;
    const updated = await updateRow("messages", message.id, messageToRow(message), messageFromRow);
    return updated || message;
  },
  async findMessage(id: string) {
    const messages = await this.listMessages();
    return messages.find((item) => item.id === id) || null;
  },

  async listLeads() {
    return supabase ? selectRows("leads", leadFromRow) : store.leads;
  },
  async createLead(lead: Lead) {
    if (!supabase) { store.leads.unshift(lead); return lead; }
    return insertRow("leads", leadToRow(lead), leadFromRow);
  },
  async updateLead(id: string, patch: Partial<Lead>) {
    if (!supabase) {
      const lead = store.leads.find((item) => item.id === id);
      if (!lead) return null;
      Object.assign(lead, patch);
      return lead;
    }
    const current = (await this.listLeads()).find((lead) => lead.id === id);
    if (!current) return null;
    return updateRow("leads", id, leadToRow({ ...current, ...patch }), leadFromRow);
  },

  async listTasks() {
    return supabase ? selectRows("agent_tasks", taskFromRow) : store.tasks;
  },
  async createTasks(tasks: AgentTask[]) {
    if (!supabase) { store.tasks.unshift(...tasks); return tasks; }
    if (!tasks.length) return [];
    const { data, error } = await supabase.from("agent_tasks").insert(tasks.map(taskToRow)).select("*");
    if (error) throw error;
    return (data || []).map(taskFromRow);
  },
  async createTask(task: AgentTask) {
    if (!supabase) { store.tasks.unshift(task); return task; }
    return insertRow("agent_tasks", taskToRow(task), taskFromRow);
  },
  async updateTask(id: string, patch: Partial<AgentTask>) {
    if (!supabase) {
      const task = store.tasks.find((item) => item.id === id);
      if (!task) return null;
      Object.assign(task, patch);
      return task;
    }
    const current = (await this.listTasks()).find((task) => task.id === id);
    if (!current) return null;
    return updateRow("agent_tasks", id, taskToRow({ ...current, ...patch }), taskFromRow);
  },

  async listApprovals() {
    return supabase ? selectRows("agent_approvals", approvalFromRow) : store.approvals;
  },
  async createApproval(approval: ApprovalItem) {
    if (!supabase) { store.approvals.unshift(approval); return approval; }
    return insertRow("agent_approvals", approvalToRow(approval), approvalFromRow);
  },
  async updateApproval(id: string, patch: Partial<ApprovalItem>) {
    if (!supabase) {
      const approval = store.approvals.find((item) => item.id === id);
      if (!approval) return null;
      Object.assign(approval, patch);
      return approval;
    }
    const current = (await this.listApprovals()).find((approval) => approval.id === id);
    if (!current) return null;
    return updateRow("agent_approvals", id, approvalToRow({ ...current, ...patch }), approvalFromRow);
  },

  async listMemory() {
    return supabase ? selectRows("broker_memory", memoryFromRow) : store.memory;
  },
  async createMemory(entry: MemoryEntry) {
    if (!supabase) { store.memory.unshift(entry); return entry; }
    return insertRow("broker_memory", memoryToRow(entry), memoryFromRow);
  },
  async updateMemory(id: string, patch: Partial<MemoryEntry>) {
    if (!supabase) {
      const entry = store.memory.find((item) => item.id === id);
      if (!entry) return null;
      Object.assign(entry, patch);
      return entry;
    }
    const current = (await this.listMemory()).find((entry) => entry.id === id);
    if (!current) return null;
    return updateRow("broker_memory", id, memoryToRow({ ...current, ...patch }), memoryFromRow);
  },

  async listKnowledge() {
    return supabase ? selectRows("knowledge_entries", knowledgeFromRow) : store.knowledge;
  },
  async createKnowledge(entry: KnowledgeEntry) {
    if (!supabase) { store.knowledge.unshift(entry); return entry; }
    return insertRow("knowledge_entries", knowledgeToRow(entry), knowledgeFromRow);
  },
  async updateKnowledge(id: string, patch: Partial<KnowledgeEntry>) {
    if (!supabase) {
      const entry = store.knowledge.find((item) => item.id === id);
      if (!entry) return null;
      Object.assign(entry, patch);
      return entry;
    }
    const current = (await this.listKnowledge()).find((entry) => entry.id === id);
    if (!current) return null;
    return updateRow("knowledge_entries", id, knowledgeToRow({ ...current, ...patch }), knowledgeFromRow);
  },
  async deleteKnowledge(id: string) {
    if (!supabase) {
      const index = store.knowledge.findIndex((item) => item.id === id);
      if (index === -1) return false;
      store.knowledge.splice(index, 1);
      return true;
    }
    const { error } = await supabase.from("knowledge_entries").delete().eq("id", id);
    if (error) throw error;
    return true;
  },

  async listActivity() {
    return supabase ? selectRows("agent_activity_logs", activityFromRow) : store.activity;
  }
};
