# Commercial Intelligence Engine V1

**Version:** 1.0  
**Status:** Active — Search, Classification, Ranking implemented. All other modules are placeholders for V2.  
**Location:** `src/platform/cie/`

---

## Purpose

The Commercial Intelligence Engine (CIE) is the shared search-and-ranking platform layer for EBOS agents. It centralises:

- Commercial vocabulary (LINE_TERMS, DEMAND_SIGNALS, URGENCY_SIGNALS, etc.)
- Search query tables per mode × business line
- Result scoring (standard and demand modes)
- Business line classification

Before the CIE, these were duplicated inside the Lead Hunter route. Future agents (Charter, Car Rental, Yacht Broker) would have needed their own copies. The CIE gives them a single source of truth.

---

## What the CIE Is NOT

- **Not a monolithic pipeline.** Callers invoke individual module functions, not a black box.
- **Not an agent.** The CIE has no autonomy, no side effects, no approvals. It is a pure computation library.
- **Not a rewrite.** Lead Hunter behaviour is unchanged. The CIE extraction is a pure refactor of internal scoring logic.

---

## Architecture

```
src/platform/cie/
├── index.ts                        ← Public API — all consumers import from here
├── types.ts                        ← Shared types (BusinessLine, SearchMode, SearchResult, etc.)
├── vocabulary.ts                   ← Commercial signals (LINE_TERMS, DEMAND_SIGNALS, JUNK_TERMS, etc.)
└── modules/
    ├── SearchModule.ts             ✅ V1  Query tables per mode × business line
    ├── ClassificationModule.ts     ✅ V1  Business line classification from text signals
    ├── RankingModule.ts            ✅ V1  scoreSearchResult, scoreDemandResult
    ├── FreshnessModule.ts          ⬜ V2  Placeholder — stale result detection
    ├── GeographyModule.ts          ⬜ V2  Placeholder — structured geo matching
    ├── DeduplicationModule.ts      ⬜ V2  Placeholder — cross-campaign deduplication
    ├── OpportunityScoreModule.ts   ⬜ V2  Placeholder — composite 0–100 score
    ├── RecommendationModule.ts     ⬜ V2  Placeholder — structured operator actions
    └── MarketIntelligenceModule.ts ⬜ V2  Placeholder — aggregate market picture
```

---

## V1 Active Modules

### SearchModule

Provides `DEFAULT_QUERIES_BY_MODE` — a two-level table of default search queries indexed by:

```
SearchMode × BusinessLine → string[]
```

Modes: `company_discovery | demand_discovery | partner_discovery | market_intelligence`  
Business lines: `yacht_sale | yacht_charter | car_rental | mixed`

Also exports `selectDefaultQueries(mode, line)` for callers that want the defaults without the full table.

### ClassificationModule

`classifyBusinessLine(hint, text)` → `{ businessLine, confidence }`

V1 is a hint-passthrough with fallback to LINE_TERMS text scoring.  
V2 will add NLP-based classification independent of caller hints.

### RankingModule

Two scorers:

| Function | Used for | Key signals |
|---|---|---|
| `scoreSearchResult(result, ctx)` | company / partner / market modes | LINE_TERMS + intent + geography |
| `scoreDemandResult(result, ctx)` | demand_discovery only | DEMAND_SIGNALS + URGENCY_SIGNALS |

Both return `SearchQuality: { accepted, relevanceScore: A/B/C/D, confidence, reason }`.

The caller (`leadHunterSearch.ts`) decides which scorer to use based on `searchMode`.

---

## Shared Types

```typescript
type BusinessLine = "yacht_sale" | "yacht_charter" | "car_rental" | "mixed";
type SearchMode   = "company_discovery" | "demand_discovery" | "partner_discovery" | "market_intelligence";
type RelevanceScore = "A" | "B" | "C" | "D";

type SearchResult = { title: string; url: string; snippet: string; query: string; };

type SearchQuality = {
  accepted: boolean;
  relevanceScore: RelevanceScore;
  confidence: number;   // 0.0 – 1.0
  reason: string;
};

type CIEContext = {
  businessLine: BusinessLine;
  searchMode?: SearchMode;
  targetSegments?: string;
  geography?: string;
};
```

---

## Current Consumers

| File | What it uses |
|---|---|
| `src/backend/routes/leadHunterSearch.ts` | `DEFAULT_QUERIES_BY_MODE`, `scoreSearchResult`, `scoreDemandResult` |
| `src/agent/profiles/leadHunter/LeadHunterProfile.ts` | `BusinessLine`, `SearchMode` (types only) |

---

## How Lead Hunter Uses the CIE

The Lead Hunter route (`leadHunterSearch.ts`) is a thin orchestrator:

```
1. normalizeCampaign(body)              → LeadCampaign
2. DEFAULT_QUERIES_BY_MODE[mode][line]  → queries[]          ← CIE SearchModule
3. serperSearch(query, limit)           → SearchResult[]     ← transport (local, will move to CIE V2)
4. dedupe(results)                      → unique[]           ← local (will move to CIE DeduplicationModule V2)
5. scoreSearchResult(result, campaign)  → SearchQuality      ← CIE RankingModule
   scoreDemandResult(result, campaign)  → SearchQuality      ← CIE RankingModule
6. runLeadHunterOnResult(...)           → InboxMessage + Approval  ← Lead Hunter only
```

Steps 2 and 5 were previously inline in the route. They are now CIE calls. Steps 3, 4, 6 are Lead Hunter-specific and stay in the route.

---

## What Stays in Lead Hunter (Not CIE)

| Logic | Location | Reason |
|---|---|---|
| `normalizeCampaign` | Route | Lead Hunter-specific request parsing |
| `composeFallbackQuery` | Route | Lead Hunter-specific query fallback |
| `serperSearch` (HTTP) | Route | Transport layer — not CIE's concern in V1 |
| `dedupe` | Route | Future `DeduplicationModule` placeholder |
| `runLeadHunterOnResult` | Route | Creates InboxMessage + Approval — not CIE |
| `buildDraft`, `buildDemandDraft` | Profile | Lead Hunter-specific outreach copy |
| `scoreCandidate`, `scoreDemandCandidate` | Profile | Agent-reasoning-time scoring (different concern) |
| `routeFor`, `urgencyFor`, etc. | Profile | Lead Hunter-specific agent output logic |

---

## V2 Roadmap

The placeholder modules describe their intended responsibilities in detail. The priority order for V2 implementation:

1. **Deduplication** — Cross-campaign duplicate detection (currently per-run URL dedup only)
2. **Freshness** — Penalise stale results (publication year detection)
3. **Geography** — Structured geo matching with region aliases (Côte d'Azur = Monaco + Nice + Cannes + Antibes)
4. **Opportunity Score** — Composite 0–100 score replacing A/B/C/D grade
5. **Recommendation** — Structured operator action (Contact Immediately / Monitor / Ignore)
6. **Market Intelligence** — Aggregate picture across multiple searches

---

## Design Principles

- **No side effects.** CIE functions are pure computations — no database reads, no HTTP calls, no approvals.
- **No autonomous actions.** The CIE ranks and classifies. It never decides to contact anyone.
- **Thin interfaces.** Placeholder modules define the type contract but throw on call. This ensures future implementors know the expected shape without creating dead code.
- **Structural typing.** Callers pass their own campaign/context objects. As long as the object satisfies `CIEContext` (has `businessLine`, optionally `targetSegments`, `geography`, `searchMode`), it works.
