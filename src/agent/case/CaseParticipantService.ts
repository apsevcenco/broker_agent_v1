import type { CaseParticipant } from "../../shared/types";
import { repository } from "../../backend/data/repository";

export async function findOrCreateParticipant(params: {
  caseId: string;
  name: string;
  email?: string;
  role: string;
}): Promise<CaseParticipant> {
  const existing = await repository.findParticipantInCase(params.caseId, params.name);
  if (existing) {
    console.log(`[CaseParticipant] Reusing ${existing.id} for "${existing.name}" in case ${params.caseId}`);
    return existing;
  }

  const participant: CaseParticipant = {
    id:         crypto.randomUUID(),
    caseId:     params.caseId,
    name:       params.name,
    email:      params.email,
    role:       params.role,
    status:     "active",
    createdAt:  new Date().toISOString()
  };

  const created = await repository.createCaseParticipant(participant);
  console.log(`[CaseParticipant] Created ${created.id} for "${created.name}" in case ${params.caseId}`);
  return created;
}
