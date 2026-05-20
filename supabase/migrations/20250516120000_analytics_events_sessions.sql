-- Salvya first-party analytics (sessions + events). Writes via service role API only.
-- Admin reads via is_admin() RLS policies.

-- ---------------------------------------------------------------------------
-- Sessions (anonymous or merged with auth user)
-- ---------------------------------------------------------------------------

create table if not exists public.analytics_sessions (
  id uuid primary key default gen_random_uuid(),
  session_id text not null unique,
  user_id uuid references auth.users (id) on delete set null,
  started_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  user_agent text,
  referrer text,
  utm_source text,
  utm_campaign text,
  utm_medium text
);

create index if not exists analytics_sessions_last_seen_idx
  on public.analytics_sessions (last_seen_at desc);

create index if not exists analytics_sessions_started_idx
  on public.analytics_sessions (started_at desc);

create index if not exists analytics_sessions_user_idx
  on public.analytics_sessions (user_id)
  where user_id is not null;

-- ---------------------------------------------------------------------------
-- Events (append-only; session_id links to analytics_sessions.session_id)
-- ---------------------------------------------------------------------------

create table if not exists public.analytics_events (
  id uuid primary key default gen_random_uuid(),
  session_id text not null,
  user_id uuid references auth.users (id) on delete set null,
  event_type text not null,
  page text not null,
  product_id text,
  artist_slug text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists analytics_events_session_created_idx
  on public.analytics_events (session_id, created_at desc);

create index if not exists analytics_events_type_created_idx
  on public.analytics_events (event_type, created_at desc);

create index if not exists analytics_events_product_idx
  on public.analytics_events (product_id)
  where product_id is not null;

create index if not exists analytics_events_artist_idx
  on public.analytics_events (artist_slug)
  where artist_slug is not null;

-- ---------------------------------------------------------------------------
-- RLS: admin read-only; no client policies (ingest uses service role)
-- ---------------------------------------------------------------------------

alter table public.analytics_sessions enable row level security;
alter table public.analytics_events enable row level security;

drop policy if exists "analytics_sessions_admin_select" on public.analytics_sessions;
create policy "analytics_sessions_admin_select"
  on public.analytics_sessions for select
  using (public.is_admin());

drop policy if exists "analytics_events_admin_select" on public.analytics_events;
create policy "analytics_events_admin_select"
  on public.analytics_events for select
  using (public.is_admin());
