import type { InboxMessage, RiskLevel } from "../shared/types";
import { requiresApproval } from "./rules";

export function assessRisk(message: Pick<InboxMessage, "body" | "urgency">): RiskLevel {
  const body = message.body.toLowerCase();
  if (message.urgency === "critical" || requiresApproval(body)) return "critical";
  if (["owner", "location", "commission", "nda", "lawyer", "tax", "sanction", "offer"].some((term) => body.includes(term))) return "high";
  if (["price", "budget", "documents", "survey", "valuation"].some((term) => body.includes(term))) return "medium";
  return "low";
}
