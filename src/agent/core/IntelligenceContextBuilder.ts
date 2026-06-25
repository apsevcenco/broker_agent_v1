import type { InboxMessage } from "../../shared/types";
import type { IntelligenceContext, ParticipantSummary } from "./IntelligenceContext";
import { repository } from "../../backend/data/repository";
import { buildKnowledgeQuery } from "../knowledgeSearch";
import { retrieveKnowledgeForAgent } from "../../knowledge/retrieval";

export async function buildIntelligenceContext(params: {
  message: InboxMessage;
  agentId: string;
  caseId: string;
  triggeringEventId: string;
  caseProfile: string;
  caseStatus: string;
  participants: ParticipantSummary[];
  classification: string;
}): Promise<IntelligenceContext> {
  const [knowledgeResults, allMemory] = await Promise.all([
    retrieveKnowledgeForAgent({
      agentId:       params.agentId,
      query:         buildKnowledgeQuery({ ...params.message, classification: params.classification }),
      limit:         5,
      includeGlobal: true
    }),
    repository.listMemory()
  ]);

  const agentMemory = params.agentId
    ? allMemory.filter(m => m.agentId === params.agentId)
    : allMemory;

  const senderLower = params.message.senderName.toLowerCase();
  const senderMatches = agentMemory.filter(m =>
    m.personName.toLowerCase().includes(senderLower) ||
    senderLower.includes(m.personName.toLowerCase())
  );
  const contextMemory = [
    ...senderMatches,
    ...agentMemory.filter(m => !senderMatches.includes(m))
  ].slice(0, 5);

  return {
    message:           params.message,
    knowledge:         knowledgeResults,
    memory:            contextMemory,
    relationshipMemory: agentMemory.slice(0, 10),
    assets:            [],
    agent:             null,
    capabilities:      ["knowledge", "memory", "inbox", "tasks", "crm"],
    companyId:         "internal",
    caseId:            params.caseId || undefined,
    triggeringEventId: params.triggeringEventId || undefined,
    caseProfile:       params.caseProfile,
    caseStatus:        params.caseStatus,
    participants:      params.participants,
    metadata:          { agentId: params.agentId, preliminaryClassification: params.classification }
  };
}
