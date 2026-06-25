import type { ImportPlan, KnowledgeChunk, KnowledgeReview, KnowledgeSource, KnowledgeVersion } from "./knowledgeTypes";

export const knowledgeStore = {
  sources: [] as KnowledgeSource[],
  chunks: [] as KnowledgeChunk[],
  reviews: [] as KnowledgeReview[],
  versions: [] as KnowledgeVersion[],
  importPlans: [] as ImportPlan[]
};
