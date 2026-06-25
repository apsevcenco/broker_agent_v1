# Knowledge Engine

The Knowledge Engine is a shared infrastructure module that provides structured knowledge retrieval for all agents in the Luxury Mobility AI OS.

## Architecture

Three layers:

### Layer 1 — Source Library

Stores original source records before they are processed into knowledge entries.

**Source types:** `pdf`, `docx`, `txt`, `html`, `url`, `manual`, `other`

**Status lifecycle:** `draft` → `imported` → `reviewed` → `approved` → `archived`

**Scope:**
- `global` — available to all agents
- `agent` — scoped to a specific agent

Sources are never processed automatically. An admin provides the source, initiates an import plan, and a reviewer approves before content is added to knowledge entries.

### Layer 2 — Knowledge Entries

Structured expert knowledge derived from sources. The existing `knowledge_entries` table continues to serve this layer without any changes.

`knowledge_chunks` stores smaller text segments derived from larger source documents, linked to a source record and optionally to an agent.

### Layer 3 — Retrieval Layer

A unified function `retrieveKnowledgeForAgent()` combines:
- Existing `knowledge_entries` (keyword-scored, reliability-weighted)
- Future `knowledge_chunks` (same scoring, degrades silently if table is empty)

Results are ranked by relevance score and returned as `RetrievalResult[]`.

## Retrieval

```ts
import { retrieveKnowledgeForAgent } from "../knowledge/retrieval";

const results = await retrieveKnowledgeForAgent({
  agentId: "yacht-broker-agent",
  query: "buyer qualification NDA off-market",
  limit: 10,
  includeGlobal: true
});
```

The function:
1. Loads all `knowledge_entries` via repository (Supabase or in-memory)
2. Filters by `agentId` and optionally includes entries with no agent_id (global)
3. Scores using keyword matching from `searchKnowledge()`
4. Loads `knowledge_chunks` from Supabase if the table exists
5. Combines all results, re-ranks by score × reliability weight
6. Returns top N as `RetrievalResult[]`

**Reliability weights:** `verified=4`, `high=3`, `medium=2`, `low=1`

## Review Workflow

1. Admin creates a source record (status: `draft`)
2. Admin submits for review via `createReviewRequest()`
3. Reviewer approves or rejects via `approveKnowledgeItem()` / `rejectKnowledgeItem()`
4. On approval, source status moves to `approved`
5. Content can then be chunked and added as knowledge entries

## Versioning

Knowledge entries are versioned when their content changes. Each version stores the full title, summary, content, source and reliability level at that point in time.

```ts
await createKnowledgeVersion({
  id: crypto.randomUUID(),
  knowledgeEntryId: entry.id,
  versionNumber: nextVersion,
  title: entry.title,
  summary: entry.summary,
  content: entry.content,
  source: entry.source,
  reliabilityLevel: entry.reliabilityLevel,
  changedBy: "admin",
  changeNote: "Updated after MCA LY3 revision",
  createdAt: new Date().toISOString()
});
```

## Import Planning

The Import Planner is the controlled entry point for new knowledge. It does **not** scrape the web or connect to paid databases.

An admin provides: target agent, topic, category, source URLs, reliability expectation and reviewer notes. The system creates an `ImportPlan` record in `planned` status. A reviewer approves before any import proceeds. Actual content extraction is a V2 feature.

## Agent Knowledge Isolation

Each agent accesses:
1. Its own knowledge entries (`agent_id = agent.id`)
2. Global entries (`agent_id IS NULL`) when `includeGlobal: true`
3. Its own knowledge chunks from processed sources

Agents cannot access other agents' private entries. Shared knowledge is promoted to `scope: global` by an admin.

## How Future PDF/URL Import Will Work (V2)

1. Admin uploads PDF or provides URL through a secure interface
2. System creates `knowledge_source` record (status: `draft`)
3. Text extracted (PDF parser / HTTP fetch — admin-initiated only)
4. `chunkText()` splits content into ordered chunks
5. Chunks saved to `knowledge_chunks` linked to the source
6. AI model (with admin approval) can generate knowledge entry summaries
7. Generated entries enter review queue before being added to `knowledge_entries`
8. On approval, entries become available to all retrieval calls

At no point does the system autonomously scrape, store or use content without human review.

## Suggest-Reply Integration (Future)

The current `suggest-reply` route calls `searchKnowledge()` directly. The planned replacement:

```ts
// Current (src/backend/routes/api.ts)
const relevantKnowledge = searchKnowledge(knowledge, query, 5);

// Future
const results = await retrieveKnowledgeForAgent({ agentId, query, limit: 5 });
const relevantKnowledge = mapResultsToKnowledgeEntries(results);
```

The `mapResultsToKnowledgeEntries()` adapter in `src/knowledge/retrieval.ts` handles the type conversion so `suggestReply()` does not need to change.

## V2 Roadmap

- PDF upload and text extraction
- DOCX upload
- URL import (admin-provided, not autonomous scraping)
- OCR for scanned documents
- Embedding-based vector search (replacing keyword scoring)
- AI-generated knowledge entry drafts (with approval gate)
- Source document viewer in the UI
- Admin-triggered source freshness checks
- Citation-aware answers linking response text to source records
- Per-agent knowledge taxonomies linked to source categories
