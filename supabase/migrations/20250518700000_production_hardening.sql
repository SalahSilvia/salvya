-- Production hardening: refund governance, FX rates, reconciliation, fraud persistence.

-- Refund governance columns
alter table public.customer_orders
  add column if not exists refund_eligibility_checked_at timestamptz,
  add column if not exists order_locked boolean not null default false,
  add column if not exists refund_policy_code text,
  add column if not exists fraud_score smallint not null default 0;

-- Extend refund_status with processed
alter table public.customer_orders drop constraint if exists customer_orders_refund_status_check;
alter table public.customer_orders
  add constraint customer_orders_refund_status_check check (
    refund_status is null
    or refund_status in ('requested', 'approved', 'rejected', 'refunded', 'failed', 'processed')
  );

-- payment_recovered lifecycle
alter table public.customer_orders drop constraint if exists customer_orders_payment_status_check;
alter table public.customer_orders
  add constraint customer_orders_payment_status_check check (
    payment_status in (
      'pending',
      'awaiting_payment_verification',
      'authorized',
      'paid',
      'cod_pending',
      'failed',
      'refunded',
      'refund_requested',
      'refund_approved',
      'refund_rejected',
      'payment_abandoned',
      'payment_failed',
      'payment_recovered'
    )
  );

create index if not exists customer_orders_fraud_score_idx
  on public.customer_orders (fraud_score desc)
  where fraud_score > 0;

create index if not exists customer_orders_order_locked_idx
  on public.customer_orders (order_locked)
  where order_locked = true;

-- FX governance (admin-managed; env is fallback only)
create table if not exists public.fx_rates (
  id uuid primary key default gen_random_uuid(),
  base_currency text not null check (base_currency in ('EUR', 'USD', 'MAD')),
  quote_currency text not null check (quote_currency in ('EUR', 'USD', 'MAD')),
  rate numeric(18, 8) not null check (rate > 0),
  effective_at timestamptz not null default now(),
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  unique (base_currency, quote_currency, effective_at)
);

create index if not exists fx_rates_pair_effective_idx
  on public.fx_rates (base_currency, quote_currency, effective_at desc);

create table if not exists public.fx_rate_history (
  id uuid primary key default gen_random_uuid(),
  base_currency text not null,
  quote_currency text not null,
  rate numeric(18, 8) not null,
  effective_at timestamptz not null,
  archived_at timestamptz not null default now(),
  actor_user_id uuid references auth.users (id) on delete set null
);

-- Daily reconciliation snapshots
create table if not exists public.daily_sales_reports (
  id uuid primary key default gen_random_uuid(),
  report_date date not null unique,
  db_paid_total_eur numeric(14, 2) not null default 0,
  db_refunded_total_eur numeric(14, 2) not null default 0,
  paypal_estimate_eur numeric(14, 2) not null default 0,
  paid_order_count int not null default 0,
  mismatch_count int not null default 0,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.payment_mismatch_alerts (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references public.customer_orders (id) on delete cascade,
  alert_type text not null check (
    alert_type in (
      'paypal_paid_db_unpaid',
      'db_paid_paypal_missing_capture',
      'stale_paypal_pending',
      'amount_mismatch',
      'duplicate_capture'
    )
  ),
  severity text not null default 'warning' check (severity in ('info', 'warning', 'critical')),
  details jsonb not null default '{}'::jsonb,
  resolved_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists payment_mismatch_alerts_open_idx
  on public.payment_mismatch_alerts (created_at desc)
  where resolved_at is null;

-- Persistent fraud events
create table if not exists public.fraud_events (
  id uuid primary key default gen_random_uuid(),
  event_type text not null,
  user_id uuid references auth.users (id) on delete set null,
  order_id uuid references public.customer_orders (id) on delete set null,
  email text,
  ip text,
  fraud_score_delta smallint not null default 1,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists fraud_events_created_idx
  on public.fraud_events (created_at desc);

create index if not exists fraud_events_user_idx
  on public.fraud_events (user_id, created_at desc)
  where user_id is not null;

alter table public.fx_rates enable row level security;
alter table public.fx_rate_history enable row level security;
alter table public.daily_sales_reports enable row level security;
alter table public.payment_mismatch_alerts enable row level security;
alter table public.fraud_events enable row level security;

create policy "Admins read fx_rates"
  on public.fx_rates for select
  using (
    exists (
      select 1 from public.user_profiles up
      where up.user_id = auth.uid() and up.role in ('admin', 'god_admin')
    )
  );

create policy "Admins read daily_sales_reports"
  on public.daily_sales_reports for select
  using (
    exists (
      select 1 from public.user_profiles up
      where up.user_id = auth.uid() and up.role in ('admin', 'god_admin')
    )
  );

create policy "Admins read payment_mismatch_alerts"
  on public.payment_mismatch_alerts for select
  using (
    exists (
      select 1 from public.user_profiles up
      where up.user_id = auth.uid() and up.role in ('admin', 'god_admin')
    )
  );

create policy "Admins read fraud_events"
  on public.fraud_events for select
  using (
    exists (
      select 1 from public.user_profiles up
      where up.user_id = auth.uid() and up.role in ('admin', 'god_admin')
    )
  );

-- Seed default FX from common env fallbacks (service role can upsert later)
insert into public.fx_rates (base_currency, quote_currency, rate, effective_at)
values
  ('EUR', 'USD', 1.08, now()),
  ('EUR', 'MAD', 10.8, now()),
  ('MAD', 'USD', 0.1, now())
on conflict do nothing;
