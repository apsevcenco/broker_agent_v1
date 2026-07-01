// CIE Opportunity Score Module — PLACEHOLDER (CIE V2)
//
// Planned responsibility: composite commercial opportunity scoring.
// V1 ranking returns A/B/C/D relevance grades.
// V2 Opportunity Score will be a richer, multi-factor numeric score (0–100):
//   - Relevance grade (from RankingModule)        → 30 pts
//   - Demand urgency (from FreshnessModule)        → 20 pts
//   - Geography match quality (GeographyModule)    → 15 pts
//   - Estimated revenue potential                  → 20 pts
//   - Historical success rate for this lead type   → 15 pts
//
// Future consumers: Lead Hunter Results workspace, Mission Control urgent banner,
// Charter Agent, Yacht Broker Agent

import type { CIEContext, SearchQuality, SearchResult } from "../types";

export type OpportunityScore = {
  score: number;        // 0–100 composite score
  grade: "A" | "B" | "C" | "D";
  factors: Record<string, number>;
  reason: string;
};

export function computeOpportunityScore(
  _result: SearchResult,
  _quality: SearchQuality,
  _ctx: CIEContext
): OpportunityScore {
  throw new Error("OpportunityScoreModule not yet implemented — planned for CIE V2");
}
