# API

Base URL: `/api`

## Core

- `GET /dashboard/summary`
- `GET /activity`
- `GET /system/persistence`

## Agents

- `GET /agents`
- `GET /agents/:slug`

## Inbox

- `GET /inbox`
- `POST /inbox/message`
- `POST /inbox/:id/classify`
- `POST /inbox/:id/suggest-reply`

## CRM

- `GET /leads`
- `POST /leads`
- `PATCH /leads/:id`
- `POST /leads/:id/score`

## Tasks

- `GET /tasks`
- `POST /tasks`
- `PATCH /tasks/:id`

## Approvals

- `GET /approvals`
- `POST /approvals/:id/approve`
- `POST /approvals/:id/reject`

## Memory

- `GET /memory`
- `POST /memory`
- `PATCH /memory/:id`

## Knowledge

- `GET /knowledge`
- `POST /knowledge`
- `PATCH /knowledge/:id`
- `DELETE /knowledge/:id`

## Assets

- `GET /assets`
- `POST /assets`
- `PATCH /assets/:id`

## Settings

- `GET /settings/ai-providers`

## Agent Runtime Context

`GET /api/agents/:slug/context` returns the selected agent, bootstrap profile, agent-scoped knowledge entries, relationship memory, assets, recent tasks, pending approvals and safety guardrails.

Use `/api/agents/yacht-broker/context` to verify that the Yacht Broker Agent memory has been loaded from Supabase.
