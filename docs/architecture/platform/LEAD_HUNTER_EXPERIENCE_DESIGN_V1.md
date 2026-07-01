# Lead Hunter Experience Design V1

**Agent:** `client-acquisition-agent`  
**Status:** Design only — learning not yet implemented  
**Target implementation:** Experience Engine V1

---

## Purpose

Lead Hunter Experience tracks the commercial effectiveness of every decision the agent makes — which queries found real leads, which sources convert, which classifications were accurate, and which campaigns produced revenue.

Without experience, the agent repeats the same mistakes. With experience, it gets progressively better at finding and qualifying commercial opportunities.

---

## Conversion Funnel

Lead Hunter's effectiveness is measured by tracking results through the full commercial funnel:

```
Search Result
  → Classification
    → Approval Created
      → Approval Accepted by Operator
        → Business Case Opened
          → Meeting / Contact Initiated
            → Proposal Sent
              → Deal Closed
                → Revenue Recorded
```

Each step is a measurable event. Experience accumulates from these events.

---

## Experience Metrics

### Source Effectiveness

**What it measures:** Which domains and URL patterns produce accepted, case-generating leads.

| Metric | Formula |
|---|---|
| `sourceAcceptanceRate` | approvals_accepted / results_from_domain |
| `sourceCaseRate` | cases_opened / approvals_from_domain |
| `sourceDealRate` | deals_closed / cases_from_domain |
| `sourceRevenuePotential` | avg revenue from deals from this domain |

**Use:** Rank trusted sources higher in future searches. Deprecate sources that never convert.

---

### Query Effectiveness

**What it measures:** Which search queries consistently produce accepted leads vs. noise.

| Metric | Formula |
|---|---|
| `queryAcceptanceRate` | accepted_candidates / total_results_for_query |
| `queryRejectionRate` | rejected_candidates / total_results_for_query |
| `queryDemandHitRate` | active_demand_results / total_results_for_query |
| `queryCaseRate` | cases_opened_from_query / accepted_from_query |

**Use:** Retire ineffective queries. Promote queries with high demand hit rates. Auto-suggest improved variants.

---

### Classification Accuracy

**What it measures:** How often the engine's classification decision was validated or overridden by the operator.

| Metric | Formula |
|---|---|
| `classificationPrecision` | correct_classifications / total_classifications |
| `falsePositiveRate` | operator_rejected / total_approved |
| `falseNegativeRate` | operator_retrieved_from_rejected / total_rejected |
| `providerRejectionPrecision` | confirmed_provider / total_provider_rejections |

**Operator feedback events that affect accuracy:**
- Operator approves a candidate → classification was correct
- Operator rejects a candidate → classification was a false positive
- Operator retrieves a rejected result → classification was a false negative

---

### Geographic Precision

**What it measures:** Whether geography filtering is correctly calibrated.

| Metric | Formula |
|---|---|
| `geoRelevanceRate` | results_matching_geography / total_results |
| `geoFalsePositiveRate` | accepted_results_outside_target_geo / total_accepted |

**Use:** Identify if the geography module is too strict (missing valid results) or too loose (passing irrelevant geographies).

---

### Urgency Calibration

**What it measures:** Whether urgent results were actually contacted urgently.

| Metric | Formula |
|---|---|
| `urgencyResponseTime` | operator_action_time - approval_created_at |
| `immediateContactRate` | contacted_same_day / classified_as_immediate |
| `urgencyDecayRate` | leads_expired_before_contact / total_urgent |

**Use:** Feed back into operator workflow recommendations ("You have 3 immediate leads that were not contacted within 2 hours").

---

### Campaign-Level Effectiveness

**What it measures:** Which campaign configurations (businessLine + searchMode + geography) produce the best results.

| Metric | Formula |
|---|---|
| `campaignAcceptanceRate` | accepted / total_for_campaign_config |
| `campaignCaseRate` | cases / total_for_campaign_config |
| `campaignROI` | revenue / (time_spent + search_credits) |

---

## Experience Entry Schema

Experience entries should extend the existing memory/experience infrastructure:

```typescript
type LeadHunterExperienceEntry = {
  id: string;
  agentId: "client-acquisition-agent";
  eventType:
    | "lead_accepted"
    | "lead_rejected_by_operator"
    | "lead_retrieved_from_rejected"
    | "case_opened"
    | "case_closed"
    | "meeting_initiated"
    | "proposal_sent"
    | "deal_closed"
    | "source_blacklisted"
    | "query_retired";
  domain?: string;
  searchQuery?: string;
  campaignConfig?: string;
  classification?: string;
  opportunityScore?: string;
  outcome?: string;
  revenueImpact?: number;
  recordedAt: string;
};
```

---

## Learning Trigger Points

| Event | What the agent learns |
|---|---|
| Operator approves a lead | Source and query get positive signal |
| Operator rejects a lead | Classification may be too loose for this source type |
| Case opens from a lead | Source earns high-converting status |
| Deal closes from a case | Source earns top-tier status; query gets promoted |
| Domain appears 5+ times as job_ad | Add to rejected domains memory |
| Domain appears 3+ times as provider | Add to known provider memory |
| Query hits 0% acceptance for 3 runs | Flag query for operator review |

---

## Feedback Loop (Not Yet Implemented)

The full learning loop will require:

1. Approval outcome tracking (operator accepted / rejected)
2. Case → Meeting → Proposal → Deal event chain
3. Query and source tagging on every event
4. Periodic score recalibration (weekly or monthly)
5. Operator-reviewed experience summary reports

**None of these are implemented in V1.** This document describes the target state.

---

## V1 Limitation

In V1, experience data is not collected or used. Every search session starts from the same baseline knowledge. Memory (LEAD_HUNTER_MEMORY_DESIGN_V1) provides session-level deduplication; Experience will provide cross-session quality improvement.
