-- Creator Phase 3 — event trust, fraud, realtime metrics, payout automation.

-- ---------------------------------------------------------------------------
-- Event deduplication (idempotency)
-- ---------------------------------------------------------------------------

create table if not exists public.creator_event_dedup (
  id uuid primary key default gen_random_uuid(),
  event_type text not null check (event_type in ('click', 'order', 'view')),
  fingerprint_hash text not null,
  creator_id uuid references auth.users (id) on delete cascade,
  tracking_code text,
  product_id uuid references public.salvya_products (id) on delete set null,
  user_id uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists creator_event_dedup_fingerprint_created_idx
  on public.creator_event_dedup (fingerprint_hash, created_at desc);

create index if not exists creator_event_dedup_creator_created_idx
  on public.creator_event_dedup (creator_id, created_at desc);

-- ---------------------------------------------------------------------------
-- Fraud flags
-- ---------------------------------------------------------------------------

create table if not exists public.creator_fraud_flags (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid not null references auth.users (id) on delete cascade,
  event_id uuid references public.creator_events (id) on delete set null,
  reason text not null,
  severity text not null check (severity in ('low', 'medium', 'high')),
  auto_blocked boolean not null default false,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists creator_fraud_flags_creator_created_idx
  on public.creator_fraud_flags (creator_id, created_at desc);

create index if not exists creator_fraud_flags_severity_idx
  on public.creator_fraud_flags (severity, created_at desc);

-- ---------------------------------------------------------------------------
-- Last-touch referral history (attribution fallback)
-- ---------------------------------------------------------------------------

create table if not exists public.creator_referral_touches (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete cascade,
  visitor_key text not null,
  creator_id uuid not null references auth.users (id) on delete cascade,
  product_id uuid references public.salvya_products (id) on delete set null,
  link_id uuid references public.creator_product_links (id) on delete set null,
  tracking_code text not null,
  touched_at timestamptz not null default now()
);

create index if not exists creator_referral_touches_user_touched_idx
  on public.creator_referral_touches (user_id, touched_at desc)
  where user_id is not null;

create index if not exists creator_referral_touches_visitor_touched_idx
  on public.creator_referral_touches (visitor_key, touched_at desc);

-- ---------------------------------------------------------------------------
-- Realtime metrics (materialized on each trusted event)
-- ---------------------------------------------------------------------------

create table if not exists public.creator_metrics_realtime (
  creator_id uuid primary key references auth.users (id) on delete cascade,
  total_clicks bigint not null default 0,
  total_orders bigint not null default 0,
  total_views bigint not null default 0,
  clicks_today integer not null default 0,
  orders_today integer not null default 0,
  revenue_today_minor bigint not null default 0,
  conversion_rate numeric(8, 2) not null default 0,
  metrics_day date not null default (timezone('utc', now()))::date,
  top_product_id uuid references public.salvya_products (id) on delete set null,
  top_tracking_code text,
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Earnings trust columns
-- ---------------------------------------------------------------------------

alter table public.creator_earnings
  add column if not exists fraud_status text not null default 'valid'
    check (fraud_status in ('valid', 'suspicious', 'void')),
  add column if not exists locked boolean not null default false,
  add column if not exists payout_id uuid references public.creator_payouts (id) on delete set null;

create index if not exists creator_earnings_payable_idx
  on public.creator_earnings (creator_id, status, fraud_status)
  where status = 'available' and fraud_status = 'valid' and locked = false;

-- ---------------------------------------------------------------------------
-- Payout automation columns
-- ---------------------------------------------------------------------------

alter table public.creator_payouts
  add column if not exists method text not null default 'manual'
    check (method in ('paypal', 'bank', 'manual')),
  add column if not exists processed_at timestamptz,
  add column if not exists failure_reason text;

alter table public.creator_payouts drop constraint if exists creator_payouts_status_check;

alter table public.creator_payouts
  add constraint creator_payouts_status_check
  check (status in ('pending', 'processing', 'paid', 'failed', 'completed'));

-- Map legacy completed -> paid in app reads; keep completed valid in DB.

-- ---------------------------------------------------------------------------
-- RLS (admin read fraud; creators read own metrics)
-- ---------------------------------------------------------------------------

alter table public.creator_event_dedup enable row level security;
alter table public.creator_fraud_flags enable row level security;
alter table public.creator_referral_touches enable row level security;
alter table public.creator_metrics_realtime enable row level security;

drop policy if exists "creator_fraud_flags_admin" on public.creator_fraud_flags;
create policy "creator_fraud_flags_admin"
  on public.creator_fraud_flags for all
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "creator_metrics_select_own" on public.creator_metrics_realtime;
create policy "creator_metrics_select_own"
  on public.creator_metrics_realtime for select
  using (auth.uid() = creator_id);

drop policy if exists "creator_metrics_admin" on public.creator_metrics_realtime;
create policy "creator_metrics_admin"
  on public.creator_metrics_realtime for select
  using (public.is_admin());

-- ---------------------------------------------------------------------------
-- Materialize realtime metrics
-- ---------------------------------------------------------------------------

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
  v_clicks bigint;
  v_orders bigint;
  v_rate numeric(8, 2);
begin
  insert into public.creator_metrics_realtime (creator_id, metrics_day)
  values (p_creator_id, v_day)
  on conflict (creator_id) do nothing;

  update public.creator_metrics_realtime m
  set
    metrics_day = v_day,
    clicks_today = (case when m.metrics_day = v_day then m.clicks_today else 0 end)
      + case when p_event_type = 'click' then 1 else 0 end,
    orders_today = (case when m.metrics_day = v_day then m.orders_today else 0 end)
      + case when p_event_type = 'order' then 1 else 0 end,
    revenue_today_minor = (case when m.metrics_day = v_day then m.revenue_today_minor else 0 end)
      + greatest(coalesce(p_revenue_minor, 0), 0),
    total_clicks = m.total_clicks + case when p_event_type = 'click' then 1 else 0 end,
    total_orders = m.total_orders + case when p_event_type = 'order' then 1 else 0 end,
    total_views = m.total_views + case when p_event_type = 'view' then 1 else 0 end,
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

grant execute on function public.materialize_creator_metrics(uuid, text, integer) to service_role;

-- ---------------------------------------------------------------------------
-- Trusted event ingest (dedup + event + counters + metrics)
-- ---------------------------------------------------------------------------

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
begin
  if p_event_type not in ('click', 'order', 'view') then
    raise exception 'invalid event_type';
  end if;

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

  if p_link_id is not null then
    if p_event_type = 'click' then
      update public.creator_product_links set clicks_count = clicks_count + 1 where id = p_link_id;
    elsif p_event_type = 'order' then
      update public.creator_product_links set orders_count = orders_count + 1 where id = p_link_id;
    end if;
  end if;

  perform public.materialize_creator_metrics(p_creator_id, p_event_type, coalesce(p_revenue_minor, 0));

  return jsonb_build_object('duplicate', false, 'event_id', v_id);
end;
$$;

grant execute on function public.record_trusted_creator_event(
  text, uuid, text, uuid, uuid, text, uuid, uuid, jsonb, integer, integer
) to service_role;

-- Legacy wrappers delegate to trusted ingest
create or replace function public.record_creator_event(
  p_event_type text,
  p_creator_id uuid,
  p_product_id uuid default null,
  p_link_id uuid default null,
  p_tracking_code text default null,
  p_user_id uuid default null,
  p_order_id uuid default null,
  p_metadata jsonb default '{}'::jsonb
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_result jsonb;
  v_fp text;
begin
  v_fp := coalesce(p_metadata->>'fingerprint_hash', encode(sha256(
    (p_event_type || '|' || p_creator_id::text || '|' || coalesce(p_tracking_code, '') || '|' || coalesce(p_order_id::text, ''))::bytea
  ), 'hex'));

  v_result := public.record_trusted_creator_event(
    p_event_type, p_creator_id, v_fp, p_product_id, p_link_id, p_tracking_code,
    p_user_id, p_order_id, p_metadata, 10, 0
  );

  if coalesce((v_result->>'duplicate')::boolean, false) then
    return null;
  end if;

  return (v_result->>'event_id')::uuid;
end;
$$;

create or replace function public.increment_creator_link_click(p_tracking_code text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_link public.creator_product_links%rowtype;
  v_fp text;
begin
  select * into v_link
  from public.creator_product_links
  where tracking_code = trim(upper(p_tracking_code))
  limit 1;

  if not found then return; end if;

  v_fp := encode(sha256(
    ('click|' || v_link.tracking_code || '|' || v_link.id::text || '|' || extract(epoch from now())::bigint::text)::bytea
  ), 'hex');

  perform public.record_trusted_creator_event(
    'click', v_link.creator_id, v_fp, v_link.product_id, v_link.id, v_link.tracking_code,
    null, null, '{}'::jsonb, 1, 0
  );
end;
$$;
