-- Salvya admin catalog + admin access to orders (RLS defense-in-depth).
-- Requires public.is_admin() from user_profiles RBAC migration.

-- ---------------------------------------------------------------------------
-- Products (admin-managed; published rows optionally visible to storefront)
-- ---------------------------------------------------------------------------

create table if not exists public.salvya_products (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  slug text not null unique,
  artist_slug text not null,
  price_cents integer not null default 0 check (price_cents >= 0),
  category text not null default 'other'
    check (category in ('hoodie', 'tee', 'accessories', 'other')),
  images text[] not null default '{}'::text[],
  stock integer not null default 0 check (stock >= 0),
  is_limited_drop boolean not null default false,
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists salvya_products_artist_slug_idx on public.salvya_products (artist_slug);
create index if not exists salvya_products_created_at_idx on public.salvya_products (created_at desc);

alter table public.salvya_products enable row level security;

drop policy if exists "salvya_products_admin_select" on public.salvya_products;
create policy "salvya_products_admin_select"
  on public.salvya_products for select
  using (public.is_admin());

drop policy if exists "salvya_products_admin_insert" on public.salvya_products;
create policy "salvya_products_admin_insert"
  on public.salvya_products for insert
  with check (public.is_admin());

drop policy if exists "salvya_products_admin_update" on public.salvya_products;
create policy "salvya_products_admin_update"
  on public.salvya_products for update
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "salvya_products_admin_delete" on public.salvya_products;
create policy "salvya_products_admin_delete"
  on public.salvya_products for delete
  using (public.is_admin());

drop policy if exists "salvya_products_public_read_published" on public.salvya_products;
create policy "salvya_products_public_read_published"
  on public.salvya_products for select
  using (published = true);

create or replace function public.touch_salvya_products_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists salvya_products_touch_updated_at on public.salvya_products;

create trigger salvya_products_touch_updated_at
  before update on public.salvya_products
  for each row
  execute function public.touch_salvya_products_updated_at();

-- ---------------------------------------------------------------------------
-- Orders: admins may read/update lifecycle (service role still used in APIs)
-- ---------------------------------------------------------------------------

drop policy if exists "Admins read all orders" on public.customer_orders;
create policy "Admins read all orders"
  on public.customer_orders for select
  using (public.is_admin());

drop policy if exists "Admins update all orders" on public.customer_orders;
create policy "Admins update all orders"
  on public.customer_orders for update
  using (public.is_admin())
  with check (public.is_admin());
