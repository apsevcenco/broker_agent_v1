// Integration note: this function uses KnowledgeEntry[] from the existing knowledge_entries table.
// TODO: Future — replace the searchKnowledge() call in src/backend/routes/api.ts (suggest-reply handler)
//   with retrieveKnowledgeForAgent() from src/knowledge/retrieval.ts, then use
//   mapResultsToKnowledgeEntries() to convert RetrievalResult[] → KnowledgeEntry[] before
//   passing here. This will include knowledge_chunks and global entries without changing this
//   function's signature.
import type { InboxMessage, KnowledgeEntry } from "../shared/types";
import { assessRisk } from "./riskAssessment";

const templates: Record<string, string> = {
  "buyer inquiry": "Thank you for your message. At broker level, I would first separate the acquisition criteria from the operating structure: intended private versus charter use, cruising area, ownership structure, VAT/import position, class/commercial coding, insurance warranties, crew model and future resale all need to align before a specific yacht is pursued. For a mixed private and limited charter profile, the flag and registration route should be reviewed against where the yacht will cruise, whether EU charter is intended, what commercial compliance is required, and how insurers and future buyers will view the setup. We should confirm the target size and builders, budget, delivery timeframe, cruising programme, charter expectations, proof-of-funds process, purchase authority and broker representation, then route tax, flag, class and insurance points to the relevant specialists before any final position is taken.",
  "broker cooperation": "Thank you for reaching out. We can review cooperation on a discreet, case-by-case basis. Before any yacht, owner or commercial details are shared, we should confirm mandate, buyer qualification, confidentiality expectations and commission framework for human approval.",
  "seller inquiry": "Thank you for the introduction. The next sensible step is to understand ownership status, asking expectations, documentation readiness, location constraints and preferred confidentiality level. I can prepare an internal valuation and positioning note after review.",
  "owner representative inquiry": "Thank you. We can handle this discreetly. I would first confirm your authority to represent the owner, the desired process, disclosure limits and documentation available for review.",
  "captain inquiry": "Thank you. Please share the operational context, yacht size, location range and the decision maker involved. I will keep any sensitive yacht or owner detail internal until approved.",
  "investor inquiry": "Thank you for your message. To qualify the opportunity, I would suggest confirming investment mandate, return expectations, hold period, preferred yacht segment and risk constraints before discussing specific assets.",
  "NDA step": "An NDA may be appropriate before any sensitive disclosure. I can prepare a draft step for admin review; no document should be sent automatically in V1.",
  "commission agreement step": "Commission terms should be handled carefully and only after human review. I can prepare a summary of the requested commercial structure for approval.",
  "unavailable yacht": "Thank you for the inquiry. That opportunity may no longer be available, but we can review matching alternatives if your criteria and qualification details are current.",
  "off-market confidentiality explanation": "Off-market opportunities require a controlled process. Yacht identity, owner details, exact location and documents are only disclosed after qualification, confidentiality checks and approval.",
  "PDYE registration invitation": "A PDYE Deal Room may be appropriate for controlled next steps once the lead is qualified and approved by the admin.",
  "follow-up after no response": "I wanted to follow up discreetly on the below. If the requirement is still active, please send any updated criteria or timeline and I will prepare the next step for review.",
  "polite rejection": "Thank you for reaching out. Based on the current information, this does not appear to be a fit for our process, but I appreciate the introduction."
};

function summarizeKnowledge(entries: KnowledgeEntry[]) {
  if (!entries.length) return "No knowledge entries matched this draft.";
  return entries.slice(0, 5).map((entry, index) => `${index + 1}. ${entry.title} (${entry.category}, ${entry.reliabilityLevel}) - ${entry.summary}`).join("\n");
}

export function suggestReply(message: InboxMessage, classification: string, knowledge: KnowledgeEntry[] = []): string {
  const risk = assessRisk(message);
  const base = templates[classification] || templates["buyer inquiry"];
  const knowledgeNote = summarizeKnowledge(knowledge);
  return `${base}\n\nKnowledge used:\n${knowledgeNote}\n\nInternal note: risk level ${risk}. This is a draft only and requires admin approval before any external use. Do not present legal, tax, flag-state, insurance or class guidance as final advice without specialist review.`;
}

export const suggestedReplyTemplates = templates;
