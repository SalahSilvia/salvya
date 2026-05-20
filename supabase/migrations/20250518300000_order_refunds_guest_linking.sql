-- Refund lifecycle + idempotency for admin PayPal refunds.

alter table public.customer_orders
  add column if not exists refund_status text
    check (refund_status is null or refund_status in ('requested', 'refunded', 'failed')),
  add column if not exists refund_amount numeric(12, 2),
  add column if not exists refund_reason text,
  add column if not exists refunded_at timestamptz,
  add column if not exists refund_idempotency_key text,
  add column if not exists paypal_refund_id text;

create unique index if not exists customer_orders_refund_idempotency_key_unique
  on public.customer_orders (refund_idempotency_key)
  where refund_idempotency_key is not null;

create index if not exists customer_orders_refund_status_idx
  on public.customer_orders (refund_status, refunded_at desc)
  where refund_status is not null;
