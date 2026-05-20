-- Salvya artist follows (one JSON document per authenticated user).

create table if not exists public.customer_artist_follows (
  user_id uuid primary key references auth.users (id) on delete cascade,
  follows jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);

create index if not exists customer_artist_follows_updated_at_idx on public.customer_artist_follows (updated_at desc);

alter table public.customer_artist_follows enable row level security;

create policy "Users read own follows"
  on public.customer_artist_follows
  for select
  using (auth.uid() = user_id);

create policy "Users insert own follows"
  on public.customer_artist_follows
  for insert
  with check (auth.uid() = user_id);

create policy "Users update own follows"
  on public.customer_artist_follows
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users delete own follows"
  on public.customer_artist_follows
  for delete
  using (auth.uid() = user_id);
