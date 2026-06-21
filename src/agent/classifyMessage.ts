import type { InboxMessage } from "../shared/types";

export function classifyMessage(message: Pick<InboxMessage, "body" | "senderRole">): string {
  const body = message.body.toLowerCase();
  if (body.includes("charter")) return "charter inquiry";
  if (body.includes("sell") || body.includes("listing")) return "seller inquiry";
  if (body.includes("buy") || body.includes("budget")) return "buyer inquiry";
  if (body.includes("commission") || message.senderRole === "broker") return "broker cooperation";
  if (body.includes("valuation") || body.includes("worth")) return "valuation request";
  if (body.includes("distressed") || body.includes("urgent sale")) return "distressed opportunity";
  if (body.includes("nda")) return "NDA step";
  return "general brokerage inquiry";
}
