# Deployment

The app is prepared for Render + Supabase.

## Supabase

1. Create a Supabase project.
2. Open SQL Editor.
3. Run `supabase/migrations/20260621190000_yacht_ai_broker_engine_v1.sql`.
4. In Project Settings -> API, copy:
   - Project URL -> `SUPABASE_URL`
   - service_role key -> `SUPABASE_SERVICE_ROLE_KEY`

The service role key is a backend secret. Do not put it in frontend code or expose it publicly.

## Render Blueprint

The repository includes `render.yaml`.

1. In Render, choose New -> Blueprint.
2. Connect `apsevcenco/broker_agent_v1`.
3. Render will read `render.yaml`.
4. Add the secret env vars when prompted.
5. Deploy.

## Manual Render Web Service

Repository: `https://github.com/apsevcenco/broker_agent_v1`

Build command:

```bash
npm install && npm run build
```

Start command:

```bash
npm run start
```

Health check path:

```text
/health
```

Environment variables:

```env
NODE_VERSION=20
AGENT_MODE=draft_only
SUPABASE_URL=your-supabase-project-url
SUPABASE_SERVICE_ROLE_KEY=your-server-only-service-role-key
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=change-me
```

## Persistence Modes

Check current persistence mode:

```text
GET /api/system/persistence
```

Response is either:

```json
{ "mode": "supabase" }
```

or:

```json
{ "mode": "memory" }
```

Use memory mode only for local development. Render should use Supabase.

## Existing Supabase Upgrade

If you already ran the old Yacht Broker schema, run this additive migration instead of re-running the original full schema:

```text
supabase/migrations/20260625090000_luxury_mobility_os_upgrade.sql
```

It creates agents/assets/vehicles/memory_entries if missing, adds agent_id columns, preserves existing records and assigns existing data to `yacht-broker-agent`.
