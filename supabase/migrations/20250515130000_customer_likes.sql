-- Salvya customer likes (one JSON document per authenticated user).

create table if not exists public.customer_likes (
  user_id uuid primary key references auth.users (id) on delete cascade,
  items jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);

create index if not exists customer_likes_updated_at_idx on public.customer_likes (updated_at desc);

alter table public.customer_likes enable row level security;

create policy "Users read own likes"
  on public.customer_likes
  for select
  using (auth.uid() = user_id);

create policy "Users insert own likes"
  on public.customer_likes
  for insert
  with check (auth.uid() = user_id);

create policy "Users update own likes"
  on public.customer_likes
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users delete own likes"
  on public.customer_likes
  for delete
  using (auth.uid() = user_id);
