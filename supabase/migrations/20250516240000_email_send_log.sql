-- Transactional email send audit log (admin Email Center).

create table if not exists public.email_send_log (
  id uuid primary key default gen_random_uuid(),
  template_id text not null,
  to_email text not null,
  subject text not null,
  status text not null check (status in ('sent', 'queued', 'failed', 'skipped')),
  error text,
  meta jsonb,
  created_at timestamptz not null default now()
);

create index if not exists email_send_log_created_idx on public.email_send_log (created_at desc);
create index if not exists email_send_log_template_idx on public.email_send_log (template_id, created_at desc);

alter table public.email_send_log enable row level security;

-- No public policies; admin APIs use service role.
