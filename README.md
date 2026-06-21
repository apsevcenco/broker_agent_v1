# Yacht AI Broker Engine

A standalone V1 foundation for a private digital senior yacht broker working under human supervision. The system is API-first, draft-only in V1, and designed for future PDYE, YachtWorth, Gmail, LinkedIn, Instagram, WhatsApp, OpenAI and vector database integrations.

## What works now

- React + Vite + TypeScript admin dashboard.
- Node.js + Express + TypeScript API.
- Manual inbox message creation.
- Rule-based message classification.
- Rule-based lead scoring and risk assessment.
- Reply draft generation.
- Approval queue for drafts, lead scores and sensitive actions.
- Task generation.
- Editable leads, memory and knowledge base records.
- Activity log.
- SQL schema and Supabase migration draft.

## Run locally

```bash
npm install
npm run dev
```

Frontend: http://localhost:5173  
API: http://localhost:4100

## Environment

Copy `.env.example` to `.env` and fill values as needed.

```bash
PORT=4100
VITE_API_BASE_URL=http://localhost:4100
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=change-me
AGENT_MODE=draft_only
```

The current V1 uses in-memory data for fast local operation. Use `docs/DATABASE_SCHEMA.md` or `supabase/migrations/20260621190000_yacht_ai_broker_engine_v1.sql` when wiring Supabase persistence.

## Safety model

No external messages are sent automatically. All high-risk disclosures, documents, legal/commercial terms, commission discussion and buyer/broker access decisions require admin approval.

## Supabase setup

1. Create a Supabase project.
2. Open SQL Editor.
3. Run `supabase/migrations/20260621190000_yacht_ai_broker_engine_v1.sql`.
4. Open Project Settings -> API.
5. Copy `Project URL` into `SUPABASE_URL`.
6. Copy `service_role` key into `SUPABASE_SERVICE_ROLE_KEY`.
7. Keep `SUPABASE_SERVICE_ROLE_KEY` server-side only. Never expose it in frontend code.

When these variables are present, the API uses Supabase persistence. Without them, local development falls back to in-memory storage.

## Render setup

Use the included `render.yaml` as a Blueprint, or create a Render Web Service manually from the GitHub repository.

Build command:

```bash
npm install && npm run build
```

Start command:

```bash
npm run start
```

Required Render environment variables:

```env
NODE_VERSION=20
AGENT_MODE=draft_only
SUPABASE_URL=your-supabase-project-url
SUPABASE_SERVICE_ROLE_KEY=your-server-only-service-role-key
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=change-me
```
