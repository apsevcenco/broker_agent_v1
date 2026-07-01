// CIE Provider Rejection Module — detects competitor / self-promotional service pages.
// ONLY applied in demand_discovery mode.
// Must NOT reject brokers or concierge companies in company/partner/market modes.
// Requires 2+ provider signals to reject (avoids false positives from descriptive text).

import type { ProviderCheckResult } from "../types";
import { PROVIDER_SIGNALS } from "../vocabulary";

export function checkProvider(text: string): ProviderCheckResult {
  const t = text.toLowerCase();
  const matched = PROVIDER_SIGNALS.filter(s => t.includes(s));

  // Require at least 2 matching signals to avoid false positives.
  // A single occurrence of "our fleet" in a forum post is not a provider page;
  // two or more signals together strongly indicate a self-promotional page.
  const isProvider = matched.length >= 2;

  return { isProvider, signals: matched.slice(0, 5), signalCount: matched.length };
}
