# EBOS UX Master Plan V1

**Status:** Draft — Pending Operator Approval  
**Version:** 1.0.0  
**Date:** 2026-06-29  
**Scope:** Full interface redesign direction for Luxury Mobility AI OS (EBOS)

---

## 1. Core UX Principle

EBOS is not a chatbot, a CRM, a website, or an automation tool.

**EBOS is a Business Operating System.**

The interface must start from business outcomes, not from technical modules.

Every screen must answer one question for the operator:

> *"What is happening in my business right now, and what do I need to decide?"*

The current interface is confusing because it reflects **backend architecture** — routes, agents, modules — instead of the **operator's real business workflow**. This must change before any further UI development proceeds.

---

## 2. Primary User Mindset

The operator does not think in modules. The operator thinks:

- Find buyers for the yacht fleet
- Find charter clients for the season
- Find luxury car rental clients
- Review what the AI has proposed
- Approve or reject actions before they execute
- Open active cases and see their status
- Understand what needs attention today

The interface must match this mental model exactly. Everything else is secondary.

---

## 3. New Top-Level Navigation

The sidebar navigation must be restructured from a flat technical list into a business-oriented hierarchy.

### Proposed Structure

```
Mission Control                    ← Default landing page

Business
  Sales                            ← Yacht sale opportunities and cases
  Charter                          ← Yacht charter pipeline
  Car Rental                       ← Luxury car rental pipeline
  Cases                            ← All active business cases
  CRM                              ← Contacts and relationship memory

Operations
  Lead Hunter Results              ← All discovered lead candidates
  Inbox                            ← Incoming messages
  Approvals                        ← AI Operations Center (pending decisions)
  Tasks                            ← Scheduled and pending tasks
  Business Flow Canvas             ← Visual business lifecycle map

AI Workforce
  Lead Hunter                      ← Client acquisition agent
  Yacht Broker                     ← Yacht sale specialist
  Charter Agent                    ← Charter specialist
  Car Rental Agent                 ← Car rental specialist
  Marketing Agent                  ← Marketing (Phase 3)
  Support Agent                    ← Client support

Platform
  Knowledge                        ← Knowledge base
  Memory                           ← Agent relationship memory
  Connections                      ← Integration hub (API keys, services)
  AI Providers                     ← LLM and model settings
  Analytics                        ← Activity and performance log
  Settings                         ← System settings
```

### Navigation Design Rules

- Maximum **three clicks** from any screen to any important object
- Active items show live count badges (pending approvals, new leads, open cases)
- No nested sub-menus beyond one level
- "What needs my attention now" must always be visible within one click

---

## 4. Mission Control

**Route:** `/` and `/dashboard`  
**Role:** Default landing page — replaces the current Dashboard

Mission Control is the operator's starting point every morning. It replaces the current generic dashboard with a purpose-built business command center.

### Required Sections

#### 4.1 Urgent Attention Banner
A top-of-page strip that shows only items requiring immediate operator action:
- Approvals waiting more than 2 hours
- High-urgency demand signals (Demand Discovery results with `commercialPriority: immediate`)
- Cases with no activity in more than 24 hours
- Failed agent actions requiring review

#### 4.2 At a Glance (Stats Row)
Real counts only. No fake or placeholder numbers.
- Open Cases
- Pending Approvals
- New Lead Candidates (since last visit)
- Active Searches (Lead Hunter runs in progress)
- Messages in Inbox (unread)

#### 4.3 Quick Actions
Prominent action buttons. Each launches the most likely next step.

| Button | Action |
|---|---|
| Find Buyers | Opens Lead Hunter runner pre-set to `company_discovery` / `yacht_sale` |
| Find Charter Clients | Opens Lead Hunter runner pre-set to `demand_discovery` / `yacht_charter` |
| Find Car Rental Clients | Opens Lead Hunter runner pre-set to `demand_discovery` / `car_rental` |
| Review Approvals | Opens Approvals page filtered to `pending` |
| Open Active Cases | Opens Cases page filtered to `open` |

#### 4.4 Recent AI Decisions
A live feed of the last 10–15 agent actions:
- Lead candidate created → approval pending
- Approval approved / rejected by operator
- Case opened / updated
- Tool plan proposed
- Intelligence generated

Each entry shows: agent name, event type, entity name, timestamp, and a direct link to the related object.

#### 4.5 Active Lead Searches
If any Lead Hunter campaigns ran recently, show:
- Mode (Company Discovery / Demand Discovery / etc.)
- Business line
- Results count
- Link to Lead Hunter Results filtered to that campaign

#### 4.6 Pending Approvals (Mini List)
The top 5 pending approvals, inline, with Approve / Reject buttons accessible without navigating away.

---

## 5. Business Flow Canvas

**Route:** `/operations/canvas`  
**Role:** Visual business lifecycle map — not a workflow editor

### Purpose

The Business Flow Canvas makes the entire lead-to-deal pipeline visible in one diagram. It answers:

> *"Where is every lead and case right now in the full business process?"*

### V1 Flow Definition

```
Lead Sources
    │
    ▼
[ Lead Hunter ]
  Public web search
  Multilingual queries
  Demand / Company / Partner / Market modes
    │
    ▼
[ Lead Candidates ]
  Scored A / B / C / D
  Stored as Approvals (pending)
    │
    ▼
[ Inbox ]
  Inbound messages classified
  Buyer / Seller / Charter / Broker / General
    │
    ▼
[ Business Case ]
  Created per qualified opportunity
  Status: open / active / closed / won / lost
    │
    ▼
[ Specialist Agent ]
  Yacht Broker / Charter / Car Rental
  Runs intelligence and reasoning
    │
    ▼
[ Tool Plan ]
  Proposed actions
  All require operator approval
    │
    ▼
[ Approval ]
  Operator approves or rejects
  Nothing executes automatically
    │
    ▼
[ Execution ]
  Only after approval
  CRM update / Draft sent / Task created
    │
    ▼
[ Client ]
  Contact record created in CRM
  Relationship memory updated
    │
    ▼
[ Deal Closed ]
  Case status → won
  Revenue event logged
```

### V1 Constraints

- **Static / non-editable.** This is a business lifecycle map, not an n8n automation builder.
- Live counts shown on each node where data is available (e.g., "12 candidates", "3 pending approvals", "5 open cases").
- Clicking a node navigates to the corresponding page.
- No drag-and-drop in V1. No workflow configuration in V1.
- Node count badges use real data only. Zero is shown as zero, not hidden.

### Design Reference
Think Stripe's payment lifecycle diagram — clear, linear, with real status counts at each stage.

---

## 6. Lead Hunter Results Workspace

**Route:** `/lead-hunter/results`  
**Role:** Single workspace for all discovered lead candidates across all search modes

### Tab Structure

| Tab | Filter Logic |
|---|---|
| All | All candidates |
| Yacht Sale | `businessLine: yacht_sale` |
| Yacht Charter | `businessLine: yacht_charter` |
| Car Rental | `businessLine: car_rental` |
| Active Demand | `searchMode: demand_discovery` AND `commercialPriority: immediate OR today` |
| Partners | `searchMode: partner_discovery` |
| Rejected | `approvalStatus: rejected` |

### Column Set (Full)

| Column | Description |
|---|---|
| Business Line | Yacht Sale / Charter / Car Rental / Mixed |
| Source | Search query or source URL domain |
| Company / Person | Extracted from search result title |
| Lead Category | Airport Transfer / Yacht Charter / Family Office / etc. |
| Opportunity Score | A / B / C / D |
| Urgency | Immediate / Today / This Week / Future (Demand mode only) |
| Recommendation | Contact Immediately / Contact Today / Monitor / Ignore |
| Approval Status | Pending / Approved / Rejected |
| Business Case | Linked case ID if exists |
| Actions | View · Approval · Case |

### Drawer (Detail Panel)
Opens on View. Shows all available intelligence for that candidate:
- Source URL, search query, web snippet
- AI summary, lead score reasoning, risk reasoning
- Demand fields (if demand_discovery): request type, urgency, commercial priority, estimated revenue, booking window, closing probability, repeat potential
- Outreach draft (prepared, not sent)
- Tool plan (proposed actions, not executed)
- Approval state with link to Operations Center
- Business case link

---

## 7. AI Workforce Pages

Each agent in the AI Workforce section must follow a consistent page structure.

### Per-Agent Page Structure

```
Agent Name + Status Badge (Active / Inactive / Coming Soon)

Overview
  │  Description of what this agent does
  │  Business line it serves
  │  Current status
  │  Recent activity feed

Knowledge
  │  Knowledge entries this agent uses
  │  Add / link knowledge

Memory
  │  Relationship memory entries
  │  Contact profiles this agent has built

Policies
  │  Risk level configuration
  │  Approval requirements
  │  What this agent is and is not allowed to do

Tools
  │  Available tools (CRM, outreach draft, case create, etc.)
  │  Approval requirement per tool
  │  Risk level per tool

Connections
  │  Which integrations this agent uses
  │  Status of each connection

Cases
  │  Active and closed cases this agent is handling

Performance
  │  Leads found / qualified (when real data available)
  │  Approvals given / rejected
  │  Cases handled

Settings
  │  Rename, enable/disable, configure
```

### Agent Status Rules

| Agent | Status |
|---|---|
| Lead Hunter (`client-acquisition-agent`) | Active |
| Yacht Broker (`yacht-broker-agent`) | Active |
| Charter Agent (`charter-agent`) | Inactive — not yet implemented |
| Car Rental Agent (`car-rental-agent`) | Inactive — not yet implemented |
| Marketing Agent | Coming Soon — Phase 3 |
| Support Agent | Coming Soon — Phase 3 |

**Rule:** Only agents with working backend profiles may be marked Active. Future agents must be labeled "Coming Soon" or "Not Yet Implemented" with a clear note. No agent must ever appear Active if it has no real profile or handler.

---

## 8. Connection Center

**Route:** `/connections`  
**Role:** Shared hub for all external service integrations

### Purpose

Every external service — search providers, communication channels, data providers, storage, calendar — is configured here in one place. Agents declare which connections they use. Operators approve what each agent is allowed to access.

### Connection Categories and Services

#### Search Providers
| Service | V1 Status |
|---|---|
| Serper | Supported — requires API key |
| Brave Search | Planned — Phase 4 |
| Bing Search | Planned — Phase 4 |

#### Communication
| Service | V1 Status |
|---|---|
| Gmail | Planned — Phase 4 |
| Outlook | Planned — Phase 4 |
| WhatsApp Business | Planned — Phase 4 |
| Telegram | Planned — Phase 4 |

#### Social
| Service | V1 Status |
|---|---|
| LinkedIn | Planned — Phase 4 (read-only public data only) |
| Instagram | Planned — Phase 4 |
| Facebook | Planned — Phase 4 |
| X (Twitter) | Planned — Phase 4 |

#### Data Providers
| Service | V1 Status |
|---|---|
| Apollo | Planned — Phase 4 |
| Clay | Planned — Phase 4 |
| RocketReach | Planned — Phase 4 |
| Hunter.io | Planned — Phase 4 |

#### Storage
| Service | V1 Status |
|---|---|
| Google Drive | Planned — Phase 3 |
| Dropbox | Planned — Phase 3 |
| OneDrive | Planned — Phase 3 |

#### Calendar
| Service | V1 Status |
|---|---|
| Google Calendar | Planned — Phase 3 |
| Outlook Calendar | Planned — Phase 3 |

### Per-Connection Information Required

Each connection card must display:

| Field | Description |
|---|---|
| Status | Connected / Disconnected / Error / Planned |
| Permissions | Read / Write / Send / Delete — what is allowed |
| Allowed Agents | Which agents may use this connection |
| Approval Rules | What requires operator approval before execution |
| Safety Notes | What this connection will never do automatically |
| Last Used | Timestamp of last successful use |
| Error State | Last error if connection failed |

### Safety Architecture

Every connection that involves **sending, posting, or contacting** requires explicit operator approval before any action executes. This is enforced at the tool level, not as a UI preference. The Connection Center makes this visible to the operator.

---

## 9. Design Principles

### Business-First
The interface must reflect business outcomes, not technical modules. Every label, route, and section name must make sense to a business owner who has never seen source code.

### No Fake Data
Zero placeholder numbers. Zero mock agents marked as active. Zero fake connection statuses. If data is not available, show "—" or "Not yet available", never a hardcoded value.

### No Hidden Automation
Every agent action that involves external contact, message sending, or data writing must create an Approval before it executes. The interface must make this guarantee visible at all times.

### Approval Before Execution
The approval requirement is not a feature — it is a system guarantee. The UI must reinforce this on every screen where an agent proposes an action.

### Business Cases Remain Central
Every lead, every opportunity, every client interaction must be traceable to a Business Case. Cases are the spine of the operating system. Nothing important happens outside a case.

### Three-Click Maximum
Any important object — a case, an approval, a lead, an agent — must be reachable within three clicks from Mission Control.

### Attention-First
Every screen must be able to answer: *"What needs my attention right now?"* Pending approvals, urgent leads, and stalled cases must be visible without scrolling or drilling down.

### Avoid CRM Clutter
The system is not a contact database. CRM is a supporting layer, not the primary view. The operator's main concern is active opportunities and decisions — not contact fields.

### Avoid Chatbot Layout
No chat interface. No streaming responses in the main UI. Intelligence output appears as structured cards, drawers, and timelines — not as a conversation.

### Design References
- **Linear** — clean priority-first task management
- **Stripe Dashboard** — clear metrics, business-oriented data views
- **n8n Canvas** — visual flow map (for Business Flow Canvas only)
- **Vercel** — minimal, decisive, performance-aware

---

## 10. Implementation Phases

### Phase 1 — Core Business Interface
**Goal:** Make the interface match the operator's mental model.

- Mission Control (new landing page)
- Business Flow Canvas (static V1)
- Lead Hunter Results (current page enhanced with tabs)
- Navigation restructure (new sidebar hierarchy)

### Phase 2 — Operations and Agents
**Goal:** Improve decision-making and agent visibility.

- Connection Center (configured services, Serper live)
- Agent pages restructure (consistent 8-section layout)
- Approvals workspace improvements (inline approve/reject, filters, grouping)

### Phase 3 — Business Line Pages
**Goal:** Dedicated workspaces per business line.

- Sales page (yacht sale pipeline)
- Charter page (charter pipeline)
- Car Rental page (car rental pipeline)
- Marketing Agent UI
- Support Agent UI
- Storage and Calendar connections (Drive, Google Calendar)

### Phase 4 — Real Integrations
**Goal:** Connect the system to the real world.

- Gmail (read + draft send, approval required)
- LinkedIn (public read only, no DM automation)
- Instagram (public read only)
- WhatsApp Business (send with approval)
- Apollo (lead enrichment)
- Clay (data enrichment)
- Brave Search / Bing Search (additional search providers)

---

## 11. Out of Scope

The following are explicitly out of scope until this UX direction is approved and Phase 1 is complete:

- Real LinkedIn integration or DM automation
- Real Instagram integration
- Real WhatsApp message sending
- Autonomous outreach of any kind (no automatic emails, DMs, or messages)
- Dashboard analytics or charting
- Drag-and-drop workflow editor
- New agent types not listed in the current AI Workforce
- Mobile application
- Multi-user / team access
- Billing or subscription management

---

## 12. Approved UX Direction

This section serves as a formal gate.

**No major new UI functionality should be implemented until this UX Master Plan is reviewed and approved by the operator.**

Specifically:

- Do not add new navigation items outside the structure defined in Section 3
- Do not build new pages that are not listed in the phase plan (Section 10)
- Do not implement agent pages in a format that differs from the structure in Section 7
- Do not add any connection or integration UI outside the Connection Center defined in Section 8
- Do not build screens that show fake data, fake agent statuses, or placeholder counts

The correct implementation sequence is:

1. **Approve this document** (operator reviews, accepts or amends)
2. **Implement Phase 1** (Mission Control, Business Flow Canvas, Navigation, Lead Hunter tabs)
3. **Review Phase 1** (confirm it matches operator expectations before continuing)
4. **Implement Phase 2** (Connection Center, Agent pages, Approvals improvements)
5. Continue phase by phase with operator review between each

Any UI work that begins before approval of this document should be treated as exploratory only and may require rework to conform to the approved direction.

---

*End of EBOS UX Master Plan V1*
