// CIE Freshness Module — detects date and temporal relevance signals.
// For demand_discovery: absence of freshness evidence → unclear or old_expired.
// For other modes: freshness is a positive signal but not a hard requirement.

import type { FreshnessCheckResult, SearchResult } from "../types";
import { CURRENT_YEAR_PATTERN, STALE_YEAR_PATTERN } from "../vocabulary";

const FRESH_PATTERNS: RegExp[] = [
  // Immediate urgency (English)
  /\btoday\b/i, /\btonight\b/i, /\bthis\s+evening\b/i,
  /\bright\s+now\b/i, /\bimmediately\b/i, /\basap\b/i, /\burgent\b/i,
  /\blast[- ]minute\b/i, /\bemergency\b/i,
  // Near-future (English)
  /\btomorrow\b/i, /\bthis\s+week(?:end)?\b/i, /\bnext\s+week\b/i, /\bthis\s+month\b/i,
  // French immediate
  /\baujourd['']hui\b/i, /\bce\s+soir\b/i, /\bdès\s+maintenant\b/i, /\bdès\s+que\s+possible\b/i,
  // French near-future
  /\bdemain\b/i, /\bcette\s+semaine\b/i, /\bce\s+week-end\b/i, /\bce\s+mois\b/i,
  // Italian
  /\boggi\b/i, /\bstasera\b/i, /\bsubito\b/i, /\bdomani\b/i, /\bquesta\s+settimana\b/i,
  // German
  /\bheute\b/i, /\bheute\s+abend\b/i, /\bsofort\b/i, /\bdringend\b/i,
  /\bmorgen\b/i, /\bdiese\s+woche\b/i, /\bdieses\s+wochenende?\b/i,
  // Spanish
  /\bhoy\b/i, /\besta\s+noche\b/i, /\bahora\s+mismo\b/i,
  /\bma[ñn]ana\b/i, /\besta\s+semana\b/i, /\beste\s+fin\s+de\s+semana\b/i,
  // Russian
  /\bсегодня\b/i, /\bсейчас\b/i, /\bсрочно\b/i, /\bзавтра\b/i, /\bна\s+этой\s+неделе\b/i,
  // Season / month references in current year
  /\bjuly\s+2026\b/i, /\baugust\s+2026\b/i, /\bjune\s+2026\b/i, /\bseptember\s+2026\b/i,
  /\bjuillet\s+2026\b/i, /\bao[uû]t\s+2026\b/i, /\bseptembre\s+2026\b/i,
  /\bsummer\s+2026\b/i, /\bsaison\s+2026\b/i,
];

const URGENCY_PATTERNS: RegExp[] = [
  /\btoday\b/i, /\btonight\b/i, /\bthis\s+evening\b/i,
  /\bright\s+now\b/i, /\bimmediately\b/i, /\basap\b/i,
  /\blast[- ]minute\b/i, /\bemergency\b/i,
  /\baujourd['']hui\b/i, /\bce\s+soir\b/i, /\bdès\s+maintenant\b/i,
  /\boggi\b/i, /\bstasera\b/i, /\bsubito\b/i,
  /\bheute\b/i, /\bheute\s+abend\b/i, /\bsofort\b/i,
  /\bhoy\b/i, /\besta\s+noche\b/i, /\bahora\s+mismo\b/i,
  /\bсегодня\b/i, /\bсейчас\b/i, /\bсрочно\b/i,
];

export function checkFreshness(result: SearchResult): FreshnessCheckResult {
  const text = [result.title, result.snippet, result.url, result.query].join(" ");
  const staleSignal = STALE_YEAR_PATTERN.test(text) && !CURRENT_YEAR_PATTERN.test(text);

  for (const pattern of FRESH_PATTERNS) {
    const match = text.match(pattern);
    if (match) {
      return {
        hasFreshness: true,
        phrase: match[0].trim(),
        urgencySignal: URGENCY_PATTERNS.some(p => p.test(text)),
        staleSignal: false
      };
    }
  }

  if (CURRENT_YEAR_PATTERN.test(text)) {
    return {
      hasFreshness: true,
      phrase: text.match(CURRENT_YEAR_PATTERN)?.[0],
      urgencySignal: false,
      staleSignal: false
    };
  }

  return { hasFreshness: false, urgencySignal: false, staleSignal };
}
