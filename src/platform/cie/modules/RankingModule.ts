// CIE Ranking Module — scores a single SearchResult against a CIEContext.
// Two scorers: standard (company/partner/market modes) and demand (demand_discovery mode).
// Caller decides which to invoke based on searchMode.

import type { BusinessLine, CIEContext, SearchQuality, SearchResult } from "../types";
import { DEMAND_SIGNALS, INTENT_TERMS, JUNK_TERMS, LINE_TERMS, URGENCY_SIGNALS } from "../vocabulary";

function lineTerms(line: BusinessLine): string[] {
  return line === "mixed"
    ? [...LINE_TERMS.yacht_sale, ...LINE_TERMS.yacht_charter, ...LINE_TERMS.car_rental]
    : LINE_TERMS[line];
}

function splitField(value?: string): string[] {
  return String(value || "").split(/[,;\n]/).map(s => s.trim()).filter(Boolean);
}

// Standard scorer — used for company_discovery, partner_discovery, market_intelligence.
export function scoreSearchResult(result: SearchResult, ctx: CIEContext): SearchQuality {
  const text = [result.title, result.url, result.snippet, result.query].join(" ").toLowerCase();
  const terms  = lineTerms(ctx.businessLine);
  const target = splitField(ctx.targetSegments).map(s => s.toLowerCase());
  const geo    = splitField(ctx.geography).map(s => s.toLowerCase());

  let points = 0;
  const reasons: string[] = [];

  const matchedLine = terms.filter(t => text.includes(t)).slice(0, 5);
  points += matchedLine.length * 12;
  if (matchedLine.length) reasons.push(`matched business terms: ${matchedLine.join(", ")}`);

  const matchedTarget = target.filter(t => text.includes(t)).slice(0, 4);
  points += matchedTarget.length * 14;
  if (matchedTarget.length) reasons.push(`matched target segment: ${matchedTarget.join(", ")}`);

  const matchedGeo = geo.filter(t => text.includes(t)).slice(0, 4);
  points += matchedGeo.length * 10;
  if (matchedGeo.length) reasons.push(`matched geography: ${matchedGeo.join(", ")}`);

  if (INTENT_TERMS.some(t => text.includes(t))) {
    points += 14;
    reasons.push("contains commercial intent or role signal");
  }
  if (JUNK_TERMS.some(t => text.includes(t))) {
    points -= 24;
    reasons.push("generic directory/news/SEO result risk");
  }
  if (!result.url || text.length < 120) points -= 10;

  const relevanceScore = points >= 58 ? "A" : points >= 40 ? "B" : points >= 24 ? "C" : "D";
  const confidence = Number(Math.max(0.2, Math.min(0.94, points / 85)).toFixed(2));
  return {
    accepted: relevanceScore !== "D",
    relevanceScore,
    confidence,
    reason: reasons.length ? reasons.join("; ") : "weak or generic public web signal"
  };
}

// Demand scorer — used exclusively for demand_discovery mode.
// Weights urgency and explicit demand signals higher than business term matching.
export function scoreDemandResult(result: SearchResult, ctx: CIEContext): SearchQuality {
  const text = [result.title, result.url, result.snippet, result.query].join(" ").toLowerCase();

  let points = 0;
  const reasons: string[] = [];

  const matchedDemand = DEMAND_SIGNALS.filter(s => text.includes(s));
  points += matchedDemand.length * 18;
  if (matchedDemand.length) reasons.push(`demand signals: ${matchedDemand.slice(0, 3).join(", ")}`);

  const matchedUrgency = URGENCY_SIGNALS.filter(s => text.includes(s));
  if (matchedUrgency.length) {
    points += matchedUrgency.length * 22;
    reasons.push(`urgency: ${matchedUrgency.slice(0, 2).join(", ")}`);
  }

  const terms = lineTerms(ctx.businessLine);
  const matchedLine = terms.filter(t => text.includes(t)).slice(0, 4);
  points += matchedLine.length * 10;
  if (matchedLine.length) reasons.push(`business terms: ${matchedLine.slice(0, 2).join(", ")}`);

  if (JUNK_TERMS.some(t => text.includes(t))) {
    points -= 20;
    reasons.push("generic/SEO content detected");
  }
  if (!result.url || text.length < 80) points -= 15;

  const relevanceScore = points >= 50 ? "A" : points >= 30 ? "B" : points >= 15 ? "C" : "D";
  const confidence = Number(Math.max(0.2, Math.min(0.95, points / 88)).toFixed(2));
  return {
    accepted: relevanceScore !== "D",
    relevanceScore,
    confidence,
    reason: reasons.length ? reasons.join("; ") : "weak demand signal"
  };
}
