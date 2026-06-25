import type { KnowledgeEntry } from "../shared/types";
import type { KnowledgeReliability, RetrievalQuery, RetrievalResult } from "./knowledgeTypes";
import { repository } from "../backend/data/repository";
import { supabase } from "../backend/data/supabaseClient";

const RELIABILITY_WEIGHT: Record<string, number> = {
  verified: 8,
  high: 5,
  medium: 2,
  low: 0
};

const STOP_WORDS = new Set([
  "the", "and", "for", "with", "from", "that", "this", "are", "will", "need", "want", "looking",
  "please", "about", "into", "have", "has", "our", "your", "you", "via", "manual", "email", "yacht",
  "yachts", "motor", "enquiry", "inquiry", "brokerage", "agent", "client", "contact"
]);

const COMPLIANCE_TERMS = [
  "solas", "marpol", "mlc", "ism", "isps", "compliance", "safety", "pollution", "sewage", "garbage",
  "waste", "certificate", "certificates", "class", "flag", "registry", "tonnage", "regulation", "regulatory"
];

const CLOSING_TERMS = ["escrow", "deposit", "payment", "closing", "refund", "bank", "moa", "spa", "offer", "loi"];

type RetrievalIntent = {
  buyer: boolean;
  seller: boolean;
  broker: boolean;
  nda: boolean;
  offMarket: boolean;
  compliance: boolean;
  closing: boolean;
};

function tokenize(value: string): string[] {
  return value
    .toLowerCase()
    .split(/[^a-z0-9ÃƒÆ’Ã‚ÂÃƒâ€šÃ‚Â°-ÃƒÆ’Ã¢â‚¬ËœÃƒâ€šÃ‚ÂÃƒÆ’Ã¢â‚¬ËœÃƒÂ¢Ã¢â€šÂ¬Ã‹Å“]+/i)
    .map((term) => term.trim())
    .filter((term) => term.length > 2 && !STOP_WORDS.has(term));
}

function includesAny(text: string, terms: string[]): boolean {
  return terms.some((term) => text.includes(term));
}

function inferIntent(queryText: string): RetrievalIntent {
  const q = queryText.toLowerCase();
  return {
    buyer:      includesAny(q, ["buyer", "buy", "purchase", "acquisition", "family office", "proof of funds", "pof", "budget"]),
    seller:     includesAny(q, ["seller", "sell", "owner", "mandate", "valuation", "listing"]),
    broker:     includesAny(q, ["broker", "cooperation", "commission", "co-broker"]),
    nda:        includesAny(q, ["nda", "non-disclosure", "confidentiality", "confidential"]),
    offMarket:  includesAny(q, ["off-market", "private sale", "confidential", "discreet"]),
    compliance: includesAny(q, COMPLIANCE_TERMS),
    closing:    includesAny(q, CLOSING_TERMS)
  };
}


function scoreEntry(entry: KnowledgeEntry, terms: string[], intent: RetrievalIntent): number {
  const title = entry.title.toLowerCase();
  const category = entry.category.toLowerCase();
  const summary = entry.summary.toLowerCase();
  const content = entry.content.toLowerCase();
  const tags = entry.tags.join(" ").toLowerCase();
  const all = `${title} ${category} ${summary} ${content} ${tags}`;

  let score = RELIABILITY_WEIGHT[entry.reliabilityLevel] ?? 0;

  for (const term of terms) {
    if (title.includes(term)) score += 10;
    if (category.includes(term)) score += 7;
    if (tags.includes(term)) score += 6;
    if (summary.includes(term)) score += 4;
    if (content.includes(term)) score += 1;
  }

  const isBrokerageProcess = category.includes("brokerage process") || all.includes("qualification") || all.includes("lead scoring");
  const isConfidentiality = category.includes("off-market") || all.includes("confidentiality") || all.includes("controlled disclosure");
  const isNda = all.includes("nda") || all.includes("non-disclosure");
  const isCompliance = category.includes("safety and compliance") || includesAny(all, COMPLIANCE_TERMS);
  const isClosing = category.includes("contracts") || category.includes("deal flow") || includesAny(all, CLOSING_TERMS);

  if (intent.buyer) {
    if (title.includes("buyer") || all.includes("buyer qualification")) score += 34;
    if (isConfidentiality) score += 18;
    if (isNda) score += 18;
    if (isBrokerageProcess) score += 12;
    if (all.includes("document disclosure") || all.includes("controlled materials")) score += 10;
    if (all.includes("proof-of-funds") || all.includes("proof of funds") || all.includes("budget")) score += 10;
  }

  if (intent.seller) {
    if (title.includes("seller") || all.includes("seller qualification")) score += 34;
    if (all.includes("owner") || all.includes("mandate") || all.includes("valuation")) score += 12;
    if (isConfidentiality) score += 12;
  }

  if (intent.broker) {
    if (title.includes("broker") || all.includes("broker cooperation")) score += 34;
    if (all.includes("mandate") || all.includes("buyer qualification")) score += 10;
    if (isConfidentiality || isNda) score += 10;
  }

  if (intent.nda && isNda) score += 22;
  if (intent.offMarket && isConfidentiality) score += 20;
  if (intent.offMarket && isNda) score += 12;

  if (intent.compliance) {
    if (isCompliance) score += 30;
  } else if (isCompliance) {
    score -= 38;
  }

  if (intent.closing) {
    if (isClosing) score += 18;
  } else if (isClosing && (intent.buyer || intent.seller || intent.broker)) {
    score -= 14;
  }

  return score;
}

function entryToResult(entry: KnowledgeEntry, score: number): RetrievalResult {
  return {
    id: entry.id,
    type: "knowledge_entry",
    title: entry.title,
    summary: entry.summary,
    content: entry.content,
    category: entry.category,
    tags: entry.tags,
    reliabilityLevel: entry.reliabilityLevel as KnowledgeReliability,
    source: entry.source,
    agentId: entry.agentId,
    score
  };
}

function passesFilters(entry: KnowledgeEntry, query: RetrievalQuery): boolean {
  if (query.categories?.length && !query.categories.includes(entry.category)) return false;
  if (query.minReliability) {
    const min = RELIABILITY_WEIGHT[query.minReliability] ?? 0;
    const current = RELIABILITY_WEIGHT[entry.reliabilityLevel] ?? 0;
    if (current < min) return false;
  }
  return true;
}

export async function retrieveKnowledgeForAgent(query: RetrievalQuery): Promise<RetrievalResult[]> {
  const { agentId, query: queryText, limit = 10, includeGlobal = true } = query;
  const terms = tokenize(queryText);
  const intent = inferIntent(queryText);

  // Step 1: existing knowledge_entries via repository (Supabase or in-memory).
  // V2 ranking is context-aware: it boosts the current business intent and suppresses
  // compliance/legal material unless the user message actually asks for it.
  const allEntries = await repository.listKnowledge();
  const candidates = allEntries.filter(
    (e) => (e.agentId === agentId || (includeGlobal && !e.agentId)) && passesFilters(e, query)
  );
  const entryResults: RetrievalResult[] = candidates
    .map((entry) => ({ entry, score: scoreEntry(entry, terms, intent) }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit * 2)
    .map(({ entry, score }) => entryToResult(entry, score));

  // Step 2: knowledge_chunks - V1 likely empty; fails silently if table not yet present.
  const chunkResults: RetrievalResult[] = [];
  if (supabase) {
    try {
      const filter = includeGlobal
        ? `agent_id.eq.${agentId},agent_id.is.null`
        : `agent_id.eq.${agentId}`;
      const { data } = await supabase
        .from("knowledge_chunks")
        .select("*")
        .or(filter)
        .limit(limit * 3);
      if (data && data.length > 0) {
        const rankable = data
          .map((row: any) => {
            const text = `${row.title || ""} ${row.content} ${(row.tags || []).join(" ")}`.toLowerCase();
            let score = terms.reduce((acc, term) => acc + (text.includes(term) ? 3 : 0), 0);
            const isCompliance = includesAny(text, COMPLIANCE_TERMS);
            if (intent.compliance && isCompliance) score += 20;
            if (!intent.compliance && isCompliance) score -= 25;
            return { row, score };
          })
          .filter((item) => item.score > 0)
          .sort((a, b) => b.score - a.score)
          .slice(0, limit);
        for (const { row, score } of rankable) {
          chunkResults.push({
            id: row.id,
            type: "knowledge_chunk",
            title: row.title || `Chunk ${row.chunk_index}`,
            summary: row.summary || (row.content as string).slice(0, 200),
            content: row.content,
            tags: row.tags || [],
            reliabilityLevel: "medium",
            agentId: row.agent_id ?? undefined,
            score
          });
        }
      }
    } catch {
      // knowledge_chunks table may not exist yet - degrade silently.
    }
  }

  return [...entryResults, ...chunkResults]
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

// Adapter: maps RetrievalResult[] -> KnowledgeEntry[] so suggestReply() signature stays unchanged.
export function mapResultsToKnowledgeEntries(results: RetrievalResult[]): KnowledgeEntry[] {
  return results.map((r) => ({
    id: r.id,
    agentId: r.agentId,
    title: r.title,
    category: r.category || "General",
    summary: r.summary,
    content: r.content,
    source: r.source,
    reliabilityLevel: r.reliabilityLevel,
    tags: r.tags,
    createdAt: "",
    updatedAt: ""
  }));
}
