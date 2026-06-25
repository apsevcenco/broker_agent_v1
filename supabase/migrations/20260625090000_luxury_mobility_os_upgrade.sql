create extension if not exists pgcrypto;

create table if not exists agents (
  id text primary key,
  name text not null,
  slug text unique not null,
  status text not null,
  category text not null,
  description text not null,
  risk_level text not null default 'medium',
  default_tone text not null,
  system_rules jsonb not null default '[]'::jsonb,
  allowed_actions jsonb not null default '[]'::jsonb,
  blocked_actions jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

insert into agents (id, name, slug, status, category, description, risk_level, default_tone, system_rules, allowed_actions, blocked_actions)
values
('yacht-broker-agent', 'Yacht Broker Agent', 'yacht-broker', 'active', 'yachts', 'Yacht brokerage, off-market deals, distressed yacht sales, broker cooperation, buyer/seller qualification.', 'high', 'Senior yacht broker, discreet, concise, professional.', '["Confidentiality first", "Draft only in V1", "Human approval for high-risk actions"]', '["classify message", "create draft task", "suggest reply", "suggest lead score", "suggest memory update", "suggest next action"]', '["automatic sending", "autonomous deal approval", "legal advice", "paid database ingestion"]'),
('car-rental-agent', 'Car Rental Agent', 'car-rental', 'planned', 'car_rental', 'Car rental, luxury vehicles, chauffeur service, transfers, weddings, events and fleet management.', 'medium', 'Luxury mobility operator, clear, practical and service-focused.', '["No live booking in V1", "Contracts require approval", "Pricing disclosures require review"]', '["draft rental task", "suggest qualification questions", "summarize vehicle requirements"]', '["confirm availability", "send contract", "take payment", "approve rental"]'),
('yachtworth-support-agent', 'YachtWorth Support Agent', 'yachtworth-support', 'planned', 'support', 'Technical support, bug triage, user support, Codex fix preparation and product QA.', 'medium', 'Calm product support specialist, precise and actionable.', '["Do not expose secrets", "Prepare fixes for human review", "Preserve user data"]', '["triage bug", "draft support reply", "prepare Codex fix prompt"]', '["deploy without approval", "change customer data", "expose logs containing secrets"]'),
('charter-agent', 'Charter Agent', 'charter', 'planned', 'charter', 'Yacht charter inquiries, APA, itineraries, charter pricing and client qualification.', 'high', 'Discreet charter broker, polished and concise.', '["No charter confirmation in V1", "Commercial terms require approval"]', '["draft itinerary questions", "suggest qualification", "summarize charter request"]', '["confirm booking", "send offer", "collect payment"]'),
('marketing-agent', 'Marketing Agent', 'marketing', 'planned', 'marketing', 'Content planning, social media drafts, campaigns and lead generation.', 'medium', 'Luxury brand marketer, restrained and conversion-aware.', '["Draft only", "No automatic publishing", "Respect confidentiality"]', '["draft content", "suggest campaign", "summarize audience"]', '["publish automatically", "use confidential asset data", "scrape paid sources"]')
on conflict (id) do update set
  name = excluded.name,
  slug = excluded.slug,
  status = excluded.status,
  category = excluded.category,
  description = excluded.description,
  risk_level = excluded.risk_level,
  default_tone = excluded.default_tone,
  system_rules = excluded.system_rules,
  allowed_actions = excluded.allowed_actions,
  blocked_actions = excluded.blocked_actions,
  updated_at = now();

create table if not exists contacts (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  company text,
  email text,
  phone text,
  country text,
  role text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists assets (
  id uuid primary key default gen_random_uuid(),
  agent_id text references agents(id),
  type text not null,
  name text not null,
  brand text,
  model text,
  year integer,
  location text,
  status text not null default 'draft',
  owner_contact_id uuid references contacts(id),
  notes text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists agent_capabilities (
  id uuid primary key default gen_random_uuid(),
  agent_id text references agents(id),
  capability text not null,
  status text not null default 'planned',
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists memory_entries (
  id uuid primary key default gen_random_uuid(),
  agent_id text references agents(id),
  person_name text not null,
  company text,
  role text,
  relationship_status text,
  trust_level text default 'unknown',
  past_interactions jsonb not null default '[]'::jsonb,
  preferred_communication_style text,
  known_asset_interests text,
  known_yacht_interests text,
  deal_history text,
  warnings text,
  admin_notes text,
  agent_learned_observations text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists vehicles (
  id uuid primary key default gen_random_uuid(),
  asset_id uuid references assets(id),
  segment text,
  daily_price numeric,
  weekly_price numeric,
  monthly_price numeric,
  deposit numeric,
  insurance_notes text,
  included_km integer,
  extra_km_price numeric,
  chauffeur_price numeric,
  availability_status text default 'planned',
  created_at timestamptz not null default now()
);

alter table if exists leads add column if not exists agent_id text references agents(id);
alter table if exists conversations add column if not exists agent_id text references agents(id);
alter table if exists messages add column if not exists agent_id text references agents(id);
alter table if exists messages add column if not exists related_asset_id uuid references assets(id);
alter table if exists agent_tasks add column if not exists agent_id text references agents(id);
alter table if exists agent_tasks add column if not exists related_asset_id uuid references assets(id);
alter table if exists agent_approvals add column if not exists agent_id text references agents(id);
alter table if exists agent_approvals add column if not exists related_asset_id uuid references assets(id);
alter table if exists agent_activity_logs add column if not exists agent_id text references agents(id);
alter table if exists knowledge_entries add column if not exists agent_id text references agents(id);
alter table if exists yachts_reference add column if not exists asset_id uuid references assets(id);
alter table if exists relationship_notes drop constraint if exists relationship_notes_memory_id_fkey;
alter table if exists relationship_notes add constraint relationship_notes_memory_id_fkey foreign key (memory_id) references memory_entries(id);

update leads set agent_id = 'yacht-broker-agent' where agent_id is null;
update messages set agent_id = 'yacht-broker-agent' where agent_id is null;
update conversations set agent_id = 'yacht-broker-agent' where agent_id is null;
update agent_tasks set agent_id = 'yacht-broker-agent' where agent_id is null;
update agent_approvals set agent_id = 'yacht-broker-agent' where agent_id is null;
update agent_activity_logs set agent_id = 'yacht-broker-agent' where agent_id is null;
update knowledge_entries set agent_id = 'yacht-broker-agent' where agent_id is null;

do $$
begin
  if exists (select 1 from information_schema.tables where table_schema = 'public' and table_name = 'broker_memory') then
    execute $copy$
      insert into memory_entries (id, agent_id, person_name, company, role, relationship_status, trust_level, past_interactions, preferred_communication_style, known_yacht_interests, deal_history, warnings, admin_notes, agent_learned_observations, created_at, updated_at)
      select id, 'yacht-broker-agent', person_name, company, role, relationship_status, trust_level, past_interactions, preferred_communication_style, known_yacht_interests, deal_history, warnings, admin_notes, agent_learned_observations, created_at, updated_at
      from broker_memory
      on conflict (id) do nothing
    $copy$;
  end if;
end $$;

