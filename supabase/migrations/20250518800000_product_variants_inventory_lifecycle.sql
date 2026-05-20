-- Product variants, atomic stock reservations, and lifecycle (draft / scheduled / live / archived).

-- ---------------------------------------------------------------------------
-- Lifecycle columns on salvya_products
-- ---------------------------------------------------------------------------

alter table public.salvya_products
  add column if not exists status text,
  add column if not exists scheduled_at timestamptz,
  add column if not exists published_at timestamptz;

update public.salvya_products
set status = case
  when coalesce(publish_state, case when published then 'published' else 'draft' end) = 'published' then 'live'
  when coalesce(publish_state, 'draft') = 'archived' then 'archived'
  else 'draft'
end
where status is null;

alter table public.salvya_products
  alter column status set default 'draft';

update public.salvya_products set status = 'draft' where status is null;

alter table public.salvya_products
  alter column status set not null;

alter table public.salvya_products
  drop constraint if exists salvya_products_status_check;

alter table public.salvya_products
  add constraint salvya_products_status_check
  check (status in ('draft', 'scheduled', 'live', 'archived'));

-- Backfill published_at for already-live products
update public.salvya_products
set published_at = coalesce(published_at, updated_at)
where status = 'live' and published_at is null;

create or replace function public.salvya_products_sync_lifecycle_flags()
returns trigger
language plpgsql
as $$
begin
  new.published := (new.status = 'live');
  new.publish_state := case new.status
    when 'live' then 'published'
    when 'archived' then 'archived'
    else 'draft'
  end;
  if new.status = 'live' and (tg_op = 'INSERT' or old.status is distinct from 'live') then
    new.published_at := coalesce(new.published_at, now());
  end if;
  return new;
end;
$$;

drop trigger if exists salvya_products_sync_lifecycle_flags_trg on public.salvya_products;

create trigger salvya_products_sync_lifecycle_flags_trg
  before insert or update of status, scheduled_at on public.salvya_products
  for each row
  execute function public.salvya_products_sync_lifecycle_flags();

-- Replace legacy publish_state-only trigger (lifecycle trigger supersedes it)
drop trigger if exists salvya_products_sync_published_flag_trg on public.salvya_products;

update public.salvya_products set published = (status = 'live');
update public.salvya_products
set publish_state = case status when 'live' then 'published' when 'archived' then 'archived' else 'draft' end;

drop policy if exists "salvya_products_public_read_published" on public.salvya_products;
create policy "salvya_products_public_read_published"
  on public.salvya_products for select
  using (status = 'live');

-- ---------------------------------------------------------------------------
-- product_variants
-- ---------------------------------------------------------------------------

create table if not exists public.product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.salvya_products (id) on delete cascade,
  size text,
  color text not null default 'default',
  stock integer not null default 0 check (stock >= 0),
  price_delta_cents integer not null default 0 check (price_delta_cents >= -10000000),
  sku text not null,
  image_override text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists product_variants_product_size_color_uidx
  on public.product_variants (product_id, coalesce(size, ''), color);

create index if not exists product_variants_product_id_idx on public.product_variants (product_id);
create unique index if not exists product_variants_sku_uidx on public.product_variants (sku);

alter table public.product_variants enable row level security;

drop policy if exists "product_variants_admin_all" on public.product_variants;
create policy "product_variants_admin_all"
  on public.product_variants for all
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "product_variants_public_read_live" on public.product_variants;
create policy "product_variants_public_read_live"
  on public.product_variants for select
  using (
    exists (
      select 1 from public.salvya_products p
      where p.id = product_id and p.status = 'live'
    )
  );

create or replace function public.touch_product_variants_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists product_variants_touch_updated_at on public.product_variants;
create trigger product_variants_touch_updated_at
  before update on public.product_variants
  for each row
  execute function public.touch_product_variants_updated_at();

-- ---------------------------------------------------------------------------
-- stock_reservations
-- ---------------------------------------------------------------------------

create table if not exists public.stock_reservations (
  id uuid primary key default gen_random_uuid(),
  product_variant_id uuid not null references public.product_variants (id) on delete cascade,
  quantity integer not null check (quantity > 0),
  status text not null default 'reserved'
    check (status in ('reserved', 'confirmed', 'expired', 'released')),
  expires_at timestamptz not null,
  checkout_session_id text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists stock_reservations_variant_status_idx
  on public.stock_reservations (product_variant_id, status);

create index if not exists stock_reservations_expires_idx
  on public.stock_reservations (expires_at)
  where status = 'reserved';

create unique index if not exists stock_reservations_active_session_variant_uidx
  on public.stock_reservations (checkout_session_id, product_variant_id)
  where status = 'reserved';

alter table public.stock_reservations enable row level security;

drop policy if exists "stock_reservations_service" on public.stock_reservations;
create policy "stock_reservations_service"
  on public.stock_reservations for all
  using (false);

-- ---------------------------------------------------------------------------
-- Backfill: one default variant per product (full legacy stock)
-- ---------------------------------------------------------------------------

insert into public.product_variants (product_id, size, color, stock, sku)
select
  p.id,
  null,
  'default',
  p.stock,
  coalesce(nullif(trim(p.slug), ''), p.id::text) || '-default'
from public.salvya_products p
where not exists (
  select 1 from public.product_variants v where v.product_id = p.id
);

-- ---------------------------------------------------------------------------
-- Promote scheduled products (cron)
-- ---------------------------------------------------------------------------

create or replace function public.promote_scheduled_products()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_count integer;
begin
  update public.salvya_products
  set status = 'live', published_at = coalesce(published_at, now()), updated_at = now()
  where status = 'scheduled'
    and scheduled_at is not null
    and scheduled_at <= now();
  get diagnostics v_count = row_count;
  return v_count;
end;
$$;

revoke all on function public.promote_scheduled_products() from public;
grant execute on function public.promote_scheduled_products() to service_role;

-- ---------------------------------------------------------------------------
-- Release expired reservations (restores variant stock)
-- ---------------------------------------------------------------------------

create or replace function public.release_expired_stock_reservations()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  r record;
  v_count integer := 0;
begin
  for r in
    select id, product_variant_id, quantity
    from public.stock_reservations
    where status = 'reserved' and expires_at <= now()
    for update
  loop
    update public.product_variants
    set stock = stock + r.quantity, updated_at = now()
    where id = r.product_variant_id;

    update public.stock_reservations
    set status = 'expired', updated_at = now()
    where id = r.id;

    v_count := v_count + 1;
  end loop;
  return v_count;
end;
$$;

revoke all on function public.release_expired_stock_reservations() from public;
grant execute on function public.release_expired_stock_reservations() to service_role;

-- ---------------------------------------------------------------------------
-- Reserve variant stock (FOR UPDATE, idempotent per checkout session)
-- ---------------------------------------------------------------------------

create or replace function public.reserve_variant_stock(
  p_variant_id uuid,
  p_qty integer,
  p_checkout_session_id text,
  p_ttl_minutes integer default 15
)
returns table(ok boolean, reservation_id uuid, remaining_stock integer, message text)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_qty integer;
  v_variant public.product_variants%rowtype;
  v_existing public.stock_reservations%rowtype;
  v_res_id uuid;
  v_remaining integer;
  v_product_status text;
begin
  perform public.release_expired_stock_reservations();

  v_qty := greatest(1, coalesce(p_qty, 1));
  if p_variant_id is null or coalesce(trim(p_checkout_session_id), '') = '' then
    return query select false, null::uuid, 0, 'invalid_args';
    return;
  end if;

  select * into v_existing
  from public.stock_reservations
  where checkout_session_id = trim(p_checkout_session_id)
    and product_variant_id = p_variant_id
    and status = 'reserved'
    and expires_at > now()
  limit 1;

  if found then
    select stock into v_remaining from public.product_variants where id = p_variant_id;
    return query select true, v_existing.id, coalesce(v_remaining, 0), 'already_reserved';
    return;
  end if;

  select v.* into v_variant
  from public.product_variants v
  where v.id = p_variant_id
  for update;

  select p.status into v_product_status
  from public.salvya_products p
  where p.id = v_variant.product_id;

  if not found then
    return query select false, null::uuid, 0, 'variant_not_found';
    return;
  end if;

  if v_product_status <> 'live' then
    return query select false, null::uuid, v_variant.stock, 'product_not_live';
    return;
  end if;

  if v_variant.stock < v_qty then
    return query select false, null::uuid, v_variant.stock, 'insufficient_stock';
    return;
  end if;

  update public.product_variants
  set stock = stock - v_qty, updated_at = now()
  where id = p_variant_id;

  insert into public.stock_reservations (
    product_variant_id, quantity, status, expires_at, checkout_session_id
  )
  values (
    p_variant_id,
    v_qty,
    'reserved',
    now() + make_interval(mins => greatest(1, coalesce(p_ttl_minutes, 15))),
    trim(p_checkout_session_id)
  )
  returning id into v_res_id;

  select stock into v_remaining from public.product_variants where id = p_variant_id;
  return query select true, v_res_id, coalesce(v_remaining, 0), 'reserved';
end;
$$;

revoke all on function public.reserve_variant_stock(uuid, integer, text, integer) from public;
grant execute on function public.reserve_variant_stock(uuid, integer, text, integer) to service_role;

-- ---------------------------------------------------------------------------
-- Confirm reservation at order placement (idempotent)
-- ---------------------------------------------------------------------------

create or replace function public.confirm_variant_stock_reservation(
  p_checkout_session_id text,
  p_variant_id uuid,
  p_qty integer
)
returns table(ok boolean, message text)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_qty integer;
  v_res public.stock_reservations%rowtype;
begin
  perform public.release_expired_stock_reservations();
  v_qty := greatest(1, coalesce(p_qty, 1));

  if coalesce(trim(p_checkout_session_id), '') = '' or p_variant_id is null then
    return query select false, 'invalid_args';
    return;
  end if;

  select * into v_res
  from public.stock_reservations
  where checkout_session_id = trim(p_checkout_session_id)
    and product_variant_id = p_variant_id
    and status = 'reserved'
    and expires_at > now()
  order by created_at desc
  limit 1
  for update;

  if found then
    if v_res.quantity < v_qty then
      return query select false, 'reservation_qty_mismatch';
      return;
    end if;
    update public.stock_reservations
    set status = 'confirmed', updated_at = now()
    where id = v_res.id;
    return query select true, 'confirmed';
    return;
  end if;

  -- Already confirmed (retry)
  if exists (
    select 1 from public.stock_reservations
    where checkout_session_id = trim(p_checkout_session_id)
      and product_variant_id = p_variant_id
      and status = 'confirmed'
  ) then
    return query select true, 'already_confirmed';
    return;
  end if;

  return query select false, 'no_active_reservation';
end;
$$;

revoke all on function public.confirm_variant_stock_reservation(text, uuid, integer) from public;
grant execute on function public.confirm_variant_stock_reservation(text, uuid, integer) to service_role;

-- ---------------------------------------------------------------------------
-- Commit stock at checkout (reserve+confirm in one txn if no prior reservation)
-- ---------------------------------------------------------------------------

create or replace function public.commit_variant_stock_for_checkout(
  p_variant_id uuid,
  p_qty integer,
  p_checkout_session_id text
)
returns table(ok boolean, remaining_stock integer, message text)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_qty integer;
  v_confirm_ok boolean;
  v_confirm_msg text;
  v_reserve_ok boolean;
  v_reserve_remaining integer;
  v_reserve_msg text;
  v_remaining integer;
begin
  v_qty := greatest(1, coalesce(p_qty, 1));

  select c.ok, c.message into v_confirm_ok, v_confirm_msg
  from public.confirm_variant_stock_reservation(p_checkout_session_id, p_variant_id, v_qty) c
  limit 1;

  if v_confirm_ok then
    select stock into v_remaining from public.product_variants where id = p_variant_id;
    return query select true, coalesce(v_remaining, 0), v_confirm_msg;
    return;
  end if;

  if v_confirm_msg = 'no_active_reservation' then
    select r.ok, r.remaining_stock, r.message
    into v_reserve_ok, v_reserve_remaining, v_reserve_msg
    from public.reserve_variant_stock(p_variant_id, v_qty, p_checkout_session_id, 15) r
    limit 1;

    if not v_reserve_ok then
      return query select false, coalesce(v_reserve_remaining, 0), v_reserve_msg;
      return;
    end if;

    select c.ok, c.message into v_confirm_ok, v_confirm_msg
    from public.confirm_variant_stock_reservation(p_checkout_session_id, p_variant_id, v_qty) c
    limit 1;

    if v_confirm_ok then
      select stock into v_remaining from public.product_variants where id = p_variant_id;
      return query select true, coalesce(v_remaining, 0), 'committed';
      return;
    end if;
  end if;

  select stock into v_remaining from public.product_variants where id = p_variant_id;
  return query select false, coalesce(v_remaining, 0), coalesce(v_confirm_msg, 'commit_failed');
end;
$$;

revoke all on function public.commit_variant_stock_for_checkout(uuid, integer, text) from public;
grant execute on function public.commit_variant_stock_for_checkout(uuid, integer, text) to service_role;

-- ---------------------------------------------------------------------------
-- Legacy product-level decrement → delegates to default variant
-- ---------------------------------------------------------------------------

create or replace function public.decrement_product_stock(p_product_id uuid, p_qty integer)
returns table(ok boolean, remaining_stock integer)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_variant_id uuid;
  v_ok boolean;
  v_remaining integer;
begin
  select id into v_variant_id
  from public.product_variants
  where product_id = p_product_id
  order by created_at asc
  limit 1;

  if v_variant_id is null then
    return query select false, 0;
    return;
  end if;

  select c.ok, c.remaining_stock into v_ok, v_remaining
  from public.commit_variant_stock_for_checkout(
    v_variant_id,
    p_qty,
    'legacy-' || p_product_id::text
  ) c
  limit 1;

  return query select coalesce(v_ok, false), coalesce(v_remaining, 0);
end;
$$;
