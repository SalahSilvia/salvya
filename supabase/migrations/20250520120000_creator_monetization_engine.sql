-- Creator monetization engine: events (source of truth), earnings, order attribution snapshots.

-- ---------------------------------------------------------------------------
-- Order attribution (immutable snapshot at checkout)
-- ---------------------------------------------------------------------------

alter table public.customer_orders
  add column if not exists creator_id uuid references auth.users (id) on delete set null,
  add column if not exists creator_tracking_code text,
  add column if not exists creator_product_link_id uuid references public.creator_product_links (id) on delete set null,
  add column if not exists referral_source text,
  add column if not exists creator_self_referral boolean not null default false;

create index if not exists customer_orders_creator_id_idx
  on public.customer_orders (creator_id)
  where creator_id is not null;

create index if not exists customer_orders_creator_tracking_code_idx
  on public.customer_orders (creator_tracking_code)
  where creator_tracking_code is not null;

-- ---------------------------------------------------------------------------
-- Creator events (append-only analytics)
-- ---------------------------------------------------------------------------

create table if not exists public.creator_events (
  id uuid primary key default gen_random_uuid(),
  event_type text not null check (event_type in ('click', 'order', 'view')),
  creator_id uuid not null references auth.users (id) on delete cascade,
  product_id uuid references public.salvya_products (id) on delete set null,
  link_id uuid references public.creator_product_links (id) on delete set null,
  tracking_code text,
  user_id uuid references auth.users (id) on delete set null,
  order_id uuid references public.customer_orders (id) on delete set null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists creator_events_creator_type_created_idx
  on public.creator_events (creator_id, event_type, created_at desc);

create index if not exists creator_events_link_type_created_idx
  on public.creator_events (link_id, event_type, created_at desc)
  where link_id is not null;

create index if not exists creator_events_tracking_code_idx
  on public.creator_events (tracking_code)
  where tracking_code is not null;

create index if not exists creator_events_order_id_idx
  on public.creator_events (order_id)
  where order_id is not null;

-- ---------------------------------------------------------------------------
-- Creator earnings (commission ledger)
-- ---------------------------------------------------------------------------

create table if not exists public.creator_earnings (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid not null references auth.users (id) on delete cascade,
  order_id uuid not null unique references public.customer_orders (id) on delete cascade,
  link_id uuid references public.creator_product_links (id) on delete set null,
  gross_amount_minor integer not null check (gross_amount_minor >= 0),
  commission_rate numeric(6, 4) not null check (commission_rate >= 0 and commission_rate <= 1),
  amount_minor integer not null check (amount_minor >= 0),
  currency text not null default 'EUR',
  status text not null default 'pending'
    check (status in ('pending', 'available', 'paid', 'void')),
  self_referral boolean not null default false,
  created_at timestamptz not null default now(),
  available_at timestamptz,
  paid_at timestamptz
);

create index if not exists creator_earnings_creator_status_idx
  on public.creator_earnings (creator_id, status, created_at desc);

-- ---------------------------------------------------------------------------
-- Payout history (withdrawals)
-- ---------------------------------------------------------------------------

create table if not exists public.creator_payouts (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid not null references auth.users (id) on delete cascade,
  amount_minor integer not null check (amount_minor > 0),
  currency text not null default 'EUR',
  status text not null default 'completed'
    check (status in ('pending', 'completed', 'failed')),
  reference text,
  created_at timestamptz not null default now()
);

create index if not exists creator_payouts_creator_created_idx
  on public.creator_payouts (creator_id, created_at desc);

-- ---------------------------------------------------------------------------
-- RLS: creators read own rows; writes via service role only
-- ---------------------------------------------------------------------------

alter table public.creator_events enable row level security;
alter table public.creator_earnings enable row level security;
alter table public.creator_payouts enable row level security;

drop policy if exists "creator_events_select_own" on public.creator_events;
create policy "creator_events_select_own"
  on public.creator_events for select
  using (auth.uid() = creator_id);

drop policy if exists "creator_events_admin_select" on public.creator_events;
create policy "creator_events_admin_select"
  on public.creator_events for select
  using (public.is_admin());

drop policy if exists "creator_earnings_select_own" on public.creator_earnings;
create policy "creator_earnings_select_own"
  on public.creator_earnings for select
  using (auth.uid() = creator_id);

drop policy if exists "creator_earnings_admin_all" on public.creator_earnings;
create policy "creator_earnings_admin_all"
  on public.creator_earnings for all
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "creator_payouts_select_own" on public.creator_payouts;
create policy "creator_payouts_select_own"
  on public.creator_payouts for select
  using (auth.uid() = creator_id);

drop policy if exists "creator_payouts_admin_all" on public.creator_payouts;
create policy "creator_payouts_admin_all"
  on public.creator_payouts for all
  using (public.is_admin())
  with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- Record event + sync link counters (denormalized cache)
-- ---------------------------------------------------------------------------

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
  v_id uuid;
  v_code text;
begin
  if p_event_type not in ('click', 'order', 'view') then
    raise exception 'invalid event_type';
  end if;

  v_code := nullif(trim(upper(coalesce(p_tracking_code, ''))), '');

  insert into public.creator_events (
    event_type,
    creator_id,
    product_id,
    link_id,
    tracking_code,
    user_id,
    order_id,
    metadata
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

  if p_link_id is not null then
    if p_event_type = 'click' then
      update public.creator_product_links
      set clicks_count = clicks_count + 1
      where id = p_link_id;
    elsif p_event_type = 'order' then
      update public.creator_product_links
      set orders_count = orders_count + 1
      where id = p_link_id;
    end if;
  end if;

  return v_id;
end;
$$;

grant execute on function public.record_creator_event(text, uuid, uuid, uuid, text, uuid, uuid, jsonb) to service_role;

-- Keep legacy RPC delegating to events for backwards compatibility during rollout.
create or replace function public.increment_creator_link_click(p_tracking_code text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_link public.creator_product_links%rowtype;
begin
  select * into v_link
  from public.creator_product_links
  where tracking_code = trim(upper(p_tracking_code))
  limit 1;

  if not found then
    return;
  end if;

  perform public.record_creator_event(
    'click',
    v_link.creator_id,
    v_link.product_id,
    v_link.id,
    v_link.tracking_code,
    null,
    null,
    '{}'::jsonb
  );
end;
$$;

grant execute on function public.increment_creator_link_click(text) to service_role;

-- ---------------------------------------------------------------------------
-- Aggregated stats (O(1) dashboard reads)
-- ---------------------------------------------------------------------------

create or replace function public.get_creator_event_totals(p_creator_id uuid)
returns table (
  total_clicks bigint,
  total_orders bigint,
  total_views bigint
)
language sql
stable
security definer
set search_path = public
as $$
  select
    count(*) filter (where event_type = 'click') as total_clicks,
    count(*) filter (where event_type = 'order') as total_orders,
    count(*) filter (where event_type = 'view') as total_views
  from public.creator_events
  where creator_id = p_creator_id;
$$;

grant execute on function public.get_creator_event_totals(uuid) to service_role;

create or replace function public.get_creator_top_product_by_clicks(p_creator_id uuid)
returns table (
  product_id uuid,
  tracking_code text,
  clicks bigint
)
language sql
stable
security definer
set search_path = public
as $$
  select
    e.product_id,
    max(e.tracking_code) as tracking_code,
    count(*)::bigint as clicks
  from public.creator_events e
  where e.creator_id = p_creator_id
    and e.event_type = 'click'
    and e.product_id is not null
  group by e.product_id
  order by clicks desc
  limit 1;
$$;

grant execute on function public.get_creator_top_product_by_clicks(uuid) to service_role;

create or replace function public.get_creator_link_performance(p_creator_id uuid)
returns table (
  link_id uuid,
  tracking_code text,
  product_id uuid,
  product_title text,
  clicks bigint,
  orders bigint,
  revenue_minor bigint
)
language sql
stable
security definer
set search_path = public
as $$
  select
    l.id as link_id,
    l.tracking_code,
    l.product_id,
    coalesce(p.title, 'Product') as product_title,
    count(e.id) filter (where e.event_type = 'click') as clicks,
    count(e.id) filter (where e.event_type = 'order') as orders,
    coalesce(
      (
        select sum(ce.amount_minor)::bigint
        from public.creator_earnings ce
        where ce.creator_id = p_creator_id
          and ce.link_id = l.id
          and ce.status in ('pending', 'available', 'paid')
          and not ce.self_referral
      ),
      0
    ) as revenue_minor
  from public.creator_product_links l
  left join public.creator_events e on e.link_id = l.id
  left join public.salvya_products p on p.id = l.product_id
  where l.creator_id = p_creator_id
  group by l.id, l.tracking_code, l.product_id, p.title
  order by clicks desc, orders desc;
$$;

grant execute on function public.get_creator_link_performance(uuid) to service_role;
