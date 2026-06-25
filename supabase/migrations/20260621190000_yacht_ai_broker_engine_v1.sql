create extension if not exists pgcrypto;

create table users (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  role text not null default 'admin',
  created_at timestamptz not null default now()
);

create table agents (
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

create table agent_capabilities (
  id uuid primary key default gen_random_uuid(),
  agent_id text references agents(id),
  capability text not null,
  status text not null default 'planned',
  notes text,
  created_at timestamptz not null default now()
);

create table contacts (
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

create table leads (
  id uuid primary key default gen_random_uuid(),
  agent_id text references agents(id),
  name text not null,
  company text,
  email text,
  phone text,
  country text,
  role text not null,
  source text not null,
  status text not null default 'new',
  lead_score text not null default 'C',
  interest_type text,
  budget_range text,
  yacht_size_interest text,
  yacht_type_interest text,
  timeline text,
  region text,
  notes text,
  last_contact_date date,
  next_follow_up_date date,
  relationship_history jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table conversations (
  id uuid primary key default gen_random_uuid(),
  agent_id text references agents(id),
  lead_id uuid references leads(id),
  source text not null,
  status text not null default 'open',
  created_at timestamptz not null default now()
);

create table assets (
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

create table messages (
  id uuid primary key default gen_random_uuid(),
  agent_id text references agents(id),
  conversation_id uuid references conversations(id),
  lead_id uuid references leads(id),
  related_asset_id uuid references assets(id),
  source text not null,
  sender_name text not null,
  sender_company text,
  sender_role text,
  body text not null,
  related_yacht text,
  related_deal text,
  urgency text not null default 'medium',
  status text not null default 'new',
  classification text,
  risk_level text,
  created_at timestamptz not null default now()
);

create table agent_tasks (
  id uuid primary key default gen_random_uuid(),
  agent_id text references agents(id),
  type text not null,
  title text not null,
  description text,
  status text not null default 'new',
  priority text not null default 'medium',
  related_lead_id uuid references leads(id),
  related_message_id uuid references messages(id),
  related_asset_id uuid references assets(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table agent_approvals (
  id uuid primary key default gen_random_uuid(),
  agent_id text references agents(id),
  type text not null,
  title text not null,
  payload text not null,
  status text not null default 'pending',
  risk_level text not null,
  related_message_id uuid references messages(id),
  related_asset_id uuid references assets(id),
  decided_by uuid references users(id),
  decided_at timestamptz,
  created_at timestamptz not null default now()
);

create table agent_activity_logs (
  id uuid primary key default gen_random_uuid(),
  agent_id text references agents(id),
  actor text not null,
  action text not null,
  details text,
  created_at timestamptz not null default now()
);

create table memory_entries (
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

create table knowledge_entries (
  id uuid primary key default gen_random_uuid(),
  agent_id text references agents(id),
  title text not null,
  category text not null,
  summary text,
  content text not null,
  source text,
  reliability_level text not null default 'medium',
  tags text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table knowledge_tags (
  id uuid primary key default gen_random_uuid(),
  name text unique not null
);

create table relationship_notes (
  id uuid primary key default gen_random_uuid(),
  memory_id uuid references memory_entries(id),
  lead_id uuid references leads(id),
  note text not null,
  source text not null default 'admin',
  created_at timestamptz not null default now()
);

create table yachts_reference (
  id uuid primary key default gen_random_uuid(),
  asset_id uuid references assets(id),
  display_label text not null,
  confidential_name text,
  yacht_type text,
  length_m numeric,
  build_year integer,
  location_general text,
  exact_location text,
  disclosure_status text not null default 'restricted',
  created_at timestamptz not null default now()
);

create table vehicles (
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

create table deals_reference (
  id uuid primary key default gen_random_uuid(),
  yacht_reference_id uuid references yachts_reference(id),
  deal_stage text not null default 'internal review',
  confidentiality_level text not null default 'high',
  pdye_deal_room_id text,
  notes text,
  created_at timestamptz not null default now()
);

insert into agents (id, name, slug, status, category, description, risk_level, default_tone, system_rules, allowed_actions, blocked_actions)
values
('yacht-broker-agent', 'Yacht Broker Agent', 'yacht-broker', 'active', 'yachts', 'Yacht brokerage, off-market deals, distressed yacht sales, broker cooperation, buyer/seller qualification.', 'high', 'Senior yacht broker, discreet, concise, professional.', '["Confidentiality first", "Draft only in V1", "Human approval for high-risk actions"]', '["classify message", "create draft task", "suggest reply", "suggest lead score", "suggest memory update", "suggest next action"]', '["automatic sending", "autonomous deal approval", "legal advice", "paid database ingestion"]'),
('car-rental-agent', 'Car Rental Agent', 'car-rental', 'planned', 'car_rental', 'Car rental, luxury vehicles, chauffeur service, transfers, weddings, events and fleet management.', 'medium', 'Luxury mobility operator, clear, practical and service-focused.', '["No live booking in V1", "Contracts require approval", "Pricing disclosures require review"]', '["draft rental task", "suggest qualification questions", "summarize vehicle requirements"]', '["confirm availability", "send contract", "take payment", "approve rental"]'),
('yachtworth-support-agent', 'YachtWorth Support Agent', 'yachtworth-support', 'planned', 'support', 'Technical support, bug triage, user support, Codex fix preparation and product QA.', 'medium', 'Calm product support specialist, precise and actionable.', '["Do not expose secrets", "Prepare fixes for human review", "Preserve user data"]', '["triage bug", "draft support reply", "prepare Codex fix prompt"]', '["deploy without approval", "change customer data", "expose logs containing secrets"]'),
('charter-agent', 'Charter Agent', 'charter', 'planned', 'charter', 'Yacht charter inquiries, APA, itineraries, charter pricing and client qualification.', 'high', 'Discreet charter broker, polished and concise.', '["No charter confirmation in V1", "Commercial terms require approval"]', '["draft itinerary questions", "suggest qualification", "summarize charter request"]', '["confirm booking", "send offer", "collect payment"]'),
('marketing-agent', 'Marketing Agent', 'marketing', 'planned', 'marketing', 'Content planning, social media drafts, campaigns and lead generation.', 'medium', 'Luxury brand marketer, restrained and conversion-aware.', '["Draft only", "No automatic publishing", "Respect confidentiality"]', '["draft content", "suggest campaign", "summarize audience"]', '["publish automatically", "use confidential asset data", "scrape paid sources"]');

insert into knowledge_entries (agent_id, title, category, summary, content, source, reliability_level, tags)
values (
  'yacht-broker-agent',
  'Off-market confidentiality baseline',
  'Off-Market Deals',
  'Sensitive details are disclosed only after qualification and approval.',
  'Asset identity, owner details, exact location, documents and commercial terms must stay internal until admin approval is granted.',
  'Internal V1 rule',
  'verified',
  array['confidentiality', 'approval', 'off-market', 'yacht-broker']
);

insert into agents (id, name, slug, status, category, description, risk_level, default_tone, system_rules, allowed_actions, blocked_actions)
values (
  'client-acquisition-agent',
  'Client Acquisition Agent',
  'client-acquisition',
  'planned',
  'client_acquisition',
  'Online prospect research, social lead discovery, compliant outreach drafts, chat response preparation and campaign follow-up planning.',
  'high',
  'Discreet luxury business development specialist, human, concise and non-spammy.',
  '["Draft only in V1", "Respect platform rules", "No spam or mass messaging", "Human approval before any external message", "Do not impersonate a human", "Do not scrape restricted or paid sources"]',
  '["research public prospects", "suggest target segments", "draft outreach", "draft chat replies", "create follow-up tasks", "suggest lead score"]',
  '["send messages automatically", "join chats automatically", "post ads automatically", "scrape platforms", "bypass rate limits", "impersonate people", "use bought contact lists"]'
)
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
