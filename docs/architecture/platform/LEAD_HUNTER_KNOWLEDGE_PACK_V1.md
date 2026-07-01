# Lead Hunter Knowledge Pack V1

**Agent:** `client-acquisition-agent`  
**Version:** 1.0  
**Status:** Active  
**Last Updated:** 2026-06-29  
**SQL Migration:** `supabase/migrations/20260629200000_lead_hunter_knowledge_pack_v1.sql`

---

## Purpose

The Lead Hunter Knowledge Pack is the professional knowledge foundation that enables the Lead Hunter agent to make expert commercial search and classification decisions.

Lead Hunter is **not** a yacht broker. He is **not** a salesperson. He is an expert in:

- Finding commercial opportunities on the public web
- Classifying what he finds (demand, company, partner, market intelligence, noise)
- Ranking by urgency, confidence and commercial potential
- Rejecting low-quality results before they create approvals
- Prioritising the operator's time

This knowledge pack is **separate** from Yacht Broker, Charter, Car Rental, Marketing and Platform knowledge. Lead Hunter must only retrieve entries from this pack unless explicitly directed otherwise.

---

## Knowledge Categories

| # | Category | Entries | Purpose |
|---|---|---|---|
| 1 | Commercial Search | 10 | How to construct and iterate effective commercial searches |
| 2 | Demand Discovery | 12 | How to detect active buyer/requestor intent signals |
| 3 | Company Discovery | 12 | How to identify high-value company and individual prospects |
| 4 | Partner Discovery | 8 | How to identify referral and commission-generating partners |
| 5 | Market Intelligence | 8 | How to extract market signals from public sources |
| 6 | Classification | 12 | Rules for classifying every result into a named category |
| 7 | Freshness | 6 | How to determine whether a result is current or stale |
| 8 | Geography | 8 | Commercial territory rules and regional expansion |
| 9 | Commercial Scoring | 8 | How to score opportunity grade, confidence and urgency |
| 10 | Rejection Rules | 10 | What to reject and why |
| 11 | Evidence Rules | 6 | What evidence is required before creating an approval |
| 12 | Communication Awareness | 6 | How to recognise commercial intent without writing messages |

**Total: 106 entries**

---

## Design Principles

### What the knowledge IS

- Verified commercial search strategy
- Classification decision rules
- Evidence requirements
- Geography and freshness logic
- Rejection criteria and false-positive prevention

### What the knowledge is NOT

- Yacht brokerage or charter knowledge
- Legal, tax or compliance guidance
- Hardcoded scoring thresholds
- Contact scripts or outreach templates

---

## Isolation Policy

Lead Hunter knowledge entries have `agent_id = 'client-acquisition-agent'`.

When the Lead Hunter agent queries the knowledge engine, it must filter by its own `agent_id`. It must **never** retrieve yacht broker, charter, car rental, marketing or platform knowledge unless explicitly requested by a human operator or another authorised agent.

---

## Version History

| Version | Date | Change |
|---|---|---|
| V1 | 2026-06-29 | Initial 106-entry knowledge pack |
