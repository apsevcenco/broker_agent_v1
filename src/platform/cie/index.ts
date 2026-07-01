// Commercial Intelligence Engine — public API surface.
//
// Active modules (V1): Search, Classification, Ranking, Freshness, Geography,
//   Deduplication, Scoring, Recommendation, DemandEvidence, ProviderRejection,
//   JobAdRejection
// Placeholder (V2): OpportunityScoreModule, MarketIntelligenceModule
//
// All consumers import from this index.

// Main engine
export { CommercialIntelligenceEngine } from "./CommercialIntelligenceEngine";

// Types
export type {
  BusinessLine,
  CIECandidate,
  CIEContext,
  CIEResponse,
  CommercialPotential,
  ConfidenceLevel,
  DemandEvidence,
  FreshnessCheckResult,
  GeographyCheckResult,
  JobAdCheckResult,
  LeadClassification,
  OpportunityGrade,
  ProviderCheckResult,
  RecommendationAction,
  RelevanceScore,
  SearchMode,
  SearchQuality,
  SearchResult,
  UrgencyLevel
} from "./types";

// Vocabulary (used by Lead Hunter profile and future agents)
export {
  DEMAND_SIGNALS,
  DIRECTORY_SIGNALS,
  INTENT_TERMS,
  JOB_AD_SIGNALS,
  JUNK_TERMS,
  LINE_TERMS,
  PROVIDER_SIGNALS,
  URGENCY_SIGNALS
} from "./vocabulary";

// Search module (query selection)
export { DEFAULT_QUERIES_BY_MODE, selectDefaultQueries } from "./modules/SearchModule";

// Active module functions
export { checkFreshness } from "./modules/FreshnessModule";
export { checkGeography } from "./modules/GeographyModule";
export { checkJobAd } from "./modules/JobAdRejectionModule";
export { checkProvider } from "./modules/ProviderRejectionModule";
export { classifyBusinessLine, classifyResult } from "./modules/ClassificationModule";
export type { ClassificationResult } from "./modules/ClassificationModule";
export { extractDemandEvidence, evidenceStrength } from "./modules/DemandEvidenceModule";
export { scoreCandidate } from "./modules/ScoringModule";
export type { ScoringResult } from "./modules/ScoringModule";
export { buildRecommendation, recommendationLabel } from "./modules/RecommendationModule";
export { deduplicate } from "./modules/DeduplicationModule";

// Legacy ranking functions (backward compat — not used in main pipeline)
export { scoreSearchResult, scoreDemandResult } from "./modules/RankingModule";
