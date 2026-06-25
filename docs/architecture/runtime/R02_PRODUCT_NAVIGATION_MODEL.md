# Enterprise Business Operating System (EBOS)

## R02 — Product Navigation Model

Document type: Runtime Spec — Product Architecture
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
- `docs/architecture/12_OPERATIONS_CENTER.md`
- `docs/architecture/runtime/R01_CASE_RUNTIME.md`

---

## 1. Purpose

This document defines the product navigation model for the Enterprise Business Operating System (EBOS) — currently running as Luxury Mobility AI OS V1.

Navigation is not a cosmetic concern. The structure of a product's sidebar is a statement of what the product is and what it values. A navigation built around Inbox and Agents tells every operator: this is a messaging tool with bots. A navigation built around Goals, Cases, and Operations tells every operator: this is a business operating system.

This document establishes the correct navigation structure so the interface reflects the architecture — a company managing business objectives through cases, supported by AI.

---

## 2. The Core Navigation Principle

The center of the product is not Inbox.

The center of the product is not Agents.

The center of the product is the Company operating through its Goals and Cases.

```text
Company
↓
Goals  →  Cases  →  Events  →  Intelligence  →  Decisions  →  Execution
                               ↑
                         AI assists here
                         Humans govern here
```

Every section of the sidebar must reflect a layer of this flow.

If a feature does not fit somewhere in this flow, it belongs in Platform administration, not in the primary navigation.

---

## 3. The Problem With The Current Navigation

The current sidebar has twelve flat items in no logical order:

```
Dashboard
Agents
Inbox
Leads / CRM
Tasks
AI Operations Center
Memory
Knowledge Base
Assets
Activity Log
Settings
Knowledge Engine
```

This structure has three problems.

**Problem 1: Agents are prominent, Cases are invisible.**
Agents are second in the sidebar. Cases do not appear in the sidebar at all. This misrepresents the architecture. Agents are participants in Cases. Cases are the operational center. The product should show what it is.

**Problem 2: Inbox is the entry point to everything.**
Starting from Inbox implies the product is an email client. The real entry point is a Case. Inbox is one operational input channel that feeds Cases. It belongs inside Operations, not at the top of the product.

**Problem 3: There is no structure.**
Knowledge, Memory, Agents, Approvals, and Tasks are peers at the same level. They are not peers. Knowledge and Memory are intelligence infrastructure. Approvals and Inbox are operational workflows. Agents are configuration and monitoring. Without structure, the sidebar does not communicate what the product does.

---

## 4. Proposed Navigation Structure

The product navigation is organized into six sections.

Each section maps to a layer of the EBOS business flow.

```
Dashboard

Business
  Goals
  Cases
  CRM

Operations
  Inbox
  AI Operations Center
  Tasks

Intelligence
  AI Workforce
  Knowledge
  Memory
  Experience

Resources
  Assets
  Documents

Platform
  Analytics
  Settings
```

---

## 5. Section Definitions

### 5.1 Dashboard

**Route:** `/dashboard`

**Purpose:**
Company-level overview. One screen that answers: what is the current state of business execution?

**Contents:**
- Active Goal count and health summary.
- Active Case count by status.
- Pending approvals count and highest risk level.
- Recent AI activity (last 8 events from any case).
- Agent health indicators.
- Key commercial metrics (from Luxury Mobility Business Pack: active buyer count, listing count, pending deals).

**Current state:**
Already exists as `Dashboard.tsx`.

**Future state:**
As Goals and Cases become first-class UI objects, the Dashboard evolves to show a true company operating picture: Goals by health, Cases by stage, intelligence throughput, risk concentration, and commercial pipeline.

**What changes now:**
Nothing. Keep existing dashboard content. The visual and content evolution happens in future milestones.

---

### 5.2 Business

**Purpose:**
Business objectives, execution units, and commercial relationships. This is where the company's business work lives — not the operational day-to-day (that is Operations) and not the AI layer (that is Intelligence).

This section answers: what are we working on and why?

#### 5.2.1 Goals

**Route:** `/goals`

**Purpose:**
Business objectives that justify Cases. Operators define and monitor Goals here. Each Goal shows its linked Cases, health, KPIs, and progress.

**Current state:**
Not yet implemented. No page, no route, no data model in the running system.

**Implementation priority:**
Future milestone. Not in V1.

**Sidebar behavior:**
Show as a placeholder or grayed-out item with a "Coming soon" indicator. Do not link to a 404.

**Future page content:**
- Goal list with health badges (Excellent, Healthy, At Risk, Critical, Completed).
- Goal creation and editing.
- Goal → Case linkage panel.
- KPI progress for each Goal.
- Recent activity on each Goal's Cases.

---

#### 5.2.2 Cases

**Route:** `/cases`

**Purpose:**
The operational unit of business execution. Every buyer inquiry, seller mandate, charter request, car rental booking, marketing campaign, and support issue is a Case.

This page shows all Cases across the company, with filtering by status, type, profile, and assigned agent.

**Current state:**
The data exists. Case Runtime V1 (`R01_CASE_RUNTIME.md`) created the `cases`, `case_events`, and `case_participants` tables and populates them during the suggest-reply flow. However, no Cases UI page exists yet.

**Implementation priority:**
First priority in the next UI milestone after navigation restructuring.

**Sidebar behavior:**
Show as a placeholder for now. The route `/cases` returns a simple "Cases — coming soon" page until implemented.

**Future page content:**
- Case list with filters: status (open, qualified, in progress, waiting, completed, archived), type (buyer_inquiry, seller_inquiry, charter_request, etc.), profile (yacht-broker, charter, etc.), assigned agent.
- Case detail view: timeline of events, participants, intelligence, decisions, tasks, documents, and tool plans.
- Case creation (manual).
- Case closing and outcome recording.

**The relationship between Cases and the current Approvals page:**
The AI Operations Center (`/approvals`) shows pending approval items. In the future, approval items will be navigable to their parent Case. Cases will become the authoritative view; the Approvals page becomes a filtered operational queue within Operations, not a standalone page.

---

#### 5.2.3 CRM

**Route:** `/leads`

**Purpose:**
Commercial contacts, lead qualification, and relationship pipeline. CRM tracks who the company knows, at what stage they are commercially, and what follow-up is required.

**Current state:**
Already exists as `Leads / CRM` pointing to `/leads`.

**What changes now:**
- Rename sidebar label from "Leads / CRM" to "CRM".
- Route `/leads` stays unchanged — backward compatible.
- Page content stays unchanged.

**Future state:**
CRM Contacts become linked to the Identity model. Each CRM contact shows their Case history. Lead score becomes derived from Case outcomes and AI commercial assessment rather than manually set.

---

### 5.3 Operations

**Purpose:**
Daily operational work. Incoming signals, AI-generated outputs pending review, tasks requiring action. This is the human operator's work queue — the layer where humans govern AI proposals and manage active work.

This section answers: what needs human attention right now?

#### 5.3.1 Inbox

**Route:** `/inbox`

**Purpose:**
Incoming messages across all channels (email, WhatsApp, LinkedIn, Instagram, PDYE, website). Operators use Inbox to trigger AI analysis and generate reply drafts. Each message belongs to a Case (or creates one via Case Runtime V1).

**Current state:**
Already exists as `Inbox.tsx`.

**What changes now:**
- Sidebar position moves from second slot (currently above Leads, Tasks, Approvals) to inside Operations group.
- Label stays "Inbox".
- Route stays `/inbox`.
- Functionality stays unchanged.

**Future state:**
Inbox messages will show their parent Case directly. The "Suggest Reply" button remains; the resulting approval item links to the Case timeline.

---

#### 5.3.2 AI Operations Center

**Route:** `/approvals`

**Purpose:**
The human operator's review queue for all AI-generated outputs pending approval. AI proposes. Humans govern. This is where that governance happens.

The AI Operations Center is not only for email reply drafts. It supports all agent output types: brokerage drafts, charter quotes, car rental responses, marketing copy, research summaries, translation previews, support replies, and proposed tool actions.

Design principles are defined in `docs/architecture/12_OPERATIONS_CENTER.md`.

**Current state:**
Already exists as "AI Operations Center" at `/approvals` in `ListPages.tsx`.

**What changes now:**
- Sidebar label stays "AI Operations Center".
- Route stays `/approvals`.
- Position moves inside Operations group.

**Future state:**
Each approval item in the Operations Center will link to its parent Case. A "View Case" button will navigate to `/cases/{id}` showing the full timeline.

---

#### 5.3.3 Tasks

**Route:** `/tasks`

**Purpose:**
Work items generated by operators, AI agents, business processes, and ToolPlans. Tasks track what must be done — who is responsible, by when, and in relation to which Case or contact.

**Current state:**
Already exists as `Tasks` at `/tasks` in `ListPages.tsx`.

**What changes now:**
- Sidebar position moves inside Operations group.
- Label stays "Tasks".
- Route stays `/tasks`.

**Future state:**
Tasks will carry a `case_id` and will be navigable to their parent Case.

---

#### 5.3.4 Calendar / Scheduling

**Route:** `/calendar`

**Purpose:**
Scheduling, follow-up dates, and time-based task management. Supports scheduling calls proposed by AI in ToolPlans (e.g., `calendar.proposeMeeting` ToolRequest).

**Current state:**
Not implemented. No page, no route.

**Implementation priority:**
Future placeholder. Do not add yet.

---

### 5.4 Intelligence

**Purpose:**
The company's AI workforce, knowledge, memory, and accumulated experience. This is the layer that makes AI effective. Without structured knowledge, calibrated memory, and a curated AI workforce, AI outputs are generic and unreliable.

This section answers: what does the company know, who are the AI agents working for us, and what have we learned?

This section is not operational. It does not contain work queues or approvals. It contains the intellectual and operational capital of the company.

#### 5.4.1 AI Workforce

**Route:** `/agents`

**Purpose:**
Configuration, monitoring, health, capabilities, permissions, and cost visibility for all AI agents. Operators manage which agents are active, what knowledge they draw from, what tools they are allowed to propose, and what their operating rules are.

AI Workforce is a management and configuration surface. It is not a work queue.

**Current state:**
Already exists as "Agents" at `/agents`. Includes agent list and agent detail pages (`/agents/yacht-broker`, `/agents/charter`, etc.).

**What changes now:**
- Rename sidebar label from "Agents" to "AI Workforce".
- Route `/agents` stays unchanged — backward compatible.
- All existing agent detail routes (`/agents/yacht-broker`, etc.) stay unchanged.
- Page content stays unchanged.

**Why "AI Workforce" instead of "Agents":**
"Agents" frames AI as the center of the product. "AI Workforce" frames AI as a resource managed by the company — consistent with EBOS Principle 12 (AI Participates, It Does Not Own).

---

#### 5.4.2 Knowledge

**Route:** `/knowledge`

**Sub-route:** `/knowledge-engine`

**Purpose:**
Reusable reference information used by AI agents during reasoning. Knowledge includes market information, compliance rules, product/service details, operating procedures, and verified facts the company wants AI to use consistently.

**Current state:**
Knowledge Base exists at `/knowledge`. Knowledge Engine sub-tool exists at `/knowledge-engine`. Both are in `ListPages.tsx` and `KnowledgeEngine.tsx`.

**What changes now:**
- Rename sidebar label from "Knowledge Base" to "Knowledge".
- Route `/knowledge` stays unchanged.
- Route `/knowledge-engine` stays unchanged and accessible from within the Knowledge page or via direct URL.
- Knowledge Engine link may be removed from the top-level sidebar and surfaced as a button within the Knowledge page instead.

---

#### 5.4.3 Memory

**Route:** `/memory`

**Purpose:**
Relationship context, trust levels, communication preferences, deal history, and warnings about people and organizations. Memory is personal and contextual — it is not reusable reference information (that is Knowledge) and it is not company-level learning (that is Experience).

**Current state:**
Already exists as "Memory" at `/memory`.

**What changes now:**
- Sidebar position moves inside Intelligence group.
- Label stays "Memory".
- Route stays `/memory`.

---

#### 5.4.4 Experience

**Route:** `/experience`

**Purpose:**
Company learning derived from completed and closed Cases. What worked in negotiations. Why deals were lost. Which outreach patterns generated qualified buyers. How charter booking errors happened. Experience is private operational intelligence that improves future decision quality.

Experience is distinct from Knowledge (reusable reference) and Memory (relationship context). It is lessons from real business execution.

**Current state:**
Not implemented. No page, no route, no database table.

**Implementation priority:**
Future milestone. Experience Engine extraction pipeline is outside V1 scope per `R01_CASE_RUNTIME.md` Section 2.

**Sidebar behavior:**
Show as a placeholder. Do not link to a 404. Future implementation follows after Cases UI is complete and Outcomes model is in place.

---

### 5.5 Resources

**Purpose:**
Business resources used inside Cases. Assets are yachts, vehicles, properties, and services the company manages or brokers. Documents are contracts, valuations, NDAs, and other business artifacts.

Resources are not intelligence. They do not produce AI output. They are inputs to Cases.

#### 5.5.1 Assets

**Route:** `/assets`

**Purpose:**
Managed assets: yachts, luxury cars, aircraft, villas, services. Asset records track status, owner, location, and related Cases.

**Current state:**
Already exists as "Assets" at `/assets`.

**What changes now:**
- Sidebar position moves inside Resources group.
- Label stays "Assets".
- Route stays `/assets`.

---

#### 5.5.2 Documents

**Route:** `/documents`

**Purpose:**
NDAs, SPAs, MOAs, valuations, surveys, contracts, passports, and other business artifacts linked to Cases and participants.

**Current state:**
Not implemented. No page, no route, no database table.

**Implementation priority:**
Future milestone.

**Sidebar behavior:**
Show as a placeholder.

---

### 5.6 Platform

**Purpose:**
Administration and SaaS configuration. Analytics, settings, policies, and team management. These are not business operations — they are configuration and oversight of the operating system itself.

Operators should rarely visit Platform during normal work. Platform is for setup, review, and administration.

#### 5.6.1 Analytics

**Route:** `/activity`

**Purpose:**
Activity log, AI throughput metrics, approval rates, agent utilization, and response time analysis. In V1 this is the existing Activity Log. In future versions it becomes a full analytics dashboard with business performance metrics.

**Current state:**
Already exists as "Activity Log" at `/activity`.

**What changes now:**
- Rename sidebar label from "Activity Log" to "Analytics".
- Route `/activity` stays unchanged.
- Page content stays unchanged in V1.

**Note:** The name change from "Activity Log" to "Analytics" signals intent — this surface will grow from a raw activity list into a proper business analytics layer. The route does not change, so existing bookmarks are preserved.

---

#### 5.6.2 Settings

**Route:** `/settings`

**Sub-route:** `/settings/ai-providers`

**Purpose:**
System configuration: AI provider selection, API keys, defaults, operational rules, agent behavior settings, and future policy configuration.

**Current state:**
Already exists as "Settings" at `/settings`. AI Providers sub-page at `/settings/ai-providers`.

**What changes now:**
- Sidebar position moves inside Platform group.
- Label stays "Settings".
- Routes stay unchanged.

---

#### 5.6.3 Policies (Future)

**Route:** `/policies`

**Purpose:**
Company policies governing AI behavior, approval requirements, tool permissions, escalation rules, and compliance constraints. Policies are first-class architectural objects (EBOS Principle 9).

**Current state:**
Policies are currently embedded in PBRE prompt rules and `ToolExecutionPolicy` defaults. No standalone Policy page exists.

**Implementation priority:**
Future milestone. Do not add yet.

---

#### 5.6.4 Business Packs (Future)

**Route:** `/business-packs`

**Purpose:**
Configure, install, and manage Business Packs — domain modules that extend EBOS for specific business areas (Luxury Mobility, Charter, Car Rental, etc.).

**Current state:**
Not implemented.

**Implementation priority:**
Future milestone. Not in V1.

---

#### 5.6.5 Users / Teams (Future)

**Route:** `/users`

**Purpose:**
Human operator accounts, roles, permissions, and team assignments.

**Current state:**
Not implemented. Single-user mode in V1.

**Implementation priority:**
Future milestone tied to multi-tenant architecture.

---

## 6. Full Proposed Sidebar Tree

```
LM  Luxury Mobility AI OS

  Dashboard               /dashboard        ✓ exists

  ── Business ─────────────────────────────────────────
  Goals                   /goals            PLACEHOLDER
  Cases                   /cases            PLACEHOLDER
  CRM                     /leads            ✓ rename from "Leads / CRM"

  ── Operations ───────────────────────────────────────
  Inbox                   /inbox            ✓ no change
  AI Operations Center    /approvals        ✓ no change
  Tasks                   /tasks            ✓ no change

  ── Intelligence ─────────────────────────────────────
  AI Workforce            /agents           ✓ rename from "Agents"
  Knowledge               /knowledge        ✓ rename from "Knowledge Base"
  Memory                  /memory           ✓ no change
  Experience              /experience       PLACEHOLDER

  ── Resources ────────────────────────────────────────
  Assets                  /assets           ✓ no change
  Documents               /documents        PLACEHOLDER

  ── Platform ─────────────────────────────────────────
  Analytics               /activity         ✓ rename from "Activity Log"
  Settings                /settings         ✓ no change
```

---

## 7. Route Mapping: Current vs. Proposed

| Current Label      | Route                 | New Label           | Section         | Change Type             |
|--------------------|-----------------------|---------------------|-----------------|-------------------------|
| Dashboard          | `/dashboard`          | Dashboard           | Top-level       | No change               |
| Agents             | `/agents`             | AI Workforce        | Intelligence    | Rename + regroup        |
| Inbox              | `/inbox`              | Inbox               | Operations      | Regroup only            |
| Leads / CRM        | `/leads`              | CRM                 | Business        | Rename + regroup        |
| Tasks              | `/tasks`              | Tasks               | Operations      | Regroup only            |
| AI Operations Center | `/approvals`        | AI Operations Center | Operations     | Regroup only            |
| Memory             | `/memory`             | Memory              | Intelligence    | Regroup only            |
| Knowledge Base     | `/knowledge`          | Knowledge           | Intelligence    | Rename + regroup        |
| Assets             | `/assets`             | Assets              | Resources       | Regroup only            |
| Activity Log       | `/activity`           | Analytics           | Platform        | Rename + regroup        |
| Settings           | `/settings`           | Settings            | Platform        | Regroup only            |
| Knowledge Engine   | `/knowledge-engine`   | (sub-page)          | Intelligence/Knowledge | Remove from sidebar top-level |
| —                  | `/goals`              | Goals               | Business        | NEW PLACEHOLDER         |
| —                  | `/cases`              | Cases               | Business        | NEW PLACEHOLDER         |
| —                  | `/experience`         | Experience          | Intelligence    | NEW PLACEHOLDER         |
| —                  | `/documents`          | Documents           | Resources       | NEW PLACEHOLDER         |

**Every existing route is preserved. No existing route is broken or removed.**

---

## 8. What Is Visible In The Sidebar

The sidebar shows everything in the tree above.

Placeholders (Goals, Cases, Experience, Documents) are visible with a visual indicator (grayed label, "soon" badge, or disabled state). They communicate the product direction without creating broken links.

Section headers (Business, Operations, Intelligence, Resources, Platform) are non-clickable labels that group items visually. They are not navigation targets themselves.

### What Does NOT Appear In The Sidebar

- `/knowledge-engine` — accessible from within the Knowledge page, not a top-level sidebar item.
- `/settings/ai-providers` — accessible from within Settings, not a standalone sidebar item.
- Individual agent detail pages (`/agents/yacht-broker`, etc.) — accessible from the AI Workforce page.
- Individual approval detail pages — accessible from AI Operations Center.
- Individual lead/case/asset detail pages — accessible from their respective list pages.

---

## 9. Why Inbox Is No Longer The Center

In the current navigation, Inbox is item three — above Leads, Tasks, and the AI Operations Center. This is historically an artifact of how the system was built: messages came in, AI was triggered from the inbox screen, and approvals came out.

This ordering implied a messaging product.

The architectural reality is different. An Inbox message is one event that creates or feeds a Case. It is an input, not an organizing principle.

The correct organizing principle is the Case.

A message arrives → it joins a Case → the Case accumulates intelligence, decisions, tasks, and outcomes. The message matters because of the Case it belongs to, not in isolation.

Moving Inbox inside Operations signals this correctly. Inbox is the operational channel through which external signals enter Cases. It is not the center of the product.

This does not reduce the importance of Inbox in the current workflow. It is still the most-used page in V1. But its position in the navigation should reflect its role: one operational input channel among several.

---

## 10. Why Agents Are Not The Center

In the current navigation, Agents is item two — the highest non-dashboard item. This implies that Agents are the primary concern of the product.

Agents are not the primary concern of the product. Companies are.

EBOS Principle 12 states: AI participates, it does not own. Agents participate in Cases. They produce intelligence, drafts, and tool plans. They are configured by companies. They serve business goals. They are never the organizing principle of business execution.

Placing Agents second in the sidebar created two false impressions:

1. The product is an "AI agents" product, not a business operating system.
2. Cases, Goals, and business execution are secondary.

Moving Agents into Intelligence under "AI Workforce" corrects both impressions. AI Workforce is where operators configure and monitor agents. Cases are where agents do their work. The operator sees agents as workforce — something managed and directed — not as the product itself.

The name change from "Agents" to "AI Workforce" reinforces this. A company has a workforce. The AI workforce is one part of that workforce, managed alongside humans, assets, and knowledge.

---

## 11. How AI Workforce Differs From AI Operations Center

These two features are frequently confused because both involve AI. They answer different questions and serve different operational moments.

**AI Workforce** (`/agents`, Intelligence section):
- Configuration of AI agents: name, slug, category, description, risk level, tone, operating rules, allowed and blocked actions.
- Monitoring: which agents are active, healthy, or disabled.
- Capabilities: what each agent can reason about, what tools it is allowed to propose.
- Cost and usage visibility (future).
- This is where an operator asks: *who are our AI agents and how are they configured?*

**AI Operations Center** (`/approvals`, Operations section):
- The human review queue for AI-generated outputs: reply drafts, tool plans, commercial recommendations.
- Where operators approve, reject, edit, or request revision of AI proposals.
- Where governance happens before anything external occurs.
- This is where an operator asks: *what has AI proposed that requires my review right now?*

The analogy: AI Workforce is HR and management. AI Operations Center is the daily decision queue.

An operator configures an agent once in AI Workforce. They review that agent's outputs every day in the AI Operations Center.

---

## 12. How Cases Show Assigned Agents

When a Case is created (as implemented in Case Runtime V1), it is associated with a `case_profile` — currently `"yacht-broker"`. The case profile determines which CIE reasoning profile and therefore which agent handles intelligence generation.

The future Cases page (`/cases/{id}`) should display this relationship under an "AI Team" section within the Case detail view:

```
Case: Enquiry from James Harrington
AI Team:
  └── Yacht Broker Agent   (intelligence, drafts, tool plans)
      status: active
      last action: intelligence.generated (2026-06-25T14:32:00Z)
      [View in AI Workforce →]
```

This is not a configuration surface — it is a visibility surface. Operators see which AI agents are participating in this Case, what they last did, and can navigate to the AI Workforce for configuration.

This relationship makes the "AI participates in Cases" principle visible in the UI without elevating Agents above Cases in the information hierarchy.

---

## 13. How This Navigation Supports Future Agents

The current system has one active reasoning profile: Yacht Broker. Future Business Packs will add:

| Agent                | Business Pack          | Case Types Generated                        |
|----------------------|------------------------|---------------------------------------------|
| Charter Agent        | Charter Pack           | charter_request, charter_itinerary          |
| Car Rental Agent     | Luxury Mobility Pack   | rental_request, rental_qualification        |
| Marketing Agent      | Marketing Pack         | marketing_campaign, content_production      |
| Lead Hunter Agent    | Client Acquisition Pack | lead_acquisition, outreach_campaign        |
| Translator Agent     | Translation Pack       | translation_request, legal_review           |
| Support Agent        | Support Pack           | support_case, complaint_resolution          |
| Research Agent       | Research Pack          | research_request, market_analysis           |

In the proposed navigation model:

1. **All agents appear in AI Workforce.** The list page is already agent-neutral. Adding new agents only adds rows to the existing page.

2. **All agent outputs appear in AI Operations Center.** The approval queue is already structured around `IntelligenceResponse` which is agent-neutral. Charter drafts, car rental responses, and marketing copy all appear in the same queue with the same approval workflow.

3. **All agent activity creates Cases.** As each agent's suggest-reply equivalent is implemented, it will call `CaseRuntimeService.resolveCase()` with the appropriate `caseProfile`. The Cases page will show all Case types from all agents in one unified list.

4. **All Case types appear in Business → Cases.** Filtering by case type or agent allows operators to view "all charter cases" or "all marketing campaigns" without a separate navigation section per business domain.

This is the architectural advantage of the proposed navigation: zero navigation changes are required when a new agent or Business Pack is added. The navigation is stable. The data is additive.

---

## 14. Migration Strategy

### Phase 1: Sidebar Restructuring (No Code Changes to Pages)

**Target: implement in one pull request.**

Changes required:
1. Update `src/frontend/components/Layout.tsx` to add section group headers and restructure the nav array.
2. Add placeholder items for Goals, Cases, Experience, Documents.
3. Rename three labels: "Agents" → "AI Workforce", "Leads / CRM" → "CRM", "Knowledge Base" → "Knowledge", "Activity Log" → "Analytics".
4. Move Knowledge Engine link from top-level sidebar into the Knowledge page as a button or tab.

No routes change. No pages change. No backend changes.

Constraint: Keep all routes backward compatible. `/leads`, `/agents`, `/knowledge`, `/activity` all continue to work. Existing bookmarks and links are not broken.

Constraint: Do not change any page content in this phase. This phase is navigation-only.

---

### Phase 2: Placeholder Pages

**Target: implement in the same pull request as Phase 1, or immediately after.**

Add simple placeholder pages for:
- `/goals` — "Goals — coming soon" with a description matching the architecture.
- `/cases` — "Cases — coming soon" with a description matching the architecture, and a note that Case Runtime V1 is already recording data in the background.
- `/experience` — "Experience — coming soon" with a description.
- `/documents` — "Documents — coming soon" with a description.

These pages should use the same layout as the rest of the product. They should be lightweight. They signal direction without faking functionality.

---

### Phase 3: Cases UI (First Real New Page)

**Target: next major UI milestone.**

Build `/cases` as the first new Business section page.

Minimum viable Cases page:
- List of Cases from the database (`cases` table populated by Case Runtime V1).
- Columns: title, case type, case profile, status, primary contact, created at.
- Filters: status, case type, case profile.
- Click to view Case detail (timeline of CaseEvents, participants, linked approval items).

This page requires no new backend work beyond what Case Runtime V1 already delivered.

---

### Phase 4: Dashboard Evolution

After Cases page exists, evolve the Dashboard to show Goal and Case data:
- Active Goals (count and health).
- Open Cases (count and breakdown by type).
- This replaces current generic "metrics" cards with real business status.

---

### Do Not Do Yet

The following must not be added during this migration:

- Full Goal creation and editing UI.
- Case creation workflow.
- Documents management page.
- Experience generation pipeline.
- Policies management page.
- Users / Teams management.
- Business Packs marketplace.
- Calendar / Scheduling.
- Multi-tenant navigation changes.
- Analytics dashboards.

These belong to future architecture milestones and must be defined in separate Runtime Specs before implementation begins.

---

## 15. Success Criteria

The navigation model is successfully implemented when:

1. The sidebar has six grouped sections matching the tree in Section 6.
2. All existing routes continue to work without modification.
3. Three label renames are applied: Agents → AI Workforce, Leads / CRM → CRM, Knowledge Base → Knowledge, Activity Log → Analytics.
4. Knowledge Engine is accessible from within the Knowledge page, not from the top-level sidebar.
5. Placeholder items are visible for Goals, Cases, Experience, and Documents.
6. No existing page functionality is broken.
7. Any operator looking at the sidebar can answer "what does this product do?" from the navigation structure alone — without reading documentation.

---

## 16. Architecture Alignment

This navigation model directly implements the following EBOS principles:

| Principle | How This Navigation Implements It |
|---|---|
| Principle 2 — Company First | Dashboard and Business section reflect company-level view |
| Principle 4 — Goals Create Cases | Goals and Cases are adjacent in Business section, in the correct order |
| Principle 5 — Case Is The Operational Center | Cases appear in Business as first-class objects; all operational work references Cases |
| Principle 7 — AI Reasons Before Acting | AI Workforce (reasoning configuration) and AI Operations Center (approval governance) are separated |
| Principle 8 — Approval Before Execution | AI Operations Center remains in Operations — the human review layer |
| Principle 11 — Knowledge, Memory and Experience Are Different | All three have separate pages under Intelligence; none are merged |
| Principle 12 — AI Participates, It Does Not Own | AI Workforce is inside Intelligence, not at the top of the product |
| Principle 14 — Business Packs Extend, Core Does Not Change | Navigation requires zero changes when new agents or Business Packs are added |
| Principle 16 — Incremental Evolution | All routes preserved; changes are additive labels and groupings |
| Principle 18 — Enterprise Before Industry | Section names (Business, Operations, Intelligence, Resources, Platform) are universal across all industries |

---

## 17. Risks And Constraints

**Risk: Operator confusion during rename.**
Operators accustomed to "Agents" may not immediately recognize "AI Workforce". Mitigation: keep the same route, same icons where possible, and same page content. Only the sidebar label changes.

**Risk: Placeholder items feel incomplete.**
Goals, Cases, Experience, Documents appear but do nothing. Mitigation: use a clear visual treatment (grayed with "coming soon" badge) and a brief description on the placeholder page explaining what the feature will do and why it matters.

**Risk: Cases placeholder creates expectation gap.**
Case Runtime V1 has been running in the background and recording Case data. When operators see the Cases placeholder, they may expect to see data immediately. Mitigation: the placeholder page may say "Your cases are being recorded. Full case management is coming soon."

**Risk: Section headers not supported by current Layout component.**
The current `Layout.tsx` uses a flat `nav` array. Section headers require grouped rendering. This is a straightforward UI change to the layout component and does not affect routing or data.

**Constraint: Do not break the approval flow.**
The existing Inbox → suggest-reply → AI Operations Center workflow must continue to work exactly as today. No navigation change should affect this flow.

**Constraint: Do not add new sidebar items without a Runtime Spec.**
Every new navigation item beyond Phase 1 and 2 above requires a corresponding Runtime Spec document before implementation begins.

---

## 18. Terminology Reference

| Old Label           | New Label              | Reason For Change                                |
|---------------------|------------------------|--------------------------------------------------|
| Agents              | AI Workforce           | Frames AI as workforce managed by the company, not the product center |
| Leads / CRM         | CRM                    | Shorter, universal, not tied to the "lead" concept only |
| Knowledge Base      | Knowledge              | Shorter, matches architecture terminology        |
| Activity Log        | Analytics              | Signals future evolution from raw log to business analytics |
| (no change)         | Business (group)       | New section header grouping Goals, Cases, CRM    |
| (no change)         | Operations (group)     | New section header grouping Inbox, AI Ops, Tasks |
| (no change)         | Intelligence (group)   | New section header grouping AI, Knowledge, Memory, Experience |
| (no change)         | Resources (group)      | New section header grouping Assets, Documents    |
| (no change)         | Platform (group)       | New section header grouping Analytics, Settings  |
