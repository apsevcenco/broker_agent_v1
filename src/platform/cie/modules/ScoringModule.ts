// CIE Scoring Module — produces opportunity grade, confidence, urgency, and commercial potential.
// Uses classification + evidence + freshness + geography to compute structured scores.
// Replaces the old inline scoring logic in the route.

import type {
  CIEContext,
  CommercialPotential,
  ConfidenceLevel,
  DemandEvidence,
  FreshnessCheckResult,
  GeographyCheckResult,
  LeadClassification,
  OpportunityGrade,
  SearchResult,
  UrgencyLevel
} from "../types";
import { LINE_TERMS, INTENT_TERMS } from "../vocabulary";
import { evidenceStrength } from "./DemandEvidenceModule";

const REJECTED_CLASSIFICATIONS = new Set<LeadClassification>([
  "provider_page", "job_ad", "old_expired", "generic_directory", "irrelevant"
]);

function toUrgency(freshness: FreshnessCheckResult): UrgencyLevel {
  if (!freshness.hasFreshness) return "low";
  if (freshness.urgencySignal) return "immediate";
  const phrase = (freshness.phrase ?? "").toLowerCase();
  const highUrgency = ["today", "tonight", "urgent", "asap", "immediately", "right now", "sofort",
    "subito", "ahora", "maintenant", "сегодня", "сейчас"];
  if (highUrgency.some(s => phrase.includes(s))) return "immediate";
  const medUrgency = ["tomorrow", "demain", "morgen", "mañana", "завтра", "next week"];
  if (medUrgency.some(s => phrase.includes(s))) return "high";
  return "medium";
}

function toConfidence(evidenceCount: number, geoConf: string): ConfidenceLevel {
  if (evidenceCount >= 4 && geoConf !== "none") return "high";
  if (evidenceCount >= 3 || (evidenceCount >= 2 && geoConf === "high")) return "medium";
  return "low";
}

function toCommercialPotential(businessLine: string, urgency: UrgencyLevel): CommercialPotential {
  if (urgency === "immediate" || urgency === "high") {
    return businessLine === "car_rental" ? "medium" :
      businessLine === "yacht_charter" ? "high" :
      businessLine === "yacht_sale" ? "high" : "medium";
  }
  return businessLine === "yacht_sale" ? "high" :
    businessLine === "yacht_charter" ? "medium" : "low";
}

function scoreActiveDemand(
  evidence: DemandEvidence,
  freshness: FreshnessCheckResult,
  geo: GeographyCheckResult
): { grade: OpportunityGrade; confidence: ConfidenceLevel; urgency: UrgencyLevel } {
  const strength = evidenceStrength(evidence);
  const urgency = toUrgency(freshness);
  const confidence = toConfidence(strength, geo.confidence);

  const grade: OpportunityGrade =
    urgency === "immediate" && strength >= 3 ? "A" :
    urgency === "immediate" && strength >= 2 ? "B" :
    (urgency === "high" || urgency === "medium") && strength >= 3 ? "B" :
    strength >= 2 ? "C" : "D";

  return { grade, confidence, urgency };
}

function scoreCompanyOrPartner(
  result: SearchResult,
  ctx: CIEContext,
  geo: GeographyCheckResult
): { grade: OpportunityGrade; confidence: ConfidenceLevel } {
  const text = [result.title, result.snippet, result.url, result.query].join(" ").toLowerCase();
  const terms =
    ctx.businessLine === "mixed"
      ? Object.values(LINE_TERMS).flat()
      : (LINE_TERMS[ctx.businessLine] ?? []);

  const termMatches = terms.filter(t => text.includes(t)).length;
  const intentMatches = INTENT_TERMS.filter(t => text.includes(t)).length;
  const geoBonus = geo.confidence === "high" ? 2 : geo.confidence === "medium" ? 1 : 0;

  const total = termMatches + intentMatches + geoBonus;
  const grade: OpportunityGrade =
    total >= 7 ? "A" : total >= 4 ? "B" : total >= 2 ? "C" : "D";
  const confidence: ConfidenceLevel =
    total >= 6 ? "high" : total >= 3 ? "medium" : "low";

  return { grade, confidence };
}

export type ScoringResult = {
  opportunityScore: OpportunityGrade;
  confidence: ConfidenceLevel;
  urgency: UrgencyLevel;
  commercialPotential: CommercialPotential;
};

export function scoreCandidate(
  result: SearchResult,
  ctx: CIEContext,
  classification: LeadClassification,
  evidence: DemandEvidence,
  freshness: FreshnessCheckResult,
  geo: GeographyCheckResult
): ScoringResult {
  const businessLine = ctx.businessLine;

  if (REJECTED_CLASSIFICATIONS.has(classification)) {
    return { opportunityScore: "D", confidence: "low", urgency: "low", commercialPotential: "low" };
  }

  if (classification === "unclear") {
    return { opportunityScore: "D", confidence: "low", urgency: "low", commercialPotential: "low" };
  }

  if (classification === "active_demand") {
    const { grade, confidence, urgency } = scoreActiveDemand(evidence, freshness, geo);
    return { opportunityScore: grade, confidence, urgency, commercialPotential: toCommercialPotential(businessLine, urgency) };
  }

  if (classification === "market_intelligence") {
    return { opportunityScore: "C", confidence: "medium", urgency: "low", commercialPotential: "low" };
  }

  if (classification === "company_lead" || classification === "partner_lead") {
    const { grade, confidence } = scoreCompanyOrPartner(result, ctx, geo);
    const urgency: UrgencyLevel = "low";
    return { opportunityScore: grade, confidence, urgency, commercialPotential: toCommercialPotential(businessLine, urgency) };
  }

  return { opportunityScore: "D", confidence: "low", urgency: "low", commercialPotential: "low" };
}
