# Event Engine

## Enterprise Business Operating System

Version: 1.0 (Architecture Blueprint)

---

## Purpose

The Event Engine defines how the Enterprise Business Operating System records business history.

Every important action, observation, decision, approval, tool proposal, document change, outcome, and learning moment becomes an Event inside a Case.

The Event Engine is not a notification system and not a raw log stream. It is the auditable business timeline for each Case.

In EBOS, the Case is the central operational aggregate. Events are the immutable history of that aggregate.

---

## 1. What Is An Event?

An Event is an immutable timeline record of something meaningful that happened inside a Case.

Examples:

- A Case was created.
- A message was received.
- AI generated intelligence.
- A decision was proposed.
- A ToolPlan was created.
- A ToolRequest was approved.
- A document was uploaded.
- A task was completed.
- An outcome was recorded.
- Experience was created from a closed Case.

An Event answers:

- What happened?
- When did it happen?
- Who or what caused it?
- Which Case does it belong to?
- Which entity does it relate to?
- What data snapshot is needed for audit and reconstruction?

An Event is not:

- A mutable status field.
- A task.
- A message itself.
- A database debug log.
- A frontend notification.
- A replacement for the entity it references.

---

## 2. Why Events Belong To Cases

Events belong to Cases because the Case is the operational unit of business execution.

A Message, Task, Decision, ToolPlan, ToolRequest, Document, Intelligence record, Outcome, or Experience entry only matters operationally because it contributes to a Case.

Case ownership gives Events their business meaning.

```text
Company
↓
Goal
↓
Case
↓
Events
↓
Timeline / Audit / Intelligence / Experience
```

Without a Case, an Event has no operational context:

- A message without a Case is just communication noise.
- A ToolRequest without a Case is unsafe automation.
- A decision without a Case is not accountable.
- An outcome without a Case is not explainable.
- Experience without a closed Case is not grounded.

Therefore:

- Event never exists outside Case.
- Message never exists outside Case.
- ToolRequest never executes outside Case.
- Intelligence belongs to Case.
- Decision belongs to Case.
- Outcome belongs to Case.

---

## 3. Event Principles

### Immutable

An Event is not edited after creation.

If a correction is needed, create a new correction Event rather than mutating the old Event.

### Append-Only

Events are appended to the Case timeline.

The Event stream grows over time and preserves the history of the Case.

### Case-Owned

Every Event belongs to exactly one Case.

A Company may own all Cases, but the Case owns its execution history.

### Auditable

Events must support later review by Human Operators, compliance reviewers, business owners, and future AI analysis.

Auditability requires clear actor, timestamp, event type, summary, and related entity references.

### Actor-Aware

Every Event records who or what caused it.

Actors may include:

- Human Operator
- AI Agent
- System
- External Participant
- Tool
- Integration

### Timestamped

Every Event records when it happened.

The timestamp is part of the business history and should not be replaced by display-only dates.

---

## 4. Event Lifecycle

Events are append-only, so their lifecycle is intentionally simple.

```text
Observed / Triggered
↓
Validated
↓
Appended To Case Timeline
↓
Used For Case State Projection
↓
Visible In Timeline UI
↓
Available For Intelligence / Audit / Experience
```

### Observed / Triggered

Something happens in the system or business environment.

Examples:

- Message received.
- AI analysis completed.
- Operator approves a decision.
- ToolRequest is proposed.
- Document uploaded.

### Validated

The system confirms that the Event has required fields:

- Company ID
- Case ID
- Actor
- Event type
- Timestamp
- Summary

### Appended To Case Timeline

The Event is written to the Case timeline and becomes part of immutable history.

### Used For Case State Projection

The Case may update derived state from Events.

Examples:

- Current stage.
- Current status.
- Last activity.
- Pending approval count.
- Open task count.
- Latest decision.

### Visible In Timeline UI

Operators can review what happened in chronological order.

### Available For Intelligence / Audit / Experience

AI and humans can use Events for:

- Context reconstruction.
- Risk review.
- Decision audit.
- Outcome analysis.
- Experience extraction after Case closure.

---

## 5. Event Types

The initial Event taxonomy should use stable machine-readable event types.

### Case Events

- `case.created`

### Message Events

- `message.received`

### Intelligence Events

- `intelligence.generated`

### Decision Events

- `decision.proposed`
- `decision.approved`

### Tool Plan Events

- `toolplan.created`

### Tool Request Events

- `toolrequest.proposed`
- `toolrequest.approved`
- `toolrequest.rejected`
- `toolrequest.executed`

### Task Events

- `task.created`
- `task.completed`

### Document Events

- `document.uploaded`
- `document.generated`

### Policy Events

- `policy.triggered`

### Outcome Events

- `outcome.recorded`

### Experience Events

- `experience.created`

Future Event types may be added, but existing event type meanings should remain stable.

---

## 6. Event Object Structure

A future Event object should contain the following fields.

```ts
interface CaseEvent {
  id: string;
  companyId: string;
  caseId: string;
  actorType: "human_operator" | "agent" | "system" | "participant" | "tool" | "integration";
  actorId: string;
  eventType: string;
  timestamp: string;
  summary: string;
  payload: Record<string, unknown>;
  relatedEntityType?: string;
  relatedEntityId?: string;
}
```

### `id`

Unique Event identifier.

### `companyId`

Company boundary for ownership, governance, and future multi-tenant isolation.

### `caseId`

The Case that owns the Event.

### `actorType`

The type of actor that caused the Event.

Allowed initial values:

- `human_operator`
- `agent`
- `system`
- `participant`
- `tool`
- `integration`

### `actorId`

Identifier of the specific actor.

Examples:

- Human Operator ID.
- Agent ID.
- Participant ID.
- Tool ID.
- Integration ID.

### `eventType`

Stable machine-readable event type.

Examples:

- `message.received`
- `intelligence.generated`
- `toolrequest.proposed`

### `timestamp`

The time the Event occurred or was recorded.

### `summary`

Short human-readable explanation of the Event.

### `payload`

Structured data snapshot needed for audit, reconstruction, display, or intelligence.

Payload should contain only event-relevant data, not unrelated entity duplication.

### `relatedEntityType`

Optional entity type referenced by the Event.

Examples:

- `message`
- `intelligence`
- `decision`
- `task`
- `toolplan`
- `toolrequest`
- `document`
- `outcome`
- `experience`

### `relatedEntityId`

Optional ID of the related entity.

---

## 7. Event To Case Update Flow

Events are written first. Case state is projected from Events and related entities.

```text
Business action occurs
↓
Event is validated
↓
Event is appended to Case timeline
↓
Case projection updates derived state
↓
Operator sees updated Case state
```

Examples of projected Case state:

- Current lifecycle stage.
- Current status.
- Last activity timestamp.
- Current risk level.
- Pending decisions.
- Pending ToolRequests.
- Open tasks.
- Document count.
- Latest Intelligence summary.
- Outcome status.

Important rule:

The Event is the history. The Case state is the current projection.

Do not mutate old Events to change current Case state.

---

## 8. Event To Intelligence Flow

Events provide the historical context for AI analysis.

```text
Case timeline
↓
Relevant Events selected
↓
Messages / Documents / Memory / Knowledge attached
↓
Agent generates Intelligence
↓
intelligence.generated Event appended
↓
Decision / ToolPlan / Task events may follow
```

AI should not analyze isolated messages without Case context.

An Intelligence record should be able to reference:

- The triggering Event.
- Relevant prior Events.
- Related Messages.
- Related Documents.
- Related Knowledge.
- Related Memory.
- Prior Decisions.
- Prior ToolPlans.
- Prior Outcomes where applicable.

When Intelligence is generated, the system should append `intelligence.generated` to the Case timeline.

If that Intelligence proposes a Decision, append `decision.proposed`.

If that Intelligence proposes actions, append `toolplan.created` and `toolrequest.proposed` events.

---

## 9. Event To Timeline UI Flow

The Timeline UI should be a Case-owned view of Events.

```text
Case selected
↓
Events loaded by caseId
↓
Events grouped / filtered for readability
↓
Operator reviews timeline
↓
Operator expands details only when needed
```

The Timeline UI should show:

- Event type label.
- Timestamp.
- Actor.
- Summary.
- Related entity link if available.
- Important status/risk badges.

Collapsed details may show:

- Payload.
- Related entity snapshot.
- Technical metadata.
- Raw JSON.

Timeline UI should not replace the AI Operations Center.

Relationship between views:

- AI Operations Center shows what needs supervision now.
- Timeline UI shows what happened over time.
- Case view combines current state, timeline, tasks, documents, participants, intelligence, and outcome.

---

## 10. What Events Must NOT Do

Events must not:

- Exist outside a Case.
- Replace the Case object.
- Replace the related entity they reference.
- Be edited after creation.
- Execute tools.
- Approve actions by themselves.
- Store unrelated duplicated entity state.
- Become a dumping ground for raw logs.
- Become frontend-only notifications.
- Store secrets unless explicitly required and protected.
- Contain unbounded raw documents when a Document entity should be used.
- Contain reusable business knowledge when a Knowledge entry should be used.
- Contain relationship context when Memory should be used.
- Contain company learning when Experience should be used.
- Override Policy.

Events record what happened. They do not decide what should happen next by themselves.

---

## 11. Future Database Implications

The Event Engine implies a future `case_events` table or collection.

Potential table:

```text
case_events
  id
  company_id
  case_id
  actor_type
  actor_id
  event_type
  timestamp
  summary
  payload
  related_entity_type
  related_entity_id
  created_at
```

Recommended indexes:

- `company_id`
- `case_id`
- `(case_id, timestamp)`
- `event_type`
- `(related_entity_type, related_entity_id)`
- `(actor_type, actor_id)`

Design implications:

- Events should be append-only.
- Events should be queryable by Case.
- Events should be filterable by type, actor, related entity, and time.
- Case timeline should be built from `case_events`.
- Case current state may be stored as a projection for speed.
- Intelligence should reference triggering and supporting Events.
- ToolRequests should emit Events for proposal, approval, rejection, execution, and completion.
- Outcome should emit `outcome.recorded`.
- Experience extraction should emit `experience.created`.
- Policy triggers should emit `policy.triggered`.

Future projection tables may exist, but they must not replace the Event stream.

---

## 12. What Is Intentionally Not Implemented Yet

The following are architecture concepts, not current implementation commitments:

- Full `case_events` database table.
- Event append service.
- Event validation layer.
- Event-sourced Case projections.
- Timeline UI.
- Event replay.
- Event versioning.
- Event retention policy.
- Event redaction workflow.
- Event-driven automations.
- Event-based analytics.
- Event-based Experience extraction.
- Policy-triggered Event emission.
- Cross-Case Event correlation.
- Multi-company Event isolation.
- Tool execution Events beyond proposed architecture.

Current implementation may contain activity logs, approvals, messages, tasks, knowledge, memory, intelligence payloads, and ToolPlans. Those are foundations, not the final Event Engine.

