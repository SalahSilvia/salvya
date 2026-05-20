-- Salvya customer bag (one JSON document per authenticated user).
-- Run in Supabase SQL editor or via CLI: supabase db push

create table if not exists public.customer_carts (
  user_id uuid primary key references auth.users (id) on delete cascade,
  lines jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);

create index if not exists customer_carts_updated_at_idx on public.customer_carts (updated_at desc);

alter table public.customer_carts enable row level security;

create policy "Users read own cart"
  on public.customer_carts
  for select
  using (auth.uid() = user_id);

create policy "Users insert own cart"
  on public.customer_carts
  for insert
  with check (auth.uid() = user_id);

create policy "Users update own cart"
  on public.customer_carts
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users delete own cart"
  on public.customer_carts
  for delete
  using (auth.uid() = user_id);
