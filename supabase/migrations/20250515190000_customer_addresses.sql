-- Salvya saved shipping addresses (per authenticated customer).

create table if not exists public.customer_addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  full_name text not null,
  phone text not null,
  address_line_1 text not null,
  address_line_2 text,
  city text,
  region text,
  postal_code text,
  country text not null,
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists customer_addresses_user_id_idx
  on public.customer_addresses (user_id, created_at desc);

create index if not exists customer_addresses_default_idx
  on public.customer_addresses (user_id, is_default)
  where is_default;

alter table public.customer_addresses enable row level security;

create policy "customer_addresses_select_own"
  on public.customer_addresses
  for select
  using (auth.uid() = user_id);

create policy "customer_addresses_insert_own"
  on public.customer_addresses
  for insert
  with check (auth.uid() = user_id);

create policy "customer_addresses_update_own"
  on public.customer_addresses
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "customer_addresses_delete_own"
  on public.customer_addresses
  for delete
  using (auth.uid() = user_id);

-- Keep updated_at fresh on row changes.
create or replace function public.touch_customer_addresses_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists customer_addresses_touch_updated_at on public.customer_addresses;

create trigger customer_addresses_touch_updated_at
  before update on public.customer_addresses
  for each row
  execute function public.touch_customer_addresses_updated_at();

-- At most one default address per user: clearing others when setting default true.
create or replace function public.customer_addresses_single_default()
returns trigger
language plpgsql
as $$
begin
  if new.is_default then
    update public.customer_addresses ca
    set is_default = false
    where ca.user_id = new.user_id
      and ca.id is distinct from new.id;
  end if;
  return new;
end;
$$;

drop trigger if exists customer_addresses_enforce_default on public.customer_addresses;

create trigger customer_addresses_enforce_default
  before insert or update of is_default on public.customer_addresses
  for each row
  execute function public.customer_addresses_single_default();

-- Optional linkage from orders to the saved row used at checkout (auth users only).
alter table public.customer_orders
  add column if not exists shipping_address_id uuid references public.customer_addresses (id) on delete set null;

create index if not exists customer_orders_shipping_address_id_idx
  on public.customer_orders (shipping_address_id)
  where shipping_address_id is not null;
