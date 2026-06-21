create table users (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  role text not null default 'admin',
  created_at timestamptz not null default now()
);

create table leads (
  id uuid primary key default gen_random_uuid(),
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
  lead_id uuid references leads(id),
  source text not null,
  status text not null default 'open',
  created_at timestamptz not null default now()
);

create table messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid references conversations(id),
  lead_id uuid references leads(id),
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
  type text not null,
  title text not null,
  description text,
  status text not null default 'new',
  priority text not null default 'medium',
  related_lead_id uuid references leads(id),
  related_message_id uuid references messages(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table agent_approvals (
  id uuid primary key default gen_random_uuid(),
  type text not null,
  title text not null,
  payload text not null,
  status text not null default 'pending',
  risk_level text not null,
  related_message_id uuid references messages(id),
  decided_by uuid references users(id),
  decided_at timestamptz,
  created_at timestamptz not null default now()
);

create table agent_activity_logs (
  id uuid primary key default gen_random_uuid(),
  actor text not null,
  action text not null,
  details text,
  created_at timestamptz not null default now()
);

create table broker_memory (
  id uuid primary key default gen_random_uuid(),
  person_name text not null,
  company text,
  role text,
  relationship_status text,
  trust_level text default 'unknown',
  past_interactions jsonb not null default '[]'::jsonb,
  preferred_communication_style text,
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
  memory_id uuid references broker_memory(id),
  lead_id uuid references leads(id),
  note text not null,
  source text not null default 'admin',
  created_at timestamptz not null default now()
);

create table yachts_reference (
  id uuid primary key default gen_random_uuid(),
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

create table deals_reference (
  id uuid primary key default gen_random_uuid(),
  yacht_reference_id uuid references yachts_reference(id),
  deal_stage text not null default 'internal review',
  confidentiality_level text not null default 'high',
  pdye_deal_room_id text,
  notes text,
  created_at timestamptz not null default now()
);
