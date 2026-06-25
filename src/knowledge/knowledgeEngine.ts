import { retrieveKnowledgeForAgent, mapResultsToKnowledgeEntries } from "./retrieval";
import { chunkText } from "./chunking";
import { listSources, createSource, getSource, updateSource } from "./sourceLibrary";
import { listReviews, createReviewRequest, approveKnowledgeItem, rejectKnowledgeItem } from "./reviewWorkflow";
import { createKnowledgeVersion, listKnowledgeVersions } from "./versioning";
import { createImportPlan, listImportPlans } from "./importPlanner";

export const knowledgeEngine = {
  retrieve: retrieveKnowledgeForAgent,
  adapt: mapResultsToKnowledgeEntries,
  sources: { list: listSources, create: createSource, get: getSource, update: updateSource },
  chunks: { chunkText },
  reviews: { list: listReviews, create: createReviewRequest, approve: approveKnowledgeItem, reject: rejectKnowledgeItem },
  versions: { create: createKnowledgeVersion, list: listKnowledgeVersions },
  planning: { create: createImportPlan, list: listImportPlans }
};
