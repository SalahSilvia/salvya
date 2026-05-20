-- Ensure orders_count exists on older partial creator_product_links tables.
alter table public.creator_product_links
  add column if not exists orders_count integer not null default 0;

alter table public.creator_product_links
  add column if not exists clicks_count integer not null default 0;
