# Architecture

Yacht AI Broker Engine V1 is a standalone full-stack app.

- `src/frontend`: React dashboard, forms, tables and approval workflow.
- `src/backend`: Express API and in-memory V1 store.
- `src/agent`: rule-based broker intelligence services.
- `src/connectors`: safe placeholders for future platform integrations.
- `src/shared`: shared TypeScript types.
- `docs`: architecture, API, database, deployment and roadmap notes.

The backend exposes API-first routes. The frontend calls `/api/*` through the Vite proxy in development. Agent services are intentionally deterministic in V1 so behavior can be reviewed before LLM integration.
