// CIE Deduplication Module — URL-based and title/snippet deduplication.
// V1: per-run dedup by normalised URL and near-identical title+snippet.
// V2 will add cross-campaign and entity-level deduplication.

import type { SearchResult } from "../types";

function normaliseUrl(url: string): string {
  return url
    .toLowerCase()
    .replace(/^https?:\/\/(www\.)?/, "")
    .replace(/\/+$/, "")
    .split("?")[0]   // drop query string
    .split("#")[0];  // drop fragment
}

function normaliseTitle(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9À-ɏЀ-ӿ]+/g, " ")
    .trim()
    .slice(0, 60);
}

export type DedupeResult = {
  unique: SearchResult[];
  duplicates: SearchResult[];
  deduplicated: number;
};

export function deduplicate(results: SearchResult[]): DedupeResult {
  const seenUrls = new Set<string>();
  const seenTitles = new Set<string>();
  const unique: SearchResult[] = [];
  const duplicates: SearchResult[] = [];

  for (const result of results) {
    const urlKey = normaliseUrl(result.url || "");
    const titleKey = normaliseTitle(result.title || "");
    const isDuplicate =
      (urlKey.length > 8 && seenUrls.has(urlKey)) ||
      (titleKey.length > 15 && seenTitles.has(titleKey));

    if (isDuplicate) {
      duplicates.push(result);
    } else {
      if (urlKey.length > 8) seenUrls.add(urlKey);
      if (titleKey.length > 15) seenTitles.add(titleKey);
      unique.push(result);
    }
  }

  return { unique, duplicates, deduplicated: duplicates.length };
}
