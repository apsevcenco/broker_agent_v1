// Shared types for the Commercial Intelligence Engine V1.
// All agents and routes that interact with CIE import from here.

// ─── Core domain types ────────────────────────────────────────────────────────

export type BusinessLine = "yacht_sale" | "yacht_charter" | "car_rental" | "mixed";

export type SearchMode =
  | "company_discovery"
  | "demand_discovery"
  | "partner_discovery"
  | "market_intelligence";

// Legacy relevance grade kept for backward compatibility with RankingModule.
export type RelevanceScore = "A" | "B" | "C" | "D";

export type SearchResult = {
  title: string;
  url: string;
  snippet: string;
  query: string;
};

// Legacy quality type kept for backward compatibility with RankingModule.
export type SearchQuality = {
  accepted: boolean;
  relevanceScore: RelevanceScore;
  confidence: number;
  reason: string;
};

// Minimal context passed by callers to CIE module functions.
export type CIEContext = {
  businessLine: BusinessLine;
  searchMode?: SearchMode;
  targetSegments?: string;
  geography?: string;
  offerBrief?: string;
};

// ─── V1 classification types ─────────────────────────────────────────────────

export type LeadClassification =
  | "active_demand"      // Someone actively looking for our service right now
  | "company_lead"       // A company / family office / broker to contact
  | "partner_lead"       // A referral partner / concierge / travel advisor
  | "market_intelligence"// A market signal, news, or trend
  | "provider_page"      // A competitor or self-promotional service page
  | "job_ad"             // A job posting / recruitment ad
  | "old_expired"        // A clearly stale or date-expired result
  | "generic_directory"  // A directory, list, or comparison page
  | "irrelevant"         // No match for any business context
  | "unclear";           // Insufficient evidence to classify

export type OpportunityGrade = "A" | "B" | "C" | "D";
export type ConfidenceLevel = "low" | "medium" | "high";
export type UrgencyLevel = "low" | "medium" | "high" | "immediate";
export type CommercialPotential = "low" | "medium" | "high";

export type RecommendationAction =
  | "contact_immediately"
  | "contact_today"
  | "contact_within_24h"
  | "monitor"
  | "ignore";

// ─── Module result types ──────────────────────────────────────────────────────

export type DemandEvidence = {
  demandPhrase?: string;
  locationPhrase?: string;
  servicePhrase?: string;
  freshnessPhrase?: string;
};

export type GeographyCheckResult = {
  relevant: boolean;
  matchedTerms: string[];
  confidence: "none" | "low" | "medium" | "high";
};

export type FreshnessCheckResult = {
  hasFreshness: boolean;
  phrase?: string;         // The matched pattern (for display/debug)
  urgencySignal: boolean;  // true if "today", "urgent", "asap", etc.
  staleSignal: boolean;    // true if explicit old-year references found
};

export type ProviderCheckResult = {
  isProvider: boolean;
  signals: string[];
  signalCount: number;
};

export type JobAdCheckResult = {
  isJobAd: boolean;
  signals: string[];
};

// ─── Engine output ────────────────────────────────────────────────────────────

export type CIECandidate = {
  id: string;
  businessLine: BusinessLine;
  searchMode: SearchMode;
  title: string;
  sourceUrl: string;
  snippet: string;
  query: string;
  classification: LeadClassification;
  rejectionReason?: string;
  evidence: DemandEvidence;
  geoRelevance: GeographyCheckResult;
  freshness: FreshnessCheckResult;
  opportunityScore: OpportunityGrade;
  confidence: ConfidenceLevel;
  urgency: UrgencyLevel;
  commercialPotential: CommercialPotential;
  recommendation: RecommendationAction;
  accepted: boolean;
  createdAt: string;
};

export type CIEResponse = {
  candidates: CIECandidate[];
  accepted: CIECandidate[];
  rejected: CIECandidate[];
  stats: {
    total: number;
    accepted: number;
    rejected: number;
    deduplicated: number;
    byClassification: Partial<Record<LeadClassification, number>>;
  };
};
