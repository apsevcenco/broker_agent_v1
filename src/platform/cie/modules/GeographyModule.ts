// CIE Geography Module — structured geography matching with region expansion.
// Knows that "Côte d'Azur" = Monaco + Nice + Cannes + Antibes + Saint-Tropez + more.
// Returns "relevant: false" only when geography is specified AND no terms match.
// If no geography is specified in context, the result is always geography-relevant.

import type { GeographyCheckResult } from "../types";

type GeoGroup = { canonical: string; aliases: string[] };

const GEO_GROUPS: GeoGroup[] = [
  {
    canonical: "côte d'azur",
    aliases: [
      // Core localities
      "nice", "cannes", "antibes", "monaco", "saint-tropez", "mougins",
      "golfe-juan", "juan-les-pins", "menton", "beaulieu-sur-mer",
      "villefranche", "eze", "cap ferrat", "cap d'antibes",
      "biot", "valbonne", "sophia antipolis", "roquebrune",
      // Airport
      "nice airport", "nice côte d'azur airport", "nce", "aéroport de nice",
      // Regional names
      "côte d'azur", "cote d'azur", "cote dazur", "french riviera",
      "riviera", "riviera française", "alpes-maritimes", "alpes maritimes",
      // Postal code prefix hint
      "06"
    ]
  },
  {
    canonical: "monaco",
    aliases: ["monaco", "monte-carlo", "monte carlo", "principauté de monaco", "principality of monaco", "mc"]
  },
  {
    canonical: "cannes",
    aliases: ["cannes", "la croisette", "palais des festivals", "croisette", "cannes film festival"]
  },
  {
    canonical: "nice",
    aliases: ["nice", "nice ville", "nce", "nice-côte d'azur", "promenade des anglais"]
  },
  {
    canonical: "antibes",
    aliases: ["antibes", "juan-les-pins", "golfe-juan", "cap d'antibes", "port vauban"]
  },
  {
    canonical: "saint-tropez",
    aliases: ["saint-tropez", "st tropez", "st-tropez", "saint tropez", "port de saint-tropez"]
  },
  {
    canonical: "mediterranean",
    aliases: [
      "mediterranean", "méditerranée", "med", "côte d'azur", "french riviera",
      "corsica", "sardinia", "ibiza", "mallorca", "majorca", "balearics",
      "sicily", "amalfi", "portofino", "dubrovnik", "croatia", "greece",
      "turkey", "bodrum", "mykonos", "santorini", "porto cervo"
    ]
  },
  {
    canonical: "france",
    aliases: ["france", "french", "paris", "lyon", "marseille", "bordeaux", "nice", "cannes", "biarritz"]
  },
  {
    canonical: "europe",
    aliases: ["europe", "european", "uk", "germany", "france", "italy", "spain", "switzerland", "austria"]
  }
];

function normaliseGeoInput(raw: string): string[] {
  return raw
    .toLowerCase()
    .split(/[,;\/]/)
    .map(s => s.trim())
    .filter(Boolean);
}

function expandGeoTerms(inputs: string[]): string[] {
  const terms = new Set<string>();
  for (const input of inputs) {
    // Always include the raw input itself
    terms.add(input);
    // Find matching group and expand
    for (const group of GEO_GROUPS) {
      if (
        group.canonical === input ||
        group.aliases.includes(input) ||
        group.aliases.some(a => a.includes(input) || input.includes(a))
      ) {
        for (const alias of group.aliases) terms.add(alias);
        terms.add(group.canonical);
      }
    }
  }
  return Array.from(terms);
}

export function checkGeography(
  text: string,
  geography?: string
): GeographyCheckResult {
  if (!geography?.trim()) {
    return { relevant: true, matchedTerms: [], confidence: "none" };
  }

  const t = text.toLowerCase();
  const inputs = normaliseGeoInput(geography);
  const expanded = expandGeoTerms(inputs);

  const matchedTerms = expanded.filter(term => t.includes(term));

  if (matchedTerms.length === 0) {
    return { relevant: false, matchedTerms: [], confidence: "none" };
  }

  // Higher confidence for more specific / longer matches
  const longestMatch = matchedTerms.reduce((a, b) => (a.length >= b.length ? a : b), "");
  const confidence =
    longestMatch.length >= 8 ? "high" :
    longestMatch.length >= 4 ? "medium" :
    "low";

  return { relevant: true, matchedTerms: matchedTerms.slice(0, 5), confidence };
}
