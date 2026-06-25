import type { Case, InboxMessage } from "../../shared/types";
import { repository } from "../../backend/data/repository";

const COMPANY_ID = "internal";

function deriveCaseType(message: InboxMessage, classification?: string): string {
  const hint = ((classification ?? "") + " " + (message.classification ?? "")).toLowerCase();
  if (hint.includes("buyer"))      return "buyer_inquiry";
  if (hint.includes("seller"))     return "seller_inquiry";
  if (hint.includes("broker"))     return "broker_cooperation";
  if (hint.includes("charter"))    return "charter_request";
  if (hint.includes("invest"))     return "investment_inquiry";
  const r = message.senderRole;
  if (r === "buyer")               return "buyer_inquiry";
  if (r === "seller")              return "seller_inquiry";
  if (r === "broker")              return "broker_cooperation";
  return "general";
}

export async function resolveCase(
  message: InboxMessage,
  caseProfile: string,
  classification?: string
): Promise<{ caseId: string; isNew: boolean; caseStatus: string }> {
  const existing = await repository.findOpenCaseByContact(message.senderName, caseProfile);
  if (existing) {
    console.log(`[CaseRuntime] Reusing case ${existing.id} for "${message.senderName}" (profile=${caseProfile})`);
    return { caseId: existing.id, isNew: false, caseStatus: existing.status };
  }

  const ts = new Date().toISOString();
  const newCase: Case = {
    id:                     crypto.randomUUID(),
    companyId:              COMPANY_ID,
    title:                  `Enquiry from ${message.senderName}`,
    caseType:               deriveCaseType(message, classification),
    caseProfile,
    status:                 "open",
    source:                 message.source,
    primaryContactName:     message.senderName,
    primaryContactEmail:    undefined,
    createdFromMessageId:   message.id,
    createdAt:              ts,
    updatedAt:              ts
  };

  const created = await repository.createCase(newCase);
  console.log(`[CaseRuntime] Created case ${created.id} (${created.caseType}) for "${message.senderName}" (profile=${caseProfile})`);
  return { caseId: created.id, isNew: true, caseStatus: "open" };
}
