-- Creator Phase 2 — product promo links (selection + lightweight tracking).

create table if not exists public.creator_product_links (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid not null references auth.users (id) on delete cascade,
  product_id uuid not null references public.salvya_products (id) on delete cascade,
  creator_code text not null,
  tracking_code text not null unique,
  slug text not null,
  clicks_count integer not null default 0 check (clicks_count >= 0),
  orders_count integer not null default 0 check (orders_count >= 0),
  created_at timestamptz not null default now(),
  unique (creator_id, product_id)
);

create index if not exists creator_product_links_creator_created_idx
  on public.creator_product_links (creator_id, created_at desc);

create index if not exists creator_product_links_tracking_code_idx
  on public.creator_product_links (tracking_code);

alter table public.creator_product_links enable row level security;

drop policy if exists "creator_links_select_own" on public.creator_product_links;
create policy "creator_links_select_own"
  on public.creator_product_links for select
  using (auth.uid() = creator_id);

drop policy if exists "creator_links_insert_own" on public.creator_product_links;
create policy "creator_links_insert_own"
  on public.creator_product_links for insert
  with check (auth.uid() = creator_id);

drop policy if exists "creator_links_admin_all" on public.creator_product_links;
create policy "creator_links_admin_all"
  on public.creator_product_links for all
  using (public.is_admin())
  with check (public.is_admin());

-- Lightweight click increment (called from public redirect route via service role).
create or replace function public.increment_creator_link_click(p_tracking_code text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.creator_product_links
  set clicks_count = clicks_count + 1
  where tracking_code = p_tracking_code;
end;
$$;

grant execute on function public.increment_creator_link_click(text) to service_role;
