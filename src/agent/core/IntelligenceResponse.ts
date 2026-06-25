import type { RecommendedDecision } from "./RecommendedDecision";
import type { ExecutionPlan } from "./ExecutionPlan";
import type { LearningUpdate } from "./LearningUpdate";

// What the engine perceived about the input
export interface PerceptionLayer {
  conversationType: string;
  conversationStage: string;
  urgency: string;
  senderProfile: string;
  intentSummary: string;
}

// How the engine reasoned about the input
export interface ReasoningLayer {
  leadScore: string;
  leadScoreReason: string;
  riskLevel: string;
  riskReason: string;
  missingQualificationItems: string[];
  knowledgeUsed: Array<{ title: string; category: string; reliability: string; relevance: string }>;
  memoryUsed: Array<{ personName: string; trustLevel: string; context: string; relevance: string }>;
  adminReasoningSummary: string;
}

// The decision reached after reasoning
export interface DecisionLayer {
  recommendation: RecommendedDecision;
  rationale: string;
  safetyNotes: string;
  approvalRequired: boolean;
}

// What the engine plans to do next
export interface PlanningLayer {
  suggestedNextActions: string[];
  executionPlan: ExecutionPlan;
}

// What was produced for execution (drafts, not yet sent)
export interface ExecutionLayer {
  draftContent: string;
  draftProvider: string;
  draftMocked: boolean;
}

// What the engine learned from this interaction
export interface LearningLayer {
  updates: LearningUpdate;
}

// Profile-specific draft output stored as the approval payload.
// Typed as a flexible record so each profile can include its own fields
// without breaking the unified response contract.
export type DraftLayer = Record<string, unknown>;

export interface IntelligenceResponse {
  profileId: string;
  agentId?: string;
  perception: PerceptionLayer;
  reasoning: ReasoningLayer;
  decision: DecisionLayer;
  planning: PlanningLayer;
  execution: ExecutionLayer;
  learning: LearningLayer;
  draft: DraftLayer;
  createdAt: string;
}
