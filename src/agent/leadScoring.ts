import type { InboxMessage, LeadScore } from "../shared/types";

export function scoreLead(input: Pick<InboxMessage, "body" | "senderRole" | "urgency">): LeadScore {
  const body = input.body.toLowerCase();
  if (["spam", "seo", "crypto", "loan"].some((term) => body.includes(term))) return "Spam";
  if (input.urgency === "critical" && /budget|proof of funds|ready|this week/.test(body)) return "A+";
  if (/budget|proof of funds|ready|owner|exclusive|mandate/.test(body)) return "A";
  if (/interested|looking|available|details|valuation/.test(body)) return "B";
  if (/info|brochure|send/.test(body)) return "C";
  return "D";
}
