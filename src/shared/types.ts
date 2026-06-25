export type Source = "email" | "LinkedIn" | "Instagram" | "WhatsApp" | "PDYE" | "website" | "manual";
export type Urgency = "low" | "medium" | "high" | "critical";
export type LeadRole = "buyer" | "seller" | "broker" | "owner" | "captain" | "owner representative" | "investor" | "shipyard" | "supplier" | "unknown";
export type LeadScore = "A+" | "A" | "B" | "C" | "D" | "Spam";
export type RiskLevel = "low" | "medium" | "high" | "critical";
export type TaskStatus = "new" | "in progress" | "waiting approval" | "approved" | "rejected" | "completed" | "failed";
export type ApprovalStatus = "pending" | "approved" | "rejected" | "done";
export type AgentStatus = "active" | "planned" | "disabled";
export type AgentCategory = "yachts" | "charter" | "valuation" | "support" | "car_rental" | "concierge" | "marketing" | "client_acquisition" | "research" | "compliance";
export type AssetType = "yacht" | "vehicle" | "aircraft" | "villa" | "service" | "other";

export interface AgentDefinition {
  id: string;
  name: string;
  slug: string;
  status: AgentStatus;
  category: AgentCategory;
  description: string;
  riskLevel: RiskLevel;
  defaultTone: string;
  systemRules: string[];
  allowedActions: string[];
  blockedActions: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ManagedAsset {
  id: string;
  agentId?: string;
  type: AssetType;
  name: string;
  brand?: string;
  model?: string;
  year?: number;
  location?: string;
  status: string;
  ownerContactId?: string;
  notes?: string;
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface InboxMessage {
  id: string;
  agentId?: string;
  source: Source;
  senderName: string;
  senderCompany?: string;
  senderRole: LeadRole;
  body: string;
  relatedAssetId?: string;
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
  agentId?: string;
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
  agentId?: string;
  type: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: Urgency;
  relatedLeadId?: string;
  relatedMessageId?: string;
  relatedAssetId?: string;
  createdAt: string;
}

export interface ApprovalItem {
  id: string;
  agentId?: string;
  type: string;
  title: string;
  payload: string;
  status: ApprovalStatus;
  riskLevel: RiskLevel;
  relatedMessageId?: string;
  relatedAssetId?: string;
  createdAt: string;
}

export interface MemoryEntry {
  id: string;
  agentId?: string;
  personName: string;
  company?: string;
  role: string;
  relationshipStatus: string;
  trustLevel: "unknown" | "low" | "medium" | "high";
  pastInteractions: string[];
  preferredCommunicationStyle?: string;
  knownAssetInterests?: string;
  knownYachtInterests?: string;
  dealHistory?: string;
  warnings?: string;
  adminNotes?: string;
  agentLearnedObservations?: string;
  updatedAt: string;
}

export interface KnowledgeEntry {
  id: string;
  agentId?: string;
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
  agentId?: string;
  action: string;
  actor: "admin" | "agent" | "system";
  details: string;
  createdAt: string;
}

export type AiTaskType = "conversation_reply" | "legal_risk_review" | "document_analysis" | "market_research" | "lead_scoring" | "memory_extraction" | "support_debug" | "code_fix_prompt" | "summarization" | "translation" | "classification";
export type AiProviderName = "openai" | "anthropic" | "gemini" | "perplexity" | "local" | "mock";

export interface AiProviderSetting {
  provider: AiProviderName;
  enabled: boolean;
  configured: boolean;
  strengths: AiTaskType[];
}

export interface AiRoutingSettings {
  defaultProvider: AiProviderName;
  fallbackProvider: AiProviderName;
  costPriority: "low" | "medium" | "high";
  qualityPriority: "standard" | "high" | "critical";
  taskProviders: Record<AiTaskType, AiProviderName[]>;
  providers: AiProviderSetting[];
}

