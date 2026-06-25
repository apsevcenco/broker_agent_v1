import type { KnowledgeEntry } from "../shared/types";

function tokenize(value: string) {
  return value.toLowerCase().split(/[^a-z0-9а-яё]+/i).map((term) => term.trim()).filter((term) => term.length > 2);
}

export function searchKnowledge(entries: KnowledgeEntry[], query: string, limit = 10): KnowledgeEntry[] {
  const terms = tokenize(query);
  if (!terms.length) return entries.slice(0, limit);

  return entries
    .map((entry) => {
      const title = entry.title.toLowerCase();
      const category = entry.category.toLowerCase();
      const summary = entry.summary.toLowerCase();
      const content = entry.content.toLowerCase();
      const tags = entry.tags.join(" ").toLowerCase();
      let score = 0;
      for (const term of terms) {
        if (title.includes(term)) score += 6;
        if (category.includes(term)) score += 4;
        if (tags.includes(term)) score += 4;
        if (summary.includes(term)) score += 3;
        if (content.includes(term)) score += 1;
      }
      if (entry.reliabilityLevel === "verified") score += 2;
      if (entry.reliabilityLevel === "high") score += 1;
      return { entry, score };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((item) => item.entry);
}

export function buildKnowledgeQuery(input: { body?: string; classification?: string; senderRole?: string; relatedYacht?: string; relatedDeal?: string }) {
  return [input.classification, input.senderRole, input.relatedYacht, input.relatedDeal, input.body].filter(Boolean).join(" ");
}
