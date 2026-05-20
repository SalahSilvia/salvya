-- =============================================================================
-- Creator Phase 6 — virality, growth score, boost candidates, leaderboard,
-- AI engagement event types.
--
-- Prerequisites (run first):
--   - salvya_products, creator_product_links (Phase 1–2)
--   - creator_events, creator_event_dedup, materialize_creator_metrics (Phase 3–4)
--   - creator_campaign_links (Phase 4, for campaign_* events in record_trusted_creator_event)
--
-- Safe to re-run: uses IF NOT EXISTS / DROP IF EXISTS throughout.
-- Do NOT use partial indexes with now() in the predicate (PostgreSQL 42P17).
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Prerequisite guard
-- -----------------------------------------------------------------------------

do $$
begin
  if to_regclass('public.creator_events') is null then
    raise exception
      'Phase 6 requires public.creator_events. Apply creator Phase 3–4 migrations first.';
  end if;
  if to_regclass('public.salvya_products') is null then
    raise exception
      'Phase 6 requires public.salvya_products.';
  end if;
  if to_regclass('public.creator_product_links') is null then
    raise exception
      'Phase 6 requires public.creator_product_links.';
  end if;
end $$;

-- -----------------------------------------------------------------------------
-- Cleanup: broken partial index from earlier draft (expires_at > now())
-- -----------------------------------------------------------------------------

drop index if exists public.creator_boost_candidates_active_idx;

-- -----------------------------------------------------------------------------
-- Virality snapshots (recomputed by cron)
-- -----------------------------------------------------------------------------

create table if not exists public.creator_virality_snapshots (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid not null references auth.users (id) on delete cascade,
  product_id uuid references public.salvya_products (id) on delete cascade,
  link_id uuid references public.creator_product_links (id) on delete set null,
  viral_score integer not null default 0
    check (viral_score >= 0 and viral_score <= 100),
  viral_stage text not null default 'cold'
    check (viral_stage in ('cold', 'warming', 'hot', 'viral', 'saturated')),
  expected_peak_time timestamptz,
  expected_revenue_multiplier numeric(6, 2) not null default 1.0,
  signals jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create index if not exists creator_virality_snapshots_creator_product_idx
  on public.creator_virality_snapshots (creator_id, product_id);

create index if not exists creator_virality_snapshots_score_idx
  on public.creator_virality_snapshots (viral_score desc, updated_at desc);

-- -----------------------------------------------------------------------------
-- Growth score + rank tier
-- -----------------------------------------------------------------------------

create table if not exists public.creator_growth_scores (
  creator_id uuid primary key references auth.users (id) on delete cascade,
  growth_score integer not null default 0
    check (growth_score >= 0 and growth_score <= 1000),
  rank_tier text not null default 'bronze'
    check (rank_tier in ('bronze', 'silver', 'gold', 'diamond')),
  revenue_growth_pct numeric(8, 2) not null default 0,
  ctr_trend_pct numeric(8, 2) not null default 0,
  consistency_days integer not null default 0,
  virality_component integer not null default 0,
  week_progression jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);

-- -----------------------------------------------------------------------------
-- Organic boost candidates (storefront ranking weight)
-- -----------------------------------------------------------------------------

create table if not exists public.creator_boost_candidates (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.salvya_products (id) on delete cascade,
  creator_id uuid references auth.users (id) on delete set null,
  boost_weight numeric(4, 2) not null default 1.0
    check (boost_weight >= 1.0 and boost_weight <= 1.5),
  reason text not null default '',
  badge text,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

create index if not exists creator_boost_candidates_product_expires_idx
  on public.creator_boost_candidates (product_id, expires_at desc);

-- Query-time filter: WHERE expires_at > now() — index on expires_at only (no now() in predicate).
create index if not exists creator_boost_candidates_expires_idx
  on public.creator_boost_candidates (expires_at desc);

-- -----------------------------------------------------------------------------
-- Weekly leaderboard
-- -----------------------------------------------------------------------------

create table if not exists public.creator_leaderboard_weekly (
  week_key text not null,
  creator_id uuid not null references auth.users (id) on delete cascade,
  growth_score integer not null default 0,
  revenue_minor integer not null default 0,
  viral_score integer not null default 0,
  conversion_rate numeric(8, 2) not null default 0,
  badges jsonb not null default '[]'::jsonb,
  rank_position integer not null default 0,
  display_name text,
  updated_at timestamptz not null default now(),
  primary key (week_key, creator_id)
);

create index if not exists creator_leaderboard_weekly_week_rank_idx
  on public.creator_leaderboard_weekly (week_key, rank_position);

-- -----------------------------------------------------------------------------
-- RLS
-- -----------------------------------------------------------------------------

alter table public.creator_virality_snapshots enable row level security;
alter table public.creator_growth_scores enable row level security;
alter table public.creator_boost_candidates enable row level security;
alter table public.creator_leaderboard_weekly enable row level security;

drop policy if exists "creator_virality_own" on public.creator_virality_snapshots;
create policy "creator_virality_own"
  on public.creator_virality_snapshots
  for select
  to authenticated
  using (auth.uid() = creator_id);

drop policy if exists "creator_virality_public_read" on public.creator_virality_snapshots;
create policy "creator_virality_public_read"
  on public.creator_virality_snapshots
  for select
  using (true);

drop policy if exists "creator_growth_scores_own" on public.creator_growth_scores;
create policy "creator_growth_scores_own"
  on public.creator_growth_scores
  for select
  to authenticated
  using (auth.uid() = creator_id);

drop policy if exists "creator_growth_scores_public" on public.creator_growth_scores;
create policy "creator_growth_scores_public"
  on public.creator_growth_scores
  for select
  using (true);

drop policy if exists "creator_boost_public" on public.creator_boost_candidates;
create policy "creator_boost_public"
  on public.creator_boost_candidates
  for select
  using (true);

drop policy if exists "creator_leaderboard_public" on public.creator_leaderboard_weekly;
create policy "creator_leaderboard_public"
  on public.creator_leaderboard_weekly
  for select
  using (true);

-- Cron / service writes (bypass not needed if using service_role key; explicit for supabase client)
drop policy if exists "creator_virality_service" on public.creator_virality_snapshots;
create policy "creator_virality_service"
  on public.creator_virality_snapshots
  for all
  to service_role
  using (true)
  with check (true);

drop policy if exists creator_growth_scores_service on public.creator_growth_scores;
create policy creator_growth_scores_service
  on public.creator_growth_scores
  for all
  to service_role
  using (true)
  with check (true);

drop policy if exists "creator_boost_service" on public.creator_boost_candidates;
create policy "creator_boost_service"
  on public.creator_boost_candidates
  for all
  to service_role
  using (true)
  with check (true);

drop policy if exists "creator_leaderboard_service" on public.creator_leaderboard_weekly;
create policy "creator_leaderboard_service"
  on public.creator_leaderboard_weekly
  for all
  to service_role
  using (true)
  with check (true);

-- -----------------------------------------------------------------------------
-- Phase 6 AI engagement event types (extends Phase 4)
-- -----------------------------------------------------------------------------

alter table public.creator_events
  drop constraint if exists creator_events_event_type_check;

alter table public.creator_events
  add constraint creator_events_event_type_check
  check (
    event_type in (
      'click', 'order', 'view',
      'campaign_click', 'campaign_order',
      'product_boost_view', 'wallet_view', 'insight_view',
      'ai_insight_view', 'viral_prediction_view', 'growth_score_view', 'boost_suggestion_click'
    )
  );

alter table public.creator_event_dedup
  drop constraint if exists creator_event_dedup_event_type_check;

alter table public.creator_event_dedup
  add constraint creator_event_dedup_event_type_check
  check (
    event_type in (
      'click', 'order', 'view',
      'campaign_click', 'campaign_order',
      'product_boost_view', 'wallet_view', 'insight_view',
      'ai_insight_view', 'viral_prediction_view', 'growth_score_view', 'boost_suggestion_click'
    )
  );

create or replace function public.creator_event_metrics_bucket(p_event_type text)
returns text
language sql
immutable
set search_path = public
as $$
  select case
    when p_event_type in ('click', 'campaign_click') then 'click'
    when p_event_type in ('order', 'campaign_order') then 'order'
    when p_event_type in (
      'view', 'product_boost_view', 'wallet_view', 'insight_view',
      'ai_insight_view', 'viral_prediction_view', 'growth_score_view', 'boost_suggestion_click'
    ) then 'view'
    else null
  end;
$$;

create or replace function public.record_trusted_creator_event(
  p_event_type text,
  p_creator_id uuid,
  p_fingerprint_hash text,
  p_product_id uuid default null,
  p_link_id uuid default null,
  p_tracking_code text default null,
  p_user_id uuid default null,
  p_order_id uuid default null,
  p_metadata jsonb default '{}'::jsonb,
  p_dedup_window_minutes integer default 10,
  p_revenue_minor integer default 0
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id uuid;
  v_code text;
  v_dup boolean := false;
  v_bucket text;
  v_campaign_link_id uuid;
begin
  if p_event_type not in (
    'click', 'order', 'view',
    'campaign_click', 'campaign_order',
    'product_boost_view', 'wallet_view', 'insight_view',
    'ai_insight_view', 'viral_prediction_view', 'growth_score_view', 'boost_suggestion_click'
  ) then
    raise exception 'invalid event_type: %', p_event_type;
  end if;

  v_bucket := public.creator_event_metrics_bucket(p_event_type);

  -- Pure engagement events: insert only, no dedup / link counters / metrics rollup.
  if v_bucket is null and p_order_id is null then
    insert into public.creator_events (
      event_type, creator_id, product_id, link_id, tracking_code, user_id, order_id, metadata
    )
    values (
      p_event_type,
      p_creator_id,
      p_product_id,
      p_link_id,
      nullif(trim(upper(coalesce(p_tracking_code, ''))), ''),
      p_user_id,
      p_order_id,
      coalesce(p_metadata, '{}'::jsonb)
    )
    returning id into v_id;

    return jsonb_build_object('duplicate', false, 'event_id', v_id);
  end if;

  if p_order_id is not null then
    select id into v_id
    from public.creator_events
    where order_id = p_order_id
    limit 1;

    if v_id is not null then
      return jsonb_build_object('duplicate', true, 'event_id', v_id);
    end if;
  end if;

  if p_fingerprint_hash is not null and length(trim(p_fingerprint_hash)) > 0 then
    select true into v_dup
    from public.creator_event_dedup d
    where d.fingerprint_hash = p_fingerprint_hash
      and d.created_at > now() - make_interval(mins => greatest(p_dedup_window_minutes, 1))
    limit 1;

    if v_dup then
      return jsonb_build_object('duplicate', true, 'event_id', null);
    end if;
  end if;

  v_code := nullif(trim(upper(coalesce(p_tracking_code, ''))), '');

  insert into public.creator_events (
    event_type, creator_id, product_id, link_id, tracking_code, user_id, order_id, metadata
  )
  values (
    p_event_type,
    p_creator_id,
    p_product_id,
    p_link_id,
    v_code,
    p_user_id,
    p_order_id,
    coalesce(p_metadata, '{}'::jsonb)
  )
  returning id into v_id;

  if p_fingerprint_hash is not null and length(trim(p_fingerprint_hash)) > 0 then
    insert into public.creator_event_dedup (
      event_type, fingerprint_hash, creator_id, tracking_code, product_id, user_id
    )
    values (
      p_event_type, p_fingerprint_hash, p_creator_id, v_code, p_product_id, p_user_id
    );
  end if;

  if p_link_id is not null and v_bucket in ('click', 'order') then
    if v_bucket = 'click' then
      update public.creator_product_links
      set clicks_count = clicks_count + 1
      where id = p_link_id;
    else
      update public.creator_product_links
      set orders_count = orders_count + 1
      where id = p_link_id;
    end if;
  end if;

  if p_metadata ? 'campaign_link_id' then
    v_campaign_link_id := (p_metadata->>'campaign_link_id')::uuid;

    if v_campaign_link_id is not null and to_regclass('public.creator_campaign_links') is not null then
      if v_bucket = 'click' then
        update public.creator_campaign_links
        set clicks = clicks + 1
        where id = v_campaign_link_id;
      elsif v_bucket = 'order' then
        update public.creator_campaign_links
        set
          orders = orders + 1,
          revenue_minor = revenue_minor + greatest(coalesce(p_revenue_minor, 0), 0)
        where id = v_campaign_link_id;
      end if;
    end if;
  end if;

  if v_bucket is not null then
    perform public.materialize_creator_metrics(
      p_creator_id,
      p_event_type,
      coalesce(p_revenue_minor, 0)
    );
  end if;

  return jsonb_build_object('duplicate', false, 'event_id', v_id);
end;
$$;

grant execute on function public.creator_event_metrics_bucket(text) to authenticated, service_role;
grant execute on function public.record_trusted_creator_event(
  text, uuid, text, uuid, uuid, text, uuid, uuid, jsonb, integer, integer
) to authenticated, service_role;
