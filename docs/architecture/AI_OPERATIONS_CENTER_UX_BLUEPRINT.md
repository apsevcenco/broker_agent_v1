# AI Operations Center UX Blueprint

Proposed file path: `docs/architecture/AI_OPERATIONS_CENTER_UX_BLUEPRINT.md`

## 1. Product Purpose

The AI Operations Center is the human supervision workspace for all AI agents in the Luxury Mobility AI OS / Business AI Operating System.

It is not a chatbot screen and it is not a yacht-broker-only approval queue. It is the universal operator cockpit where a human reviews AI-understood cases, proposed outputs, proposed tool actions, risk, missing information, and approval requirements before anything external or operational happens.

The Operations Center should support all current and future agents, including Yacht Broker, Charter, Car Rental, Marketing, Lead Hunter, Translator, Support, Research, and future business AI profiles.

Its job is to answer the operator's core questions quickly:

- Who wrote or triggered this case?
- What do they want?
- Which agent handled it?
- How did AI understand the situation?
- What did AI decide?
- What output does AI propose?
- What actions does AI want to take?
- What requires human approval?

## 2. Main UX Principle

The operator must understand the case in 10 seconds.

This means the default view should show only the operationally important information. Long reasoning, knowledge references, memory references, raw JSON, and technical metadata should be available, but hidden by default.

The screen should feel like a structured decision workspace, not a debug console.

## 3. Default Approval Item Layout

### A. Case Header

The case header should be the first visible element and should summarize the case in one scan.

Fields:

- Agent
- Contact / source
- Conversation type
- Stage
- Lead / priority score
- Risk level
- Status

Recommended behavior:

- Use compact badges for agent, type, stage, score, risk, and status.
- Risk should be visually prominent.
- Agent name should be universal, not hardcoded to yacht brokerage.
- If a field is missing in legacy payloads, omit it gracefully.

### B. Original Message

Show the original client/source message in a clear readable panel.

Purpose:

- Let the operator verify what actually arrived.
- Avoid forcing the operator to infer from AI summaries only.
- Preserve trust by keeping the source text visible.

Content may come from:

- Inbox message body
- Support ticket
- Social/forum signal
- Uploaded document description
- Research request
- Translation request
- Manual admin-created case

### C. AI Decision

Show one clear decision.

Allowed decision labels:

- Proceed
- Proceed with caution
- Need more information
- Escalate
- Reject
- Archive

Include a short reason directly under the decision.

The decision panel should translate the IntelligenceResponse decision layer into operator language. It should not expose internal model language unless useful.

Example:

```text
Decision: Need more information
Reason: Buyer intent is plausible, but budget, timeline, and proof-of-funds path are missing.
```

### D. AI Draft / Output

This is the main visible work product.

For different agents, this block may represent different output types:

- Broker: draft reply
- Charter: draft itinerary or qualification reply
- Car Rental: draft rental response or quote clarification
- Marketing: proposed post, campaign copy, listing description
- Lead Hunter: proposed outreach message
- Translator: translation preview
- Support: proposed support reply
- Research: research summary or intelligence brief

The label should be generic enough to support all agents:

Recommended label: `AI Draft / Output`

The output should be readable, editable later, and visually separated from reasoning. It should never be mixed with raw JSON.

### E. Proposed Next Actions

Use `IntelligenceResponse.execution.toolPlan` when available.

Show proposed tool actions as a human-readable checklist.

Examples:

- Request NDA
- Create lead
- Schedule call
- Prepare document
- Search source
- Create task
- Draft email
- Create campaign brief
- Prepare translation note
- Escalate support issue

Each action should show:

- Action name
- Short description
- Tool/domain if useful
- Approval requirement
- Risk level if available

No tool action should execute from this UI yet. This is review-only until explicit execution controls are designed.

### F. Operator Actions

Primary operator actions should be visible near the draft/output and next actions.

Actions:

- Approve
- Reject
- Edit
- Request revision
- Assign
- Archive

Behavior:

- `Approve` approves the current draft/output or approval item.
- `Reject` rejects the proposed output/action.
- `Edit` allows human modification before approval.
- `Request revision` sends the case back for a new AI draft with operator instruction.
- `Assign` routes the case to a person/team/specialist.
- `Archive` closes low-value or irrelevant cases.

### G. Collapsed Intelligence Details

Collapsed by default.

Includes:

- Lead score explanation
- Risk explanation
- Missing qualification items
- Admin reasoning summary
- Broker/agent instinct
- Confidence

Purpose:

- Support deeper review without cluttering the default case view.
- Help operators audit why AI made a recommendation.
- Preserve transparency for high-risk decisions.

### H. Collapsed Knowledge & Memory

Collapsed by default.

Includes:

- Knowledge entries used
- Knowledge reliability
- Source/category
- Memory entries used
- Relationship trust level
- Relevant past interactions

Show this only when the operator wants detail. Do not make knowledge/memory compete with the main draft or decision.

### I. Collapsed Technical Details

Collapsed by default.

Includes:

- Raw payload
- Raw `IntelligenceResponse`
- Raw `execution.toolPlan`
- Provider information
- Mocked/non-mocked status
- Timestamps
- Internal IDs

Raw JSON should never be visible by default.

## 4. Universal Agent Examples

### Yacht Broker

Case:

- Buyer inquiry from email or WhatsApp.
- AI identifies buyer intent and missing qualification.
- Risk is medium/high because yacht identity or off-market details may be involved.

Visible screen:

- Header: Yacht Broker, buyer inquiry, qualification stage, lead score B/A, risk medium/high.
- Original Message: buyer asks for details on a yacht or acquisition opportunity.
- AI Decision: Need more information.
- AI Draft / Output: discreet reply asking for acquisition criteria, timeline, budget range, cruising region, and NDA/proof-of-funds path.
- Proposed Next Actions:
  - Create CRM lead
  - Request NDA
  - Schedule qualification call
  - Create follow-up task
- Operator Actions: approve, edit, request revision, assign to broker.

### Marketing

Case:

- AI detects a content opportunity for a yacht, car, charter route, campaign, or luxury mobility service.

Visible screen:

- Header: Marketing Agent, content opportunity, campaign stage, priority score, brand risk.
- Original Message: campaign request, asset note, social trend, or admin brief.
- AI Decision: Proceed with caution.
- AI Draft / Output: proposed post, listing caption, email campaign copy, or campaign angle.
- Proposed Next Actions:
  - Prepare post draft
  - Create campaign task
  - Request asset approval
  - Schedule publishing review
- Risk: spam risk, brand damage, unsupported claims, compliance risk.
- Operator Actions: approve copy, edit, request softer tone, assign to marketing.

### Lead Hunter

Case:

- AI detects a social/forum/public-source signal that may indicate a potential client or partner.

Visible screen:

- Header: Lead Hunter, public signal, prospecting stage, potential lead score, outreach risk.
- Original Message: social/forum signal or prospect context.
- AI Decision: Proceed with caution.
- AI Draft / Output: proposed outreach message or internal lead note.
- Proposed Next Actions:
  - Create lead
  - Prepare outreach
  - Create follow-up task
  - Route to human approval before contact
- Risk: platform rules, spam, privacy, reputational damage.
- Operator Actions: approve internal lead creation, reject outreach, request revision, assign.

Important rule:

Human approval is required before any contact. The UI must not suggest autonomous outreach execution.

### Translator

Case:

- User uploads or submits text for translation.

Visible screen:

- Header: Translator Agent, document/text translation, review stage, priority, risk.
- Original Message: source text or document summary.
- AI Decision: Proceed.
- AI Draft / Output: translation preview.
- Proposed Next Actions:
  - Save translation draft
  - Create review task
  - Extract knowledge if document contains reusable information
- Risk: legal wording, commercial terms, confidentiality, formatting loss.
- Operator Actions: approve translation, edit, request revision, assign to reviewer.

### Support

Case:

- Customer or operator reports an issue.

Visible screen:

- Header: Support Agent, support issue, triage stage, severity/priority, risk.
- Original Message: support request or bug report.
- AI Decision: Escalate or Proceed.
- AI Draft / Output: proposed support reply or internal troubleshooting note.
- Proposed Next Actions:
  - Create task
  - Assign engineer
  - Request logs
  - Escalate to admin
- Risk: exposing secrets, wrong technical instruction, customer impact.
- Operator Actions: approve reply, edit, assign, archive.

## 5. Information Hierarchy

Always visible:

- Case header
- Original message
- AI decision
- AI draft/output
- Proposed next actions
- Approval buttons

Hidden by default:

- Knowledge
- Memory
- Raw JSON
- Technical metadata
- Long reasoning

The default screen should prioritize operational clarity. Deeper intelligence should be one click away, not mixed into the main case view.

## 6. Naming Recommendation

Recommended name: `AI Operations Center`.

Alternative: `Operations Center`.

`AI Operations Center` is better for the near future because it clearly communicates that this screen supervises AI agents, AI decisions, AI drafts, and AI-proposed tool actions. It also separates the product from a simple approval queue.

`Operations Center` can be used later if the product expands beyond AI supervision into full business operations management.

Recommendation:

- Rename `Approvals` / `Control Center` to `AI Operations Center` in the primary navigation.
- Keep approval language inside cases where specific approval actions are required.

## 7. Implementation Principles For Later Coding

- No new backend logic for the first UI pass.
- Use the existing approval payload.
- Stay backward compatible.
- Legacy approval items must still render.
- Do not show raw JSON by default.
- Use `IntelligenceResponse` if available.
- Fallback to old draft payload if `intelligence` is missing.
- Build reusable components, not broker-specific components.
- Do not hardcode Yacht Broker language into universal UI components.
- Treat `payload.intelligence.execution.toolPlan` as the source for proposed next actions when present.
- If `toolPlan` is absent, show an empty or legacy-friendly next actions state.
- Preserve existing API contracts unless a later backend change is explicitly required.
- Keep approve/reject behavior compatible with current approval workflow.

Backward compatibility model:

```ts
if (payload.intelligence) {
  renderOperationsCaseFromIntelligence(payload.intelligence, payload.draft);
} else if (payload.draft) {
  renderLegacyDraftApproval(payload);
} else {
  renderPlainTextApproval(item.payload);
}
```

## 8. Component Proposal

Suggested reusable components:

- `OperationsCenterPage`
- `ApprovalCaseCard`
- `CaseHeader`
- `OriginalMessagePanel`
- `DecisionPanel`
- `DraftOutputPanel`
- `ToolPlanChecklist`
- `OperatorActions`
- `IntelligenceDetailsAccordion`
- `KnowledgeMemoryAccordion`
- `TechnicalDetailsAccordion`

Component responsibilities:

### `OperationsCenterPage`

Loads approval cases and lays out the universal operations workspace.

### `ApprovalCaseCard`

Container for one case. Handles legacy payload fallback and routes data into the correct panels.

### `CaseHeader`

Displays agent, contact/source, conversation type, stage, score, risk and status.

### `OriginalMessagePanel`

Displays the original message or source input in readable form.

### `DecisionPanel`

Displays one clear AI decision and short reason.

### `DraftOutputPanel`

Displays the main AI output: draft reply, translation, research summary, marketing copy, support reply, or outreach draft.

### `ToolPlanChecklist`

Displays `payload.intelligence.execution.toolPlan` as human-readable proposed actions.

### `OperatorActions`

Displays approve, reject, edit, request revision, assign and archive controls.

### `IntelligenceDetailsAccordion`

Displays reasoning, lead score explanation, risk explanation, missing items, admin summary, confidence and agent instinct.

### `KnowledgeMemoryAccordion`

Displays knowledge and memory references used by the agent.

### `TechnicalDetailsAccordion`

Displays raw payload, raw JSON, provider metadata and internal IDs. Collapsed by default.

## 9. What NOT To Do

- Do not create separate approval UIs per agent.
- Do not show everything at once.
- Do not expose raw JSON by default.
- Do not make yacht-specific UI.
- Do not add charts unless useful.
- Do not execute tool actions from UI yet.
- Do not make the approval page a chatbot.
- Do not bury the draft/output below technical reasoning.
- Do not require operators to read long AI reasoning before seeing the proposed action.
- Do not break legacy approval items.
