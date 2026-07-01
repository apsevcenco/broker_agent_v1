// CIE Recommendation Module — maps scoring output to a human-readable operator action.

import type {
  ConfidenceLevel,
  LeadClassification,
  OpportunityGrade,
  RecommendationAction,
  UrgencyLevel
} from "../types";

const REJECTED_CLASSIFICATIONS = new Set<LeadClassification>([
  "provider_page", "job_ad", "old_expired", "generic_directory", "irrelevant", "unclear"
]);

export function buildRecommendation(
  classification: LeadClassification,
  grade: OpportunityGrade,
  urgency: UrgencyLevel,
  confidence: ConfidenceLevel
): RecommendationAction {
  if (REJECTED_CLASSIFICATIONS.has(classification)) return "ignore";
  if (grade === "D") return "ignore";

  if (classification === "market_intelligence") return "monitor";

  // Active demand — urgency drives the timeline
  if (classification === "active_demand") {
    if (urgency === "immediate") return "contact_immediately";
    if (urgency === "high") return "contact_today";
    if (urgency === "medium") return "contact_within_24h";
    return "monitor";
  }

  // Company or partner leads — grade drives the priority
  if (grade === "A" && confidence !== "low") return "contact_today";
  if (grade === "B") return "contact_within_24h";
  if (grade === "C") return "monitor";
  return "ignore";
}

export function recommendationLabel(action: RecommendationAction): string {
  const labels: Record<RecommendationAction, string> = {
    contact_immediately: "Contact Immediately",
    contact_today: "Contact Today",
    contact_within_24h: "Contact Within 24 Hours",
    monitor: "Monitor",
    ignore: "Ignore"
  };
  return labels[action];
}
