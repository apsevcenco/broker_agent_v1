# R06 Lead Hunter Agent V1

## Purpose

Lead Hunter Agent V1 is the supervised acquisition radar for the Luxury Mobility AI OS. It identifies public lead signals, filters weak results, prepares lead candidate summaries, drafts outreach for human review, and proposes approval-only actions.

V1 is not an autonomous outreach bot. It does not send messages, join chats, post ads, scrape restricted sources, or impersonate anyone.

## Business Lines

Lead Hunter V1 supports campaign preparation for:

- `yacht_sale` - yacht acquisition, seller inquiry, broker cooperation and off-market sale signals.
- `yacht_charter` - charter demand, concierge, travel advisor and itinerary signals.
- `car_rental` - luxury car rental, chauffeur, VIP transfer, wedding and event transport signals.
- `mixed` - broad luxury mobility discovery.

## Campaign Inputs

The public web runner accepts:

- `campaignName`
- `businessLine`
- `offerBrief`
- `targetSegments`
- `geography`
- `maxResults`
- optional `searchQueries`
- legacy-compatible `topic`, `limit` and `perQuery`

## Operating Flow

```text
Campaign input
  -> public web search result
  -> Lead Signal inbox message
  -> Lead Hunter Intelligence
  -> ToolPlan
  -> Approval
  -> optional human-approved handoff
```

## Routing Rules

- Yacht sale / acquisition / seller / broker signals route to `yacht-broker-agent`.
- Yacht charter signals route to `charter-agent` only if that agent is active.
- Car rental / chauffeur / transfer / wedding transport signals route to `car-rental-agent` only if that agent is active.
- If a specialist agent exists only as planned, Lead Hunter records honest handoff status:
  - `charter handoff pending`
  - `car rental handoff pending`
- V1 must not invent active agents.

## Candidate Scoring

Each accepted candidate carries:

- `businessLine`
- `leadCategory`
- `targetSegment`
- `routedAgentId` or `handoffPending`
- `relevanceScore` (`A`, `B`, `C`, `D`)
- `confidence`
- `reason`
- `riskLevel`
- `sourceUrl`
- `recommendedNextAction`

Weak candidates are filtered before approval creation. Filtering rejects duplicate URLs, generic directories, SEO/news/blog junk, unrelated articles and results with no useful commercial signal.

## ToolPlan Behavior

Lead Hunter V1 may propose:

- `crm.createLead`
- `case.createOrAttach`
- `outreach.prepareDraft`
- `task.reviewLeadCandidate`
- `prepare.teaserForApproval` when the offer brief implies teaser, deck, brochure, materials or off-market opportunity preparation

All tool requests are `proposed`, `approvalRequired: true`, and never execute automatically in V1.

## Approval Payload

Each lead candidate approval includes:

- candidate summary
- source URL
- business line
- lead category
- score and confidence
- reason
- draft outreach
- proposed actions through `intelligence.execution.toolPlan`
- risk notes
- full `IntelligenceResponse`

The Operations Center can render the approval with the universal IntelligenceResponse layout while legacy payload fields remain available.

## Web Search Runner

Endpoint:

```text
POST /api/lead-hunter/search/run
```

Provider:

```text
SERPER_API_KEY=...
```

Optional environment query pack:

```text
LEAD_HUNTER_QUERIES=one query per line
```

If `SERPER_API_KEY` is missing, the endpoint returns `setupRequired: true`, creates no inbox messages and creates no approvals.

## Safety Rules

- Draft only.
- Human approval before lead creation, case attach or outreach use.
- Public web results only.
- No automatic contact.
- No scraping restricted or paid sources.
- No platform bypassing.
- No fake active agents.
- No fake availability, price, fleet, yacht identity or charter confirmation.

## V1 Verification Expectations

- Missing `SERPER_API_KEY` returns setup guidance and creates nothing.
- Yacht sale candidates route to Yacht Broker Agent.
- Charter candidates show `charter handoff pending` unless Charter Agent is active.
- Car rental candidates show `car rental handoff pending` unless Car Rental Agent is active.
- All proposed ToolRequests require approval.
- No outreach is sent.

## Future Work

- Scheduled search runner after Policy/Event hardening.
- Source allowlist / denylist.
- Query pack management UI.
- Duplicate detection across historical cases and approvals.
- Policy Engine integration.
- Experience scoring from closed lead outcomes.
- Charter Agent runtime handoff.
- Car Rental Agent runtime handoff.
- Near-real-time monitoring after governance hardening.
