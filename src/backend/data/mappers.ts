import type { ActivityLog, AgentDefinition, AgentTask, ApprovalItem, Case, CaseEvent, CaseParticipant, InboxMessage, KnowledgeEntry, Lead, ManagedAsset, MemoryEntry } from "../../shared/types";

export function messageFromRow(row: any): InboxMessage {
  return {
    id: row.id,
    agentId: row.agent_id ?? undefined,
    source: row.source,
    senderName: row.sender_name,
    senderCompany: row.sender_company ?? undefined,
    senderRole: row.sender_role,
    body: row.body,
    relatedAssetId: row.related_asset_id ?? undefined,
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
    agent_id: message.agentId || null,
    source: message.source,
    sender_name: message.senderName,
    sender_company: message.senderCompany || null,
    sender_role: message.senderRole,
    body: message.body,
    related_asset_id: message.relatedAssetId || null,
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
    agentId: row.agent_id ?? undefined,
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
    agent_id: lead.agentId || null,
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
    agentId: row.agent_id ?? undefined,
    type: row.type,
    title: row.title,
    description: row.description || "",
    status: row.status,
    priority: row.priority,
    relatedLeadId: row.related_lead_id ?? undefined,
    relatedMessageId: row.related_message_id ?? undefined,
    relatedAssetId: row.related_asset_id ?? undefined,
    createdAt: row.created_at
  };
}

export function taskToRow(task: AgentTask) {
  return {
    id: task.id,
    agent_id: task.agentId || null,
    type: task.type,
    title: task.title,
    description: task.description,
    status: task.status,
    priority: task.priority,
    related_lead_id: task.relatedLeadId || null,
    related_message_id: task.relatedMessageId || null,
    related_asset_id: task.relatedAssetId || null,
    created_at: task.createdAt
  };
}

export function approvalFromRow(row: any): ApprovalItem {
  return {
    id: row.id,
    agentId: row.agent_id ?? undefined,
    type: row.type,
    title: row.title,
    payload: row.payload,
    status: row.status,
    riskLevel: row.risk_level,
    relatedMessageId: row.related_message_id ?? undefined,
    relatedAssetId: row.related_asset_id ?? undefined,
    createdAt: row.created_at
  };
}

export function approvalToRow(item: ApprovalItem) {
  return {
    id: item.id,
    agent_id: item.agentId || null,
    type: item.type,
    title: item.title,
    payload: item.payload,
    status: item.status,
    risk_level: item.riskLevel,
    related_message_id: item.relatedMessageId || null,
    related_asset_id: item.relatedAssetId || null,
    created_at: item.createdAt
  };
}

export function memoryFromRow(row: any): MemoryEntry {
  return {
    id: row.id,
    agentId: row.agent_id ?? undefined,
    personName: row.person_name,
    company: row.company ?? undefined,
    role: row.role,
    relationshipStatus: row.relationship_status,
    trustLevel: row.trust_level,
    pastInteractions: row.past_interactions || [],
    preferredCommunicationStyle: row.preferred_communication_style ?? undefined,
    knownAssetInterests: row.known_asset_interests ?? undefined,
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
    agent_id: entry.agentId || null,
    person_name: entry.personName,
    company: entry.company || null,
    role: entry.role,
    relationship_status: entry.relationshipStatus,
    trust_level: entry.trustLevel,
    past_interactions: entry.pastInteractions || [],
    preferred_communication_style: entry.preferredCommunicationStyle || null,
    known_asset_interests: entry.knownAssetInterests || null,
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
    agentId: row.agent_id ?? undefined,
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
    agent_id: entry.agentId || null,
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
  return { id: row.id, agentId: row.agent_id ?? undefined, actor: row.actor, action: row.action, details: row.details || "", createdAt: row.created_at };
}

export function activityToRow(activity: ActivityLog) {
  return { id: activity.id, agent_id: activity.agentId || null, actor: activity.actor, action: activity.action, details: activity.details, created_at: activity.createdAt };
}

export function agentFromRow(row: any): AgentDefinition {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    status: row.status,
    category: row.category,
    description: row.description,
    riskLevel: row.risk_level,
    defaultTone: row.default_tone,
    systemRules: row.system_rules || [],
    allowedActions: row.allowed_actions || [],
    blockedActions: row.blocked_actions || [],
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

// ─── Case Runtime V1 mappers ──────────────────────────────────────────────────

export function caseFromRow(row: any): Case {
  return {
    id:                     row.id,
    companyId:              row.company_id ?? "internal",
    title:                  row.title,
    caseType:               row.case_type,
    caseProfile:            row.case_profile,
    status:                 row.status,
    source:                 row.source,
    primaryContactName:     row.primary_contact_name ?? undefined,
    primaryContactEmail:    row.primary_contact_email ?? undefined,
    createdFromMessageId:   row.created_from_message_id ?? undefined,
    createdAt:              row.created_at,
    updatedAt:              row.updated_at
  };
}

export function caseToRow(c: Case) {
  return {
    id:                       c.id,
    company_id:               c.companyId,
    title:                    c.title,
    case_type:                c.caseType,
    case_profile:             c.caseProfile,
    status:                   c.status,
    source:                   c.source,
    primary_contact_name:     c.primaryContactName ?? null,
    primary_contact_email:    c.primaryContactEmail ?? null,
    created_from_message_id:  c.createdFromMessageId ?? null,
    created_at:               c.createdAt,
    updated_at:               c.updatedAt
  };
}

export function caseEventFromRow(row: any): CaseEvent {
  return {
    id:                 row.id,
    caseId:             row.case_id,
    companyId:          row.company_id ?? "internal",
    eventType:          row.event_type,
    actorType:          row.actor_type,
    actorId:            row.actor_id ?? undefined,
    summary:            row.summary,
    payload:            row.payload ?? {},
    relatedEntityType:  row.related_entity_type ?? undefined,
    relatedEntityId:    row.related_entity_id ?? undefined,
    createdAt:          row.created_at
  };
}

export function caseEventToRow(e: CaseEvent) {
  return {
    id:                   e.id,
    case_id:              e.caseId,
    company_id:           e.companyId,
    event_type:           e.eventType,
    actor_type:           e.actorType,
    actor_id:             e.actorId ?? null,
    summary:              e.summary,
    payload:              e.payload,
    related_entity_type:  e.relatedEntityType ?? null,
    related_entity_id:    e.relatedEntityId ?? null,
    created_at:           e.createdAt
  };
}

export function caseParticipantFromRow(row: any): CaseParticipant {
  return {
    id:          row.id,
    caseId:      row.case_id,
    identityId:  row.identity_id ?? undefined,
    name:        row.name,
    email:       row.email ?? undefined,
    role:        row.role,
    status:      row.status,
    createdAt:   row.created_at
  };
}

export function caseParticipantToRow(p: CaseParticipant) {
  return {
    id:           p.id,
    case_id:      p.caseId,
    identity_id:  p.identityId ?? null,
    name:         p.name,
    email:        p.email ?? null,
    role:         p.role,
    status:       p.status,
    created_at:   p.createdAt
  };
}

// ─── agent mapper ─────────────────────────────────────────────────────────────

export function agentToRow(agent: AgentDefinition) {
  return {
    id: agent.id,
    name: agent.name,
    slug: agent.slug,
    status: agent.status,
    category: agent.category,
    description: agent.description,
    risk_level: agent.riskLevel,
    default_tone: agent.defaultTone,
    system_rules: agent.systemRules,
    allowed_actions: agent.allowedActions,
    blocked_actions: agent.blockedActions,
    created_at: agent.createdAt,
    updated_at: agent.updatedAt
  };
}

export function assetFromRow(row: any): ManagedAsset {
  return {
    id: row.id,
    agentId: row.agent_id ?? undefined,
    type: row.type,
    name: row.name,
    brand: row.brand ?? undefined,
    model: row.model ?? undefined,
    year: row.year ?? undefined,
    location: row.location ?? undefined,
    status: row.status,
    ownerContactId: row.owner_contact_id ?? undefined,
    notes: row.notes ?? undefined,
    metadata: row.metadata || {},
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

export function assetToRow(asset: ManagedAsset) {
  return {
    id: asset.id,
    agent_id: asset.agentId || null,
    type: asset.type,
    name: asset.name,
    brand: asset.brand || null,
    model: asset.model || null,
    year: asset.year || null,
    location: asset.location || null,
    status: asset.status,
    owner_contact_id: asset.ownerContactId || null,
    notes: asset.notes || null,
    metadata: asset.metadata || {},
    created_at: asset.createdAt,
    updated_at: asset.updatedAt
  };
}
