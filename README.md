# Luxury Mobility AI Operating System

A standalone multi-agent AI command center for luxury mobility operations. The first active module is the Yacht Broker Agent; the shared core is designed to support charter, valuation, support, car rental, concierge, marketing, research and compliance agents later.

## Core V1

- Global dashboard.
- Agents registry.
- Shared inbox.
- Shared CRM/leads.
- Shared memory.
- Shared knowledge base.
- Shared assets registry.
- Shared tasks, approvals and activity log.
- Supabase/PostgreSQL persistence with local memory fallback.
- Provider-agnostic AI layer with mock/local fallback.
- Render-ready backend and static frontend deployment.

## Active Agent

Yacht Broker Agent is active in V1. It handles yacht brokerage, off-market deals, distressed opportunities, broker cooperation, buyer/seller qualification, draft replies, lead scoring and approval-controlled next steps.

## Planned Agents

- Car Rental Agent
- YachtWorth Support Agent
- Charter Agent
- Marketing Agent
- Client Acquisition Agent
- Future concierge, valuation, research and compliance assistants

## Run Locally

```bash
npm install
npm run dev
```

Frontend: http://localhost:5173  
API: http://localhost:4100

## Environment

Copy `.env.example` to `.env`.

```env
PORT=4100
VITE_API_BASE_URL=http://localhost:4100
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=change-me
AGENT_MODE=draft_only
OPENAI_API_KEY=
ANTHROPIC_API_KEY=
GEMINI_API_KEY=
PERPLEXITY_API_KEY=
```

When Supabase variables are present, the API uses Supabase persistence. Without them, local development uses in-memory storage.

## Supabase Setup

1. Create a Supabase project.
2. Open SQL Editor.
3. Run `supabase/migrations/20260621190000_yacht_ai_broker_engine_v1.sql`.
4. Copy Project URL into `SUPABASE_URL`.
5. Copy service_role key into `SUPABASE_SERVICE_ROLE_KEY`.

Keep `SUPABASE_SERVICE_ROLE_KEY` server-side only.

## Render Setup

Backend Web Service:

```bash
npm install && npm run build
npm run start
```

Static Frontend:

```text
Build Command: npm install && npm run build
Publish Directory: dist/frontend
VITE_API_BASE_URL=https://your-backend.onrender.com
```

Rewrite rule:

```text
Source: /*
Destination: /index.html
Action: Rewrite
```

## Safety Model

Allowed without approval: classify message, create draft task, suggest reply, suggest lead score, suggest memory update, suggest next action.

Requires approval: send message, disclose confidential asset data, change access rights, discuss commission, send contract, send offer, approve a client, connect to external platform.

Blocked in V1: automatic social/WhatsApp sending, scraping, paid database ingestion, autonomous deal approval, autonomous legal advice.


