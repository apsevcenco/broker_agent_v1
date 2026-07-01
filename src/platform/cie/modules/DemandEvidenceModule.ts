// CIE Demand Evidence Module — extracts structured evidence from demand_discovery results.
// Active Demand classification requires all four evidence pieces.
// Missing evidence downgrades classification to "unclear".

import type { CIEContext, DemandEvidence, FreshnessCheckResult, GeographyCheckResult } from "../types";
import { DEMAND_SIGNALS } from "../vocabulary";
import { LINE_TERMS } from "../vocabulary";

// Demand phrases (buyer intent signals)
const DEMAND_PHRASES = [
  ...DEMAND_SIGNALS,
  // Additional request-style signals
  "anyone know", "can anyone recommend", "any suggestions", "do you know",
  "anyone have", "looking to hire", "need to book", "want to rent",
  "would like to", "interested in booking", "planning to", "thinking of",
  "connaissez-vous", "quelqu'un peut recommander", "je voudrais",
  "chi conosce", "qualcuno sa", "cerco consiglio",
  "kennt jemand", "kann jemand empfehlen", "ich suche",
  "¿alguien conoce", "¿pueden recomendar", "estoy buscando"
];

// Service phrases per business line key terms
const SERVICE_PHRASES: Record<string, string[]> = {
  yacht_sale: [
    "yacht", "superyacht", "motor yacht", "sailing yacht", "boat",
    "vessel", "navire", "barca", "yacht à vendre"
  ],
  yacht_charter: [
    "yacht charter", "charter yacht", "sailing trip", "yacht hire",
    "location yacht", "noleggio yacht", "chartern", "alquilar yate"
  ],
  car_rental: [
    "car", "vehicle", "van", "minibus", "minivan", "transfer", "chauffeur",
    "driver", "airport", "taxi", "limousine", "limo", "coach",
    "renault trafic", "mercedes v-class", "sprinter", "viano",
    "voiture", "véhicule", "transfert", "macchina", "auto", "auto a noleggio",
    "fahrzeug", "kleinbus", "coche", "vehículo"
  ],
  mixed: [
    "yacht", "car", "vehicle", "charter", "transfer", "chauffeur", "driver",
    "service", "transport", "mobility"
  ]
};

function extractDemandPhrase(text: string): string | undefined {
  const t = text.toLowerCase();
  return DEMAND_PHRASES.find(p => t.includes(p));
}

function extractServicePhrase(text: string, businessLine: string): string | undefined {
  const t = text.toLowerCase();
  const phrases = SERVICE_PHRASES[businessLine] || SERVICE_PHRASES.mixed;
  return phrases.find(p => t.includes(p));
}

function extractLocationPhrase(text: string, geo: GeographyCheckResult): string | undefined {
  if (geo.relevant && geo.matchedTerms.length > 0) {
    return geo.matchedTerms[0];
  }
  // If no specific geography was given, look for any location-like term
  const t = text.toLowerCase();
  const genericGeoTerms = [
    "monaco", "cannes", "nice", "antibes", "saint-tropez", "côte d'azur",
    "french riviera", "mediterranean", "riviera", "airport", "aéroport"
  ];
  return genericGeoTerms.find(g => t.includes(g));
}

export function extractDemandEvidence(
  text: string,
  ctx: CIEContext,
  freshness: FreshnessCheckResult,
  geo: GeographyCheckResult
): DemandEvidence {
  const demandPhrase = extractDemandPhrase(text);
  const servicePhrase = extractServicePhrase(text, ctx.businessLine);
  const locationPhrase = extractLocationPhrase(text, geo);
  const freshnessPhrase = freshness.hasFreshness ? freshness.phrase : undefined;

  return { demandPhrase, servicePhrase, locationPhrase, freshnessPhrase };
}

export function evidenceStrength(evidence: DemandEvidence): 0 | 1 | 2 | 3 | 4 {
  const count = [
    evidence.demandPhrase,
    evidence.servicePhrase,
    evidence.locationPhrase,
    evidence.freshnessPhrase
  ].filter(Boolean).length;
  return count as 0 | 1 | 2 | 3 | 4;
}
