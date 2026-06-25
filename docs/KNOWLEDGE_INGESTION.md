# Agent Knowledge Ingestion

Each agent should have a supervised knowledge library instead of unsupervised internet memory.

## Current Design

- `knowledge_entries` stores agent-specific knowledge in Supabase.
- `agent_id` scopes entries to one agent.
- `/api/agents/:slug/context` returns profile, taxonomy, knowledge, memory, assets, tasks, approvals and guardrails.
- `/api/agents/:slug/knowledge-taxonomy` returns the knowledge categories for that agent.
- `/api/knowledge?agentId=...&q=...` retrieves relevant entries.
- Reply drafting now retrieves relevant knowledge and includes a `Knowledge used` section in the approval payload.

## Yacht Broker Agent Foundation

Run this seed in Supabase SQL Editor after the base schema:

`supabase/migrations/20260625130000_yacht_knowledge_az_foundation.sql`

It adds the first A-Z foundation layer for yacht brokerage:

- Brokerage process
- Contracts and deal flow
- Flags and registration
- Tax, VAT and customs boundaries
- Classification and survey
- Safety and compliance
- Charter operations
- Crew and operations
- Insurance and risk
- Valuation and market
- Refit and technical
- KYC, AML and sanctions
- Marinas and berthing
- Advisory boundaries

## Rule

The agent may use stored knowledge to understand a topic, ask better questions, draft internal notes and route approvals. It must not provide final legal, tax, flag-state, class, insurance or sanctions advice without specialist review.

## Future Importer

The next step is a supervised URL importer:

1. Admin enters topic, category and source URLs.
2. System fetches pages or uploaded PDFs.
3. AI drafts proposed knowledge entries.
4. Admin reviews and approves.
5. Approved entries are saved to `knowledge_entries` with source and reliability level.

This same structure will be reused for Car Rental Agent, Client Acquisition Agent and future agents.
