-- Salvya member notification inbox + channel prefs (one row per user).

create table if not exists public.customer_notifications (
  user_id uuid primary key references auth.users (id) on delete cascade,
  items jsonb not null default '[]'::jsonb,
  prefs jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create index if not exists customer_notifications_updated_at_idx on public.customer_notifications (updated_at desc);

alter table public.customer_notifications enable row level security;

create policy "Users read own notifications"
  on public.customer_notifications
  for select
  using (auth.uid() = user_id);

create policy "Users insert own notifications"
  on public.customer_notifications
  for insert
  with check (auth.uid() = user_id);

create policy "Users update own notifications"
  on public.customer_notifications
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users delete own notifications"
  on public.customer_notifications
  for delete
  using (auth.uid() = user_id);
