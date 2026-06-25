import type { AgentDefinition, InboxMessage, Lead, ManagedAsset, MemoryEntry } from "../../shared/types";
import type { RetrievalResult } from "../../knowledge/knowledgeTypes";
import type { Capability } from "./Capability";

export interface IntelligenceContext {
  // Primary input
  message: InboxMessage;

  // Knowledge base results pre-retrieved for this request
  knowledge: RetrievalResult[];

  // Relationship memory relevant to this sender (pre-filtered, ranked)
  memory: MemoryEntry[];

  // Broader agent relationship memory (all entries, for context)
  relationshipMemory: MemoryEntry[];

  // Existing CRM lead for this contact, if any
  lead?: Lead | null;

  // Related managed assets
  assets: ManagedAsset[];

  // The executing agent definition
  agent: AgentDefinition | null;

  // Which capabilities are available in this execution context
  capabilities: Capability[];

  // Extension point for future profile-specific metadata
  metadata?: Record<string, unknown>;
}
