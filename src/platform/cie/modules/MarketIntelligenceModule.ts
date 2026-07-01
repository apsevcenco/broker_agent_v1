// CIE Market Intelligence Module — PLACEHOLDER (CIE V2)
//
// Planned responsibility: aggregate market signals across multiple searches
// into a structured market picture per business line.
// Individual search results are noise; this module will find signal.
//
// Planned outputs:
//   - Demand trend: growing / stable / declining
//   - Active hotspots: geographies with highest recent demand
//   - Supply observations: new fleet additions, yacht listings, service gaps
//   - Competitive signals: competitor activity, pricing shifts
//   - Season readiness: approaching charter or sale season indicators
//
// Primary search mode: market_intelligence
// Future consumers: Mission Control (Market Pulse section),
// Charter Agent (season planning), Yacht Broker Agent (market timing)

import type { BusinessLine, SearchResult } from "../types";

export type MarketPicture = {
  businessLine: BusinessLine;
  demandTrend: "growing" | "stable" | "declining" | "unknown";
  hotspots: string[];
  supplyNotes: string[];
  competitiveSignals: string[];
  generatedAt: string;
};

export function buildMarketPicture(
  _results: SearchResult[],
  _businessLine: BusinessLine
): MarketPicture {
  throw new Error("MarketIntelligenceModule not yet implemented — planned for CIE V2");
}
