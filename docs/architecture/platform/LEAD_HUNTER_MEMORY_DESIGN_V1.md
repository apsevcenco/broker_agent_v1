# Lead Hunter Memory Design V1

**Agent:** `client-acquisition-agent`  
**Status:** Design only — not yet implemented  
**Target implementation:** CIE V2 / Memory Engine V1

---

## Purpose

Lead Hunter Memory allows the agent to learn across sessions. Without memory, every search run starts blind. With memory, Lead Hunter can skip known-bad sources, prioritise known-good sources, avoid re-processing already-approved companies, and improve precision over time.

---

## Memory Categories

### 1. Processed URLs

**What:** Every URL that has been searched, classified and either accepted or rejected.

**Fields:**
- `url` (normalised, no query string)
- `domain`
- `classifiedAs` (active_demand / company_lead / provider_page / etc.)
- `opportunityScore`
- `processedAt`
- `campaignId`

**Use:** Skip deduplication at search time. If the same URL was already processed in the last 30 days and classified as `provider_page` or `job_ad`, skip it without re-scoring.

---

### 2. Rejected Domains

**What:** Domains that consistently produce junk results.

**Fields:**
- `domain`
- `rejectionType` (job_board / directory / seo_farm / competitor / spam)
- `rejectionCount`
- `firstRejectedAt`
- `lastRejectedAt`
- `confirmedBy` (human / engine)

**Use:** Pre-filter search results. If a domain appears 5+ times as `job_ad` across campaigns, blacklist it from future demand discovery runs.

**Examples of domains that would be remembered:**
- Indeed.com, LinkedIn Jobs → job_board
- Yelp.com, Tripadvisor → directory
- Any domain with 3+ provider rejections in demand mode → competitor

---

### 3. Known Provider Domains

**What:** Domains known to be service provider / competitor pages.

**Fields:**
- `domain`
- `providerType` (car_rental / yacht_charter / transfer / chauffeur)
- `businessLine`
- `firstDetectedAt`
- `signalCount`

**Use:** In demand_discovery mode, immediately classify results from known provider domains as `provider_page` without spending ranking computation.

---

### 4. Trusted / High-Converting Sources

**What:** Domains that have previously produced accepted leads that converted to cases or deals.

**Fields:**
- `domain`
- `totalLeadsAccepted`
- `totalCasesCreated`
- `totalDeals`
- `lastSuccessAt`
- `businessLine`
- `searchMode`

**Use:** Prioritise results from high-converting domains. A forum where 3 previous posts led to yacht charter bookings should be treated as a priority source.

---

### 5. Already-Approved Companies

**What:** Companies that are already in the approval queue or CRM.

**Fields:**
- `companyName` (normalised)
- `domain`
- `approvalId`
- `approvalStatus` (pending / accepted / rejected)
- `businessLine`
- `firstSeenAt`

**Use:** Skip results from companies already in the pipeline. Do not create a second approval for the same company unless the first was explicitly closed or rejected.

---

### 6. CRM Matches

**What:** Domains or company names that match existing CRM leads.

**Fields:**
- `domain`
- `crmLeadId`
- `leadStatus`
- `lastContactedAt`

**Use:** When a search result matches a known CRM entry, flag it as a CRM match rather than creating a new approval. Route to the existing lead record.

---

### 7. Known Spam Domains

**What:** Domains flagged as spam by the engine or operator.

**Fields:**
- `domain`
- `spamType` (content_farm / redirect / phishing / aggregator)
- `confirmedBy`
- `flaggedAt`

**Use:** Immediate rejection. No scoring needed.

---

### 8. Repeat Opportunities

**What:** Source URLs that appeared in multiple separate searches, suggesting persistent demand or repeated exposure.

**Fields:**
- `url`
- `domain`
- `seenCount`
- `firstSeenAt`
- `lastSeenAt`
- `classifications` (array of past classifications)

**Use:** If a URL has been seen 3+ times and always classified the same way, that classification should have higher confidence. If it keeps appearing as `active_demand` across different queries, it may represent genuine sustained demand worth escalating.

---

## Memory Retention Policy

| Memory Type | Retention |
|---|---|
| Processed URLs | 90 days |
| Rejected Domains | 180 days (renewable) |
| Known Provider Domains | Permanent until manually cleared |
| High-Converting Sources | Permanent |
| Already-Approved Companies | Until approval closed |
| CRM Matches | Live sync |
| Known Spam | Permanent |
| Repeat Opportunities | 60 days |

---

## Implementation Notes

Memory should be stored in the existing `memory_entries` table using `agentId = 'client-acquisition-agent'`.

The CIE DeduplicationModule V2 should consume the Processed URLs and Known Provider Domains memory types before scoring begins.

Memory entries should be created by the approval creation flow, not by the search engine itself. The engine classifies; the approval flow records outcomes.

---

## Not In Scope for V1

- Cross-agent memory sharing
- Automatic memory expiry cleanup jobs
- NLP-based company name normalisation
- CRM bi-directional sync
- Machine learning on memory patterns
