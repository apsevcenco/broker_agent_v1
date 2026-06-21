import type { ActivityLog, AgentTask, ApprovalItem, InboxMessage, KnowledgeEntry, Lead, MemoryEntry } from "../../shared/types";

export function messageFromRow(row: any): InboxMessage {
  return {
    id: row.id,
    source: row.source,
    senderName: row.sender_name,
    senderCompany: row.sender_company ?? undefined,
    senderRole: row.sender_role,
    body: row.body,
    relatedYacht: row.related_yacht ?? undefined,
    relatedDeal: row.related_deal ?? undefined,
    urgency: row.urgency,
    status: row.status,
    classification: row.classification ?? undefined,
    riskLevel: row.risk_level ?? undefined,
    createdAt: row.created_at
  };
}

export function messageToRow(message: InboxMessage) {
  return {
    id: message.id,
    source: message.source,
    sender_name: message.senderName,
    sender_company: message.senderCompany || null,
    sender_role: message.senderRole,
    body: message.body,
    related_yacht: message.relatedYacht || null,
    related_deal: message.relatedDeal || null,
    urgency: message.urgency,
    status: message.status,
    classification: message.classification || null,
    risk_level: message.riskLevel || null,
    created_at: message.createdAt
  };
}

export function leadFromRow(row: any): Lead {
  return {
    id: row.id,
    name: row.name,
    company: row.company ?? undefined,
    email: row.email ?? undefined,
    phone: row.phone ?? undefined,
    country: row.country ?? undefined,
    role: row.role,
    source: row.source,
    status: row.status,
    leadScore: row.lead_score,
    interestType: row.interest_type ?? undefined,
    budgetRange: row.budget_range ?? undefined,
    yachtSizeInterest: row.yacht_size_interest ?? undefined,
    yachtTypeInterest: row.yacht_type_interest ?? undefined,
    timeline: row.timeline ?? undefined,
    region: row.region ?? undefined,
    notes: row.notes ?? undefined,
    lastContactDate: row.last_contact_date ?? undefined,
    nextFollowUpDate: row.next_follow_up_date ?? undefined,
    relationshipHistory: row.relationship_history || []
  };
}

export function leadToRow(lead: Lead) {
  return {
    id: lead.id,
    name: lead.name,
    company: lead.company || null,
    email: lead.email || null,
    phone: lead.phone || null,
    country: lead.country || null,
    role: lead.role,
    source: lead.source,
    status: lead.status,
    lead_score: lead.leadScore,
    interest_type: lead.interestType || null,
    budget_range: lead.budgetRange || null,
    yacht_size_interest: lead.yachtSizeInterest || null,
    yacht_type_interest: lead.yachtTypeInterest || null,
    timeline: lead.timeline || null,
    region: lead.region || null,
    notes: lead.notes || null,
    last_contact_date: lead.lastContactDate || null,
    next_follow_up_date: lead.nextFollowUpDate || null,
    relationship_history: lead.relationshipHistory || []
  };
}

export function taskFromRow(row: any): AgentTask {
  return {
    id: row.id,
    type: row.type,
    title: row.title,
    description: row.description || "",
    status: row.status,
    priority: row.priority,
    relatedLeadId: row.related_lead_id ?? undefined,
    relatedMessageId: row.related_message_id ?? undefined,
    createdAt: row.created_at
  };
}

export function taskToRow(task: AgentTask) {
  return {
    id: task.id,
    type: task.type,
    title: task.title,
    description: task.description,
    status: task.status,
    priority: task.priority,
    related_lead_id: task.relatedLeadId || null,
    related_message_id: task.relatedMessageId || null,
    created_at: task.createdAt
  };
}

export function approvalFromRow(row: any): ApprovalItem {
  return {
    id: row.id,
    type: row.type,
    title: row.title,
    payload: row.payload,
    status: row.status,
    riskLevel: row.risk_level,
    relatedMessageId: row.related_message_id ?? undefined,
    createdAt: row.created_at
  };
}

export function approvalToRow(item: ApprovalItem) {
  return {
    id: item.id,
    type: item.type,
    title: item.title,
    payload: item.payload,
    status: item.status,
    risk_level: item.riskLevel,
    related_message_id: item.relatedMessageId || null,
    created_at: item.createdAt
  };
}

export function memoryFromRow(row: any): MemoryEntry {
  return {
    id: row.id,
    personName: row.person_name,
    company: row.company ?? undefined,
    role: row.role,
    relationshipStatus: row.relationship_status,
    trustLevel: row.trust_level,
    pastInteractions: row.past_interactions || [],
    preferredCommunicationStyle: row.preferred_communication_style ?? undefined,
    knownYachtInterests: row.known_yacht_interests ?? undefined,
    dealHistory: row.deal_history ?? undefined,
    warnings: row.warnings ?? undefined,
    adminNotes: row.admin_notes ?? undefined,
    agentLearnedObservations: row.agent_learned_observations ?? undefined,
    updatedAt: row.updated_at
  };
}

export function memoryToRow(entry: MemoryEntry) {
  return {
    id: entry.id,
    person_name: entry.personName,
    company: entry.company || null,
    role: entry.role,
    relationship_status: entry.relationshipStatus,
    trust_level: entry.trustLevel,
    past_interactions: entry.pastInteractions || [],
    preferred_communication_style: entry.preferredCommunicationStyle || null,
    known_yacht_interests: entry.knownYachtInterests || null,
    deal_history: entry.dealHistory || null,
    warnings: entry.warnings || null,
    admin_notes: entry.adminNotes || null,
    agent_learned_observations: entry.agentLearnedObservations || null,
    updated_at: entry.updatedAt
  };
}

export function knowledgeFromRow(row: any): KnowledgeEntry {
  return {
    id: row.id,
    title: row.title,
    category: row.category,
    summary: row.summary || "",
    content: row.content,
    source: row.source ?? undefined,
    reliabilityLevel: row.reliability_level,
    tags: row.tags || [],
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

export function knowledgeToRow(entry: KnowledgeEntry) {
  return {
    id: entry.id,
    title: entry.title,
    category: entry.category,
    summary: entry.summary,
    content: entry.content,
    source: entry.source || null,
    reliability_level: entry.reliabilityLevel,
    tags: entry.tags || [],
    created_at: entry.createdAt,
    updated_at: entry.updatedAt
  };
}

export function activityFromRow(row: any): ActivityLog {
  return { id: row.id, actor: row.actor, action: row.action, details: row.details || "", createdAt: row.created_at };
}

export function activityToRow(activity: ActivityLog) {
  return { id: activity.id, actor: activity.actor, action: activity.action, details: activity.details, created_at: activity.createdAt };
}
