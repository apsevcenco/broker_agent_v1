import type { InboxMessage } from "../shared/types";

export function classifyMessage(message: Pick<InboxMessage, "body" | "senderRole">): string {
  // senderRole is the strongest signal — check before body keywords
  if (message.senderRole === "buyer")  return "buyer inquiry";
  if (message.senderRole === "seller") return "seller inquiry";
  if (message.senderRole === "broker") return "broker cooperation";
  const body = message.body.toLowerCase();
  if (body.includes("charter")) return "charter inquiry";
  if (body.includes("sell") || body.includes("listing")) return "seller inquiry";
  if (body.includes("buy") || body.includes("budget")) return "buyer inquiry";
  if (body.includes("commission")) return "broker cooperation";
  if (body.includes("valuation") || body.includes("worth")) return "valuation request";
  if (body.includes("distressed") || body.includes("urgent sale")) return "distressed opportunity";
  if (body.includes("nda")) return "NDA step";
  return "general brokerage inquiry";
}
