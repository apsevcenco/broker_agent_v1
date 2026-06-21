import type { ActivityLog, AgentTask, ApprovalItem, InboxMessage, KnowledgeEntry, Lead, MemoryEntry } from "../../shared/types";

const now = () => new Date().toISOString();

export const store = {
  messages: [] as InboxMessage[],
  leads: [] as Lead[],
  tasks: [] as AgentTask[],
  approvals: [] as ApprovalItem[],
  memory: [] as MemoryEntry[],
  knowledge: [
    {
      id: crypto.randomUUID(),
      title: "Off-market confidentiality baseline",
      category: "Off-Market Deals",
      summary: "Sensitive details are disclosed only after qualification and approval.",
      content: "Yacht identity, owner details, exact location, documents and commercial terms must stay internal until admin approval is granted.",
      source: "Internal V1 rule",
      reliabilityLevel: "verified",
      tags: ["confidentiality", "approval", "off-market"],
      createdAt: now(),
      updatedAt: now()
    }
  ] as KnowledgeEntry[],
  activity: [] as ActivityLog[]
};

export function logActivity(actor: ActivityLog["actor"], action: string, details: string) {
  store.activity.unshift({ id: crypto.randomUUID(), actor, action, details, createdAt: now() });
}

export function dashboardSummary() {
  return {
    totalLeads: store.leads.length,
    hotLeads: store.leads.filter((lead) => lead.leadScore === "A+" || lead.leadScore === "A").length,
    pendingTasks: store.tasks.filter((task) => ["new", "in progress", "waiting approval"].includes(task.status)).length,
    pendingApprovals: store.approvals.filter((approval) => approval.status === "pending").length,
    recentConversations: store.messages.slice(0, 5),
    agentAlerts: store.approvals.filter((approval) => approval.riskLevel === "critical" && approval.status === "pending"),
    knowledgeBaseStatus: { entries: store.knowledge.length, categories: [...new Set(store.knowledge.map((entry) => entry.category))].length },
    recentAgentActivity: store.activity.slice(0, 8)
  };
}
