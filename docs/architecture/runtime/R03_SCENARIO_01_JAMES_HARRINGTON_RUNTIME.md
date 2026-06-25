# R03 — Scenario 01: James Harrington Buyer Inquiry Runtime

Document type: Runtime Scenario Record  
Status: **Completed / PASS**  
Created: 2026-06-25  
Related specs: `docs/architecture/runtime/R01_CASE_RUNTIME.md`, `docs/architecture/runtime/R02_PRODUCT_NAVIGATION_MODEL.md`

---

## 1. Scenario Status

**Status: Completed / PASS**

**Scenario:**  
James Harrington sends a buyer inquiry for a 50–60m motor yacht with a EUR 8–12M budget and confirmed financing. The message arrives via email. The system classifies it, creates a Case, runs CIE/PBRE reasoning, proposes a decision, generates a ToolPlan, creates an Approval, and surfaces everything in the Cases list and Case Detail workspace.

**Runtime path verified:**

```
Inbox
→ Suggest Reply
→ Case created
→ Case Events persisted
→ CIE/PBRE reasoning
→ Decision proposed
→ ToolPlan created
→ Approval created
→ Cases list
→ Case Detail
```

---

## 2. Test Input

Exact message used during E2E verification:

| Field | Value |
|---|---|
| `senderName` | James Harrington |
| `senderRole` | buyer |
| `source` | email |
| `subject` | Enquiry: 50m Motor Yacht |
| `body` | I am a serious buyer looking for a 50-60m motor yacht EUR 8-12M. Confirmed financing, ready in 30 days. Please send off-market listings. |
| `urgency` | high |
| `status` | new |

---

## 3. Expected Classification

**Expected result:** `buyer_inquiry`

**Classification rule:**  
The classifier must check `senderRole` before scanning the message body for keywords. An explicit `senderRole: "buyer"` is a stronger signal than any keyword match.

**Resolved bug:**  
The word "listings" (as in "off-market listings") matched the body keyword check `body.includes("listing")`, which returned `"seller inquiry"` before the `buy`/`budget` check was reached. The message was incorrectly classified as `seller_inquiry` despite `senderRole: "buyer"`.

**Fix applied:**  
`src/agent/classifyMessage.ts` was updated to check `senderRole` at the top of the function, before any body keyword analysis. The existing keyword fallback logic is unchanged and applies only when `senderRole` is absent or unrecognised.

---

## 4. Runtime Objects Created

The following objects are created during a single Suggest Reply invocation for this scenario:

**Inbox Message**  
Stored in `messages`. Fields: `id`, `senderName`, `senderRole`, `source`, `subject`, `body`, `urgency`, `status`, `agentId`, `createdAt`.

**Business Case**  
Stored in `cases`. Created by `CaseRuntimeService.resolveCase()`.  
Fields: `id`, `companyId`, `title`, `caseType`, `caseProfile`, `status`, `source`, `primaryContactName`, `createdFromMessageId`, `createdAt`, `updatedAt`.

**Case Events**  
Five append-only records stored in `case_events`. See Section 5.

**Intelligence Result**  
Produced by `CoreIntelligenceEngine.execute("yacht-broker", context)` → `YachtBrokerProfile` → PBRE. Stored in the approval payload. Not a separate database entity in V1.

**Decision Proposal**  
A `decision.proposed` CaseEvent carrying `recommendation`, `rationale`, and `riskLevel`. Also accessible at `intelligence.decision` inside the approval payload.

**ToolPlan**  
A `toolplan.created` CaseEvent carrying a summary of proposed tool requests. Full ToolPlan accessible at `intelligence.execution.toolPlan` inside the approval payload.

**Approval Item**  
Stored in `agent_approvals`. Fields: `id`, `agentId`, `type`, `title`, `payload`, `status`, `riskLevel`, `relatedMessageId`, `createdAt`. Payload contains the full `IntelligenceResponse` and all Case linkage IDs.

**Assigned Agent Reference**  
Resolved by the `GET /api/cases/:id` endpoint from the existing agent registry (`defaultAgentDefinitions`). Not stored as a separate entity in V1 — derived at read time.

**Case Detail Response**  
Assembled by `GET /api/cases/:id`. Returns: `case`, `events`, `participants`, `approvals`, `messages`, `latestIntelligence`, `latestDraft`, `latestToolPlan`, `assignedAgents`.

---

## 5. Case Events Sequence

The following five events are emitted in guaranteed order during a single Suggest Reply call:

| Order | Event Type | Actor | Description |
|---|---|---|---|
| 1 | `message.received` | `participant` | Message received from James Harrington via email |
| 2 | `intelligence.generated` | `agent` | CIE produced intelligence via yacht-broker profile |
| 3 | `decision.proposed` | `agent` | Decision proposed: PROCEED |
| 4 | `toolplan.created` | `agent` | ToolPlan: 2 proposed action(s) |
| 5 | `approval.created` | `system` | Approval pending: Reply draft for James Harrington |

Events are append-only. No event is modified or deleted after creation.

---

## 6. Intelligence Result

Confirmed output from CIE/PBRE during E2E verification:

| Field | Value |
|---|---|
| `reasoning.leadScore` | A |
| `reasoning.riskLevel` | low |
| `decision.recommendation` | PROCEED |
| `latestDraft` (first 60 chars) | "Thank you for your message. Before discussing specific oppor…" |

**Note:** CIE/PBRE currently runs in template/mock mode (`draftMocked: true`) in the local development environment. No live GPT-4o API call was made. The template response is intentionally conservative and reflects the PROCEED recommendation correctly given the high lead score and low risk classification.

---

## 7. ToolPlan

Confirmed ToolPlan from E2E verification:

| Tool | Priority | Risk Level |
|---|---|---|
| `crm.createLead` | medium | low |
| `memory.proposeUpdate` | medium | low |

**Implementation rules confirmed:**

- ToolPlan is generated from runtime CIE/PBRE intelligence, not hardcoded.
- ToolPlan is captured in a `toolplan.created` CaseEvent and in `intelligence.execution.toolPlan` inside the approval payload.
- `requiresApproval: true` — no tool request is executed without operator approval.
- No autonomous execution occurs in V1. All ToolRequests remain in `"proposed"` status.

---

## 8. Approval

An `agent_approvals` record is created after the ToolPlan stage. The approval payload carries:

- All PBRE fields at the top level (backward compatible)
- `caseId`, `triggeringEventId`, `intelligenceEventId`, `decisionEventId`, `toolPlanEventId`
- Full `IntelligenceResponse` at `payload.intelligence`

**Approval principle:** Approval before autonomy.

No AI-generated draft, decision, or tool action reaches any external system without an explicit operator approval action. This principle is enforced in V1 by design and is not optional.

---

## 9. Assigned Agent

Confirmed from E2E verification:

| Field | Value |
|---|---|
| `slug` | `yacht-broker` |
| `name` | `Yacht Broker Agent` |

**Implementation rules:**

- Assigned agents are resolved from the existing agent registry (`defaultAgentDefinitions` in `src/backend/data/agents.ts`). No new registry was created.
- Resolution matches by both `agent.slug` and `agent.id` to handle the fact that `caseProfile` stores the slug (`"yacht-broker"`) while event `actorId` stores the full agent ID (`"yacht-broker-agent"`). Both resolve to the same canonical slug.
- Deduplication is performed using the canonical slug. If `caseProfile` and an event `actorId` refer to the same agent, only one entry appears.
- No fake agents are shown.
- No "coming soon" agents are shown.
- No static AI team list is rendered.
- If no assigned agent exists in the data, the UI shows: `"No assigned agent yet."`

---

## 10. Case Detail V1

Case Detail V1 (`/cases/:id`) displays only real data retrieved from the backend. The following tabs are implemented:

| Tab | Content |
|---|---|
| Overview | 6 stat cards: Lead Score, Risk, Decision, Participants, Pending Approvals, Tool Requests. Recent activity list. |
| Timeline | All CaseEvents in newest-first order, colour-coded by event type. |
| Messages | Original inbox messages linked to this case via `message.received` events. |
| AI Decisions | Conversation type, stage, lead score, risk, decision, rationale, AI draft, collapsed reasoning details. |
| Tool Plans | Card list of ToolRequests from `intelligence.execution.toolPlan`. Tool name, priority, risk, approval status. |
| Approvals | Full approval rendering reused from the AI Operations Center. Approve/Reject actions available. |
| Participants | Name, role, email, status for each CaseParticipant. |

**Right sidebar:** Assigned Agent — resolved from registry. One entry per canonical agent slug.

**Empty state rule:** If any tab has no data, the UI shows an honest empty state message. No placeholder data, no mock content, no future-state previews.

---

## 11. Completed Acceptance Criteria

All of the following were verified during E2E testing:

- [x] Message can be created in Inbox (`POST /api/inbox/message`)
- [x] Suggest Reply runs (`POST /api/inbox/:id/suggest-reply`)
- [x] Case is created in `cases` store
- [x] Classification is `buyer_inquiry` (not `seller_inquiry`)
- [x] 5 events are persisted in correct order
- [x] Intelligence result is stored in approval payload
- [x] Decision is proposed (`PROCEED`, risk=`low`, score=`A`)
- [x] ToolPlan is created with 2 tool requests
- [x] Approval item is created with `status: "pending"`
- [x] Cases list (`GET /api/cases`) shows the case with event/participant counts
- [x] Case Detail (`GET /api/cases/:id`) opens correctly and returns all fields
- [x] Assigned agent has no duplicate entries
- [x] No fake agents are shown in the Case Detail sidebar
- [x] Full scenario result: **PASS**

---

## 12. Current Limitations

The following limitations apply to the current local environment and do not indicate architectural defects:

| Limitation | Detail |
|---|---|
| In-memory store | All data is lost on server restart. No Supabase connection is active in this environment. |
| Mock CIE/PBRE | CIE/PBRE runs in template mode (`draftMocked: true`). No live GPT-4o API call is made. |
| Keyword classifier | The body keyword classifier remains order-sensitive when `senderRole` is absent or unrecognised. The `senderRole` fix applies only to messages with an explicit known role. |
| No Supabase migrations applied | The `cases`, `case_events`, and `case_participants` tables exist in `supabase/migrations/` but have not been applied in this environment. |
| Single-agent per case | V1 creates cases for one CIE profile per invocation. Multi-agent Case collaboration is a future milestone. |

None of these limitations block Scenario 01 completion in the local development environment.

---

## 13. Architectural Confirmation

This scenario confirms the approved EBOS runtime model:

```
Company
→ Goals
→ Business Cases
→ Events
→ Intelligence
→ Execution
→ Experience
```

The working implemented path for Scenario 01 is:

```
Inbox
→ Case Runtime (CaseRuntimeService, CaseEventService, CaseParticipantService)
→ Case (cases table / in-memory store)
→ Case Events (case_events — 5 events, append-only)
→ Context Builder (IntelligenceContextBuilder)
→ CIE (CoreIntelligenceEngine.execute("yacht-broker", context))
→ PBRE (YachtBrokerProfile → draftReplyWithContext)
→ Decision (decision.proposed CaseEvent)
→ ToolPlan (toolplan.created CaseEvent + approval payload)
→ Approval (agent_approvals + approval.created CaseEvent)
→ Case Detail (/cases/:id — read-only V1 workspace)
```

Goals and Experience layers are not yet implemented. Cases in V1 are created directly from inbox messages without a prerequisite Goal.

---

## 14. Next Step

Do not start new modules.

**Recommended next implementation step:**

Complete the operator action loop inside Case Detail:

> Approval decision (Approve / Reject) → status update persisted → visible state change in Case Detail Approvals tab → Case timeline updated with operator action event.

This closes the human-in-the-loop cycle. Currently, the Approve/Reject buttons in Case Detail call the existing `/api/approvals/:id/approve` and `/api/approvals/:id/reject` endpoints and the approval status updates correctly. What is missing is a corresponding CaseEvent (`approval.decided`) that records the operator action on the Case timeline, and a visible status refresh in the Case Detail view after the action.

This should be implemented as a focused addition to the existing approval endpoints and Case Detail component — no new modules required.

Do not implement this in the current task.
