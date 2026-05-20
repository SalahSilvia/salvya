-- Admin-persisted store configuration (key-value JSON)

create table if not exists public.store_settings (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create index if not exists store_settings_updated_at_idx on public.store_settings (updated_at desc);

alter table public.store_settings enable row level security;

-- No public policies: admin APIs use service role only.

create or replace function public.store_settings_touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists store_settings_updated_at on public.store_settings;
create trigger store_settings_updated_at
  before update on public.store_settings
  for each row execute function public.store_settings_touch_updated_at();
