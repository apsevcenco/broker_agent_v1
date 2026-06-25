export interface MemoryUpdateCandidate {
  personName: string;
  updates: Record<string, unknown>;
  confidence: number;
}

export interface KnowledgeCandidate {
  title: string;
  category: string;
  content: string;
  source: string;
}

export interface ExperienceCandidate {
  conversationType: string;
  outcome: string;
  lessonsLearned: string[];
}

export interface RelationshipUpdate {
  personName: string;
  changeType: "trust_increase" | "trust_decrease" | "new_signal" | "warning";
  details: string;
}

export interface LearningUpdate {
  memoryUpdates: MemoryUpdateCandidate[];
  knowledgeCandidates: KnowledgeCandidate[];
  experienceCandidates: ExperienceCandidate[];
  relationshipUpdates: RelationshipUpdate[];
}
