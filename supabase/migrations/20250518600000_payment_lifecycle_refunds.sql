-- Payment lifecycle: production window, refund states, audit log, abandoned checkout.

-- Relax and replace payment_status / refund_status checks
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
      'payment_failed'
    )
  );

alter table public.customer_orders drop constraint if exists customer_orders_refund_status_check;
alter table public.customer_orders
  add constraint customer_orders_refund_status_check check (
    refund_status is null
    or refund_status in ('requested', 'approved', 'rejected', 'refunded', 'failed')
  );

alter table public.customer_orders
  add column if not exists production_status text not null default 'pending'
    check (production_status in ('pending', 'queued', 'in_production', 'shipped')),
  add column if not exists production_starts_at timestamptz,
  add column if not exists refund_requested_at timestamptz,
  add column if not exists refund_processed_at timestamptz,
  add column if not exists refund_reference_id text,
  add column if not exists payment_abandoned_at timestamptz,
  add column if not exists payment_failed_at timestamptz;

create index if not exists customer_orders_production_status_idx
  on public.customer_orders (production_status, production_starts_at);

create index if not exists customer_orders_payment_abandoned_idx
  on public.customer_orders (payment_abandoned_at desc)
  where payment_abandoned_at is not null;

comment on column public.customer_orders.production_starts_at is
  'Scheduled production start; refund window closes 24h before this instant.';

-- Immutable payment / refund audit trail (service role writes)
create table if not exists public.payment_audit_logs (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references public.customer_orders (id) on delete set null,
  event_type text not null,
  status_before text,
  status_after text,
  metadata jsonb not null default '{}'::jsonb,
  actor_user_id uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists payment_audit_logs_order_id_idx
  on public.payment_audit_logs (order_id, created_at desc);

create index if not exists payment_audit_logs_event_type_idx
  on public.payment_audit_logs (event_type, created_at desc);

alter table public.payment_audit_logs enable row level security;

create policy "Admins read payment audit logs"
  on public.payment_audit_logs
  for select
  using (
    exists (
      select 1 from public.user_profiles up
      where up.user_id = auth.uid() and up.role in ('admin', 'god_admin')
    )
  );

-- Abandoned checkout recovery (optional guest email keyed by placement)
create table if not exists public.abandoned_checkouts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete cascade,
  buyer_email text,
  placement_key text,
  checkout_path text,
  cart_lines jsonb not null default '[]'::jsonb,
  paypal_order_id text,
  abandoned_at timestamptz not null default now(),
  recovery_email_sent_at timestamptz,
  recovered_at timestamptz
);

create index if not exists abandoned_checkouts_user_id_idx
  on public.abandoned_checkouts (user_id, abandoned_at desc);

create unique index if not exists abandoned_checkouts_placement_key_unique
  on public.abandoned_checkouts (placement_key)
  where placement_key is not null;

alter table public.abandoned_checkouts enable row level security;

create policy "Users read own abandoned checkouts"
  on public.abandoned_checkouts
  for select
  using (auth.uid() = user_id);
