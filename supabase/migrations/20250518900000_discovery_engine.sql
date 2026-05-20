-- Discovery engine: product metrics, recently viewed, trending precompute support.

-- ---------------------------------------------------------------------------
-- product_metrics (precomputed by cron; read by storefront/search)
-- ---------------------------------------------------------------------------

create table if not exists public.product_metrics (
  product_id uuid primary key references public.salvya_products (id) on delete cascade,
  views_24h integer not null default 0 check (views_24h >= 0),
  views_7d integer not null default 0 check (views_7d >= 0),
  sales_24h integer not null default 0 check (sales_24h >= 0),
  sales_7d integer not null default 0 check (sales_7d >= 0),
  cart_adds integer not null default 0 check (cart_adds >= 0),
  conversion_rate numeric(8, 4) not null default 0 check (conversion_rate >= 0),
  trending_score numeric(12, 2) not null default 0,
  popularity_score numeric(12, 2) not null default 0,
  metrics_updated_at timestamptz not null default now()
);

create index if not exists product_metrics_trending_idx
  on public.product_metrics (trending_score desc);

alter table public.product_metrics enable row level security;

drop policy if exists "product_metrics_public_read" on public.product_metrics;
create policy "product_metrics_public_read"
  on public.product_metrics for select
  using (true);

drop policy if exists "product_metrics_admin_all" on public.product_metrics;
create policy "product_metrics_admin_all"
  on public.product_metrics for all
  using (public.is_admin())
  with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- user_recent_views (last 20 per user, 10 min dedupe via app logic)
-- ---------------------------------------------------------------------------

create table if not exists public.user_recent_views (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  product_id uuid not null references public.salvya_products (id) on delete cascade,
  viewed_at timestamptz not null default now(),
  unique (user_id, product_id)
);

create index if not exists user_recent_views_user_viewed_idx
  on public.user_recent_views (user_id, viewed_at desc);

alter table public.user_recent_views enable row level security;

drop policy if exists "user_recent_views_own_select" on public.user_recent_views;
create policy "user_recent_views_own_select"
  on public.user_recent_views for select
  using (auth.uid() = user_id);

drop policy if exists "user_recent_views_own_insert" on public.user_recent_views;
create policy "user_recent_views_own_insert"
  on public.user_recent_views for insert
  with check (auth.uid() = user_id);

drop policy if exists "user_recent_views_own_update" on public.user_recent_views;
create policy "user_recent_views_own_update"
  on public.user_recent_views for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "user_recent_views_own_delete" on public.user_recent_views;
create policy "user_recent_views_own_delete"
  on public.user_recent_views for delete
  using (auth.uid() = user_id);

-- Trim to 20 most recent views per user
create or replace function public.trim_user_recent_views(p_user_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  delete from public.user_recent_views u
  where u.user_id = p_user_id
    and u.id not in (
      select id from public.user_recent_views
      where user_id = p_user_id
      order by viewed_at desc
      limit 20
    );
end;
$$;

revoke all on function public.trim_user_recent_views(uuid) from public;
grant execute on function public.trim_user_recent_views(uuid) to service_role;
