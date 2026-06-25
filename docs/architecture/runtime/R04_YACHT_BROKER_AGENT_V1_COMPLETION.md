# R04 Yacht Broker Agent V1 Completion

## Status

Yacht Broker Agent V1 is complete as a supervised pilot.

This document closes the broker V1 stabilization phase and separates future agent work from the completed Yacht Broker Agent V1 scope.

---

## What Is Included In V1

Yacht Broker Agent V1 includes:

- Inbox-based enquiry intake.
- Buyer, seller, and broker enquiry classification.
- Core Intelligence Engine routing to the Yacht Broker Profile.
- PBRE-based structured reasoning.
- IntelligenceResponse generation with perception, reasoning, decision, planning, execution, learning, and draft layers.
- AI draft reply generation.
- AI decision recommendation.
- ToolPlan generation with proposed ToolRequests.
- Approval workflow for all external-facing outputs and tool actions.
- AI Operations Center approval rendering.
- Case Runtime V1 creation for processed enquiries.
- Case timeline Events for message received, intelligence generated, decision proposed, tool plan created, and approval created.
- Case Detail UI with overview, timeline, messages, AI decisions, tool plans, approvals, and participants.
- Yacht Broker knowledge and memory bootstrap foundations.
- Knowledge Ranking V2 for improved context-aware retrieval.
- Render-compatible production build.
- Supabase Case Runtime V1 migration.

---

## What Is Not Included In V1

Yacht Broker Agent V1 does not include:

- Autonomous tool execution.
- Automatic external message sending.
- Autonomous NDA sending.
- Legal, tax, flag, class, insurance, or regulatory advice as final guidance.
- Full Decision Engine runtime.
- Full Policy Engine runtime.
- Full Execution Engine runtime.
- Full Experience Engine runtime.
- Multi-agent coordination.
- Lead Hunter functionality.
- Social media prospecting or outreach automation.
- Multi-tenant SaaS isolation beyond the current internal company boundary.

All tools remain proposed only and require human approval.

---

## Scenario Verification

Yacht Broker Agent V1 passed the required operating scenarios:

| Scenario | Status |
|---|---|
| buyer_inquiry | PASS |
| seller_inquiry | PASS |
| broker_inquiry | PASS |

Verified behavior:

- Yacht Broker Agent is assigned correctly.
- AI Decisions are visible.
- ToolPlans are visible.
- Approvals are visible.
- No fake agents appear in the Case Detail agent assignment.
- No tools execute without approval.

---

## Knowledge Ranking V2

Knowledge Ranking V2 is included in the completed V1 scope.

It improves retrieval by:

- Detecting buyer, seller, broker, NDA, off-market, compliance, and closing intent.
- Boosting qualification, confidentiality, NDA, and brokerage-process knowledge for normal buyer enquiries.
- Suppressing SOLAS, MARPOL, flag, class, and compliance material unless the enquiry actually asks for compliance context.
- Preserving compliance ranking when the query is explicitly about SOLAS, MARPOL, flag, class, certificates, or regulation.

This resolves the V1 issue where generic buyer enquiries could surface MARPOL/SOLAS knowledge in the approval view.

---

## Lead Hunter Separation

Lead Hunter Agent V1 starts as a separate milestone.

It must not be added inside Yacht Broker Agent V1.

Lead Hunter Agent V1 should begin with its own scope, operating rules, safety boundaries, profile behavior, Case type expectations, ToolPlan rules, and approval requirements.

---

## Completion Decision

Yacht Broker Agent V1 is closed.

No more broker V1 expansion should be added unless it is a defect fix or deployment stabilization issue.

Next milestone: Lead Hunter Agent V1.
