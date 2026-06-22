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
