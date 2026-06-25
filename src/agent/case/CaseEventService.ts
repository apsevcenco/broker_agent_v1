import type { CaseEvent } from "../../shared/types";
import { repository } from "../../backend/data/repository";

const COMPANY_ID = "internal";

export async function appendCaseEvent(params: {
  caseId: string;
  eventType: string;
  actorType: CaseEvent["actorType"];
  actorId?: string;
  summary: string;
  payload: Record<string, unknown>;
  relatedEntityType?: string;
  relatedEntityId?: string;
}): Promise<CaseEvent> {
  const event: CaseEvent = {
    id:                 crypto.randomUUID(),
    caseId:             params.caseId,
    companyId:          COMPANY_ID,
    eventType:          params.eventType,
    actorType:          params.actorType,
    actorId:            params.actorId,
    summary:            params.summary,
    payload:            params.payload,
    relatedEntityType:  params.relatedEntityType,
    relatedEntityId:    params.relatedEntityId,
    createdAt:          new Date().toISOString()
  };
  return repository.createCaseEvent(event);
}
