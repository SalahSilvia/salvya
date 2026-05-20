-- Creator Phase 4 — campaigns, AI insights daily, payout requests, extended event types.

-- ---------------------------------------------------------------------------
-- Campaigns
-- ---------------------------------------------------------------------------

create table if not exists public.creator_campaigns (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  status text not null default 'active' check (status in ('active', 'paused', 'ended')),
  budget_optional integer,
  start_date date,
  end_date date,
  created_at timestamptz not null default now()
);

create index if not exists creator_campaigns_creator_status_idx
  on public.creator_campaigns (creator_id, status, created_at desc);

create table if not exists public.creator_campaign_links (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.creator_campaigns (id) on delete cascade,
  creator_product_link_id uuid not null references public.creator_product_links (id) on delete cascade,
  tracking_code_variant text not null default 'default',
  clicks integer not null default 0 check (clicks >= 0),
  orders integer not null default 0 check (orders >= 0),
  revenue_minor integer not null default 0 check (revenue_minor >= 0),
  created_at timestamptz not null default now(),
  unique (campaign_id, creator_product_link_id, tracking_code_variant)
);

create index if not exists creator_campaign_links_campaign_idx
  on public.creator_campaign_links (campaign_id);

-- ---------------------------------------------------------------------------
-- Daily AI insights (updated by cron)
-- ---------------------------------------------------------------------------

create table if not exists public.creator_insights_daily (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid not null references auth.users (id) on delete cascade,
  insight_date date not null default (timezone('utc', now()))::date,
  clicks integer not null default 0,
  orders integer not null default 0,
  conversion_rate numeric(8, 2) not null default 0,
  earnings_minor integer not null default 0,
  top_product_id uuid references public.salvya_products (id) on delete set null,
  anomaly_score integer not null default 0 check (anomaly_score >= 0 and anomaly_score <= 100),
  forecast_7d_minor integer not null default 0,
  forecast_30d_minor integer not null default 0,
  forecast_confidence integer not null default 50 check (forecast_confidence >= 0 and forecast_confidence <= 100),
  recommendation_text text,
  best_post_hour integer,
  viral_score integer not null default 0 check (viral_score >= 0 and viral_score <= 100),
  updated_at timestamptz not null default now(),
  unique (creator_id, insight_date)
);

create index if not exists creator_insights_daily_creator_date_idx
  on public.creator_insights_daily (creator_id, insight_date desc);

-- ---------------------------------------------------------------------------
-- Manual payout requests
-- ---------------------------------------------------------------------------

create table if not exists public.creator_payout_requests (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid not null references auth.users (id) on delete cascade,
  amount_minor integer not null check (amount_minor > 0),
  currency text not null default 'EUR',
  status text not null default 'pending'
    check (status in ('pending', 'approved', 'paid', 'rejected')),
  method text not null default 'paypal' check (method in ('paypal', 'bank', 'manual')),
  created_at timestamptz not null default now(),
  processed_at timestamptz
);

create index if not exists creator_payout_requests_creator_created_idx
  on public.creator_payout_requests (creator_id, created_at desc);

-- ---------------------------------------------------------------------------
-- Phase 4.1 placeholder — boost / collab marketplace
-- ---------------------------------------------------------------------------

create table if not exists public.creator_boost_marketplace (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid not null references auth.users (id) on delete cascade,
  product_id uuid references public.salvya_products (id) on delete set null,
  boost_type text not null default 'visibility' check (boost_type in ('visibility', 'collab', 'cross_promo')),
  status text not null default 'draft' check (status in ('draft', 'active', 'ended')),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------

alter table public.creator_campaigns enable row level security;
alter table public.creator_campaign_links enable row level security;
alter table public.creator_insights_daily enable row level security;
alter table public.creator_payout_requests enable row level security;
alter table public.creator_boost_marketplace enable row level security;

drop policy if exists "creator_campaigns_own" on public.creator_campaigns;
create policy "creator_campaigns_own"
  on public.creator_campaigns for all
  using (auth.uid() = creator_id)
  with check (auth.uid() = creator_id);

drop policy if exists "creator_campaigns_admin" on public.creator_campaigns;
create policy "creator_campaigns_admin"
  on public.creator_campaigns for all
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "creator_campaign_links_own" on public.creator_campaign_links;
create policy "creator_campaign_links_own"
  on public.creator_campaign_links for all
  using (
    exists (
      select 1 from public.creator_campaigns c
      where c.id = campaign_id and c.creator_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.creator_campaigns c
      where c.id = campaign_id and c.creator_id = auth.uid()
    )
  );

drop policy if exists "creator_campaign_links_admin" on public.creator_campaign_links;
create policy "creator_campaign_links_admin"
  on public.creator_campaign_links for all
  using (public.is_admin());

drop policy if exists "creator_insights_daily_own" on public.creator_insights_daily;
create policy "creator_insights_daily_own"
  on public.creator_insights_daily for select
  using (auth.uid() = creator_id);

drop policy if exists "creator_insights_daily_service" on public.creator_insights_daily;
create policy "creator_insights_daily_service"
  on public.creator_insights_daily for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

drop policy if exists "creator_insights_daily_admin" on public.creator_insights_daily;
create policy "creator_insights_daily_admin"
  on public.creator_insights_daily for all
  using (public.is_admin());

drop policy if exists "creator_payout_requests_own" on public.creator_payout_requests;
create policy "creator_payout_requests_own"
  on public.creator_payout_requests for all
  using (auth.uid() = creator_id)
  with check (auth.uid() = creator_id);

drop policy if exists "creator_payout_requests_admin" on public.creator_payout_requests;
create policy "creator_payout_requests_admin"
  on public.creator_payout_requests for all
  using (public.is_admin());

-- ---------------------------------------------------------------------------
-- Extend event types (additive — existing click/order/view unchanged)
-- ---------------------------------------------------------------------------

alter table public.creator_events drop constraint if exists creator_events_event_type_check;
alter table public.creator_events add constraint creator_events_event_type_check
  check (event_type in (
    'click', 'order', 'view',
    'campaign_click', 'campaign_order',
    'product_boost_view', 'wallet_view', 'insight_view'
  ));

alter table public.creator_event_dedup drop constraint if exists creator_event_dedup_event_type_check;
alter table public.creator_event_dedup add constraint creator_event_dedup_event_type_check
  check (event_type in (
    'click', 'order', 'view',
    'campaign_click', 'campaign_order',
    'product_boost_view', 'wallet_view', 'insight_view'
  ));

create or replace function public.creator_event_metrics_bucket(p_event_type text)
returns text
language sql
immutable
as $$
  select case
    when p_event_type in ('click', 'campaign_click') then 'click'
    when p_event_type in ('order', 'campaign_order') then 'order'
    when p_event_type in ('view', 'product_boost_view', 'wallet_view', 'insight_view') then 'view'
    else null
  end;
$$;

create or replace function public.materialize_creator_metrics(
  p_creator_id uuid,
  p_event_type text,
  p_revenue_minor integer default 0
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_day date := (timezone('utc', now()))::date;
  v_bucket text;
  v_clicks bigint;
  v_orders bigint;
  v_rate numeric(8, 2);
begin
  v_bucket := public.creator_event_metrics_bucket(p_event_type);
  if v_bucket is null then
    return;
  end if;

  insert into public.creator_metrics_realtime (creator_id, metrics_day)
  values (p_creator_id, v_day)
  on conflict (creator_id) do nothing;

  update public.creator_metrics_realtime m
  set
    metrics_day = v_day,
    clicks_today = (case when m.metrics_day = v_day then m.clicks_today else 0 end)
      + case when v_bucket = 'click' then 1 else 0 end,
    orders_today = (case when m.metrics_day = v_day then m.orders_today else 0 end)
      + case when v_bucket = 'order' then 1 else 0 end,
    revenue_today_minor = (case when m.metrics_day = v_day then m.revenue_today_minor else 0 end)
      + greatest(coalesce(p_revenue_minor, 0), 0),
    total_clicks = m.total_clicks + case when v_bucket = 'click' then 1 else 0 end,
    total_orders = m.total_orders + case when v_bucket = 'order' then 1 else 0 end,
    total_views = m.total_views + case when v_bucket = 'view' then 1 else 0 end,
    updated_at = now()
  where m.creator_id = p_creator_id;

  select total_clicks, total_orders into v_clicks, v_orders
  from public.creator_metrics_realtime where creator_id = p_creator_id;

  if v_clicks > 0 then
    v_rate := round((v_orders::numeric / v_clicks::numeric) * 100, 2);
  else
    v_rate := 0;
  end if;

  update public.creator_metrics_realtime
  set conversion_rate = v_rate
  where creator_id = p_creator_id;
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
    'product_boost_view', 'wallet_view', 'insight_view'
  ) then
    raise exception 'invalid event_type';
  end if;

  v_bucket := public.creator_event_metrics_bucket(p_event_type);

  if p_order_id is not null then
    select id into v_id from public.creator_events where order_id = p_order_id limit 1;
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
    p_event_type, p_creator_id, p_product_id, p_link_id, v_code, p_user_id, p_order_id,
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
      update public.creator_product_links set clicks_count = clicks_count + 1 where id = p_link_id;
    else
      update public.creator_product_links set orders_count = orders_count + 1 where id = p_link_id;
    end if;
  end if;

  if (p_metadata ? 'campaign_link_id') then
    v_campaign_link_id := (p_metadata->>'campaign_link_id')::uuid;
    if v_campaign_link_id is not null then
      if v_bucket = 'click' then
        update public.creator_campaign_links set clicks = clicks + 1 where id = v_campaign_link_id;
      elsif v_bucket = 'order' then
        update public.creator_campaign_links
        set
          orders = orders + 1,
          revenue_minor = revenue_minor + greatest(coalesce(p_revenue_minor, 0), 0)
        where id = v_campaign_link_id;
      end if;
    end if;
  end if;

  perform public.materialize_creator_metrics(p_creator_id, p_event_type, coalesce(p_revenue_minor, 0));

  return jsonb_build_object('duplicate', false, 'event_id', v_id);
end;
$$;
