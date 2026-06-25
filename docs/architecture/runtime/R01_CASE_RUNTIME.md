# Case Runtime V1

## Enterprise Business Operating System — Runtime Specification

Document type: Runtime Spec (implementation-ready)
Status: Approved for implementation
Version: 1.0
Created: 2026-06-25

Related architecture documents:
- `docs/architecture/00_AI_OS_PRINCIPLES.md`
- `docs/architecture/01_ENTERPRISE_BUSINESS_MODEL.md`
- `docs/architecture/02_BUSINESS_DOMAIN_MODEL.md`
- `docs/architecture/03_GOAL_ENGINE.md`
- `docs/architecture/04_CASE_ENGINE.md`
- `docs/architecture/05_EVENT_ENGINE.md`
- `docs/architecture/06_CORE_INTELLIGENCE_ENGINE.md`
- `docs/architecture/GAP_ANALYSIS.md`

---

## 1. Purpose

This document is not a philosophy document. It is a concrete implementation spec.

It translates the approved EBOS Case Engine, Event Engine, and Core Intelligence Engine architecture into a first code iteration: **Case Runtime V1**.

The single goal of Case Runtime V1 is:

> Anchor the existing Inbox → CIE → Approval flow to Case and CaseEvent records, without breaking any current behavior.

The system currently processes inbox messages through the Core Intelligence Engine, produces a draft reply via the Professional Brokerage Reasoning Engine (PBRE), and stores the result as an `agent_approvals` record. This works and must continue to work. Case Runtime V1 adds the Case and Event layer around that flow as lightweight, non-destructive records.

After V1 is implemented, every suggested reply will be linked to a Case. Every important AI action will have a corresponding CaseEvent on that Case's timeline. The approval queue continues to function as today, and no external behavior changes.

This is the first step from the current working system toward the full EBOS runtime described in `GAP_ANALYSIS.md`.

---

## 2. Non-Goals

The following are explicitly out of scope for Case Runtime V1:

- **No full Case UI.** No new pages, no Case detail view, no Case list. The Operations Center continues as today. A Case timeline UI belongs to a later milestone.
- **No Goal Engine runtime.** Cases in V1 will have no `goal_id`. Goal linkage is a future milestone. Cases are created from incoming messages without a prerequisite Goal in V1.
- **No multi-agent coordination.** One agent, one CIE call, one Case. Cross-agent Case collaboration is a future milestone.
- **No autonomous tool execution.** ToolRequests remain `"proposed"` and `"status": "approved"` states are not acted upon automatically. The ToolPlan lives in the approval payload and now also in a CaseEvent; execution remains manual.
- **No full Decision Engine.** The `RecommendedDecision` value from CIE is stored as a CaseEvent payload. A first-class Decision entity with lifecycle, actor, rationale, and approval audit trail is a future milestone.
- **No full Policy Engine.** Policy constraints remain in the PBRE prompt rules and `ToolExecutionPolicy` defaults. A runtime Policy Engine is a future milestone.
- **No Experience Engine.** The `learning` layer of `IntelligenceResponse` remains a candidate list. The Experience pipeline that processes closed Cases is a future milestone.
- **No SaaS billing or multi-tenant UI.** `company_id` is introduced as a nullable column defaulting to an internal constant. Tenant isolation and billing infrastructure are future milestones.

If a proposed change falls into any of the above categories, it belongs in a later Runtime Spec, not in V1.

---

## 3. Runtime Objects V1

These are the minimal objects introduced in Case Runtime V1. They are described as data structures first; database tables are defined in Section 4.

### Case

A Case is the operational unit of business execution that groups all related messages, events, intelligence, decisions, tool plans, and approvals for one business objective.

In V1, a Case is created automatically when a new inbox message triggers the suggest-reply route and no matching open Case is found for that sender.

Minimal V1 Case fields:

| Field | Type | Notes |
|---|---|---|
| `id` | uuid | Primary key |
| `company_id` | text nullable | Nullable in V1; defaults to `"internal"`. Required in future multi-tenant mode. |
| `title` | text | Derived from message subject or `"Enquiry from {senderName}"` |
| `case_type` | text | e.g., `"buyer_inquiry"`, `"seller_inquiry"`, `"broker_cooperation"`, `"charter_request"`, `"general"` |
| `case_profile` | text | Corresponds to the CIE profile used: `"yacht-broker"`, `"charter"`, etc. |
| `status` | text | `"open"` on creation. Future: `"qualified"`, `"in_progress"`, `"waiting"`, `"completed"`, `"archived"`. |
| `source` | text | Message source: `"email"`, `"LinkedIn"`, `"WhatsApp"`, etc. |
| `primary_contact_name` | text nullable | From `message.senderName` |
| `primary_contact_email` | text nullable | From message sender email when available |
| `created_from_message_id` | uuid nullable | FK to `messages.id` — the message that triggered Case creation |
| `created_at` | timestamptz | |
| `updated_at` | timestamptz | |

### CaseEvent

A CaseEvent is an immutable, append-only timeline record of something meaningful that happened inside a Case. Events are never edited after creation.

Minimal V1 CaseEvent fields:

| Field | Type | Notes |
|---|---|---|
| `id` | uuid | Primary key |
| `case_id` | uuid | FK to `cases.id` — the owning Case |
| `company_id` | text nullable | Mirrors `cases.company_id`. Nullable in V1. |
| `event_type` | text | Stable machine-readable type (see Section 6) |
| `actor_type` | text | `"agent"`, `"system"`, `"human_operator"`, `"participant"` |
| `actor_id` | text nullable | Agent slug, operator id, or `"system"` |
| `summary` | text | Short human-readable description |
| `payload` | jsonb | Event-relevant snapshot data (not entity duplication) |
| `related_entity_type` | text nullable | e.g., `"message"`, `"intelligence"`, `"approval"`, `"toolplan"` |
| `related_entity_id` | text nullable | UUID or string ID of the related entity |
| `created_at` | timestamptz | |

### CaseParticipant

A CaseParticipant links a person or entity to a Case with a specific role and status.

In V1, a CaseParticipant is created automatically for the message sender when a Case is created or found.

Minimal V1 CaseParticipant fields:

| Field | Type | Notes |
|---|---|---|
| `id` | uuid | Primary key |
| `case_id` | uuid | FK to `cases.id` |
| `identity_id` | uuid nullable | FK to future `identities` table. Nullable in V1. |
| `name` | text | Sender name |
| `email` | text nullable | Sender email when available |
| `role` | text | From message `senderRole`: `"buyer"`, `"seller"`, `"broker"`, etc. |
| `status` | text | `"active"` on creation. Future: `"engaged"`, `"inactive"`, `"archived"`. |
| `created_at` | timestamptz | |

### Intelligence Linkage

The `IntelligenceResponse` produced by CIE is not stored as a separate database entity in V1. It is stored in the approval payload (as per the existing approval workflow). An `intelligence.generated` CaseEvent captures the key metadata and a reference to the related `agent_approvals` record.

A future `intelligence_records` table will promote this to a first-class entity. That is out of scope for V1.

### Approval Linkage

An `approval.created` CaseEvent is emitted immediately after the `agent_approvals` record is created. The `related_entity_id` of that event is the approval `id`. This creates a traceable link between the Case timeline and the approval queue without modifying the `agent_approvals` schema.

---

## 4. Minimal Database Tables V1

These are the suggested tables for Case Runtime V1. No migration SQL is written here; that belongs in a separate migration file when implementation begins.

### `cases`

```sql
cases (
  id                      uuid primary key default gen_random_uuid(),
  company_id              text,                    -- nullable; default 'internal' in V1
  title                   text not null,
  case_type               text not null,           -- e.g. 'buyer_inquiry', 'seller_inquiry', 'general'
  case_profile            text not null,           -- CIE profile: 'yacht-broker', 'charter', etc.
  status                  text not null default 'open',
  source                  text not null,           -- 'email', 'LinkedIn', 'WhatsApp', etc.
  primary_contact_name    text,
  primary_contact_email   text,
  created_from_message_id uuid references messages(id),
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now()
)
```

Recommended indexes:
- `company_id`
- `status`
- `primary_contact_email`
- `(company_id, status)`
- `created_from_message_id`

### `case_events`

```sql
case_events (
  id                    uuid primary key default gen_random_uuid(),
  case_id               uuid not null references cases(id),
  company_id            text,                     -- mirrors cases.company_id; nullable in V1
  event_type            text not null,            -- stable machine-readable type
  actor_type            text not null,            -- 'agent', 'system', 'human_operator', 'participant'
  actor_id              text,                     -- agent slug, user id, or 'system'
  summary               text not null,
  payload               jsonb not null default '{}'::jsonb,
  related_entity_type   text,                     -- 'message', 'intelligence', 'approval', 'toolplan'
  related_entity_id     text,                     -- UUID or string ID
  created_at            timestamptz not null default now()
)
```

CaseEvents are never updated. No `updated_at` column.

Recommended indexes:
- `case_id`
- `(case_id, created_at)`
- `event_type`
- `(related_entity_type, related_entity_id)`
- `(actor_type, actor_id)`

### `case_participants`

```sql
case_participants (
  id            uuid primary key default gen_random_uuid(),
  case_id       uuid not null references cases(id),
  identity_id   uuid,                             -- FK to future identities table; nullable in V1
  name          text not null,
  email         text,
  role          text not null,                    -- 'buyer', 'seller', 'broker', etc.
  status        text not null default 'active',
  created_at    timestamptz not null default now()
)
```

Recommended indexes:
- `case_id`
- `email`
- `(case_id, role)`

### Existing tables — no schema changes required in V1

The following existing tables are used as-is in V1. No columns are added or removed:

- `messages` — referenced by `cases.created_from_message_id` and `message.received` CaseEvent `related_entity_id`
- `agent_approvals` — referenced by `approval.created` CaseEvent `related_entity_id`
- `agent_activity_logs` — continue to receive log entries alongside CaseEvents

A nullable `case_id` column on `messages` is **not** required in V1. The Case ↔ Message relationship is expressed through the `cases.created_from_message_id` FK and through the `message.received` CaseEvent. This avoids a disruptive schema change to the `messages` table.

A nullable `case_id` on `agent_approvals` is also deferred. The Case ↔ Approval link is preserved through the `approval.created` CaseEvent only in V1.

---

## 5. Case Creation Rules V1

Case creation runs at the start of the suggest-reply route, before CIE is called. The rules are:

### Rule 1 — Reuse an existing open Case if a safe match is found

Check whether an open Case exists for the same sender. The match is made by `primary_contact_email` if the sender's email is known, or by `primary_contact_name` as a fallback when email is unavailable.

A match is only accepted if:
- `cases.status = 'open'`
- `cases.company_id` matches the current context (or both are internal in V1)
- `cases.case_profile` matches the profile that will be used for this request

If a match is found: use the existing Case `id`. Do not create a new Case.

### Rule 2 — Create a new Case if no safe match exists

If no matching open Case is found, create a new Case record with:
- `title`: `"Enquiry from {message.senderName}"` or message subject if available
- `case_type`: derived from the preliminary `classifyMessage()` result (e.g., `"buyer_inquiry"`, `"broker_cooperation"`, `"general"`)
- `case_profile`: the CIE profile name that will be used (`"yacht-broker"` in current production)
- `status`: `"open"`
- `source`: `message.source`
- `primary_contact_name`: `message.senderName`
- `primary_contact_email`: `message.senderEmail` if available, `null` otherwise
- `created_from_message_id`: `message.id`
- `company_id`: `"internal"` (V1 placeholder)

### Rule 3 — Create a CaseParticipant if the sender is not already a participant

After Case resolution (find or create), check whether a `case_participants` record already exists for this Case with `name = message.senderName`. If not, create one:
- `role`: `message.senderRole`
- `name`: `message.senderName`
- `email`: sender email when available
- `status`: `"active"`

### Rule 4 — Emit `message.received` CaseEvent

After Case and Participant are resolved, emit a `message.received` CaseEvent:
- `case_id`: the resolved Case `id`
- `event_type`: `"message.received"`
- `actor_type`: `"participant"`
- `actor_id`: sender name or future participant id
- `summary`: `"Message received from {message.senderName} via {message.source}"`
- `payload`: `{ messageId, senderName, senderRole, source, urgency, classification }`
- `related_entity_type`: `"message"`
- `related_entity_id`: `message.id`

### Identity matching caution

In V1, matching is intentionally conservative. Name-only matching should never result in merging Cases for different real people. If only a name is available and the name is common (e.g., "John Smith"), prefer creating a new Case over an unsafe merge. A future Identity Engine will handle deduplication more robustly.

---

## 6. Event Emission Rules V1

All events in V1 are append-only. Once written, a CaseEvent record is never updated or deleted.

Events emitted during the suggest-reply flow:

### `message.received`

When: After Case resolution (find or create), before CIE is called.
Actor: `participant` — the message sender.
Payload: `{ messageId, senderName, senderRole, source, urgency, classification }`.

### `intelligence.generated`

When: After `CoreIntelligenceEngine.execute()` returns successfully.
Actor: `agent` — the agent slug (e.g., `"yacht-broker"`).
Summary: `"CIE produced intelligence via {profileId} profile using {provider}"`.
Payload:
```json
{
  "profileId":          "yacht-broker",
  "provider":           "openai",
  "mocked":             false,
  "leadScore":          "B",
  "riskLevel":          "medium",
  "recommendation":     "PROCEED",
  "knowledgeUsedCount": 3,
  "memoryUsedCount":    1,
  "toolRequestCount":   3,
  "approvalId":         "<approval uuid>"
}
```
Related entity: `"approval"` / `approval.id`.

The payload is a summary snapshot, not a full copy of `IntelligenceResponse`. The full intelligence is stored in the approval payload.

### `decision.proposed`

When: Immediately after `intelligence.generated`.
Actor: `agent`.
Summary: `"Decision proposed: {recommendation} — {rationale excerpt}"`.
Payload:
```json
{
  "recommendation": "PROCEED",
  "rationale":      "Qualified buyer with confirmed budget...",
  "riskLevel":      "medium",
  "safetyNotes":    "...",
  "approvalRequired": true
}
```
Related entity: `"approval"` / `approval.id`.

### `toolplan.created`

When: If `intelligence.execution.toolPlan` exists and contains at least one `ToolRequest`.
Condition: Only emitted when `toolPlan.toolRequests.length > 0`.
Actor: `agent`.
Summary: `"ToolPlan created: {count} proposed action(s), highest risk {highestRiskLevel}"`.
Payload:
```json
{
  "toolRequestCount":  3,
  "highestRiskLevel":  "high",
  "requiresApproval":  true,
  "summary":           "...",
  "toolRequests": [
    { "tool": "document.requestNda", "category": "DOCUMENT", "priority": "high", "riskLevel": "high" },
    { "tool": "crm.createLead",      "category": "CRM",      "priority": "high", "riskLevel": "low" },
    { "tool": "calendar.proposeMeeting", "category": "CALENDAR", "priority": "medium", "riskLevel": "low" }
  ]
}
```
Related entity: `"approval"` / `approval.id`.

The ToolRequest `input` fields are not repeated in the CaseEvent payload. The full ToolPlan is accessible via the approval payload. The CaseEvent captures only what is needed for the timeline display.

### `approval.created`

When: After the `agent_approvals` record is created.
Actor: `system`.
Summary: `"Approval pending: {approval.title}"`.
Payload:
```json
{
  "approvalId":   "<uuid>",
  "type":         "suggested reply",
  "title":        "Reply draft for James Harrington",
  "riskLevel":    "medium",
  "status":       "pending"
}
```
Related entity: `"approval"` / `approval.id`.

### Event ordering guarantee

The events for a single suggest-reply request are always emitted in this order:

```
message.received
↓
intelligence.generated
↓
decision.proposed
↓
toolplan.created          (conditional: only if toolPlan exists)
↓
approval.created
```

Each event appends to the Case timeline. The order is enforced by sequential emission within the route handler, not by a queue.

---

## 7. IntelligenceContext Changes V1

The `IntelligenceContext` interface (`src/agent/core/IntelligenceContext.ts`) gains optional Case-related fields. All new fields are optional. Existing profiles that do not reference them continue to work without any changes.

Additions:

| Field | Type | Purpose |
|---|---|---|
| `companyId?` | `string` | Company identifier. `"internal"` in V1. Required in future multi-tenant mode. |
| `caseId?` | `string` | UUID of the resolved Case for this request. |
| `triggeringEventId?` | `string` | UUID of the `message.received` CaseEvent that triggered this intelligence request. |
| `caseProfile?` | `string` | Case profile name, e.g., `"yacht-broker"`. Used by future profile routing logic. |
| `caseStatus?` | `string` | Current Case status at the time of the intelligence request, e.g., `"open"`. |
| `participants?` | `CaseParticipant[]` | Participants known in this Case. Used by future multi-participant reasoning. |

The `CaseParticipant` type referenced here is a lightweight summary type, not the full database model:

```typescript
interface CaseParticipant {
  id: string;
  name: string;
  email?: string;
  role: string;
  status: string;
}
```

These fields are assembled by the route handler (or a future `IntelligenceContextBuilder` service) before `CoreIntelligenceEngine.execute()` is called.

The CIE and `YachtBrokerProfile` do not currently read these fields. They are present in the context for future profiles and context-aware routing logic.

---

## 8. Approval Payload V1

The existing approval payload format must remain backward compatible. Old approval records must continue to render correctly in the Operations Center without any migration.

### Current payload shape

The current `agent_approvals.payload` field stores a JSON string with the structure produced by spreading `intelligence.draft` (which is the `DraftReplyResult` from PBRE):

```json
{
  "draft": "Dear Mr. Harrington...",
  "conversationType": "Buyer Inquiry",
  "conversationStage": "Initial Inquiry",
  "leadScore": "B",
  "leadScoreReason": "...",
  "riskLevel": "medium",
  "riskReason": "...",
  "missingQualificationItems": ["..."],
  "suggestedNextActions": ["..."],
  "knowledgeUsed": [...],
  "memoryUsed": [...],
  "safetyNotes": "...",
  "approvalRequired": true,
  "adminReasoningSummary": "...",
  "provider": "openai",
  "mocked": false
}
```

### Target V1 payload shape

Add Case and Event linkage fields alongside the existing PBRE fields:

```json
{
  "draft": "Dear Mr. Harrington...",
  "conversationType": "Buyer Inquiry",
  "conversationStage": "Initial Inquiry",
  "leadScore": "B",
  "leadScoreReason": "...",
  "riskLevel": "medium",
  "riskReason": "...",
  "missingQualificationItems": ["..."],
  "suggestedNextActions": ["..."],
  "knowledgeUsed": [...],
  "memoryUsed": [...],
  "safetyNotes": "...",
  "approvalRequired": true,
  "adminReasoningSummary": "...",
  "provider": "openai",
  "mocked": false,

  "caseId":              "<uuid>",
  "triggeringEventId":   "<uuid>",
  "intelligenceEventId": "<uuid>",
  "decisionEventId":     "<uuid>",
  "toolPlanEventId":     "<uuid or null>",

  "intelligence": { ... }
}
```

New fields explained:

| Field | Value | Notes |
|---|---|---|
| `caseId` | UUID | The Case this approval belongs to |
| `triggeringEventId` | UUID | The `message.received` CaseEvent that triggered CIE |
| `intelligenceEventId` | UUID | The `intelligence.generated` CaseEvent |
| `decisionEventId` | UUID | The `decision.proposed` CaseEvent |
| `toolPlanEventId` | UUID or null | The `toolplan.created` CaseEvent; null if no ToolPlan was emitted |
| `intelligence` | object | Full `IntelligenceResponse` including `execution.toolPlan`. Enables UI to access ToolPlan at `payload.intelligence.execution.toolPlan` |

### Backward compatibility guarantee

The frontend `parseDraft()` function checks `typeof p?.draft === "string"`. This check continues to pass because `draft` (the reply text) remains at the top level of the payload. Legacy approval records that do not contain `caseId` or `intelligence` continue to render through the existing `DraftPayloadView` logic. The new fields are additive.

The approach for the payload is: `{ ...intelligence.draft, caseId, triggeringEventId, intelligenceEventId, decisionEventId, toolPlanEventId, intelligence }`. The spread ensures all PBRE fields remain at the top level for backward compatibility; the new fields are appended.

---

## 9. Services to Introduce in Code

Case Runtime V1 introduces the following backend service boundaries. These are named here to establish correct module placement, but implementation details (class vs. function, sync vs. async, error handling) belong in the code, not in this spec.

### `CaseRuntimeService`

Located at: `src/agent/case/CaseRuntimeService.ts`

Responsibilities:
- Find or create a Case for a given message and profile
- Apply Case creation rules (Section 5)
- Return the resolved `caseId` and `isNew` flag

### `CaseEventService`

Located at: `src/agent/case/CaseEventService.ts`

Responsibilities:
- Append a CaseEvent to the database
- Enforce event structure (required fields: `caseId`, `event_type`, `actor_type`, `summary`)
- Return the created event `id` for use in subsequent events and payload linkage

### `CaseParticipantService`

Located at: `src/agent/case/CaseParticipantService.ts`

Responsibilities:
- Find or create a CaseParticipant for the message sender
- Accept `{ caseId, name, email, role }` and return the participant record

### `IntelligenceContextBuilder`

Located at: `src/agent/core/IntelligenceContextBuilder.ts`

Responsibilities:
- Accept `{ message, caseId, triggeringEventId, agentId }` and all supporting data
- Run `retrieveKnowledgeForAgent()`, `repository.listMemory()`, and sender-name memory matching
- Assemble and return a complete `IntelligenceContext` including the new optional Case fields
- Extract the context assembly logic currently in `src/backend/routes/api.ts` into a reusable infrastructure layer

The route handler becomes a thin orchestrator:

```
resolve Case
→ IntelligenceContextBuilder.build()
→ CoreIntelligenceEngine.execute()
→ emit events
→ create approval
→ respond
```

These four services must not be implemented until database migrations for `cases`, `case_events`, and `case_participants` are in place and the repository layer is extended to support them.

---

## 10. API Flow V1

This section describes how `POST /api/inbox/:id/suggest-reply` changes conceptually. The current behavior is preserved as an inner subset of the new flow.

### Current flow

```
POST /inbox/:id/suggest-reply
  │
  ├─ repository.findMessage(id)
  ├─ classifyMessage(message)
  ├─ retrieveKnowledgeForAgent(...)
  ├─ repository.listMemory()
  ├─ senderName matching on memory
  │
  ├─ Build IntelligenceContext (inline in route)
  │
  ├─ CoreIntelligenceEngine.execute("yacht-broker", context)
  │     └─ YachtBrokerProfile.execute(context)
  │           └─ draftReplyWithContext() [PBRE — GPT-4o]
  │
  ├─ repository.updateMessage({ status: "reply suggested" })
  ├─ repository.createApproval({ payload: JSON.stringify(intelligence.draft) })
  ├─ repository.logActivity(...)
  └─ res.json({ approval, draft: intelligence.draft })
```

### Target V1 flow

```
POST /inbox/:id/suggest-reply
  │
  ├─ repository.findMessage(id)
  │
  ├─ CaseRuntimeService.resolveCase(message, "yacht-broker")
  │     ├─ find open Case by contact name/email, or
  │     └─ create new Case
  │
  ├─ CaseParticipantService.findOrCreate({ caseId, message.senderName, ... })
  │
  ├─ CaseEventService.append("message.received", caseId, { messageId, ... })
  │     └─ returns triggeringEventId
  │
  ├─ IntelligenceContextBuilder.build({ message, caseId, triggeringEventId, agentId })
  │     ├─ retrieveKnowledgeForAgent(...)
  │     ├─ repository.listMemory()
  │     ├─ senderName matching on memory
  │     └─ returns IntelligenceContext with caseId, triggeringEventId
  │
  ├─ CoreIntelligenceEngine.execute("yacht-broker", context)
  │     └─ YachtBrokerProfile.execute(context)
  │           └─ draftReplyWithContext() [PBRE — GPT-4o, unchanged]
  │
  ├─ CaseEventService.append("intelligence.generated", caseId, { profileId, leadScore, ... })
  │     └─ returns intelligenceEventId
  │
  ├─ CaseEventService.append("decision.proposed", caseId, { recommendation, rationale, ... })
  │     └─ returns decisionEventId
  │
  ├─ [conditional] CaseEventService.append("toolplan.created", caseId, { toolRequestCount, ... })
  │     └─ returns toolPlanEventId (or null if no ToolPlan)
  │
  ├─ repository.updateMessage({ status: "reply suggested" })
  │
  ├─ repository.createApproval({
  │     payload: JSON.stringify({
  │       ...intelligence.draft,
  │       caseId, triggeringEventId, intelligenceEventId, decisionEventId, toolPlanEventId,
  │       intelligence
  │     })
  │   })
  │
  ├─ CaseEventService.append("approval.created", caseId, { approvalId, title, riskLevel, ... })
  │
  ├─ repository.logActivity(...)
  └─ res.json({ approval, draft: intelligence.draft, caseId })
```

The response gains `caseId` so the frontend can display or navigate to the Case in the future. The `approval` and `draft` fields are unchanged for backward compatibility.

If any Case or Event service call fails, the failure should be logged but **must not block the approval creation**. The approval flow is the primary output of this route. Case and Event persistence is additive infrastructure and must degrade gracefully in V1.

---

## 11. Migration Strategy

### Principle

No destructive migrations. All changes are additive. Existing tables and columns are not modified. The system continues to operate without Case and Event records if the migration has not yet been applied.

### Phase 1 — Add new tables (required before V1 code is deployed)

Run in Supabase SQL editor:

1. Create `cases` table with all columns defined in Section 4.
2. Create `case_events` table with all columns defined in Section 4.
3. Create `case_participants` table with all columns defined in Section 4.
4. Add recommended indexes for all three tables.

File naming: `supabase/migrations/20260625150000_case_runtime_v1.sql`

### Phase 2 — Optional: add `case_id` to `messages` (deferred)

After V1 is stable and operating, a nullable `case_id` column may be added to the `messages` table:

```sql
alter table messages add column if not exists case_id uuid references cases(id);
```

This is not required for V1. The Case ↔ Message relationship is preserved through `cases.created_from_message_id` and the `message.received` CaseEvent in V1.

### Phase 3 — Optional: add `case_id` to `agent_approvals` (deferred)

A nullable `case_id` column may be added to `agent_approvals` after V1:

```sql
alter table agent_approvals add column if not exists case_id uuid references cases(id);
```

This is not required for V1. The Case ↔ Approval link is preserved through the `approval.created` CaseEvent.

### Backfill

No backfill of existing `messages` or `agent_approvals` records is required or planned. Historical records will not have Case linkage. This is acceptable. V1 provides forward linkage only.

### In-memory fallback

The existing `store.ts` in-memory fallback must gain support for `cases`, `case_events`, and `case_participants` collections. The in-memory store is used when Supabase credentials are absent (local development without a database). The V1 services must not crash if running against the in-memory store.

---

## 12. Testing Checklist

Before Case Runtime V1 is considered complete, all of the following must pass:

### Regression — existing behavior unchanged

- [ ] `POST /inbox/:id/suggest-reply` still returns `{ approval, draft }` with correct shape
- [ ] `agent_approvals` record is created with `status: "pending"` and correct `riskLevel`
- [ ] Approval is visible in the Operations Center Approvals tab
- [ ] `DraftPayloadView` renders PBRE fields (draft text, leadScore, riskLevel, suggestedNextActions, knowledgeUsed, etc.)
- [ ] Legacy approval records without `caseId` continue to render without errors
- [ ] `npm run build` passes with no TypeScript errors

### Case creation

- [ ] A `cases` record is created for a new sender
- [ ] A second message from the same sender reuses the existing open Case
- [ ] `cases.case_type` is derived from message classification correctly
- [ ] `cases.primary_contact_name` matches `message.senderName`
- [ ] `cases.created_from_message_id` points to the triggering message

### Participant creation

- [ ] A `case_participants` record is created for the message sender
- [ ] A second message from the same sender does not create a duplicate participant

### Events

- [ ] `message.received` CaseEvent is created with correct `case_id`, `related_entity_id`, and `summary`
- [ ] `intelligence.generated` CaseEvent is created with `profileId`, `leadScore`, `riskLevel`, `provider`, `approvalId`
- [ ] `decision.proposed` CaseEvent is created with `recommendation`, `rationale`, `riskLevel`
- [ ] `toolplan.created` CaseEvent is created when `intelligence.execution.toolPlan.toolRequests.length > 0`
- [ ] `toolplan.created` is NOT emitted when `toolRequests` is empty
- [ ] `approval.created` CaseEvent is created with `approvalId`, `type`, `title`, `status`
- [ ] All events have correct `case_id` FK pointing to the same Case
- [ ] Events are append-only (no update or delete is performed)

### Approval payload

- [ ] Approval payload contains top-level PBRE fields (`draft`, `leadScore`, `conversationType`, etc.)
- [ ] Approval payload contains `caseId`, `triggeringEventId`, `intelligenceEventId`, `decisionEventId`
- [ ] Approval payload contains `toolPlanEventId` (UUID) when a ToolPlan was created
- [ ] Approval payload contains `toolPlanEventId: null` when no ToolPlan was created
- [ ] Approval payload contains `intelligence` object with full `IntelligenceResponse`
- [ ] `intelligence.execution.toolPlan` is accessible at `payload.intelligence.execution.toolPlan`
- [ ] `typeof payload.draft === "string"` is true (backward compat check for `parseDraft()`)

### Failure degradation

- [ ] If Case creation fails, approval is still created and the route returns 200
- [ ] If Event emission fails, approval is still created and the route returns 200
- [ ] Failure is logged via `repository.logActivity()` or console

---

## 13. Risks

### Duplicate Case creation

**Risk:** If two messages from the same sender arrive close together before the first Case is committed, both may trigger Case creation and result in duplicate Cases.

**Mitigation in V1:** The match check and Case insert should be made atomic using a database transaction or a unique constraint on `(company_id, primary_contact_email, case_profile, status = 'open')`. If a unique constraint violation occurs, retry with the existing Case. Full deduplication is a future concern.

### Weak identity matching

**Risk:** Name-only matching (when email is unavailable) may produce incorrect Case merges for senders with common names, or may fail to merge Cases for the same person using different email addresses.

**Mitigation in V1:** Prefer creating a new Case over a risky name-only merge. Document that V1 matching is conservative. A future Identity Engine handles robust deduplication.

### Event payload bloat

**Risk:** CaseEvent payloads that include large intelligence snapshots, full message bodies, or full ToolRequest inputs could inflate the `case_events` table rapidly.

**Mitigation in V1:** CaseEvent payloads are summary-only. Full intelligence is stored in `agent_approvals.payload`. Full ToolPlan inputs remain in the approval payload. The `intelligence.generated` event payload captures only key metrics (score, risk, counts, provider), not the full `IntelligenceResponse`.

### Premature coupling to inbox

**Risk:** Designing Case creation exclusively around inbox messages may make it harder to create Cases from other triggers (e.g., leads, tasks, manual operator action) in the future.

**Mitigation in V1:** `CaseRuntimeService.resolveCase()` accepts a message as input but is not architecturally coupled to the inbox. Future callers can pass different creation triggers. The Case schema does not require a `created_from_message_id` to be non-null.

### `company_id` placeholder

**Risk:** Using `"internal"` as a `company_id` placeholder creates records that will need backfilling or re-keying when real multi-tenant isolation is introduced.

**Mitigation in V1:** Accept this as a known technical debt. The `company_id` column is present from the start so the schema change when real IDs arrive is additive (update values) rather than structural (add column). Document that `"internal"` is a V1 placeholder.

### No full tenant boundary

**Risk:** Without a real `company_id`, Case and Event records cannot be scoped to a tenant. Any future multi-tenant deployment would need careful data migration.

**Mitigation in V1:** This is documented as a known gap. Multi-tenant isolation is explicitly a non-goal of V1 (see Section 2). The architecture documents require it; the V1 runtime establishes the schema scaffolding without enforcing it.

### Failure path complexity

**Risk:** Adding Case and Event creation before and after CIE increases the number of I/O operations in the route. Any failure may leave a partially committed state (e.g., Case created, no events; or events created, no approval).

**Mitigation in V1:** The rule is that Case and Event persistence must **never block approval creation**. Wrap Case/Event operations in try/catch and log failures. The approval remains the authoritative output. A future audit process can detect and repair partially committed Cases.

---

## 14. Success Criteria

Case Runtime V1 is considered complete and successful when:

1. **Existing workflow is unchanged.** Every call to `POST /inbox/:id/suggest-reply` continues to produce an `agent_approvals` record that is visible and functional in the Operations Center. No external behavior changes.

2. **Every new suggested reply is linked to a Case.** A `cases` record exists for every message processed through the suggest-reply route after V1 is deployed.

3. **Key AI outputs create CaseEvents.** The `case_events` table receives `message.received`, `intelligence.generated`, `decision.proposed`, and `approval.created` for every processed message. `toolplan.created` is emitted when a ToolPlan with at least one ToolRequest exists.

4. **ToolPlan is accessible via the approval payload.** `payload.intelligence.execution.toolPlan` resolves to the full `ToolPlan` object for any approval processed after V1 is deployed.

5. **Case linkage fields are present in the approval payload.** `caseId`, `triggeringEventId`, `intelligenceEventId`, and `decisionEventId` are populated in every approval created after V1 is deployed.

6. **Legacy approvals still render.** Pre-V1 approval records without `caseId` or `intelligence` continue to display correctly in `DraftPayloadView` without errors.

7. **Build and typecheck pass.** `npm run build` completes with no TypeScript errors and no Vite build errors.

8. **Operations Center can later show a Case timeline.** The `case_events` table has sufficient structure and data to power a future timeline view: `SELECT * FROM case_events WHERE case_id = $1 ORDER BY created_at ASC` returns a complete, ordered activity log for any Case processed in V1.

---

## Appendix: Architecture Position

Case Runtime V1 implements the first two layers of the EBOS runtime stack as described in `GAP_ANALYSIS.md`:

```
[1] Case Engine Runtime          ← implemented in V1 (cases, case_participants)
[2] Event Engine Runtime         ← implemented in V1 (case_events, 5 event types)
[3] Intelligence Context Builder ← stub service introduced, full build in next milestone
[4] Decision Engine              ← not yet: decision.proposed event only
[5] Policy Engine                ← not yet: ToolExecutionPolicy defaults remain
[6] Execution Engine             ← not yet: ToolPlan remains "proposed" only
[7] Knowledge Ranking V2         ← not yet
[8] Experience Engine            ← not yet
[9] Multi-profile routing        ← not yet
[10] Multi-tenant SaaS           ← not yet
```

The next Runtime Spec (`R02`) should address the `IntelligenceContextBuilder` as a production service and begin the Decision Engine as a first-class entity.
