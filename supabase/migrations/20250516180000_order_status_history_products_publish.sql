-- Order fulfillment audit trail + catalog publish workflow extensions.

-- ---------------------------------------------------------------------------
-- order_status_history: append-only lifecycle log (admin/service writes)
-- ---------------------------------------------------------------------------

create table if not exists public.order_status_history (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.customer_orders (id) on delete cascade,
  fulfillment_status text not null
    check (fulfillment_status in ('confirmed', 'preparing', 'shipped', 'delivered', 'cancelled')),
  payment_status text
    check (
      payment_status is null
      or payment_status in ('pending', 'authorized', 'paid', 'cod_pending', 'failed')
    ),
  previous_fulfillment text,
  note text,
  actor_user_id uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists order_status_history_order_id_created_idx
  on public.order_status_history (order_id, created_at desc);

alter table public.order_status_history enable row level security;

drop policy if exists "order_status_history_admin_select" on public.order_status_history;
create policy "order_status_history_admin_select"
  on public.order_status_history for select
  using (public.is_admin());

-- ---------------------------------------------------------------------------
-- salvya_products: low stock + publish_state (keeps legacy `published` in sync)
-- ---------------------------------------------------------------------------

alter table public.salvya_products
  add column if not exists low_stock_threshold integer not null default 5
  check (low_stock_threshold >= 0);

alter table public.salvya_products
  add column if not exists publish_state text;

update public.salvya_products
set publish_state = case when published then 'published' else 'draft' end
where publish_state is null;

alter table public.salvya_products
  alter column publish_state set default 'draft';

alter table public.salvya_products
  alter column publish_state set not null;

alter table public.salvya_products
  drop constraint if exists salvya_products_publish_state_check;

alter table public.salvya_products
  add constraint salvya_products_publish_state_check
  check (publish_state in ('draft', 'published', 'archived'));

create or replace function public.salvya_products_sync_published_flag()
returns trigger
language plpgsql
as $$
begin
  new.published := (new.publish_state = 'published');
  return new;
end;
$$;

drop trigger if exists salvya_products_sync_published_flag_trg on public.salvya_products;

create trigger salvya_products_sync_published_flag_trg
  before insert or update on public.salvya_products
  for each row
  execute function public.salvya_products_sync_published_flag();

-- Align legacy boolean with publish_state
update public.salvya_products set published = (publish_state = 'published');

drop policy if exists "salvya_products_public_read_published" on public.salvya_products;
create policy "salvya_products_public_read_published"
  on public.salvya_products for select
  using (publish_state = 'published');
