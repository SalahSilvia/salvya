-- PayPal server verification metadata + safer payment_status values.

alter table public.customer_orders
  add column if not exists paypal_order_id text,
  add column if not exists paypal_capture_id text,
  add column if not exists paypal_verified_at timestamptz;

create unique index if not exists customer_orders_paypal_order_id_unique
  on public.customer_orders (paypal_order_id)
  where paypal_order_id is not null;

create unique index if not exists customer_orders_paypal_capture_id_unique
  on public.customer_orders (paypal_capture_id)
  where paypal_capture_id is not null;

create index if not exists customer_orders_paypal_verified_at_idx
  on public.customer_orders (paypal_verified_at desc)
  where paypal_verified_at is not null;

alter table public.customer_orders drop constraint if exists customer_orders_payment_status_check;

alter table public.customer_orders add constraint customer_orders_payment_status_check
  check (
    payment_status in (
      'pending',
      'awaiting_payment_verification',
      'authorized',
      'paid',
      'cod_pending',
      'failed',
      'refunded'
    )
  );

alter table public.order_status_history drop constraint if exists order_status_history_payment_status_check;

alter table public.order_status_history add constraint order_status_history_payment_status_check
  check (
    payment_status is null
    or payment_status in (
      'pending',
      'awaiting_payment_verification',
      'authorized',
      'paid',
      'cod_pending',
      'failed',
      'refunded'
    )
  );
