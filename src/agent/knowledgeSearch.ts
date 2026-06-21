import type { KnowledgeEntry } from "../shared/types";

export function searchKnowledge(entries: KnowledgeEntry[], query: string): KnowledgeEntry[] {
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (!terms.length) return entries;
  return entries.filter((entry) => {
    const haystack = [entry.title, entry.category, entry.summary, entry.content, entry.tags.join(" ")].join(" ").toLowerCase();
    return terms.every((term) => haystack.includes(term));
  });
}
