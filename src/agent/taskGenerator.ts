import type { AgentTask, InboxMessage, LeadScore } from "../shared/types";

export function generateTasks(message: InboxMessage, score: LeadScore): AgentTask[] {
  const now = new Date().toISOString();
  const priority = score === "A+" ? "critical" : score === "A" ? "high" : message.urgency;
  return [
    {
      id: crypto.randomUUID(),
      agentId: message.agentId,
      type: "reply draft",
      title: `Review reply for ${message.senderName}`,
      description: "Review the agent draft and approve, edit or reject before external use.",
      status: "waiting approval",
      priority,
      relatedMessageId: message.id,
      createdAt: now
    },
    {
      id: crypto.randomUUID(),
      agentId: message.agentId,
      type: "qualify lead",
      title: `Qualify ${message.senderName}`,
      description: "Confirm role, authority, budget/timeline where relevant, and confidentiality requirements.",
      status: "new",
      priority,
      relatedMessageId: message.id,
      createdAt: now
    }
  ];
}
