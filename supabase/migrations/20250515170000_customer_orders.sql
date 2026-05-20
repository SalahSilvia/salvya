-- Salvya customer orders (checkout confirm creates a real order row).

create table if not exists public.customer_orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique,
  placement_key text not null unique,
  user_id uuid references auth.users (id) on delete set null,
  checkout_path text not null,
  line_item jsonb not null,
  shipping jsonb not null,
  payment jsonb not null,
  fulfillment_status text not null default 'confirmed'
    check (fulfillment_status in ('confirmed', 'preparing', 'shipped', 'delivered', 'cancelled')),
  payment_status text not null default 'pending'
    check (payment_status in ('pending', 'authorized', 'paid', 'cod_pending', 'failed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists customer_orders_user_id_idx on public.customer_orders (user_id, created_at desc);
create index if not exists customer_orders_buyer_email_idx on public.customer_orders (lower((shipping->>'buyerEmail')::text));

alter table public.customer_orders enable row level security;

create policy "Users read own orders"
  on public.customer_orders
  for select
  using (auth.uid() = user_id);
