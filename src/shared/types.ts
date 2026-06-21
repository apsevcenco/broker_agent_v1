export type Source = "email" | "LinkedIn" | "Instagram" | "WhatsApp" | "PDYE" | "website" | "manual";
export type Urgency = "low" | "medium" | "high" | "critical";
export type LeadRole = "buyer" | "seller" | "broker" | "owner" | "captain" | "owner representative" | "investor" | "shipyard" | "supplier" | "unknown";
export type LeadScore = "A+" | "A" | "B" | "C" | "D" | "Spam";
export type RiskLevel = "low" | "medium" | "high" | "critical";
export type TaskStatus = "new" | "in progress" | "waiting approval" | "approved" | "rejected" | "completed" | "failed";
export type ApprovalStatus = "pending" | "approved" | "rejected" | "done";

export interface InboxMessage {
  id: string;
  source: Source;
  senderName: string;
  senderCompany?: string;
  senderRole: LeadRole;
  body: string;
  relatedYacht?: string;
  relatedDeal?: string;
  urgency: Urgency;
  status: "new" | "classified" | "reply suggested" | "converted" | "archived";
  classification?: string;
  riskLevel?: RiskLevel;
  createdAt: string;
}

export interface Lead {
  id: string;
  name: string;
  company?: string;
  email?: string;
  phone?: string;
  country?: string;
  role: LeadRole;
  source: Source;
  status: string;
  leadScore: LeadScore;
  interestType?: string;
  budgetRange?: string;
  yachtSizeInterest?: string;
  yachtTypeInterest?: string;
  timeline?: string;
  region?: string;
  notes?: string;
  lastContactDate?: string;
  nextFollowUpDate?: string;
  relationshipHistory: string[];
}

export interface AgentTask {
  id: string;
  type: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: Urgency;
  relatedLeadId?: string;
  relatedMessageId?: string;
  createdAt: string;
}

export interface ApprovalItem {
  id: string;
  type: string;
  title: string;
  payload: string;
  status: ApprovalStatus;
  riskLevel: RiskLevel;
  relatedMessageId?: string;
  createdAt: string;
}

export interface MemoryEntry {
  id: string;
  personName: string;
  company?: string;
  role: string;
  relationshipStatus: string;
  trustLevel: "unknown" | "low" | "medium" | "high";
  pastInteractions: string[];
  preferredCommunicationStyle?: string;
  knownYachtInterests?: string;
  dealHistory?: string;
  warnings?: string;
  adminNotes?: string;
  agentLearnedObservations?: string;
  updatedAt: string;
}

export interface KnowledgeEntry {
  id: string;
  title: string;
  category: string;
  summary: string;
  content: string;
  source?: string;
  reliabilityLevel: "low" | "medium" | "high" | "verified";
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ActivityLog {
  id: string;
  action: string;
  actor: "admin" | "agent" | "system";
  details: string;
  createdAt: string;
}
