-- Multi-market product pricing, immutable order snapshots, atomic stock decrement.

-- ---------------------------------------------------------------------------
-- Products: regional list prices (EUR / USD / MAD) + optional JSON overrides
-- ---------------------------------------------------------------------------

alter table public.salvya_products
  add column if not exists price_eur numeric(10, 2),
  add column if not exists price_usd numeric(10, 2),
  add column if not exists price_mad numeric(10, 2),
  add column if not exists market_prices jsonb not null default '{}'::jsonb,
  add column if not exists reserved_stock integer not null default 0 check (reserved_stock >= 0);

-- Backfill from legacy price_cents (treated as EUR) or category defaults
update public.salvya_products p
set
  price_eur = coalesce(
    p.price_eur,
    case when p.price_cents > 0 then round(p.price_cents::numeric / 100, 2) else null end,
    case when p.category = 'tee' then 28 else 45 end
  ),
  price_usd = coalesce(
    p.price_usd,
    case when p.category = 'tee' then 30 else 49 end
  ),
  price_mad = coalesce(
    p.price_mad,
    case when p.category = 'tee' then 175 else 250 end
  ),
  market_prices = case
    when p.market_prices = '{}'::jsonb or p.market_prices is null then jsonb_build_object(
      'MA', jsonb_build_object('currency', 'MAD', 'price', coalesce(p.price_mad, case when p.category = 'tee' then 175 else 250 end)),
      'EU', jsonb_build_object('currency', 'EUR', 'price', coalesce(p.price_eur, case when p.category = 'tee' then 28 else 45 end)),
      'US', jsonb_build_object('currency', 'USD', 'price', coalesce(p.price_usd, case when p.category = 'tee' then 30 else 49 end))
    )
    else p.market_prices
  end
where p.price_eur is null or p.price_usd is null or p.price_mad is null;

-- Keep price_cents aligned with EUR for legacy readers
update public.salvya_products
set price_cents = greatest(0, round(coalesce(price_eur, 0) * 100)::integer)
where price_eur is not null;

create unique index if not exists salvya_products_artist_slug_slug_unique
  on public.salvya_products (artist_slug, slug);

-- ---------------------------------------------------------------------------
-- Orders: frozen commercial terms at purchase time
-- ---------------------------------------------------------------------------

alter table public.customer_orders
  add column if not exists product_snapshot jsonb,
  add column if not exists final_price numeric(12, 2),
  add column if not exists order_currency text,
  add column if not exists market_code text;

-- ---------------------------------------------------------------------------
-- Atomic stock reservation (service role / security definer)
-- ---------------------------------------------------------------------------

create or replace function public.decrement_product_stock(p_product_id uuid, p_qty integer)
returns table(ok boolean, remaining_stock integer)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_stock integer;
  v_qty integer := greatest(1, coalesce(p_qty, 1));
begin
  if p_product_id is null then
    return query select false, 0;
    return;
  end if;

  update public.salvya_products
  set
    stock = stock - v_qty,
    updated_at = now()
  where id = p_product_id
    and stock >= v_qty
  returning stock into v_stock;

  if found then
    return query select true, v_stock;
  end if;

  select stock into v_stock from public.salvya_products where id = p_product_id;
  return query select false, coalesce(v_stock, 0);
end;
$$;

revoke all on function public.decrement_product_stock(uuid, integer) from public;
grant execute on function public.decrement_product_stock(uuid, integer) to service_role;
