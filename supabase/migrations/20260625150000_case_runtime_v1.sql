-- Case Runtime V1: cases, case_events, case_participants
-- Non-destructive. Does not modify any existing table or column.
-- Safe to run on an existing database. Idempotent (if not exists guards).

-- ─── cases ───────────────────────────────────────────────────────────────────

create table if not exists cases (
  id                      uuid primary key default gen_random_uuid(),
  company_id              text not null default 'internal',
  title                   text not null,
  case_type               text not null,
  case_profile            text not null,
  status                  text not null default 'open',
  source                  text not null,
  primary_contact_name    text,
  primary_contact_email   text,
  created_from_message_id uuid references messages(id),
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now()
);

create index if not exists idx_cases_company_id         on cases(company_id);
create index if not exists idx_cases_status             on cases(status);
create index if not exists idx_cases_contact_email      on cases(primary_contact_email);
create index if not exists idx_cases_company_status     on cases(company_id, status);
create index if not exists idx_cases_from_message       on cases(created_from_message_id);

-- ─── case_events ─────────────────────────────────────────────────────────────
-- Immutable append-only timeline. No updated_at column.

create table if not exists case_events (
  id                    uuid primary key default gen_random_uuid(),
  case_id               uuid not null references cases(id),
  company_id            text not null default 'internal',
  event_type            text not null,
  actor_type            text not null,
  actor_id              text,
  summary               text not null,
  payload               jsonb not null default '{}'::jsonb,
  related_entity_type   text,
  related_entity_id     text,
  created_at            timestamptz not null default now()
);

create index if not exists idx_case_events_case_id      on case_events(case_id);
create index if not exists idx_case_events_case_time    on case_events(case_id, created_at);
create index if not exists idx_case_events_event_type   on case_events(event_type);
create index if not exists idx_case_events_related      on case_events(related_entity_type, related_entity_id);
create index if not exists idx_case_events_actor        on case_events(actor_type, actor_id);

-- ─── case_participants ────────────────────────────────────────────────────────

create table if not exists case_participants (
  id            uuid primary key default gen_random_uuid(),
  case_id       uuid not null references cases(id),
  identity_id   uuid,                          -- FK to future identities table; nullable in V1
  name          text not null,
  email         text,
  role          text not null,
  status        text not null default 'active',
  created_at    timestamptz not null default now()
);

create index if not exists idx_case_participants_case_id  on case_participants(case_id);
create index if not exists idx_case_participants_email    on case_participants(email);
create index if not exists idx_case_participants_case_role on case_participants(case_id, role);
