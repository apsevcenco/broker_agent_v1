# Knowledge Engine — Database Schema

Migration file: `supabase/migrations/20260625140000_knowledge_engine.sql`

All tables are additive. No existing tables are modified. Safe to run on a populated database.

## knowledge_sources

```sql
create table if not exists knowledge_sources (
  id uuid primary key default gen_random_uuid(),
  agent_id text references agents(id),      -- null = global source
  scope text not null default 'agent',       -- 'global' | 'agent'
  source_type text not null,                 -- 'pdf'|'docx'|'txt'|'html'|'url'|'manual'|'other'
  title text not null,
  description text,
  original_url text,
  storage_path text,                         -- future: Supabase Storage path
  source_authority text,                     -- e.g. 'IMO', 'MCA', 'internal'
  reliability_level text not null default 'medium',  -- 'low'|'medium'|'high'|'verified'
  jurisdiction text,
  language text not null default 'en',
  publication_date date,
  last_checked_at timestamptz,
  status text not null default 'draft',      -- 'draft'|'imported'|'reviewed'|'approved'|'archived'|'failed'
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

## knowledge_chunks

Text segments derived from `knowledge_sources`. Cascades on source delete.

```sql
create table if not exists knowledge_chunks (
  id uuid primary key default gen_random_uuid(),
  source_id uuid not null references knowledge_sources(id) on delete cascade,
  agent_id text references agents(id),
  chunk_index integer not null,              -- 0-based order within source
  title text,
  content text not null,
  summary text,
  page_number integer,
  section_reference text,
  tags text[] not null default '{}',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

## knowledge_reviews

Review lifecycle. Links to either a source or a knowledge entry (not both required).

```sql
create table if not exists knowledge_reviews (
  id uuid primary key default gen_random_uuid(),
  source_id uuid references knowledge_sources(id),
  knowledge_entry_id uuid references knowledge_entries(id),
  reviewer text not null,
  status text not null default 'pending',    -- 'pending'|'approved'|'rejected'|'needs_changes'
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

## knowledge_versions

Immutable snapshots of `knowledge_entries` at the time of each edit.

```sql
create table if not exists knowledge_versions (
  id uuid primary key default gen_random_uuid(),
  knowledge_entry_id uuid not null references knowledge_entries(id) on delete cascade,
  version_number integer not null,
  title text not null,
  summary text not null,
  content text not null,
  source text,
  reliability_level text not null,
  changed_by text not null,
  change_note text,
  created_at timestamptz not null default now()  -- no updated_at: versions are immutable
);
```

## knowledge_import_plans

Admin-controlled import planning. No automatic scraping.

```sql
create table if not exists knowledge_import_plans (
  id uuid primary key default gen_random_uuid(),
  agent_id text references agents(id),
  topic text not null,
  category text not null,
  source_urls jsonb not null default '[]'::jsonb,  -- admin-provided URLs, not fetched automatically
  notes text,
  reliability_expectation text not null default 'medium',
  status text not null default 'planned',    -- 'planned'|'in_review'|'approved'|'rejected'
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

## Safety Notes

- All tables use `IF NOT EXISTS` — idempotent.
- `knowledge_chunks` cascades on source delete.
- `knowledge_versions` cascades on entry delete.
- No existing tables (`knowledge_entries`, `agents`, etc.) are modified.
- No data is deleted.
- Run after: `20260625130000_yacht_knowledge_az_foundation.sql`
