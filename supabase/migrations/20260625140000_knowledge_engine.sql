-- Knowledge Engine: Source Library, Chunks, Reviews, Versions, Import Plans
-- Additive only. Does not modify existing tables. Safe to run on existing database.

-- Source Library: original document/URL records before processing
create table if not exists knowledge_sources (
  id uuid primary key default gen_random_uuid(),
  agent_id text references agents(id),
  scope text not null default 'agent',
  source_type text not null,
  title text not null,
  description text,
  original_url text,
  storage_path text,
  source_authority text,
  reliability_level text not null default 'medium',
  jurisdiction text,
  language text not null default 'en',
  publication_date date,
  last_checked_at timestamptz,
  status text not null default 'draft',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Knowledge Chunks: text segments derived from sources
create table if not exists knowledge_chunks (
  id uuid primary key default gen_random_uuid(),
  source_id uuid not null references knowledge_sources(id) on delete cascade,
  agent_id text references agents(id),
  chunk_index integer not null,
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

-- Review workflow for sources and knowledge entries
create table if not exists knowledge_reviews (
  id uuid primary key default gen_random_uuid(),
  source_id uuid references knowledge_sources(id),
  knowledge_entry_id uuid references knowledge_entries(id),
  reviewer text not null,
  status text not null default 'pending',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Immutable version history for knowledge entries
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
  created_at timestamptz not null default now()
);

-- Admin-controlled import plans (no automatic web scraping)
create table if not exists knowledge_import_plans (
  id uuid primary key default gen_random_uuid(),
  agent_id text references agents(id),
  topic text not null,
  category text not null,
  source_urls jsonb not null default '[]'::jsonb,
  notes text,
  reliability_expectation text not null default 'medium',
  status text not null default 'planned',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Indexes
create index if not exists idx_knowledge_sources_agent_id on knowledge_sources(agent_id);
create index if not exists idx_knowledge_sources_scope on knowledge_sources(scope);
create index if not exists idx_knowledge_sources_status on knowledge_sources(status);
create index if not exists idx_knowledge_chunks_source_id on knowledge_chunks(source_id);
create index if not exists idx_knowledge_chunks_agent_id on knowledge_chunks(agent_id);
create index if not exists idx_knowledge_reviews_status on knowledge_reviews(status);
create index if not exists idx_knowledge_versions_entry_id on knowledge_versions(knowledge_entry_id);
create index if not exists idx_knowledge_import_plans_agent_id on knowledge_import_plans(agent_id);
