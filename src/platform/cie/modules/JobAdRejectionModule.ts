// CIE Job Ad Rejection Module — detects employment / recruitment pages.
// Applied across ALL search modes (job ads are never useful leads).

import type { JobAdCheckResult } from "../types";
import { JOB_AD_SIGNALS } from "../vocabulary";

export function checkJobAd(text: string): JobAdCheckResult {
  const t = text.toLowerCase();
  const matched = JOB_AD_SIGNALS.filter(s => t.includes(s));
  // Single signal is enough to flag a job ad.
  return { isJobAd: matched.length >= 1, signals: matched.slice(0, 5) };
}
