# Architecture

Luxury Mobility AI Operating System uses one shared core with specialized agents layered on top.

## Shared Core

- Global dashboard
- Agents registry
- Shared CRM
- Shared memory
- Shared knowledge base
- Shared inbox
- Shared tasks
- Shared approvals
- Shared activity log
- Shared settings
- Shared API layer
- Shared connectors layer
- Shared assets registry

## Specialized Agents

Agent-specific logic belongs in the relevant module. Yacht-specific rules remain in the Yacht Broker Agent. Future car rental logic should use the same core assets, contacts, tasks, approvals and memory instead of a separate system.

## Backend

Express exposes `/api/*` routes. Repository code uses Supabase when configured and in-memory storage otherwise.

## Frontend

React/Vite admin dashboard provides global navigation and agent module views.

## AI Layer

`src/ai` contains provider-agnostic interfaces and an AI router. V1 uses local/mock behavior unless provider API keys are configured.

## Agent-Scoped Memory

Every agent uses the shared `memory_entries` table with `agent_id`. This keeps one core memory engine while allowing each agent to maintain its own relationships, observations, warnings and human notes.

Agent workspace endpoints expose filtered context:

- `GET /api/agents/:slug/workspace`
- `GET /api/memory?agentId=...`
- `GET /api/tasks?agentId=...`
- `GET /api/approvals?agentId=...`
- `GET /api/assets?agentId=...`

Admin notes remain authoritative. Agent-learned observations should be treated as suggestions unless approved.

## Agent Inbox Routing

Inbox messages can be assigned to a specific agent at creation time. Downstream classification, lead creation, task generation, approvals and activity logs preserve the same `agent_id`, so each agent workspace receives only its own operational context.
