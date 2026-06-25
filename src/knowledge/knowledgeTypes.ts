export type SourceType = "pdf" | "docx" | "txt" | "html" | "url" | "manual" | "other";
export type SourceStatus = "draft" | "imported" | "reviewed" | "approved" | "archived" | "failed";
export type SourceScope = "global" | "agent";
export type ReviewStatus = "pending" | "approved" | "rejected" | "needs_changes";
export type KnowledgeReliability = "low" | "medium" | "high" | "verified";

export interface KnowledgeSource {
  id: string;
  agentId?: string;
  scope: SourceScope;
  sourceType: SourceType;
  title: string;
  description?: string;
  originalUrl?: string;
  storagePath?: string;
  sourceAuthority?: string;
  reliabilityLevel: KnowledgeReliability;
  jurisdiction?: string;
  language: string;
  publicationDate?: string;
  lastCheckedAt?: string;
  status: SourceStatus;
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface KnowledgeChunk {
  id: string;
  sourceId: string;
  agentId?: string;
  chunkIndex: number;
  title?: string;
  content: string;
  summary?: string;
  pageNumber?: number;
  sectionReference?: string;
  tags: string[];
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface KnowledgeReview {
  id: string;
  sourceId?: string;
  knowledgeEntryId?: string;
  reviewer: string;
  status: ReviewStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface KnowledgeVersion {
  id: string;
  knowledgeEntryId: string;
  versionNumber: number;
  title: string;
  summary: string;
  content: string;
  source?: string;
  reliabilityLevel: KnowledgeReliability;
  changedBy: string;
  changeNote?: string;
  createdAt: string;
}

export interface ImportPlan {
  id: string;
  agentId?: string;
  topic: string;
  category: string;
  sourceUrls: string[];
  notes?: string;
  reliabilityExpectation: KnowledgeReliability;
  status: "planned" | "in_review" | "approved" | "rejected";
  createdAt: string;
}

export interface RetrievalQuery {
  agentId: string;
  query: string;
  limit?: number;
  includeGlobal?: boolean;
  categories?: string[];
  minReliability?: KnowledgeReliability;
}

export interface RetrievalResult {
  id: string;
  type: "knowledge_entry" | "knowledge_chunk";
  title: string;
  summary: string;
  content: string;
  category?: string;
  tags: string[];
  reliabilityLevel: KnowledgeReliability;
  source?: string;
  agentId?: string;
  score: number;
}

export interface TextChunk {
  chunkIndex: number;
  content: string;
  charStart: number;
  charEnd: number;
}
