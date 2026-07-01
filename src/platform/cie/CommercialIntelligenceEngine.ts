// Commercial Intelligence Engine — V1 pipeline orchestrator.
// Takes raw SearchResult[] + CIEContext, returns structured CIECandidate[].
// Stateless, synchronous, no I/O. Callers handle transport and persistence.
//
// Pipeline per result:
//   deduplicate → freshness → geography → job_ad → provider → classification
//   → demand evidence → scoring → recommendation → format

import type { CIECandidate, CIEContext, CIEResponse, LeadClassification, SearchResult } from "./types";
import { checkFreshness } from "./modules/FreshnessModule";
import { checkGeography } from "./modules/GeographyModule";
import { checkJobAd } from "./modules/JobAdRejectionModule";
import { checkProvider } from "./modules/ProviderRejectionModule";
import { classifyResult } from "./modules/ClassificationModule";
import { extractDemandEvidence } from "./modules/DemandEvidenceModule";
import { scoreCandidate } from "./modules/ScoringModule";
import { buildRecommendation, recommendationLabel } from "./modules/RecommendationModule";
import { deduplicate } from "./modules/DeduplicationModule";

const ACCEPTED_CLASSIFICATIONS = new Set<LeadClassification>([
  "active_demand",
  "company_lead",
  "partner_lead",
  "market_intelligence"
]);

function processOne(result: SearchResult, ctx: CIEContext): CIECandidate {
  // contentText excludes the search query — we check what the PAGE says,
  // not what we typed. The query "need airport transfer" would otherwise inject
  // false demand signals into every result for demand_discovery searches.
  const contentText = [result.title, result.snippet, result.url].join(" ");
  const mode = ctx.searchMode ?? "company_discovery";

  const freshness = checkFreshness({ ...result, query: "" }); // freshness from page, not query
  const geo = checkGeography(contentText, ctx.geography);
  const jobAd = checkJobAd(contentText);

  // Provider check only in demand_discovery; brokers / partners are NOT providers
  const provider = mode === "demand_discovery"
    ? checkProvider(contentText)
    : { isProvider: false, signals: [], signalCount: 0 };

  // Demand evidence from page content only (not query)
  const evidence = extractDemandEvidence(contentText, ctx, freshness, geo);

  const { classification, rejectionReason } = classifyResult({
    ctx, text: contentText.toLowerCase(), jobAd, provider, evidence, freshness
  });

  const scoring = scoreCandidate(result, ctx, classification, evidence, freshness, geo);

  const recommendation = buildRecommendation(
    classification,
    scoring.opportunityScore,
    scoring.urgency,
    scoring.confidence
  );

  const accepted = ACCEPTED_CLASSIFICATIONS.has(classification) && scoring.opportunityScore !== "D";

  return {
    id: generateId(),
    businessLine: ctx.businessLine,
    searchMode: mode,
    title: result.title,
    sourceUrl: result.url,
    snippet: result.snippet,
    query: result.query,
    classification,
    rejectionReason,
    evidence,
    geoRelevance: geo,
    freshness,
    opportunityScore: scoring.opportunityScore,
    confidence: scoring.confidence,
    urgency: scoring.urgency,
    commercialPotential: scoring.commercialPotential,
    recommendation,
    accepted,
    createdAt: new Date().toISOString()
  };
}

// Minimal ID generation (does not require crypto — keeps CIE free of Node globals)
let _seq = 0;
function generateId(): string {
  return `cie-${Date.now()}-${++_seq}`;
}

export const CommercialIntelligenceEngine = {
  process(results: SearchResult[], ctx: CIEContext): CIEResponse {
    const { unique, duplicates, deduplicated } = deduplicate(results);

    const candidates: CIECandidate[] = unique.map(r => processOne(r, ctx));

    const accepted = candidates.filter(c => c.accepted);
    const rejected = candidates.filter(c => !c.accepted);

    const byClassification: Partial<Record<LeadClassification, number>> = {};
    for (const c of candidates) {
      byClassification[c.classification] = (byClassification[c.classification] ?? 0) + 1;
    }

    return {
      candidates,
      accepted,
      rejected,
      stats: {
        total: unique.length,
        accepted: accepted.length,
        rejected: rejected.length,
        deduplicated,
        byClassification
      }
    };
  }
};
