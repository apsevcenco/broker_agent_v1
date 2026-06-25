import type { KnowledgeEntry } from "../shared/types";
import type { KnowledgeReliability, RetrievalQuery, RetrievalResult } from "./knowledgeTypes";
import { repository } from "../backend/data/repository";
import { searchKnowledge } from "../agent/knowledgeSearch";
import { supabase } from "../backend/data/supabaseClient";

const RELIABILITY_WEIGHT: Record<string, number> = {
  verified: 4,
  high: 3,
  medium: 2,
  low: 1
};

function entryToResult(entry: KnowledgeEntry, rankIndex: number, total: number): RetrievalResult {
  const reliabilityBonus = RELIABILITY_WEIGHT[entry.reliabilityLevel] || 1;
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
    score: (total - rankIndex) * reliabilityBonus
  };
}

export async function retrieveKnowledgeForAgent(query: RetrievalQuery): Promise<RetrievalResult[]> {
  const { agentId, query: queryText, limit = 10, includeGlobal = true } = query;

  // Step 1: existing knowledge_entries via repository (Supabase or in-memory)
  const allEntries = await repository.listKnowledge();
  const candidates = allEntries.filter(
    (e) => e.agentId === agentId || (includeGlobal && !e.agentId)
  );
  const scored = searchKnowledge(candidates, queryText, limit * 2);
  const entryResults: RetrievalResult[] = scored.map((entry, i) =>
    entryToResult(entry, i, scored.length)
  );

  // Step 2: knowledge_chunks — V1 likely empty; fails silently if table not yet present
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
        .limit(limit * 2);
      if (data && data.length > 0) {
        const terms = queryText.toLowerCase().split(/\W+/).filter((t) => t.length > 2);
        const rankable = data
          .map((row: any) => {
            const text = `${row.title || ""} ${row.content} ${(row.tags || []).join(" ")}`.toLowerCase();
            const termScore = terms.reduce((acc, t) => acc + (text.includes(t) ? 1 : 0), 0);
            return { row, score: termScore * (RELIABILITY_WEIGHT["medium"] || 2) };
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
      // knowledge_chunks table may not exist yet — degrade silently
    }
  }

  return [...entryResults, ...chunkResults]
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

// Adapter: maps RetrievalResult[] → KnowledgeEntry[] so suggestReply() signature stays unchanged.
// TODO: Future — replace searchKnowledge() in the suggest-reply route with retrieveKnowledgeForAgent(),
//       then convert with this adapter before passing to suggestReply().
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
