create extension if not exists pgcrypto;

create type opportunity_status as enum ('discovered','scored','approved','production','published','paused');
create type autonomy_level as enum ('green','amber','red');

create table if not exists opportunities (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  niche text not null,
  source text not null,
  score int not null default 0 check (score between 0 and 100),
  demand int not null default 0 check (demand between 0 and 100),
  competition int not null default 0 check (competition between 0 and 100),
  commercial_intent int not null default 0 check (commercial_intent between 0 and 100),
  status opportunity_status not null default 'discovered',
  product_name text,
  product_price numeric(10,2),
  monthly_searches int default 0,
  revenue_30d numeric(12,2) default 0,
  traffic_30d int default 0,
  conversion_rate numeric(6,3) default 0,
  next_action text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists agent_runs (
  id uuid primary key default gen_random_uuid(),
  agent_id text not null,
  opportunity_id uuid references opportunities(id) on delete set null,
  autonomy autonomy_level not null default 'green',
  action text not null,
  status text not null,
  input jsonb not null default '{}'::jsonb,
  output jsonb not null default '{}'::jsonb,
  cost_gbp numeric(10,4) default 0,
  created_at timestamptz not null default now()
);

create table if not exists assets (
  id uuid primary key default gen_random_uuid(),
  opportunity_id uuid references opportunities(id) on delete cascade,
  type text not null,
  provider text not null,
  status text not null,
  external_id text,
  url text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists revenue_events (
  id uuid primary key default gen_random_uuid(),
  opportunity_id uuid references opportunities(id) on delete set null,
  provider text not null,
  external_id text,
  gross_gbp numeric(12,2) not null,
  fee_gbp numeric(12,2) default 0,
  net_gbp numeric(12,2) generated always as (gross_gbp - fee_gbp) stored,
  occurred_at timestamptz not null,
  metadata jsonb not null default '{}'::jsonb
);

create table if not exists system_events (
  id bigserial primary key,
  event_type text not null,
  entity_type text,
  entity_id text,
  severity text not null default 'info',
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists opportunities_score_idx on opportunities(score desc);
create index if not exists opportunities_status_idx on opportunities(status);
create index if not exists agent_runs_created_idx on agent_runs(created_at desc);
create index if not exists revenue_events_occurred_idx on revenue_events(occurred_at desc);
