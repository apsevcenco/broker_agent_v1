// CIE Classification Module â€” full V1 implementation.
// Priority order:
//   1. job_ad (always, all modes)
//   2. provider_page (demand_discovery only; after demand evidence check)
//   3. generic_directory
//   4. old_expired (demand_discovery only)
//   5. active_demand (demand_discovery with evidence)
//   6. unclear (demand_discovery without sufficient evidence)
//   7. company_lead / partner_lead / market_intelligence (by searchMode)
//   8. irrelevant (no signals)

import type {
  BusinessLine,
  CIEContext,
  DemandEvidence,
  FreshnessCheckResult,
  JobAdCheckResult,
  LeadClassification,
  ProviderCheckResult
} from "../types";
import { LINE_TERMS, DIRECTORY_SIGNALS } from "../vocabulary";
import { evidenceStrength } from "./DemandEvidenceModule";

export type ClassificationResult = {
  businessLine: BusinessLine;
  confidence: number;
};

// Business line resolution (used when hint is "mixed" or absent)
export function classifyBusinessLine(
  hint: BusinessLine | string | undefined,
  text: string
): ClassificationResult {
  if (hint === "yacht_sale" || hint === "yacht_charter" || hint === "car_rental") {
    return { businessLine: hint, confidence: 0.95 };
  }
  const t = text.toLowerCase();
  const scores: Record<BusinessLine, number> = { yacht_sale: 0, yacht_charter: 0, car_rental: 0, mixed: 0 };
  for (const [line, terms] of Object.entries(LINE_TERMS) as [BusinessLine, string[]][]) {
    scores[line] = terms.filter(term => t.includes(term)).length;
  }
  const winner = (Object.entries(scores) as [BusinessLine, number][])
    .filter(([k]) => k !== "mixed")
    .sort(([, a], [, b]) => b - a)[0];
  if (winner && winner[1] > 0) {
    return { businessLine: winner[0], confidence: Math.min(0.85, 0.4 + winner[1] * 0.1) };
  }
  return { businessLine: "mixed", confidence: 0.4 };
}


const YACHT_PURCHASE_SIGNALS = [
  "looking to buy", "want to buy", "seeking yacht", "yacht wanted",
  "purchase", "acquisition", "in the market for", "buyer", "family office",
  "mandate to buy", "looking for a yacht", "interested in buying"
];

const YACHT_BROKER_SOURCE_SIGNALS = [
  "yacht broker", "superyacht broker", "sales broker", "brokerage",
  "central agency", "listing broker", "off-market", "for sale"
];

const CHARTER_CLIENT_SIGNALS = [
  "looking to charter", "need yacht charter", "looking for yacht charter",
  "charter request", "charter enquiry", "charter inquiry", "private client",
  "book yacht charter", "yacht charter client", "need a yacht", "summer charter"
];

const CAR_RENTAL_CLIENT_SIGNALS = [
  "looking for luxury car rental", "need luxury car", "need vip transfer",
  "looking for vip transfer", "airport transfer", "private client", "for client",
  "wedding transport", "event transport", "rolls royce", "bentley", "luxury car rental"
];

const DRIVER_SUPPLY_OR_JOB_SIGNALS = [
  "driver job", "chauffeur job", "driver wanted", "chauffeur wanted",
  "looking for a driver", "looking for chauffeur", "hiring driver", "hiring chauffeur",
  "we are hiring", "apply now", "send your cv", "salary"
];

function hasAny(text: string, terms: string[]): boolean {
  return terms.some(term => text.includes(term));
}

function strictFitForLine(line: BusinessLine, mode: string, text: string): { ok: boolean; reason?: string } {
  if (line === "yacht_sale") {
    const hasBuyer = hasAny(text, YACHT_PURCHASE_SIGNALS);
    const hasBrokerSource = hasAny(text, YACHT_BROKER_SOURCE_SIGNALS);
    if (mode === "demand_discovery" && !hasBuyer) {
      return { ok: false, reason: "No yacht purchase buyer/acquisition signal" };
    }
    if ((mode === "company_discovery" || mode === "partner_discovery") && !hasBuyer && !hasBrokerSource) {
      return { ok: false, reason: "No yacht buyer or broker-source signal" };
    }
    return { ok: true };
  }

  if (line === "yacht_charter") {
    if (!hasAny(text, CHARTER_CLIENT_SIGNALS) && mode === "demand_discovery") {
      return { ok: false, reason: "No yacht charter client/request signal" };
    }
    if ((mode === "company_discovery" || mode === "partner_discovery") && !hasAny(text, CHARTER_CLIENT_SIGNALS) && !/charter broker|travel advisor|concierge|family office/.test(text)) {
      return { ok: false, reason: "No yacht charter client or partner signal" };
    }
    return { ok: true };
  }

  if (line === "car_rental") {
    if (hasAny(text, DRIVER_SUPPLY_OR_JOB_SIGNALS)) {
      return { ok: false, reason: "Driver/chauffeur supply or job signal, not a rental client" };
    }
    if (!hasAny(text, CAR_RENTAL_CLIENT_SIGNALS)) {
      return { ok: false, reason: "No luxury car rental client/request signal" };
    }
    return { ok: true };
  }

  return { ok: true };
}
function isGenericDirectory(text: string): boolean {
  const t = text.toLowerCase();
  const matchCount = DIRECTORY_SIGNALS.filter(s => t.includes(s)).length;
  return matchCount >= 2;
}

export type ClassifyInput = {
  ctx: CIEContext;
  text: string;
  jobAd: JobAdCheckResult;
  provider: ProviderCheckResult;
  evidence: DemandEvidence;
  freshness: FreshnessCheckResult;
};

export function classifyResult(input: ClassifyInput): {
  classification: LeadClassification;
  rejectionReason?: string;
} {
  const { ctx, text, jobAd, provider, evidence, freshness } = input;
  const mode = ctx.searchMode ?? "company_discovery";
  const strictLine = ctx.businessLine === "mixed" ? classifyBusinessLine(ctx.businessLine, text).businessLine : ctx.businessLine;
  const strictFit = strictFitForLine(strictLine, mode, text);
  if (!strictFit.ok) {
    return {
      classification: "irrelevant",
      rejectionReason: strictFit.reason
    };
  }

  // 1. Job ads â€” always rejected regardless of mode
  if (jobAd.isJobAd) {
    return {
      classification: "job_ad",
      rejectionReason: `Job advertisement detected: ${jobAd.signals.slice(0, 2).join(", ")}`
    };
  }

  // 2. Generic directory â€” applies in all modes
  if (isGenericDirectory(text)) {
    return {
      classification: "generic_directory",
      rejectionReason: "Generic directory or comparison page"
    };
  }

  if (mode === "demand_discovery") {
    const strength = evidenceStrength(evidence);

    // 3. Provider rejection (demand_discovery only).
    //    Reject if the page self-promotes its own service AND contains no demand phrase
    //    from an actual person. A forum post quoting a provider still has a human demand
    //    phrase â€” that human phrase takes precedence.
    if (provider.isProvider && !evidence.demandPhrase) {
      return {
        classification: "provider_page",
        rejectionReason: `Provider / competitor page: ${provider.signals.slice(0, 2).join(", ")}`
      };
    }

    // 4. Old / expired (demand_discovery only)
    if (freshness.staleSignal && !freshness.hasFreshness) {
      return {
        classification: "old_expired",
        rejectionReason: "References old dates only â€” no current demand evidence"
      };
    }

    // 5. Active demand - strict mode requires demand + service + location/freshness evidence.
    if (evidence.demandPhrase && strength >= 3 && evidence.servicePhrase && (evidence.locationPhrase || evidence.freshnessPhrase)) {
      return { classification: "active_demand" };
    }

    // 6. No freshness, no demand phrase â†’ unclear
    if (!freshness.hasFreshness && !evidence.demandPhrase) {
      return {
        classification: "unclear",
        rejectionReason: "No demand phrase and no freshness signal found"
      };
    }

    // Weak demand signal â€” still classify as unclear
    return {
      classification: "unclear",
      rejectionReason: "Insufficient demand evidence (missing location, service, or freshness phrase)"
    };
  }

  if (mode === "partner_discovery") {
    return { classification: "partner_lead" };
  }

  if (mode === "market_intelligence") {
    return { classification: "market_intelligence" };
  }

  // company_discovery (default)
  // Check that there are some relevant signals
  const t = text.toLowerCase();
  const lineTerms =
    ctx.businessLine === "mixed"
      ? Object.values(LINE_TERMS).flat()
      : LINE_TERMS[ctx.businessLine] ?? [];

  const hasRelevantTerms = lineTerms.some(term => t.includes(term));
  if (!hasRelevantTerms) {
    return {
      classification: "irrelevant",
      rejectionReason: "No business-relevant terms found"
    };
  }

  return { classification: "company_lead" };
}
