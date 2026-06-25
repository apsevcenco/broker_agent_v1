# Gap Analysis

## Enterprise Business Operating System (EBOS)

Architecture Backlog Version: 1.0

---

## 1. Purpose

This document captures the known architecture gaps between the approved EBOS architecture documents and the current implementation.

Its purpose is to prevent reactive refactoring after every architecture audit. Audit findings should not immediately become implementation tasks. They should become architectural backlog items, be grouped into milestones, and be scheduled according to product, technical, and business priorities.

This document is not a sprint plan and not a command to fix everything now.

---

## 2. Current Status Summary

The current implementation already contains important EBOS foundations:

- Core Intelligence Engine foundation exists.
- Yacht Broker Reasoning Profile exists.
- PBRE exists as the domain reasoning layer for yacht brokerage.
- Tool Orchestrator Foundation exists through ToolPlan, ToolRequest, and ToolRegistry.
- Operations Center exists and can render IntelligenceResponse-based approval cases.
- Knowledge Engine exists.
- Memory Engine exists.
- Approval workflow exists.

These foundations are valuable. The current system is not a final EBOS runtime yet, but it has the correct early building blocks for one.

---

## 3. Key Architecture Gaps Table

| Area | Current Implementation | Architecture Expectation | Gap | Priority | Suggested Milestone |
|---|---|---|---|---|---|
| Case-owned runtime | CIE runs around an inbox message. | AI runs inside Company -> Goal -> Case -> Event. | Intelligence is not yet anchored to the Case aggregate, Goal, or triggering Event. | Critical | Case Engine Runtime |
| Intelligence Context Builder | API route manually assembles context before calling CIE. | A dedicated Intelligence Context Builder assembles Case, Event, Knowledge, Memory, Policies, Participants, Documents, and prior Decisions. | Context assembly is mixed into API routing instead of being a reusable intelligence infrastructure layer. | Critical | CIE hardening |
| Event emission | Reasoning creates an approval payload but not immutable Events. | Intelligence generation, decisions, tool plans, approvals, and execution proposals emit append-only Case Events. | No `intelligence.generated`, `decision.proposed`, `toolplan.created`, or approval Events are written to a Case timeline. | Critical | Event Engine Runtime |
| Company / tenant boundary | No full `companyId` boundary exists in CIE runtime. | Every Case, Event, Intelligence record, ToolPlan, ToolRequest, Knowledge item, Memory item, Policy, and Operator belongs to a Company. | CIE is not yet ready for strict multi-tenant isolation or company-scoped governance. | Critical | SaaS foundation |
| Decision persistence | Decision lives inside IntelligenceResponse and approval payload. | Decision is a Case-owned record and/or Event with status, actor, rationale, approval state, and audit history. | Decision is not yet a durable business entity. | Important | Decision Engine |
| ToolPlan persistence | ToolPlan lives inside IntelligenceResponse. | ToolPlan and ToolRequests are Case-owned records with lifecycle, approval status, execution status, and Events. | Proposed actions are visible but not yet first-class operational records. | Important | Execution Engine |
| Policy Engine | Policies are scattered across prompt rules, ToolRegistry, and approval logic. | Policy Engine is a first-class governance layer used by CIE, Decision Engine, Tool Orchestrator, and Operations Center. | Governance is present, but not centralized, auditable, or configurable enough for enterprise use. | Important | Policy Engine |
| Knowledge ranking | Retrieved knowledge can be weakly relevant to the business context, such as MARPOL/SOLAS appearing for a buyer acquisition enquiry. | Knowledge ranking should be business-context-aware, case-aware, and profile-aware. | Retrieval relevance does not yet fully understand conversation purpose, Case Profile, or agent task. | Important | Knowledge Engine V2 |
| Experience lifecycle | Learning layer creates placeholder candidates. | Closed Cases and Outcomes generate structured Experience after review and sanitization. | Learning exists as a response field, but not as a complete Experience lifecycle. | Important | Experience Engine |
| Profile routing | Yacht Broker profile is hardcoded in the current CIE route. | Profile routing is selected by Case Profile, Business Pack, requested capability, Company configuration, and current Case state. | CIE supports profiles conceptually but not yet through runtime routing. | Later | Multi-profile runtime |
| Multi-agent coordination | One profile handles one request. | Multiple agents may participate in one Case over time, each producing intelligence, decisions, tasks, or tool plans. | No shared Case-level coordination model exists yet for multiple agents. | Later | Agent Coordination |
| Model / provider trace | Provider information is limited. | Intelligence records should include model, provider, cost, confidence, profile version, and relevant execution trace. | Observability is not yet strong enough for commercial operations, audit, cost control, or model comparison. | Later | Observability |

---

## 4. What We Should NOT Fix Now

- Do not rewrite CIE now.
- Do not implement Case Engine runtime immediately without schema planning.
- Do not add new agents before Case, Policy, and Event foundations are planned.
- Do not build autonomous tool execution.
- Do not over-optimize model routing yet.

The current system should continue evolving deliberately. The goal is to avoid turning architecture review into constant redesign.

---

## 5. Recommended Implementation Order

1. Case Engine Runtime
2. Event Engine Runtime
3. Intelligence Context Builder
4. Decision Engine
5. Policy Engine
6. Execution Engine / ToolPlan persistence
7. Knowledge Ranking V2
8. Experience Engine
9. Multi-profile runtime
10. Multi-tenant SaaS foundation

This order is architectural, not an immediate development mandate. Some milestones may be split, delayed, or combined depending on product priorities.

---

## 6. Architecture Principle

Audit findings do not automatically become immediate tasks.

They become architectural backlog items and are scheduled according to milestones.

The system should evolve from its current working foundations toward EBOS through deliberate runtime layers: Case, Event, Context, Decision, Policy, Execution, Experience, and then broader multi-agent and multi-tenant capabilities.
