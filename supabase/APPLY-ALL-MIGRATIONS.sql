-- ================================================================================
-- SALVYA — APPLY ALL MIGRATIONS (single batch for Supabase SQL Editor)
-- Generated: 2026-05-20T16:47:53.642Z
-- Files: 40 migrations (oldest → newest)
--
-- HOW TO RUN (production launch):
--   1. Supabase Dashboard → SQL Editor → New query
--   2. Paste this entire file and Run
--   3. On success, run supabase/PROMOTE-ADMIN.sql (edit your user id/email)
--   4. cd web && npm run db:verify
--
-- Re-generate after adding migrations:
--   npm run db:bundle
-- ================================================================================



-- ========== 20250515120000_customer_carts.sql ==========

-- Salvya customer bag (one JSON document per authenticated user).
-- Run in Supabase SQL editor or via CLI: supabase db push

create table if not exists public.customer_carts (
  user_id uuid primary key references auth.users (id) on delete cascade,
  lines jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);

create index if not exists customer_carts_updated_at_idx on public.customer_carts (updated_at desc);

alter table public.customer_carts enable row level security;

create policy "Users read own cart"
  on public.customer_carts
  for select
  using (auth.uid() = user_id);

create policy "Users insert own cart"
  on public.customer_carts
  for insert
  with check (auth.uid() = user_id);

create policy "Users update own cart"
  on public.customer_carts
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users delete own cart"
  on public.customer_carts
  for delete
  using (auth.uid() = user_id);


-- ========== 20250515130000_customer_likes.sql ==========

-- Salvya customer likes (one JSON document per authenticated user).

create table if not exists public.customer_likes (
  user_id uuid primary key references auth.users (id) on delete cascade,
  items jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);

create index if not exists customer_likes_updated_at_idx on public.customer_likes (updated_at desc);

alter table public.customer_likes enable row level security;

create policy "Users read own likes"
  on public.customer_likes
  for select
  using (auth.uid() = user_id);

create policy "Users insert own likes"
  on public.customer_likes
  for insert
  with check (auth.uid() = user_id);

create policy "Users update own likes"
  on public.customer_likes
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users delete own likes"
  on public.customer_likes
  for delete
  using (auth.uid() = user_id);


-- ========== 20250515140000_customer_artist_follows.sql ==========

-- Salvya artist follows (one JSON document per authenticated user).

create table if not exists public.customer_artist_follows (
  user_id uuid primary key references auth.users (id) on delete cascade,
  follows jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);

create index if not exists customer_artist_follows_updated_at_idx on public.customer_artist_follows (updated_at desc);

alter table public.customer_artist_follows enable row level security;

create policy "Users read own follows"
  on public.customer_artist_follows
  for select
  using (auth.uid() = user_id);

create policy "Users insert own follows"
  on public.customer_artist_follows
  for insert
  with check (auth.uid() = user_id);

create policy "Users update own follows"
  on public.customer_artist_follows
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users delete own follows"
  on public.customer_artist_follows
  for delete
  using (auth.uid() = user_id);


-- ========== 20250515150000_product_reviews.sql ==========

-- Public product comments / reviews (one row per user per product).

create table if not exists public.product_reviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  artist_slug text not null,
  product_kind text not null check (product_kind in ('hoodie', 'tshirt')),
  item_slug text not null,
  author_label text not null,
  rating int not null check (rating >= 1 and rating <= 5),
  body text not null check (char_length(body) >= 1 and char_length(body) <= 2000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, artist_slug, product_kind, item_slug)
);

create index if not exists product_reviews_product_idx
  on public.product_reviews (artist_slug, product_kind, item_slug, created_at desc);

create index if not exists product_reviews_user_idx on public.product_reviews (user_id);

alter table public.product_reviews enable row level security;

create policy "Anyone can read product reviews"
  on public.product_reviews
  for select
  using (true);

create policy "Users insert own review"
  on public.product_reviews
  for insert
  with check (auth.uid() = user_id);

create policy "Users update own review"
  on public.product_reviews
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users delete own review"
  on public.product_reviews
  for delete
  using (auth.uid() = user_id);


-- ========== 20250515160000_customer_notifications.sql ==========

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


-- ========== 20250515170000_customer_orders.sql ==========

-- Salvya customer orders (checkout confirm creates a real order row).

create table if not exists public.customer_orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique,
  placement_key text not null unique,
  user_id uuid references auth.users (id) on delete set null,
  checkout_path text not null,
  line_item jsonb not null,
  shipping jsonb not null,
  payment jsonb not null,
  fulfillment_status text not null default 'confirmed'
    check (fulfillment_status in ('confirmed', 'preparing', 'shipped', 'delivered', 'cancelled')),
  payment_status text not null default 'pending'
    check (payment_status in ('pending', 'authorized', 'paid', 'cod_pending', 'failed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists customer_orders_user_id_idx on public.customer_orders (user_id, created_at desc);
create index if not exists customer_orders_buyer_email_idx on public.customer_orders (lower((shipping->>'buyerEmail')::text));

alter table public.customer_orders enable row level security;

create policy "Users read own orders"
  on public.customer_orders
  for select
  using (auth.uid() = user_id);


-- ========== 20250515180000_user_profiles_rbac.sql ==========

-- =============================================================================
-- Salvya RBAC — run this ENTIRE file in Supabase SQL Editor as one batch.
-- Do NOT paste UI text (e.g. "Search"); only this SQL. Line-1 errors usually
-- mean non-SQL was pasted.
--
-- Trigger syntax: PostgreSQL 14+ uses EXECUTE FUNCTION … If your DB errors,
-- replace with: EXECUTE PROCEDURE public.handle_new_user_profile();
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1) Table + helper functions + trigger (before RLS policies that call is_admin)
-- -----------------------------------------------------------------------------

create table if not exists public.user_profiles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  role text not null default 'customer' check (role in ('customer', 'influencer', 'admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists user_profiles_role_idx on public.user_profiles (role);

-- Normalize signup metadata; never grant admin via self-signup.
create or replace function public.normalize_signup_role(meta_role text)
returns text
language plpgsql
immutable
as $$
begin
  if meta_role in ('influencer', 'creator') then
    return 'influencer';
  end if;
  return 'customer';
end;
$$;

create or replace function public.handle_new_user_profile()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  meta_role text;
  assigned_role text;
begin
  meta_role := coalesce(new.raw_user_meta_data->>'salvya_role', 'customer');
  assigned_role := public.normalize_signup_role(meta_role);

  insert into public.user_profiles (user_id, role)
  values (new.id, assigned_role)
  on conflict (user_id) do nothing;

  return new;
end;
$$;

-- Trusted admin check (used by policies). SECURITY DEFINER bypasses RLS on user_profiles read.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_profiles
    where user_id = auth.uid()
      and role = 'admin'
  );
$$;

create or replace function public.current_user_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select role
  from public.user_profiles
  where user_id = auth.uid();
$$;

-- -----------------------------------------------------------------------------
-- 2) Row level security on user_profiles
-- -----------------------------------------------------------------------------

alter table public.user_profiles enable row level security;

drop policy if exists "Users read own profile" on public.user_profiles;
drop policy if exists "Admins read all profiles" on public.user_profiles;

create policy "Users read own profile"
  on public.user_profiles
  for select
  using (auth.uid() = user_id);

create policy "Admins read all profiles"
  on public.user_profiles
  for select
  using (public.is_admin());

-- No insert/update/delete for authenticated JWT users — triggers + service role only.

-- -----------------------------------------------------------------------------
-- 3) Auth trigger (PostgreSQL-compatible: EXECUTE PROCEDURE ... OR FUNCTION ...)
-- -----------------------------------------------------------------------------

drop trigger if exists on_auth_user_created_profile on auth.users;

create trigger on_auth_user_created_profile
  after insert on auth.users
  for each row
  execute function public.handle_new_user_profile();

-- -----------------------------------------------------------------------------
-- 4) Admin audit log
-- -----------------------------------------------------------------------------

create table if not exists public.admin_audit_log (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid not null references auth.users (id) on delete cascade,
  action text not null,
  target_type text,
  target_id text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists admin_audit_log_created_at_idx
  on public.admin_audit_log (created_at desc);

alter table public.admin_audit_log enable row level security;

drop policy if exists "Admins read audit log" on public.admin_audit_log;
drop policy if exists "Admins insert audit log" on public.admin_audit_log;

create policy "Admins read audit log"
  on public.admin_audit_log
  for select
  using (public.is_admin());

create policy "Admins insert audit log"
  on public.admin_audit_log
  for insert
  with check (public.is_admin() and auth.uid() = actor_id);

-- -----------------------------------------------------------------------------
-- 5) Backfill existing auth users (safe to re-run — skips existing rows)
-- -----------------------------------------------------------------------------

insert into public.user_profiles (user_id, role)
select
  u.id,
  public.normalize_signup_role(u.raw_user_meta_data->>'salvya_role')
from auth.users u
where not exists (
  select 1 from public.user_profiles p where p.user_id = u.id
)
on conflict (user_id) do nothing;

-- First admin — replace UUID before running manually:
-- update public.user_profiles set role = 'admin', updated_at = now() where user_id = '<auth.users.id>';


-- ========== 20250515190000_customer_addresses.sql ==========

-- Salvya saved shipping addresses (per authenticated customer).

create table if not exists public.customer_addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  full_name text not null,
  phone text not null,
  address_line_1 text not null,
  address_line_2 text,
  city text,
  region text,
  postal_code text,
  country text not null,
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists customer_addresses_user_id_idx
  on public.customer_addresses (user_id, created_at desc);

create index if not exists customer_addresses_default_idx
  on public.customer_addresses (user_id, is_default)
  where is_default;

alter table public.customer_addresses enable row level security;

create policy "customer_addresses_select_own"
  on public.customer_addresses
  for select
  using (auth.uid() = user_id);

create policy "customer_addresses_insert_own"
  on public.customer_addresses
  for insert
  with check (auth.uid() = user_id);

create policy "customer_addresses_update_own"
  on public.customer_addresses
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "customer_addresses_delete_own"
  on public.customer_addresses
  for delete
  using (auth.uid() = user_id);

-- Keep updated_at fresh on row changes.
create or replace function public.touch_customer_addresses_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists customer_addresses_touch_updated_at on public.customer_addresses;

create trigger customer_addresses_touch_updated_at
  before update on public.customer_addresses
  for each row
  execute function public.touch_customer_addresses_updated_at();

-- At most one default address per user: clearing others when setting default true.
create or replace function public.customer_addresses_single_default()
returns trigger
language plpgsql
as $$
begin
  if new.is_default then
    update public.customer_addresses ca
    set is_default = false
    where ca.user_id = new.user_id
      and ca.id is distinct from new.id;
  end if;
  return new;
end;
$$;

drop trigger if exists customer_addresses_enforce_default on public.customer_addresses;

create trigger customer_addresses_enforce_default
  before insert or update of is_default on public.customer_addresses
  for each row
  execute function public.customer_addresses_single_default();

-- Optional linkage from orders to the saved row used at checkout (auth users only).
alter table public.customer_orders
  add column if not exists shipping_address_id uuid references public.customer_addresses (id) on delete set null;

create index if not exists customer_orders_shipping_address_id_idx
  on public.customer_orders (shipping_address_id)
  where shipping_address_id is not null;


-- ========== 20250515201000_salvya_products_and_admin_order_access.sql ==========

-- Salvya admin catalog + admin access to orders (RLS defense-in-depth).
-- Requires public.is_admin() from user_profiles RBAC migration.

-- ---------------------------------------------------------------------------
-- Products (admin-managed; published rows optionally visible to storefront)
-- ---------------------------------------------------------------------------

create table if not exists public.salvya_products (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  slug text not null unique,
  artist_slug text not null,
  price_cents integer not null default 0 check (price_cents >= 0),
  category text not null default 'other'
    check (category in ('hoodie', 'tee', 'accessories', 'other')),
  images text[] not null default '{}'::text[],
  stock integer not null default 0 check (stock >= 0),
  is_limited_drop boolean not null default false,
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists salvya_products_artist_slug_idx on public.salvya_products (artist_slug);
create index if not exists salvya_products_created_at_idx on public.salvya_products (created_at desc);

alter table public.salvya_products enable row level security;

drop policy if exists "salvya_products_admin_select" on public.salvya_products;
create policy "salvya_products_admin_select"
  on public.salvya_products for select
  using (public.is_admin());

drop policy if exists "salvya_products_admin_insert" on public.salvya_products;
create policy "salvya_products_admin_insert"
  on public.salvya_products for insert
  with check (public.is_admin());

drop policy if exists "salvya_products_admin_update" on public.salvya_products;
create policy "salvya_products_admin_update"
  on public.salvya_products for update
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "salvya_products_admin_delete" on public.salvya_products;
create policy "salvya_products_admin_delete"
  on public.salvya_products for delete
  using (public.is_admin());

drop policy if exists "salvya_products_public_read_published" on public.salvya_products;
create policy "salvya_products_public_read_published"
  on public.salvya_products for select
  using (published = true);

create or replace function public.touch_salvya_products_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists salvya_products_touch_updated_at on public.salvya_products;

create trigger salvya_products_touch_updated_at
  before update on public.salvya_products
  for each row
  execute function public.touch_salvya_products_updated_at();

-- ---------------------------------------------------------------------------
-- Orders: admins may read/update lifecycle (service role still used in APIs)
-- ---------------------------------------------------------------------------

drop policy if exists "Admins read all orders" on public.customer_orders;
create policy "Admins read all orders"
  on public.customer_orders for select
  using (public.is_admin());

drop policy if exists "Admins update all orders" on public.customer_orders;
create policy "Admins update all orders"
  on public.customer_orders for update
  using (public.is_admin())
  with check (public.is_admin());


-- ========== 20250516120000_analytics_events_sessions.sql ==========

-- Salvya first-party analytics (sessions + events). Writes via service role API only.
-- Admin reads via is_admin() RLS policies.

-- ---------------------------------------------------------------------------
-- Sessions (anonymous or merged with auth user)
-- ---------------------------------------------------------------------------

create table if not exists public.analytics_sessions (
  id uuid primary key default gen_random_uuid(),
  session_id text not null unique,
  user_id uuid references auth.users (id) on delete set null,
  started_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  user_agent text,
  referrer text,
  utm_source text,
  utm_campaign text,
  utm_medium text
);

create index if not exists analytics_sessions_last_seen_idx
  on public.analytics_sessions (last_seen_at desc);

create index if not exists analytics_sessions_started_idx
  on public.analytics_sessions (started_at desc);

create index if not exists analytics_sessions_user_idx
  on public.analytics_sessions (user_id)
  where user_id is not null;

-- ---------------------------------------------------------------------------
-- Events (append-only; session_id links to analytics_sessions.session_id)
-- ---------------------------------------------------------------------------

create table if not exists public.analytics_events (
  id uuid primary key default gen_random_uuid(),
  session_id text not null,
  user_id uuid references auth.users (id) on delete set null,
  event_type text not null,
  page text not null,
  product_id text,
  artist_slug text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists analytics_events_session_created_idx
  on public.analytics_events (session_id, created_at desc);

create index if not exists analytics_events_type_created_idx
  on public.analytics_events (event_type, created_at desc);

create index if not exists analytics_events_product_idx
  on public.analytics_events (product_id)
  where product_id is not null;

create index if not exists analytics_events_artist_idx
  on public.analytics_events (artist_slug)
  where artist_slug is not null;

-- ---------------------------------------------------------------------------
-- RLS: admin read-only; no client policies (ingest uses service role)
-- ---------------------------------------------------------------------------

alter table public.analytics_sessions enable row level security;
alter table public.analytics_events enable row level security;

drop policy if exists "analytics_sessions_admin_select" on public.analytics_sessions;
create policy "analytics_sessions_admin_select"
  on public.analytics_sessions for select
  using (public.is_admin());

drop policy if exists "analytics_events_admin_select" on public.analytics_events;
create policy "analytics_events_admin_select"
  on public.analytics_events for select
  using (public.is_admin());


-- ========== 20250516180000_order_status_history_products_publish.sql ==========

-- Order fulfillment audit trail + catalog publish workflow extensions.

-- ---------------------------------------------------------------------------
-- order_status_history: append-only lifecycle log (admin/service writes)
-- ---------------------------------------------------------------------------

create table if not exists public.order_status_history (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.customer_orders (id) on delete cascade,
  fulfillment_status text not null
    check (fulfillment_status in ('confirmed', 'preparing', 'shipped', 'delivered', 'cancelled')),
  payment_status text
    check (
      payment_status is null
      or payment_status in ('pending', 'authorized', 'paid', 'cod_pending', 'failed')
    ),
  previous_fulfillment text,
  note text,
  actor_user_id uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists order_status_history_order_id_created_idx
  on public.order_status_history (order_id, created_at desc);

alter table public.order_status_history enable row level security;

drop policy if exists "order_status_history_admin_select" on public.order_status_history;
create policy "order_status_history_admin_select"
  on public.order_status_history for select
  using (public.is_admin());

-- ---------------------------------------------------------------------------
-- salvya_products: low stock + publish_state (keeps legacy `published` in sync)
-- ---------------------------------------------------------------------------

alter table public.salvya_products
  add column if not exists low_stock_threshold integer not null default 5
  check (low_stock_threshold >= 0);

alter table public.salvya_products
  add column if not exists publish_state text;

update public.salvya_products
set publish_state = case when published then 'published' else 'draft' end
where publish_state is null;

alter table public.salvya_products
  alter column publish_state set default 'draft';

alter table public.salvya_products
  alter column publish_state set not null;

alter table public.salvya_products
  drop constraint if exists salvya_products_publish_state_check;

alter table public.salvya_products
  add constraint salvya_products_publish_state_check
  check (publish_state in ('draft', 'published', 'archived'));

create or replace function public.salvya_products_sync_published_flag()
returns trigger
language plpgsql
as $$
begin
  new.published := (new.publish_state = 'published');
  return new;
end;
$$;

drop trigger if exists salvya_products_sync_published_flag_trg on public.salvya_products;

create trigger salvya_products_sync_published_flag_trg
  before insert or update on public.salvya_products
  for each row
  execute function public.salvya_products_sync_published_flag();

-- Align legacy boolean with publish_state
update public.salvya_products set published = (publish_state = 'published');

drop policy if exists "salvya_products_public_read_published" on public.salvya_products;
create policy "salvya_products_public_read_published"
  on public.salvya_products for select
  using (publish_state = 'published');


-- ========== 20250516190000_store_settings.sql ==========

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


-- ========== 20250516200000_product_images_storage_metadata.sql ==========

-- Product image uploads (Supabase Storage) + optional merchandising metadata on products.

alter table public.salvya_products
  add column if not exists metadata jsonb not null default '{}'::jsonb;

-- Public bucket for admin-uploaded product photos (service role uploads via API).
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'product-images',
  'product-images',
  true,
  8388608,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']::text[]
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "product_images_public_read" on storage.objects;
create policy "product_images_public_read"
  on storage.objects for select
  using (bucket_id = 'product-images');


-- ========== 20250516210000_salvya_artists.sql ==========

-- Artist profiles managed from admin (storefront + catalog).

create table if not exists public.salvya_artists (
  slug text primary key,
  name text not null,
  status_tag text not null default 'AVAILABLE'
    check (status_tag in ('AVAILABLE', 'LIMITED DROP', 'COMING SOON')),
  gradient text not null default 'from-[#241840] via-[#0c1a45] to-[#05060c]',
  ambient text not null default 'from-[#2D6BFF]/25 to-transparent',
  profile_image text not null,
  cover_image text not null,
  about_lead text not null default '',
  about_more text,
  archived boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists salvya_artists_archived_sort_idx
  on public.salvya_artists (archived, sort_order, name);

alter table public.salvya_artists enable row level security;

drop policy if exists "salvya_artists_public_read_active" on public.salvya_artists;
create policy "salvya_artists_public_read_active"
  on public.salvya_artists for select
  using (archived = false);

drop policy if exists "salvya_artists_admin_all" on public.salvya_artists;
create policy "salvya_artists_admin_all"
  on public.salvya_artists for all
  using (public.is_admin())
  with check (public.is_admin());

-- Seed built-in artists (safe to re-run).
insert into public.salvya_artists (
  slug, name, status_tag, gradient, ambient, profile_image, cover_image, about_lead, about_more, sort_order
) values
  (
    'elgrandetoto', 'ElGrandeToto', 'AVAILABLE',
    'from-[#241840] via-[#0c1a45] to-[#05060c]', 'from-[#2D6BFF]/25 to-transparent',
    '/api/artist-avatar/elgrandetoto', '/api/artist-cover/elgrandetoto',
    'Rap from Casablanca with a worldwide audience — ElGrandeToto''s Salvya shop mirrors the energy of his stage sets in fabric and print.',
    'Expect heavyweight hoodies, clean typography, and graphics that reference the culture around his music. Stock is intentionally limited: when a run sells out, the next design may take a different direction. Check back after singles and tours for new waves.',
    10
  ),
  (
    'babygang', 'BabyGang', 'LIMITED DROP',
    'from-[#301018] via-[#120a14] to-[#050508]', 'from-[#ff4d6d]/12 to-transparent',
    '/api/artist-avatar/babygang', '/api/artist-cover/babygang',
    'Italian street rap with melody and bite — BabyGang''s line on Salvya leans dark palettes, sharp cuts, and graphics that read from a distance.',
    'Capsules are produced in small quantities so quality stays consistent. Limited tags mean the piece may not be restocked in the same color or print. If you see something you want, grab your size while it is still listed.',
    20
  ),
  (
    'tchubi', 'Tchubi', 'AVAILABLE',
    'from-[#0a2230] via-[#081018] to-[#040608]', 'from-white/5 to-transparent',
    '/api/artist-avatar/tchubi', '/api/artist-cover/tchubi',
    'Tchubi keeps silhouettes relaxed and colors restrained — pieces that work on tour, at home, or layered under a coat.',
    'Fabrics are chosen for hand-feel and longevity rather than seasonal gimmicks. Graphics stay minimal so the fit stays the focus. New items appear in quiet drops; bookmark this shop if you like a calmer wardrobe with a music edge.',
    30
  ),
  (
    'inkonnu', 'Inkonnu', 'AVAILABLE',
    'from-[#1a1025] via-[#0d1520] to-[#050508]', 'from-violet-400/15 to-transparent',
    '/api/artist-avatar/inkonnu', '/api/artist-cover/inkonnu',
    'Inkonnu sits between shadow and spotlight — Salvya pieces follow that mood with layered graphics and roomy fits.',
    'Look for washed blacks, off-whites, and occasional color hits tied to release artwork. Runs are modest in size so logistics stay tight. When a listing disappears, it is usually gone for good rather than held back for a restock.',
    40
  ),
  (
    'billie-eilish', 'Billie Eilish', 'LIMITED DROP',
    'from-[#0c1814] via-[#081210] to-[#050508]', 'from-emerald-400/12 to-transparent',
    '/media/artists/billie-eilish/profile.webp', '/media/artists/billie-eilish/cover.webp',
    'Billie''s Salvya lane mirrors her world — soft-dark palettes, oversized silhouettes, and graphics that feel personal rather than loud.',
    'Capsules land in small waves. When a colorway or print leaves the shop, the next drop may take a different visual direction. Follow the feed for tour-adjacent releases and limited collabs.',
    50
  ),
  (
    'drake', 'Drake', 'AVAILABLE',
    'from-[#1a1408] via-[#0f0c06] to-[#050508]', 'from-amber-200/10 to-transparent',
    '/media/artists/drake/profile.webp', '/media/artists/drake/cover.webp',
    'OVO energy on fabric — clean typography, premium blanks, and pieces that read as well courtside as they do on night drives.',
    'Expect restrained color stories with occasional gold hits and iconography that nods to Toronto and the broader OVO universe. Limited runs keep quality consistent; grab your size while it is listed.',
    60
  ),
  (
    'the-weeknd', 'The Weeknd', 'AVAILABLE',
    'from-[#220814] via-[#10060c] to-[#050508]', 'from-red-500/14 to-transparent',
    '/media/artists/the-weeknd/profile.webp', '/media/artists/the-weeknd/cover.webp',
    'After-hours aesthetics — deep reds, noir blacks, and merch that feels like a sequel to the show you just left.',
    'Graphics pull from era-specific artwork; fits stay roomy for layering. When a design cycles out, it may not return in the same form — bookmark this shop around tours and surprise releases.',
    70
  )
on conflict (slug) do nothing;


-- ========== 20250516220000_artist_images_storage.sql ==========

-- Artist profile & cover uploads (Supabase Storage).

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'artist-images',
  'artist-images',
  true,
  8388608,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']::text[]
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "artist_images_public_read" on storage.objects;
create policy "artist_images_public_read"
  on storage.objects for select
  using (bucket_id = 'artist-images');


-- ========== 20250516230000_salvya_blog.sql ==========

-- Salvya blog posts (admin CMS + public magazine).

create table if not exists public.salvya_blog_posts (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  subtitle text not null default '',
  excerpt text not null default '',
  body_md text not null default '',
  cover_image text not null default '',
  author_name text not null default 'Salvya',
  author_role text not null default '',
  tags text[] not null default '{}',
  status text not null default 'draft'
    check (status in ('draft', 'published', 'archived')),
  featured boolean not null default false,
  read_time_minutes integer not null default 1 check (read_time_minutes >= 1),
  seo_title text not null default '',
  seo_description text not null default '',
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists salvya_blog_posts_status_published_idx
  on public.salvya_blog_posts (status, published_at desc nulls last);

create index if not exists salvya_blog_posts_featured_idx
  on public.salvya_blog_posts (featured, published_at desc)
  where status = 'published';

alter table public.salvya_blog_posts enable row level security;

drop policy if exists "salvya_blog_posts_public_read_published" on public.salvya_blog_posts;
create policy "salvya_blog_posts_public_read_published"
  on public.salvya_blog_posts for select
  using (
    status = 'published'
    and (published_at is null or published_at <= now())
  );

drop policy if exists "salvya_blog_posts_admin_all" on public.salvya_blog_posts;
create policy "salvya_blog_posts_admin_all"
  on public.salvya_blog_posts for all
  using (public.is_admin())
  with check (public.is_admin());


-- ========== 20250516230100_blog_images_storage.sql ==========

-- Blog cover & inline images (Supabase Storage).

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'blog-images',
  'blog-images',
  true,
  10485760,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']::text[]
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "blog_images_public_read" on storage.objects;
create policy "blog_images_public_read"
  on storage.objects for select
  using (bucket_id = 'blog-images');

drop policy if exists "blog_images_admin_insert" on storage.objects;
create policy "blog_images_admin_insert"
  on storage.objects for insert
  with check (bucket_id = 'blog-images' and public.is_admin());

drop policy if exists "blog_images_admin_update" on storage.objects;
create policy "blog_images_admin_update"
  on storage.objects for update
  using (bucket_id = 'blog-images' and public.is_admin());

drop policy if exists "blog_images_admin_delete" on storage.objects;
create policy "blog_images_admin_delete"
  on storage.objects for delete
  using (bucket_id = 'blog-images' and public.is_admin());


-- ========== 20250516240000_email_send_log.sql ==========

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


-- ========== 20250516250000_salvya_influencer_applications.sql ==========

-- Influencer / creator applications — admin approve, reject, suspend.

create table if not exists public.salvya_influencer_applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users (id) on delete cascade,
  status text not null default 'pending'
    check (status in ('pending', 'approved', 'rejected', 'suspended')),
  public_name text not null default '',
  legal_name text not null default '',
  email text not null default '',
  phone text,
  platform text,
  handle text not null default '',
  audience text,
  portfolio_url text,
  pitch text not null default '',
  commission_rate numeric(5, 2) not null default 10.00
    check (commission_rate >= 0 and commission_rate <= 100),
  promo_code text,
  admin_notes text,
  reject_reason text,
  reviewed_at timestamptz,
  reviewed_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists salvya_influencer_applications_status_created_idx
  on public.salvya_influencer_applications (status, created_at desc);

alter table public.salvya_influencer_applications enable row level security;

drop policy if exists "influencer_apps_user_read_own" on public.salvya_influencer_applications;
create policy "influencer_apps_user_read_own"
  on public.salvya_influencer_applications for select
  using (auth.uid() = user_id);

drop policy if exists "influencer_apps_admin_all" on public.salvya_influencer_applications;
create policy "influencer_apps_admin_all"
  on public.salvya_influencer_applications for all
  using (public.is_admin())
  with check (public.is_admin());

-- Upsert application row from auth.users metadata (creator signup).
create or replace function public.upsert_influencer_application_from_auth(p_user_id uuid)
returns void
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  u record;
  meta_role text;
begin
  select id, email, raw_user_meta_data
  into u
  from auth.users
  where id = p_user_id;

  if not found then
    return;
  end if;

  meta_role := coalesce(u.raw_user_meta_data->>'salvya_role', '');
  if meta_role not in ('influencer', 'creator') then
    return;
  end if;

  insert into public.salvya_influencer_applications (
    user_id,
    status,
    public_name,
    legal_name,
    email,
    phone,
    platform,
    handle,
    audience,
    portfolio_url,
    pitch,
    updated_at
  )
  values (
    u.id,
    'pending',
    coalesce(nullif(trim(u.raw_user_meta_data->>'public_name'), ''), nullif(trim(u.raw_user_meta_data->>'full_name'), ''), 'Creator'),
    coalesce(nullif(trim(u.raw_user_meta_data->>'legal_name'), ''), ''),
    coalesce(nullif(trim(u.email), ''), ''),
    nullif(trim(u.raw_user_meta_data->>'phone'), ''),
    nullif(trim(u.raw_user_meta_data->>'platform'), ''),
    coalesce(nullif(trim(u.raw_user_meta_data->>'handle'), ''), ''),
    nullif(trim(u.raw_user_meta_data->>'audience'), ''),
    nullif(trim(u.raw_user_meta_data->>'portfolio_url'), ''),
    coalesce(nullif(trim(u.raw_user_meta_data->>'pitch'), ''), ''),
    now()
  )
  on conflict (user_id) do update set
    public_name = excluded.public_name,
    legal_name = excluded.legal_name,
    email = excluded.email,
    phone = excluded.phone,
    platform = excluded.platform,
    handle = excluded.handle,
    audience = excluded.audience,
    portfolio_url = excluded.portfolio_url,
    pitch = excluded.pitch,
    updated_at = now()
  where salvya_influencer_applications.status = 'pending';
end;
$$;

-- Creator signups stay `customer` until admin approves; application row is created.
create or replace function public.handle_new_user_profile()
returns trigger
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  meta_role text;
  assigned_role text;
begin
  meta_role := coalesce(new.raw_user_meta_data->>'salvya_role', 'customer');

  if meta_role in ('influencer', 'creator') then
    assigned_role := 'customer';
  else
    assigned_role := public.normalize_signup_role(meta_role);
  end if;

  insert into public.user_profiles (user_id, role)
  values (new.id, assigned_role)
  on conflict (user_id) do nothing;

  if meta_role in ('influencer', 'creator') then
    perform public.upsert_influencer_application_from_auth(new.id);
  end if;

  return new;
end;
$$;

-- Backfill applications for existing creator signups (safe to re-run).
do $$
declare
  r record;
begin
  for r in
    select id
    from auth.users
    where coalesce(raw_user_meta_data->>'salvya_role', '') in ('influencer', 'creator')
  loop
    perform public.upsert_influencer_application_from_auth(r.id);
  end loop;
end;
$$;

-- Grandfather users who already have influencer role before approval workflow.
update public.salvya_influencer_applications a
set status = 'approved',
    reviewed_at = coalesce(a.reviewed_at, now()),
    updated_at = now()
from public.user_profiles p
where p.user_id = a.user_id
  and p.role = 'influencer'
  and a.status = 'pending';


-- ========== 20250516260000_god_admin_role.sql ==========

-- God Admin: full system visibility + role management (above standard admin).

alter table public.user_profiles drop constraint if exists user_profiles_role_check;

alter table public.user_profiles
  add constraint user_profiles_role_check
  check (role in ('customer', 'influencer', 'admin', 'god_admin'));

-- Standard admin RLS helpers treat god_admin as admin.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_profiles
    where user_id = auth.uid()
      and role in ('admin', 'god_admin')
  );
$$;

create or replace function public.is_god_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_profiles
    where user_id = auth.uid()
      and role = 'god_admin'
  );
$$;


-- ========== 20250516270000_user_profile_details.sql ==========

-- Extended profile fields (display name, bio, avatars) — one row per auth user.
-- Role changes remain admin/god-only via service role APIs.

alter table public.user_profiles
  add column if not exists profile jsonb not null default '{}'::jsonb;

comment on column public.user_profiles.profile is
  'Customer-facing profile: displayName, username, bio, avatarUrl, coverUrl (strings; URLs preferred for production).';

-- Optional index for admin search by username later
create index if not exists user_profiles_profile_username_idx
  on public.user_profiles ((profile->>'username'))
  where (profile->>'username') is not null and (profile->>'username') <> '';


-- ========== 20250516280000_products_artist_slug_unique.sql ==========

-- Products: slug unique per artist (not globally) so folder names can repeat across artists.

alter table public.salvya_products drop constraint if exists salvya_products_slug_key;

create unique index if not exists salvya_products_artist_slug_slug_uidx
  on public.salvya_products (artist_slug, slug);


-- ========== 20250516290000_paypal_payment_verification.sql ==========

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


-- ========== 20250518300000_order_refunds_guest_linking.sql ==========

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


-- ========== 20250518400000_multi_market_pricing.sql ==========

-- Multi-market product pricing, immutable order snapshots, atomic stock decrement.

-- ---------------------------------------------------------------------------
-- Products: regional list prices (EUR / USD / MAD) + optional JSON overrides
-- ---------------------------------------------------------------------------

alter table public.salvya_products
  add column if not exists price_eur numeric(10, 2),
  add column if not exists price_usd numeric(10, 2),
  add column if not exists price_mad numeric(10, 2),
  add column if not exists market_prices jsonb not null default '{}'::jsonb,
  add column if not exists reserved_stock integer not null default 0 check (reserved_stock >= 0);

-- Backfill from legacy price_cents (treated as EUR) or category defaults
update public.salvya_products p
set
  price_eur = coalesce(
    p.price_eur,
    case when p.price_cents > 0 then round(p.price_cents::numeric / 100, 2) else null end,
    case when p.category = 'tee' then 28 else 45 end
  ),
  price_usd = coalesce(
    p.price_usd,
    case when p.category = 'tee' then 30 else 49 end
  ),
  price_mad = coalesce(
    p.price_mad,
    case when p.category = 'tee' then 175 else 250 end
  ),
  market_prices = case
    when p.market_prices = '{}'::jsonb or p.market_prices is null then jsonb_build_object(
      'MA', jsonb_build_object('currency', 'MAD', 'price', coalesce(p.price_mad, case when p.category = 'tee' then 175 else 250 end)),
      'EU', jsonb_build_object('currency', 'EUR', 'price', coalesce(p.price_eur, case when p.category = 'tee' then 28 else 45 end)),
      'US', jsonb_build_object('currency', 'USD', 'price', coalesce(p.price_usd, case when p.category = 'tee' then 30 else 49 end))
    )
    else p.market_prices
  end
where p.price_eur is null or p.price_usd is null or p.price_mad is null;

-- Keep price_cents aligned with EUR for legacy readers
update public.salvya_products
set price_cents = greatest(0, round(coalesce(price_eur, 0) * 100)::integer)
where price_eur is not null;

create unique index if not exists salvya_products_artist_slug_slug_unique
  on public.salvya_products (artist_slug, slug);

-- ---------------------------------------------------------------------------
-- Orders: frozen commercial terms at purchase time
-- ---------------------------------------------------------------------------

alter table public.customer_orders
  add column if not exists product_snapshot jsonb,
  add column if not exists final_price numeric(12, 2),
  add column if not exists order_currency text,
  add column if not exists market_code text;

-- ---------------------------------------------------------------------------
-- Atomic stock reservation (service role / security definer)
-- ---------------------------------------------------------------------------

create or replace function public.decrement_product_stock(p_product_id uuid, p_qty integer)
returns table(ok boolean, remaining_stock integer)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_stock integer;
  v_qty integer := greatest(1, coalesce(p_qty, 1));
begin
  if p_product_id is null then
    return query select false, 0;
    return;
  end if;

  update public.salvya_products
  set
    stock = stock - v_qty,
    updated_at = now()
  where id = p_product_id
    and stock >= v_qty
  returning stock into v_stock;

  if found then
    return query select true, v_stock;
  end if;

  select stock into v_stock from public.salvya_products where id = p_product_id;
  return query select false, coalesce(v_stock, 0);
end;
$$;

revoke all on function public.decrement_product_stock(uuid, integer) from public;
grant execute on function public.decrement_product_stock(uuid, integer) to service_role;


-- ========== 20250518500000_user_geo_preferences.sql ==========

-- Geo / locale / display currency preferences (columns + profile jsonb sync).

alter table public.user_profiles
  add column if not exists country text,
  add column if not exists locale text,
  add column if not exists display_currency text;

comment on column public.user_profiles.country is 'ISO-3166 alpha-2 preferred shopping country.';
comment on column public.user_profiles.locale is 'Preferred next-intl locale (en, fr, ar, …).';
comment on column public.user_profiles.display_currency is 'Display currency: EUR, USD, or MAD.';

create index if not exists user_profiles_country_idx
  on public.user_profiles (country)
  where country is not null and country <> '';


-- ========== 20250518600000_payment_lifecycle_refunds.sql ==========

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


-- ========== 20250518700000_production_hardening.sql ==========

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


-- ========== 20250518800000_product_variants_inventory_lifecycle.sql ==========

-- Product variants, atomic stock reservations, and lifecycle (draft / scheduled / live / archived).

-- ---------------------------------------------------------------------------
-- Lifecycle columns on salvya_products
-- ---------------------------------------------------------------------------

alter table public.salvya_products
  add column if not exists status text,
  add column if not exists scheduled_at timestamptz,
  add column if not exists published_at timestamptz;

update public.salvya_products
set status = case
  when coalesce(publish_state, case when published then 'published' else 'draft' end) = 'published' then 'live'
  when coalesce(publish_state, 'draft') = 'archived' then 'archived'
  else 'draft'
end
where status is null;

alter table public.salvya_products
  alter column status set default 'draft';

update public.salvya_products set status = 'draft' where status is null;

alter table public.salvya_products
  alter column status set not null;

alter table public.salvya_products
  drop constraint if exists salvya_products_status_check;

alter table public.salvya_products
  add constraint salvya_products_status_check
  check (status in ('draft', 'scheduled', 'live', 'archived'));

-- Backfill published_at for already-live products
update public.salvya_products
set published_at = coalesce(published_at, updated_at)
where status = 'live' and published_at is null;

create or replace function public.salvya_products_sync_lifecycle_flags()
returns trigger
language plpgsql
as $$
begin
  new.published := (new.status = 'live');
  new.publish_state := case new.status
    when 'live' then 'published'
    when 'archived' then 'archived'
    else 'draft'
  end;
  if new.status = 'live' and (tg_op = 'INSERT' or old.status is distinct from 'live') then
    new.published_at := coalesce(new.published_at, now());
  end if;
  return new;
end;
$$;

drop trigger if exists salvya_products_sync_lifecycle_flags_trg on public.salvya_products;

create trigger salvya_products_sync_lifecycle_flags_trg
  before insert or update of status, scheduled_at on public.salvya_products
  for each row
  execute function public.salvya_products_sync_lifecycle_flags();

-- Replace legacy publish_state-only trigger (lifecycle trigger supersedes it)
drop trigger if exists salvya_products_sync_published_flag_trg on public.salvya_products;

update public.salvya_products set published = (status = 'live');
update public.salvya_products
set publish_state = case status when 'live' then 'published' when 'archived' then 'archived' else 'draft' end;

drop policy if exists "salvya_products_public_read_published" on public.salvya_products;
create policy "salvya_products_public_read_published"
  on public.salvya_products for select
  using (status = 'live');

-- ---------------------------------------------------------------------------
-- product_variants
-- ---------------------------------------------------------------------------

create table if not exists public.product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.salvya_products (id) on delete cascade,
  size text,
  color text not null default 'default',
  stock integer not null default 0 check (stock >= 0),
  price_delta_cents integer not null default 0 check (price_delta_cents >= -10000000),
  sku text not null,
  image_override text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists product_variants_product_size_color_uidx
  on public.product_variants (product_id, coalesce(size, ''), color);

create index if not exists product_variants_product_id_idx on public.product_variants (product_id);
create unique index if not exists product_variants_sku_uidx on public.product_variants (sku);

alter table public.product_variants enable row level security;

drop policy if exists "product_variants_admin_all" on public.product_variants;
create policy "product_variants_admin_all"
  on public.product_variants for all
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "product_variants_public_read_live" on public.product_variants;
create policy "product_variants_public_read_live"
  on public.product_variants for select
  using (
    exists (
      select 1 from public.salvya_products p
      where p.id = product_id and p.status = 'live'
    )
  );

create or replace function public.touch_product_variants_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists product_variants_touch_updated_at on public.product_variants;
create trigger product_variants_touch_updated_at
  before update on public.product_variants
  for each row
  execute function public.touch_product_variants_updated_at();

-- ---------------------------------------------------------------------------
-- stock_reservations
-- ---------------------------------------------------------------------------

create table if not exists public.stock_reservations (
  id uuid primary key default gen_random_uuid(),
  product_variant_id uuid not null references public.product_variants (id) on delete cascade,
  quantity integer not null check (quantity > 0),
  status text not null default 'reserved'
    check (status in ('reserved', 'confirmed', 'expired', 'released')),
  expires_at timestamptz not null,
  checkout_session_id text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists stock_reservations_variant_status_idx
  on public.stock_reservations (product_variant_id, status);

create index if not exists stock_reservations_expires_idx
  on public.stock_reservations (expires_at)
  where status = 'reserved';

create unique index if not exists stock_reservations_active_session_variant_uidx
  on public.stock_reservations (checkout_session_id, product_variant_id)
  where status = 'reserved';

alter table public.stock_reservations enable row level security;

drop policy if exists "stock_reservations_service" on public.stock_reservations;
create policy "stock_reservations_service"
  on public.stock_reservations for all
  using (false);

-- ---------------------------------------------------------------------------
-- Backfill: one default variant per product (full legacy stock)
-- ---------------------------------------------------------------------------

insert into public.product_variants (product_id, size, color, stock, sku)
select
  p.id,
  null,
  'default',
  p.stock,
  coalesce(nullif(trim(p.slug), ''), p.id::text) || '-default'
from public.salvya_products p
where not exists (
  select 1 from public.product_variants v where v.product_id = p.id
);

-- ---------------------------------------------------------------------------
-- Promote scheduled products (cron)
-- ---------------------------------------------------------------------------

create or replace function public.promote_scheduled_products()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_count integer;
begin
  update public.salvya_products
  set status = 'live', published_at = coalesce(published_at, now()), updated_at = now()
  where status = 'scheduled'
    and scheduled_at is not null
    and scheduled_at <= now();
  get diagnostics v_count = row_count;
  return v_count;
end;
$$;

revoke all on function public.promote_scheduled_products() from public;
grant execute on function public.promote_scheduled_products() to service_role;

-- ---------------------------------------------------------------------------
-- Release expired reservations (restores variant stock)
-- ---------------------------------------------------------------------------

create or replace function public.release_expired_stock_reservations()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  r record;
  v_count integer := 0;
begin
  for r in
    select id, product_variant_id, quantity
    from public.stock_reservations
    where status = 'reserved' and expires_at <= now()
    for update
  loop
    update public.product_variants
    set stock = stock + r.quantity, updated_at = now()
    where id = r.product_variant_id;

    update public.stock_reservations
    set status = 'expired', updated_at = now()
    where id = r.id;

    v_count := v_count + 1;
  end loop;
  return v_count;
end;
$$;

revoke all on function public.release_expired_stock_reservations() from public;
grant execute on function public.release_expired_stock_reservations() to service_role;

-- ---------------------------------------------------------------------------
-- Reserve variant stock (FOR UPDATE, idempotent per checkout session)
-- ---------------------------------------------------------------------------

create or replace function public.reserve_variant_stock(
  p_variant_id uuid,
  p_qty integer,
  p_checkout_session_id text,
  p_ttl_minutes integer default 15
)
returns table(ok boolean, reservation_id uuid, remaining_stock integer, message text)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_qty integer;
  v_variant public.product_variants%rowtype;
  v_existing public.stock_reservations%rowtype;
  v_res_id uuid;
  v_remaining integer;
  v_product_status text;
begin
  perform public.release_expired_stock_reservations();

  v_qty := greatest(1, coalesce(p_qty, 1));
  if p_variant_id is null or coalesce(trim(p_checkout_session_id), '') = '' then
    return query select false, null::uuid, 0, 'invalid_args';
    return;
  end if;

  select * into v_existing
  from public.stock_reservations
  where checkout_session_id = trim(p_checkout_session_id)
    and product_variant_id = p_variant_id
    and status = 'reserved'
    and expires_at > now()
  limit 1;

  if found then
    select stock into v_remaining from public.product_variants where id = p_variant_id;
    return query select true, v_existing.id, coalesce(v_remaining, 0), 'already_reserved';
    return;
  end if;

  select v.* into v_variant
  from public.product_variants v
  where v.id = p_variant_id
  for update;

  select p.status into v_product_status
  from public.salvya_products p
  where p.id = v_variant.product_id;

  if not found then
    return query select false, null::uuid, 0, 'variant_not_found';
    return;
  end if;

  if v_product_status <> 'live' then
    return query select false, null::uuid, v_variant.stock, 'product_not_live';
    return;
  end if;

  if v_variant.stock < v_qty then
    return query select false, null::uuid, v_variant.stock, 'insufficient_stock';
    return;
  end if;

  update public.product_variants
  set stock = stock - v_qty, updated_at = now()
  where id = p_variant_id;

  insert into public.stock_reservations (
    product_variant_id, quantity, status, expires_at, checkout_session_id
  )
  values (
    p_variant_id,
    v_qty,
    'reserved',
    now() + make_interval(mins => greatest(1, coalesce(p_ttl_minutes, 15))),
    trim(p_checkout_session_id)
  )
  returning id into v_res_id;

  select stock into v_remaining from public.product_variants where id = p_variant_id;
  return query select true, v_res_id, coalesce(v_remaining, 0), 'reserved';
end;
$$;

revoke all on function public.reserve_variant_stock(uuid, integer, text, integer) from public;
grant execute on function public.reserve_variant_stock(uuid, integer, text, integer) to service_role;

-- ---------------------------------------------------------------------------
-- Confirm reservation at order placement (idempotent)
-- ---------------------------------------------------------------------------

create or replace function public.confirm_variant_stock_reservation(
  p_checkout_session_id text,
  p_variant_id uuid,
  p_qty integer
)
returns table(ok boolean, message text)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_qty integer;
  v_res public.stock_reservations%rowtype;
begin
  perform public.release_expired_stock_reservations();
  v_qty := greatest(1, coalesce(p_qty, 1));

  if coalesce(trim(p_checkout_session_id), '') = '' or p_variant_id is null then
    return query select false, 'invalid_args';
    return;
  end if;

  select * into v_res
  from public.stock_reservations
  where checkout_session_id = trim(p_checkout_session_id)
    and product_variant_id = p_variant_id
    and status = 'reserved'
    and expires_at > now()
  order by created_at desc
  limit 1
  for update;

  if found then
    if v_res.quantity < v_qty then
      return query select false, 'reservation_qty_mismatch';
      return;
    end if;
    update public.stock_reservations
    set status = 'confirmed', updated_at = now()
    where id = v_res.id;
    return query select true, 'confirmed';
    return;
  end if;

  -- Already confirmed (retry)
  if exists (
    select 1 from public.stock_reservations
    where checkout_session_id = trim(p_checkout_session_id)
      and product_variant_id = p_variant_id
      and status = 'confirmed'
  ) then
    return query select true, 'already_confirmed';
    return;
  end if;

  return query select false, 'no_active_reservation';
end;
$$;

revoke all on function public.confirm_variant_stock_reservation(text, uuid, integer) from public;
grant execute on function public.confirm_variant_stock_reservation(text, uuid, integer) to service_role;

-- ---------------------------------------------------------------------------
-- Commit stock at checkout (reserve+confirm in one txn if no prior reservation)
-- ---------------------------------------------------------------------------

create or replace function public.commit_variant_stock_for_checkout(
  p_variant_id uuid,
  p_qty integer,
  p_checkout_session_id text
)
returns table(ok boolean, remaining_stock integer, message text)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_qty integer;
  v_confirm_ok boolean;
  v_confirm_msg text;
  v_reserve_ok boolean;
  v_reserve_remaining integer;
  v_reserve_msg text;
  v_remaining integer;
begin
  v_qty := greatest(1, coalesce(p_qty, 1));

  select c.ok, c.message into v_confirm_ok, v_confirm_msg
  from public.confirm_variant_stock_reservation(p_checkout_session_id, p_variant_id, v_qty) c
  limit 1;

  if v_confirm_ok then
    select stock into v_remaining from public.product_variants where id = p_variant_id;
    return query select true, coalesce(v_remaining, 0), v_confirm_msg;
    return;
  end if;

  if v_confirm_msg = 'no_active_reservation' then
    select r.ok, r.remaining_stock, r.message
    into v_reserve_ok, v_reserve_remaining, v_reserve_msg
    from public.reserve_variant_stock(p_variant_id, v_qty, p_checkout_session_id, 15) r
    limit 1;

    if not v_reserve_ok then
      return query select false, coalesce(v_reserve_remaining, 0), v_reserve_msg;
      return;
    end if;

    select c.ok, c.message into v_confirm_ok, v_confirm_msg
    from public.confirm_variant_stock_reservation(p_checkout_session_id, p_variant_id, v_qty) c
    limit 1;

    if v_confirm_ok then
      select stock into v_remaining from public.product_variants where id = p_variant_id;
      return query select true, coalesce(v_remaining, 0), 'committed';
      return;
    end if;
  end if;

  select stock into v_remaining from public.product_variants where id = p_variant_id;
  return query select false, coalesce(v_remaining, 0), coalesce(v_confirm_msg, 'commit_failed');
end;
$$;

revoke all on function public.commit_variant_stock_for_checkout(uuid, integer, text) from public;
grant execute on function public.commit_variant_stock_for_checkout(uuid, integer, text) to service_role;

-- ---------------------------------------------------------------------------
-- Legacy product-level decrement → delegates to default variant
-- ---------------------------------------------------------------------------

create or replace function public.decrement_product_stock(p_product_id uuid, p_qty integer)
returns table(ok boolean, remaining_stock integer)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_variant_id uuid;
  v_ok boolean;
  v_remaining integer;
begin
  select id into v_variant_id
  from public.product_variants
  where product_id = p_product_id
  order by created_at asc
  limit 1;

  if v_variant_id is null then
    return query select false, 0;
    return;
  end if;

  select c.ok, c.remaining_stock into v_ok, v_remaining
  from public.commit_variant_stock_for_checkout(
    v_variant_id,
    p_qty,
    'legacy-' || p_product_id::text
  ) c
  limit 1;

  return query select coalesce(v_ok, false), coalesce(v_remaining, 0);
end;
$$;


-- ========== 20250518900000_discovery_engine.sql ==========

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


-- ========== 20250519900000_creator_applications_profiles.sql ==========

-- Creator Economy Phase 1 — applications + profiles (parallel to legacy influencer table).

create table if not exists public.creator_applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users (id) on delete cascade,
  full_name text not null,
  country text not null,
  instagram_username text not null,
  instagram_link text not null,
  followers_count integer not null check (followers_count >= 0),
  niche text not null check (
    niche in ('fashion', 'tech', 'beauty', 'fitness', 'lifestyle', 'gaming', 'other')
  ),
  message text,
  status text not null default 'pending'
    check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now()
);

create index if not exists creator_applications_status_created_idx
  on public.creator_applications (status, created_at desc);

create table if not exists public.creator_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users (id) on delete cascade,
  creator_code text not null unique,
  status text not null default 'active'
    check (status in ('active', 'suspended')),
  created_at timestamptz not null default now()
);

create index if not exists creator_profiles_creator_code_idx
  on public.creator_profiles (creator_code);

alter table public.creator_applications enable row level security;
alter table public.creator_profiles enable row level security;

-- Applicants: read own application.
drop policy if exists "creator_apps_select_own" on public.creator_applications;
create policy "creator_apps_select_own"
  on public.creator_applications for select
  using (auth.uid() = user_id);

-- Applicants: insert own row (service role used for admin updates).
drop policy if exists "creator_apps_insert_own" on public.creator_applications;
create policy "creator_apps_insert_own"
  on public.creator_applications for insert
  with check (auth.uid() = user_id and status = 'pending');

-- Admin: full access to applications.
drop policy if exists "creator_apps_admin_all" on public.creator_applications;
create policy "creator_apps_admin_all"
  on public.creator_applications for all
  using (public.is_admin())
  with check (public.is_admin());

-- Creators: read own profile.
drop policy if exists "creator_profiles_select_own" on public.creator_profiles;
create policy "creator_profiles_select_own"
  on public.creator_profiles for select
  using (auth.uid() = user_id);

-- Admin: full access to profiles.
drop policy if exists "creator_profiles_admin_all" on public.creator_profiles;
create policy "creator_profiles_admin_all"
  on public.creator_profiles for all
  using (public.is_admin())
  with check (public.is_admin());


-- ========== 20250520100000_creator_product_links.sql ==========

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


-- ========== 20250520110000_creator_product_links_orders_count.sql ==========

-- Ensure orders_count exists on older partial creator_product_links tables.
alter table public.creator_product_links
  add column if not exists orders_count integer not null default 0;

alter table public.creator_product_links
  add column if not exists clicks_count integer not null default 0;


-- ========== 20250520120000_creator_monetization_engine.sql ==========

-- Creator monetization engine: events (source of truth), earnings, order attribution snapshots.

-- ---------------------------------------------------------------------------
-- Order attribution (immutable snapshot at checkout)
-- ---------------------------------------------------------------------------

alter table public.customer_orders
  add column if not exists creator_id uuid references auth.users (id) on delete set null,
  add column if not exists creator_tracking_code text,
  add column if not exists creator_product_link_id uuid references public.creator_product_links (id) on delete set null,
  add column if not exists referral_source text,
  add column if not exists creator_self_referral boolean not null default false;

create index if not exists customer_orders_creator_id_idx
  on public.customer_orders (creator_id)
  where creator_id is not null;

create index if not exists customer_orders_creator_tracking_code_idx
  on public.customer_orders (creator_tracking_code)
  where creator_tracking_code is not null;

-- ---------------------------------------------------------------------------
-- Creator events (append-only analytics)
-- ---------------------------------------------------------------------------

create table if not exists public.creator_events (
  id uuid primary key default gen_random_uuid(),
  event_type text not null check (event_type in ('click', 'order', 'view')),
  creator_id uuid not null references auth.users (id) on delete cascade,
  product_id uuid references public.salvya_products (id) on delete set null,
  link_id uuid references public.creator_product_links (id) on delete set null,
  tracking_code text,
  user_id uuid references auth.users (id) on delete set null,
  order_id uuid references public.customer_orders (id) on delete set null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists creator_events_creator_type_created_idx
  on public.creator_events (creator_id, event_type, created_at desc);

create index if not exists creator_events_link_type_created_idx
  on public.creator_events (link_id, event_type, created_at desc)
  where link_id is not null;

create index if not exists creator_events_tracking_code_idx
  on public.creator_events (tracking_code)
  where tracking_code is not null;

create index if not exists creator_events_order_id_idx
  on public.creator_events (order_id)
  where order_id is not null;

-- ---------------------------------------------------------------------------
-- Creator earnings (commission ledger)
-- ---------------------------------------------------------------------------

create table if not exists public.creator_earnings (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid not null references auth.users (id) on delete cascade,
  order_id uuid not null unique references public.customer_orders (id) on delete cascade,
  link_id uuid references public.creator_product_links (id) on delete set null,
  gross_amount_minor integer not null check (gross_amount_minor >= 0),
  commission_rate numeric(6, 4) not null check (commission_rate >= 0 and commission_rate <= 1),
  amount_minor integer not null check (amount_minor >= 0),
  currency text not null default 'EUR',
  status text not null default 'pending'
    check (status in ('pending', 'available', 'paid', 'void')),
  self_referral boolean not null default false,
  created_at timestamptz not null default now(),
  available_at timestamptz,
  paid_at timestamptz
);

create index if not exists creator_earnings_creator_status_idx
  on public.creator_earnings (creator_id, status, created_at desc);

-- ---------------------------------------------------------------------------
-- Payout history (withdrawals)
-- ---------------------------------------------------------------------------

create table if not exists public.creator_payouts (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid not null references auth.users (id) on delete cascade,
  amount_minor integer not null check (amount_minor > 0),
  currency text not null default 'EUR',
  status text not null default 'completed'
    check (status in ('pending', 'completed', 'failed')),
  reference text,
  created_at timestamptz not null default now()
);

create index if not exists creator_payouts_creator_created_idx
  on public.creator_payouts (creator_id, created_at desc);

-- ---------------------------------------------------------------------------
-- RLS: creators read own rows; writes via service role only
-- ---------------------------------------------------------------------------

alter table public.creator_events enable row level security;
alter table public.creator_earnings enable row level security;
alter table public.creator_payouts enable row level security;

drop policy if exists "creator_events_select_own" on public.creator_events;
create policy "creator_events_select_own"
  on public.creator_events for select
  using (auth.uid() = creator_id);

drop policy if exists "creator_events_admin_select" on public.creator_events;
create policy "creator_events_admin_select"
  on public.creator_events for select
  using (public.is_admin());

drop policy if exists "creator_earnings_select_own" on public.creator_earnings;
create policy "creator_earnings_select_own"
  on public.creator_earnings for select
  using (auth.uid() = creator_id);

drop policy if exists "creator_earnings_admin_all" on public.creator_earnings;
create policy "creator_earnings_admin_all"
  on public.creator_earnings for all
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "creator_payouts_select_own" on public.creator_payouts;
create policy "creator_payouts_select_own"
  on public.creator_payouts for select
  using (auth.uid() = creator_id);

drop policy if exists "creator_payouts_admin_all" on public.creator_payouts;
create policy "creator_payouts_admin_all"
  on public.creator_payouts for all
  using (public.is_admin())
  with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- Record event + sync link counters (denormalized cache)
-- ---------------------------------------------------------------------------

create or replace function public.record_creator_event(
  p_event_type text,
  p_creator_id uuid,
  p_product_id uuid default null,
  p_link_id uuid default null,
  p_tracking_code text default null,
  p_user_id uuid default null,
  p_order_id uuid default null,
  p_metadata jsonb default '{}'::jsonb
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id uuid;
  v_code text;
begin
  if p_event_type not in ('click', 'order', 'view') then
    raise exception 'invalid event_type';
  end if;

  v_code := nullif(trim(upper(coalesce(p_tracking_code, ''))), '');

  insert into public.creator_events (
    event_type,
    creator_id,
    product_id,
    link_id,
    tracking_code,
    user_id,
    order_id,
    metadata
  )
  values (
    p_event_type,
    p_creator_id,
    p_product_id,
    p_link_id,
    v_code,
    p_user_id,
    p_order_id,
    coalesce(p_metadata, '{}'::jsonb)
  )
  returning id into v_id;

  if p_link_id is not null then
    if p_event_type = 'click' then
      update public.creator_product_links
      set clicks_count = clicks_count + 1
      where id = p_link_id;
    elsif p_event_type = 'order' then
      update public.creator_product_links
      set orders_count = orders_count + 1
      where id = p_link_id;
    end if;
  end if;

  return v_id;
end;
$$;

grant execute on function public.record_creator_event(text, uuid, uuid, uuid, text, uuid, uuid, jsonb) to service_role;

-- Keep legacy RPC delegating to events for backwards compatibility during rollout.
create or replace function public.increment_creator_link_click(p_tracking_code text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_link public.creator_product_links%rowtype;
begin
  select * into v_link
  from public.creator_product_links
  where tracking_code = trim(upper(p_tracking_code))
  limit 1;

  if not found then
    return;
  end if;

  perform public.record_creator_event(
    'click',
    v_link.creator_id,
    v_link.product_id,
    v_link.id,
    v_link.tracking_code,
    null,
    null,
    '{}'::jsonb
  );
end;
$$;

grant execute on function public.increment_creator_link_click(text) to service_role;

-- ---------------------------------------------------------------------------
-- Aggregated stats (O(1) dashboard reads)
-- ---------------------------------------------------------------------------

create or replace function public.get_creator_event_totals(p_creator_id uuid)
returns table (
  total_clicks bigint,
  total_orders bigint,
  total_views bigint
)
language sql
stable
security definer
set search_path = public
as $$
  select
    count(*) filter (where event_type = 'click') as total_clicks,
    count(*) filter (where event_type = 'order') as total_orders,
    count(*) filter (where event_type = 'view') as total_views
  from public.creator_events
  where creator_id = p_creator_id;
$$;

grant execute on function public.get_creator_event_totals(uuid) to service_role;

create or replace function public.get_creator_top_product_by_clicks(p_creator_id uuid)
returns table (
  product_id uuid,
  tracking_code text,
  clicks bigint
)
language sql
stable
security definer
set search_path = public
as $$
  select
    e.product_id,
    max(e.tracking_code) as tracking_code,
    count(*)::bigint as clicks
  from public.creator_events e
  where e.creator_id = p_creator_id
    and e.event_type = 'click'
    and e.product_id is not null
  group by e.product_id
  order by clicks desc
  limit 1;
$$;

grant execute on function public.get_creator_top_product_by_clicks(uuid) to service_role;

create or replace function public.get_creator_link_performance(p_creator_id uuid)
returns table (
  link_id uuid,
  tracking_code text,
  product_id uuid,
  product_title text,
  clicks bigint,
  orders bigint,
  revenue_minor bigint
)
language sql
stable
security definer
set search_path = public
as $$
  select
    l.id as link_id,
    l.tracking_code,
    l.product_id,
    coalesce(p.title, 'Product') as product_title,
    count(e.id) filter (where e.event_type = 'click') as clicks,
    count(e.id) filter (where e.event_type = 'order') as orders,
    coalesce(
      (
        select sum(ce.amount_minor)::bigint
        from public.creator_earnings ce
        where ce.creator_id = p_creator_id
          and ce.link_id = l.id
          and ce.status in ('pending', 'available', 'paid')
          and not ce.self_referral
      ),
      0
    ) as revenue_minor
  from public.creator_product_links l
  left join public.creator_events e on e.link_id = l.id
  left join public.salvya_products p on p.id = l.product_id
  where l.creator_id = p_creator_id
  group by l.id, l.tracking_code, l.product_id, p.title
  order by clicks desc, orders desc;
$$;

grant execute on function public.get_creator_link_performance(uuid) to service_role;


-- ========== 20250520130000_creator_phase3_trust.sql ==========

-- Creator Phase 3 — event trust, fraud, realtime metrics, payout automation.

-- ---------------------------------------------------------------------------
-- Event deduplication (idempotency)
-- ---------------------------------------------------------------------------

create table if not exists public.creator_event_dedup (
  id uuid primary key default gen_random_uuid(),
  event_type text not null check (event_type in ('click', 'order', 'view')),
  fingerprint_hash text not null,
  creator_id uuid references auth.users (id) on delete cascade,
  tracking_code text,
  product_id uuid references public.salvya_products (id) on delete set null,
  user_id uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists creator_event_dedup_fingerprint_created_idx
  on public.creator_event_dedup (fingerprint_hash, created_at desc);

create index if not exists creator_event_dedup_creator_created_idx
  on public.creator_event_dedup (creator_id, created_at desc);

-- ---------------------------------------------------------------------------
-- Fraud flags
-- ---------------------------------------------------------------------------

create table if not exists public.creator_fraud_flags (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid not null references auth.users (id) on delete cascade,
  event_id uuid references public.creator_events (id) on delete set null,
  reason text not null,
  severity text not null check (severity in ('low', 'medium', 'high')),
  auto_blocked boolean not null default false,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists creator_fraud_flags_creator_created_idx
  on public.creator_fraud_flags (creator_id, created_at desc);

create index if not exists creator_fraud_flags_severity_idx
  on public.creator_fraud_flags (severity, created_at desc);

-- ---------------------------------------------------------------------------
-- Last-touch referral history (attribution fallback)
-- ---------------------------------------------------------------------------

create table if not exists public.creator_referral_touches (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete cascade,
  visitor_key text not null,
  creator_id uuid not null references auth.users (id) on delete cascade,
  product_id uuid references public.salvya_products (id) on delete set null,
  link_id uuid references public.creator_product_links (id) on delete set null,
  tracking_code text not null,
  touched_at timestamptz not null default now()
);

create index if not exists creator_referral_touches_user_touched_idx
  on public.creator_referral_touches (user_id, touched_at desc)
  where user_id is not null;

create index if not exists creator_referral_touches_visitor_touched_idx
  on public.creator_referral_touches (visitor_key, touched_at desc);

-- ---------------------------------------------------------------------------
-- Realtime metrics (materialized on each trusted event)
-- ---------------------------------------------------------------------------

create table if not exists public.creator_metrics_realtime (
  creator_id uuid primary key references auth.users (id) on delete cascade,
  total_clicks bigint not null default 0,
  total_orders bigint not null default 0,
  total_views bigint not null default 0,
  clicks_today integer not null default 0,
  orders_today integer not null default 0,
  revenue_today_minor bigint not null default 0,
  conversion_rate numeric(8, 2) not null default 0,
  metrics_day date not null default (timezone('utc', now()))::date,
  top_product_id uuid references public.salvya_products (id) on delete set null,
  top_tracking_code text,
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Earnings trust columns
-- ---------------------------------------------------------------------------

alter table public.creator_earnings
  add column if not exists fraud_status text not null default 'valid'
    check (fraud_status in ('valid', 'suspicious', 'void')),
  add column if not exists locked boolean not null default false,
  add column if not exists payout_id uuid references public.creator_payouts (id) on delete set null;

create index if not exists creator_earnings_payable_idx
  on public.creator_earnings (creator_id, status, fraud_status)
  where status = 'available' and fraud_status = 'valid' and locked = false;

-- ---------------------------------------------------------------------------
-- Payout automation columns
-- ---------------------------------------------------------------------------

alter table public.creator_payouts
  add column if not exists method text not null default 'manual'
    check (method in ('paypal', 'bank', 'manual')),
  add column if not exists processed_at timestamptz,
  add column if not exists failure_reason text;

alter table public.creator_payouts drop constraint if exists creator_payouts_status_check;

alter table public.creator_payouts
  add constraint creator_payouts_status_check
  check (status in ('pending', 'processing', 'paid', 'failed', 'completed'));

-- Map legacy completed -> paid in app reads; keep completed valid in DB.

-- ---------------------------------------------------------------------------
-- RLS (admin read fraud; creators read own metrics)
-- ---------------------------------------------------------------------------

alter table public.creator_event_dedup enable row level security;
alter table public.creator_fraud_flags enable row level security;
alter table public.creator_referral_touches enable row level security;
alter table public.creator_metrics_realtime enable row level security;

drop policy if exists "creator_fraud_flags_admin" on public.creator_fraud_flags;
create policy "creator_fraud_flags_admin"
  on public.creator_fraud_flags for all
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "creator_metrics_select_own" on public.creator_metrics_realtime;
create policy "creator_metrics_select_own"
  on public.creator_metrics_realtime for select
  using (auth.uid() = creator_id);

drop policy if exists "creator_metrics_admin" on public.creator_metrics_realtime;
create policy "creator_metrics_admin"
  on public.creator_metrics_realtime for select
  using (public.is_admin());

-- ---------------------------------------------------------------------------
-- Materialize realtime metrics
-- ---------------------------------------------------------------------------

create or replace function public.materialize_creator_metrics(
  p_creator_id uuid,
  p_event_type text,
  p_revenue_minor integer default 0
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_day date := (timezone('utc', now()))::date;
  v_clicks bigint;
  v_orders bigint;
  v_rate numeric(8, 2);
begin
  insert into public.creator_metrics_realtime (creator_id, metrics_day)
  values (p_creator_id, v_day)
  on conflict (creator_id) do nothing;

  update public.creator_metrics_realtime m
  set
    metrics_day = v_day,
    clicks_today = (case when m.metrics_day = v_day then m.clicks_today else 0 end)
      + case when p_event_type = 'click' then 1 else 0 end,
    orders_today = (case when m.metrics_day = v_day then m.orders_today else 0 end)
      + case when p_event_type = 'order' then 1 else 0 end,
    revenue_today_minor = (case when m.metrics_day = v_day then m.revenue_today_minor else 0 end)
      + greatest(coalesce(p_revenue_minor, 0), 0),
    total_clicks = m.total_clicks + case when p_event_type = 'click' then 1 else 0 end,
    total_orders = m.total_orders + case when p_event_type = 'order' then 1 else 0 end,
    total_views = m.total_views + case when p_event_type = 'view' then 1 else 0 end,
    updated_at = now()
  where m.creator_id = p_creator_id;

  select total_clicks, total_orders into v_clicks, v_orders
  from public.creator_metrics_realtime where creator_id = p_creator_id;

  if v_clicks > 0 then
    v_rate := round((v_orders::numeric / v_clicks::numeric) * 100, 2);
  else
    v_rate := 0;
  end if;

  update public.creator_metrics_realtime
  set conversion_rate = v_rate
  where creator_id = p_creator_id;
end;
$$;

grant execute on function public.materialize_creator_metrics(uuid, text, integer) to service_role;

-- ---------------------------------------------------------------------------
-- Trusted event ingest (dedup + event + counters + metrics)
-- ---------------------------------------------------------------------------

create or replace function public.record_trusted_creator_event(
  p_event_type text,
  p_creator_id uuid,
  p_fingerprint_hash text,
  p_product_id uuid default null,
  p_link_id uuid default null,
  p_tracking_code text default null,
  p_user_id uuid default null,
  p_order_id uuid default null,
  p_metadata jsonb default '{}'::jsonb,
  p_dedup_window_minutes integer default 10,
  p_revenue_minor integer default 0
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id uuid;
  v_code text;
  v_dup boolean := false;
begin
  if p_event_type not in ('click', 'order', 'view') then
    raise exception 'invalid event_type';
  end if;

  if p_order_id is not null then
    select id into v_id from public.creator_events where order_id = p_order_id limit 1;
    if v_id is not null then
      return jsonb_build_object('duplicate', true, 'event_id', v_id);
    end if;
  end if;

  if p_fingerprint_hash is not null and length(trim(p_fingerprint_hash)) > 0 then
    select true into v_dup
    from public.creator_event_dedup d
    where d.fingerprint_hash = p_fingerprint_hash
      and d.created_at > now() - make_interval(mins => greatest(p_dedup_window_minutes, 1))
    limit 1;

    if v_dup then
      return jsonb_build_object('duplicate', true, 'event_id', null);
    end if;
  end if;

  v_code := nullif(trim(upper(coalesce(p_tracking_code, ''))), '');

  insert into public.creator_events (
    event_type, creator_id, product_id, link_id, tracking_code, user_id, order_id, metadata
  )
  values (
    p_event_type, p_creator_id, p_product_id, p_link_id, v_code, p_user_id, p_order_id,
    coalesce(p_metadata, '{}'::jsonb)
  )
  returning id into v_id;

  if p_fingerprint_hash is not null and length(trim(p_fingerprint_hash)) > 0 then
    insert into public.creator_event_dedup (
      event_type, fingerprint_hash, creator_id, tracking_code, product_id, user_id
    )
    values (
      p_event_type, p_fingerprint_hash, p_creator_id, v_code, p_product_id, p_user_id
    );
  end if;

  if p_link_id is not null then
    if p_event_type = 'click' then
      update public.creator_product_links set clicks_count = clicks_count + 1 where id = p_link_id;
    elsif p_event_type = 'order' then
      update public.creator_product_links set orders_count = orders_count + 1 where id = p_link_id;
    end if;
  end if;

  perform public.materialize_creator_metrics(p_creator_id, p_event_type, coalesce(p_revenue_minor, 0));

  return jsonb_build_object('duplicate', false, 'event_id', v_id);
end;
$$;

grant execute on function public.record_trusted_creator_event(
  text, uuid, text, uuid, uuid, text, uuid, uuid, jsonb, integer, integer
) to service_role;

-- Legacy wrappers delegate to trusted ingest
create or replace function public.record_creator_event(
  p_event_type text,
  p_creator_id uuid,
  p_product_id uuid default null,
  p_link_id uuid default null,
  p_tracking_code text default null,
  p_user_id uuid default null,
  p_order_id uuid default null,
  p_metadata jsonb default '{}'::jsonb
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_result jsonb;
  v_fp text;
begin
  v_fp := coalesce(p_metadata->>'fingerprint_hash', encode(sha256(
    (p_event_type || '|' || p_creator_id::text || '|' || coalesce(p_tracking_code, '') || '|' || coalesce(p_order_id::text, ''))::bytea
  ), 'hex'));

  v_result := public.record_trusted_creator_event(
    p_event_type, p_creator_id, v_fp, p_product_id, p_link_id, p_tracking_code,
    p_user_id, p_order_id, p_metadata, 10, 0
  );

  if coalesce((v_result->>'duplicate')::boolean, false) then
    return null;
  end if;

  return (v_result->>'event_id')::uuid;
end;
$$;

create or replace function public.increment_creator_link_click(p_tracking_code text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_link public.creator_product_links%rowtype;
  v_fp text;
begin
  select * into v_link
  from public.creator_product_links
  where tracking_code = trim(upper(p_tracking_code))
  limit 1;

  if not found then return; end if;

  v_fp := encode(sha256(
    ('click|' || v_link.tracking_code || '|' || v_link.id::text || '|' || extract(epoch from now())::bigint::text)::bytea
  ), 'hex');

  perform public.record_trusted_creator_event(
    'click', v_link.creator_id, v_fp, v_link.product_id, v_link.id, v_link.tracking_code,
    null, null, '{}'::jsonb, 1, 0
  );
end;
$$;


-- ========== 20250520140000_creator_phase4_growth_layer.sql ==========

-- Creator Phase 4 — campaigns, AI insights daily, payout requests, extended event types.

-- ---------------------------------------------------------------------------
-- Campaigns
-- ---------------------------------------------------------------------------

create table if not exists public.creator_campaigns (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  status text not null default 'active' check (status in ('active', 'paused', 'ended')),
  budget_optional integer,
  start_date date,
  end_date date,
  created_at timestamptz not null default now()
);

create index if not exists creator_campaigns_creator_status_idx
  on public.creator_campaigns (creator_id, status, created_at desc);

create table if not exists public.creator_campaign_links (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.creator_campaigns (id) on delete cascade,
  creator_product_link_id uuid not null references public.creator_product_links (id) on delete cascade,
  tracking_code_variant text not null default 'default',
  clicks integer not null default 0 check (clicks >= 0),
  orders integer not null default 0 check (orders >= 0),
  revenue_minor integer not null default 0 check (revenue_minor >= 0),
  created_at timestamptz not null default now(),
  unique (campaign_id, creator_product_link_id, tracking_code_variant)
);

create index if not exists creator_campaign_links_campaign_idx
  on public.creator_campaign_links (campaign_id);

-- ---------------------------------------------------------------------------
-- Daily AI insights (updated by cron)
-- ---------------------------------------------------------------------------

create table if not exists public.creator_insights_daily (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid not null references auth.users (id) on delete cascade,
  insight_date date not null default (timezone('utc', now()))::date,
  clicks integer not null default 0,
  orders integer not null default 0,
  conversion_rate numeric(8, 2) not null default 0,
  earnings_minor integer not null default 0,
  top_product_id uuid references public.salvya_products (id) on delete set null,
  anomaly_score integer not null default 0 check (anomaly_score >= 0 and anomaly_score <= 100),
  forecast_7d_minor integer not null default 0,
  forecast_30d_minor integer not null default 0,
  forecast_confidence integer not null default 50 check (forecast_confidence >= 0 and forecast_confidence <= 100),
  recommendation_text text,
  best_post_hour integer,
  viral_score integer not null default 0 check (viral_score >= 0 and viral_score <= 100),
  updated_at timestamptz not null default now(),
  unique (creator_id, insight_date)
);

create index if not exists creator_insights_daily_creator_date_idx
  on public.creator_insights_daily (creator_id, insight_date desc);

-- ---------------------------------------------------------------------------
-- Manual payout requests
-- ---------------------------------------------------------------------------

create table if not exists public.creator_payout_requests (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid not null references auth.users (id) on delete cascade,
  amount_minor integer not null check (amount_minor > 0),
  currency text not null default 'EUR',
  status text not null default 'pending'
    check (status in ('pending', 'approved', 'paid', 'rejected')),
  method text not null default 'paypal' check (method in ('paypal', 'bank', 'manual')),
  created_at timestamptz not null default now(),
  processed_at timestamptz
);

create index if not exists creator_payout_requests_creator_created_idx
  on public.creator_payout_requests (creator_id, created_at desc);

-- ---------------------------------------------------------------------------
-- Phase 4.1 placeholder — boost / collab marketplace
-- ---------------------------------------------------------------------------

create table if not exists public.creator_boost_marketplace (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid not null references auth.users (id) on delete cascade,
  product_id uuid references public.salvya_products (id) on delete set null,
  boost_type text not null default 'visibility' check (boost_type in ('visibility', 'collab', 'cross_promo')),
  status text not null default 'draft' check (status in ('draft', 'active', 'ended')),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------

alter table public.creator_campaigns enable row level security;
alter table public.creator_campaign_links enable row level security;
alter table public.creator_insights_daily enable row level security;
alter table public.creator_payout_requests enable row level security;
alter table public.creator_boost_marketplace enable row level security;

drop policy if exists "creator_campaigns_own" on public.creator_campaigns;
create policy "creator_campaigns_own"
  on public.creator_campaigns for all
  using (auth.uid() = creator_id)
  with check (auth.uid() = creator_id);

drop policy if exists "creator_campaigns_admin" on public.creator_campaigns;
create policy "creator_campaigns_admin"
  on public.creator_campaigns for all
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "creator_campaign_links_own" on public.creator_campaign_links;
create policy "creator_campaign_links_own"
  on public.creator_campaign_links for all
  using (
    exists (
      select 1 from public.creator_campaigns c
      where c.id = campaign_id and c.creator_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.creator_campaigns c
      where c.id = campaign_id and c.creator_id = auth.uid()
    )
  );

drop policy if exists "creator_campaign_links_admin" on public.creator_campaign_links;
create policy "creator_campaign_links_admin"
  on public.creator_campaign_links for all
  using (public.is_admin());

drop policy if exists "creator_insights_daily_own" on public.creator_insights_daily;
create policy "creator_insights_daily_own"
  on public.creator_insights_daily for select
  using (auth.uid() = creator_id);

drop policy if exists "creator_insights_daily_service" on public.creator_insights_daily;
create policy "creator_insights_daily_service"
  on public.creator_insights_daily for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

drop policy if exists "creator_insights_daily_admin" on public.creator_insights_daily;
create policy "creator_insights_daily_admin"
  on public.creator_insights_daily for all
  using (public.is_admin());

drop policy if exists "creator_payout_requests_own" on public.creator_payout_requests;
create policy "creator_payout_requests_own"
  on public.creator_payout_requests for all
  using (auth.uid() = creator_id)
  with check (auth.uid() = creator_id);

drop policy if exists "creator_payout_requests_admin" on public.creator_payout_requests;
create policy "creator_payout_requests_admin"
  on public.creator_payout_requests for all
  using (public.is_admin());

-- ---------------------------------------------------------------------------
-- Extend event types (additive — existing click/order/view unchanged)
-- ---------------------------------------------------------------------------

alter table public.creator_events drop constraint if exists creator_events_event_type_check;
alter table public.creator_events add constraint creator_events_event_type_check
  check (event_type in (
    'click', 'order', 'view',
    'campaign_click', 'campaign_order',
    'product_boost_view', 'wallet_view', 'insight_view'
  ));

alter table public.creator_event_dedup drop constraint if exists creator_event_dedup_event_type_check;
alter table public.creator_event_dedup add constraint creator_event_dedup_event_type_check
  check (event_type in (
    'click', 'order', 'view',
    'campaign_click', 'campaign_order',
    'product_boost_view', 'wallet_view', 'insight_view'
  ));

create or replace function public.creator_event_metrics_bucket(p_event_type text)
returns text
language sql
immutable
as $$
  select case
    when p_event_type in ('click', 'campaign_click') then 'click'
    when p_event_type in ('order', 'campaign_order') then 'order'
    when p_event_type in ('view', 'product_boost_view', 'wallet_view', 'insight_view') then 'view'
    else null
  end;
$$;

create or replace function public.materialize_creator_metrics(
  p_creator_id uuid,
  p_event_type text,
  p_revenue_minor integer default 0
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_day date := (timezone('utc', now()))::date;
  v_bucket text;
  v_clicks bigint;
  v_orders bigint;
  v_rate numeric(8, 2);
begin
  v_bucket := public.creator_event_metrics_bucket(p_event_type);
  if v_bucket is null then
    return;
  end if;

  insert into public.creator_metrics_realtime (creator_id, metrics_day)
  values (p_creator_id, v_day)
  on conflict (creator_id) do nothing;

  update public.creator_metrics_realtime m
  set
    metrics_day = v_day,
    clicks_today = (case when m.metrics_day = v_day then m.clicks_today else 0 end)
      + case when v_bucket = 'click' then 1 else 0 end,
    orders_today = (case when m.metrics_day = v_day then m.orders_today else 0 end)
      + case when v_bucket = 'order' then 1 else 0 end,
    revenue_today_minor = (case when m.metrics_day = v_day then m.revenue_today_minor else 0 end)
      + greatest(coalesce(p_revenue_minor, 0), 0),
    total_clicks = m.total_clicks + case when v_bucket = 'click' then 1 else 0 end,
    total_orders = m.total_orders + case when v_bucket = 'order' then 1 else 0 end,
    total_views = m.total_views + case when v_bucket = 'view' then 1 else 0 end,
    updated_at = now()
  where m.creator_id = p_creator_id;

  select total_clicks, total_orders into v_clicks, v_orders
  from public.creator_metrics_realtime where creator_id = p_creator_id;

  if v_clicks > 0 then
    v_rate := round((v_orders::numeric / v_clicks::numeric) * 100, 2);
  else
    v_rate := 0;
  end if;

  update public.creator_metrics_realtime
  set conversion_rate = v_rate
  where creator_id = p_creator_id;
end;
$$;

create or replace function public.record_trusted_creator_event(
  p_event_type text,
  p_creator_id uuid,
  p_fingerprint_hash text,
  p_product_id uuid default null,
  p_link_id uuid default null,
  p_tracking_code text default null,
  p_user_id uuid default null,
  p_order_id uuid default null,
  p_metadata jsonb default '{}'::jsonb,
  p_dedup_window_minutes integer default 10,
  p_revenue_minor integer default 0
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id uuid;
  v_code text;
  v_dup boolean := false;
  v_bucket text;
  v_campaign_link_id uuid;
begin
  if p_event_type not in (
    'click', 'order', 'view',
    'campaign_click', 'campaign_order',
    'product_boost_view', 'wallet_view', 'insight_view'
  ) then
    raise exception 'invalid event_type';
  end if;

  v_bucket := public.creator_event_metrics_bucket(p_event_type);

  if p_order_id is not null then
    select id into v_id from public.creator_events where order_id = p_order_id limit 1;
    if v_id is not null then
      return jsonb_build_object('duplicate', true, 'event_id', v_id);
    end if;
  end if;

  if p_fingerprint_hash is not null and length(trim(p_fingerprint_hash)) > 0 then
    select true into v_dup
    from public.creator_event_dedup d
    where d.fingerprint_hash = p_fingerprint_hash
      and d.created_at > now() - make_interval(mins => greatest(p_dedup_window_minutes, 1))
    limit 1;

    if v_dup then
      return jsonb_build_object('duplicate', true, 'event_id', null);
    end if;
  end if;

  v_code := nullif(trim(upper(coalesce(p_tracking_code, ''))), '');

  insert into public.creator_events (
    event_type, creator_id, product_id, link_id, tracking_code, user_id, order_id, metadata
  )
  values (
    p_event_type, p_creator_id, p_product_id, p_link_id, v_code, p_user_id, p_order_id,
    coalesce(p_metadata, '{}'::jsonb)
  )
  returning id into v_id;

  if p_fingerprint_hash is not null and length(trim(p_fingerprint_hash)) > 0 then
    insert into public.creator_event_dedup (
      event_type, fingerprint_hash, creator_id, tracking_code, product_id, user_id
    )
    values (
      p_event_type, p_fingerprint_hash, p_creator_id, v_code, p_product_id, p_user_id
    );
  end if;

  if p_link_id is not null and v_bucket in ('click', 'order') then
    if v_bucket = 'click' then
      update public.creator_product_links set clicks_count = clicks_count + 1 where id = p_link_id;
    else
      update public.creator_product_links set orders_count = orders_count + 1 where id = p_link_id;
    end if;
  end if;

  if (p_metadata ? 'campaign_link_id') then
    v_campaign_link_id := (p_metadata->>'campaign_link_id')::uuid;
    if v_campaign_link_id is not null then
      if v_bucket = 'click' then
        update public.creator_campaign_links set clicks = clicks + 1 where id = v_campaign_link_id;
      elsif v_bucket = 'order' then
        update public.creator_campaign_links
        set
          orders = orders + 1,
          revenue_minor = revenue_minor + greatest(coalesce(p_revenue_minor, 0), 0)
        where id = v_campaign_link_id;
      end if;
    end if;
  end if;

  perform public.materialize_creator_metrics(p_creator_id, p_event_type, coalesce(p_revenue_minor, 0));

  return jsonb_build_object('duplicate', false, 'event_id', v_id);
end;
$$;


-- ========== 20250520150000_creator_payout_system.sql ==========

-- Creator Phase 5 — production payout system, wallet cache, audit logs, export quota.

-- ---------------------------------------------------------------------------
-- Materialized wallet (fast reads, no heavy joins on dashboard)
-- ---------------------------------------------------------------------------

create table if not exists public.creator_wallet_balance (
  creator_id uuid primary key references auth.users (id) on delete cascade,
  available_balance_minor integer not null default 0 check (available_balance_minor >= 0),
  pending_balance_minor integer not null default 0 check (pending_balance_minor >= 0),
  pending_lock_minor integer not null default 0 check (pending_lock_minor >= 0),
  lifetime_earnings_minor integer not null default 0 check (lifetime_earnings_minor >= 0),
  currency text not null default 'EUR',
  updated_at timestamptz not null default now()
);

create index if not exists creator_wallet_balance_updated_idx
  on public.creator_wallet_balance (updated_at desc);

-- ---------------------------------------------------------------------------
-- Enhance creator_payouts (canonical withdrawal records)
-- ---------------------------------------------------------------------------

alter table public.creator_payouts
  add column if not exists requested_at timestamptz,
  add column if not exists external_reference text;

update public.creator_payouts
set requested_at = coalesce(requested_at, created_at)
where requested_at is null;

alter table public.creator_payouts drop constraint if exists creator_payouts_status_check;

alter table public.creator_payouts
  add constraint creator_payouts_status_check
  check (status in (
    'pending', 'approved', 'processing', 'paid', 'rejected', 'failed', 'completed'
  ));

-- ---------------------------------------------------------------------------
-- Audit trail (financial + fraud + reconciliation)
-- ---------------------------------------------------------------------------

create table if not exists public.creator_audit_logs (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid not null references auth.users (id) on delete cascade,
  action_type text not null,
  entity_type text not null check (entity_type in ('order', 'payout', 'event', 'campaign', 'earning', 'wallet', 'reconciliation')),
  entity_id text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists creator_audit_logs_creator_created_idx
  on public.creator_audit_logs (creator_id, created_at desc);

create index if not exists creator_audit_logs_entity_idx
  on public.creator_audit_logs (creator_id, entity_type, created_at desc);

-- ---------------------------------------------------------------------------
-- Data export rate limit (max 3/day per creator)
-- ---------------------------------------------------------------------------

create table if not exists public.creator_data_exports (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid not null references auth.users (id) on delete cascade,
  format text not null default 'json' check (format in ('json', 'csv')),
  created_at timestamptz not null default now()
);

create index if not exists creator_data_exports_creator_created_idx
  on public.creator_data_exports (creator_id, created_at desc);

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------

alter table public.creator_wallet_balance enable row level security;
alter table public.creator_audit_logs enable row level security;
alter table public.creator_data_exports enable row level security;

drop policy if exists "creator_wallet_balance_own" on public.creator_wallet_balance;
create policy "creator_wallet_balance_own"
  on public.creator_wallet_balance for select
  using (auth.uid() = creator_id);

drop policy if exists "creator_wallet_balance_admin" on public.creator_wallet_balance;
create policy "creator_wallet_balance_admin"
  on public.creator_wallet_balance for all
  using (public.is_admin());

drop policy if exists "creator_audit_logs_own" on public.creator_audit_logs;
create policy "creator_audit_logs_own"
  on public.creator_audit_logs for select
  using (auth.uid() = creator_id);

drop policy if exists "creator_audit_logs_admin" on public.creator_audit_logs;
create policy "creator_audit_logs_admin"
  on public.creator_audit_logs for all
  using (public.is_admin());

drop policy if exists "creator_data_exports_own" on public.creator_data_exports;
create policy "creator_data_exports_own"
  on public.creator_data_exports for select
  using (auth.uid() = creator_id);

-- ---------------------------------------------------------------------------
-- Refresh wallet from earnings + payout locks
-- ---------------------------------------------------------------------------

create or replace function public.refresh_creator_wallet_balance(p_creator_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_available integer := 0;
  v_pending integer := 0;
  v_lifetime integer := 0;
  v_lock integer := 0;
  v_currency text := 'EUR';
begin
  select coalesce(sum(
    case
      when self_referral or fraud_status = 'void' or status = 'void' then 0
      when status = 'available' and fraud_status = 'valid' and not locked then amount_minor
      else 0
    end
  ), 0),
  coalesce(sum(
    case
      when self_referral or fraud_status = 'void' or status = 'void' then 0
      when status = 'pending' and fraud_status = 'valid' and not locked then amount_minor
      else 0
    end
  ), 0),
  coalesce(sum(
    case
      when self_referral or status = 'void' or fraud_status = 'void' then 0
      else amount_minor
    end
  ), 0),
  coalesce(max(currency), 'EUR')
  into v_available, v_pending, v_lifetime, v_currency
  from public.creator_earnings
  where creator_id = p_creator_id;

  select coalesce(sum(amount_minor), 0)
  into v_lock
  from public.creator_payouts
  where creator_id = p_creator_id
    and status in ('pending', 'approved', 'processing');

  v_available := greatest(v_available - v_lock, 0);

  insert into public.creator_wallet_balance (
    creator_id,
    available_balance_minor,
    pending_balance_minor,
    pending_lock_minor,
    lifetime_earnings_minor,
    currency,
    updated_at
  )
  values (
    p_creator_id,
    v_available,
    v_pending,
    v_lock,
    v_lifetime,
    v_currency,
    now()
  )
  on conflict (creator_id) do update set
    available_balance_minor = excluded.available_balance_minor,
    pending_balance_minor = excluded.pending_balance_minor,
    pending_lock_minor = excluded.pending_lock_minor,
    lifetime_earnings_minor = excluded.lifetime_earnings_minor,
    currency = excluded.currency,
    updated_at = now();
end;
$$;

grant execute on function public.refresh_creator_wallet_balance(uuid) to service_role;

-- ---------------------------------------------------------------------------
-- Freeze balance for payout request (atomic)
-- ---------------------------------------------------------------------------

create or replace function public.freeze_creator_payout_amount(
  p_creator_id uuid,
  p_amount_minor integer
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_available integer;
begin
  if p_amount_minor is null or p_amount_minor <= 0 then
    return jsonb_build_object('ok', false, 'error', 'invalid_amount');
  end if;

  perform public.refresh_creator_wallet_balance(p_creator_id);

  select available_balance_minor into v_available
  from public.creator_wallet_balance
  where creator_id = p_creator_id;

  if v_available is null or v_available < p_amount_minor then
    return jsonb_build_object('ok', false, 'error', 'insufficient_balance', 'available', coalesce(v_available, 0));
  end if;

  update public.creator_wallet_balance
  set
    available_balance_minor = available_balance_minor - p_amount_minor,
    pending_lock_minor = pending_lock_minor + p_amount_minor,
    updated_at = now()
  where creator_id = p_creator_id;

  return jsonb_build_object('ok', true);
end;
$$;

grant execute on function public.freeze_creator_payout_amount(uuid, integer) to service_role;

-- ---------------------------------------------------------------------------
-- Release lock on rejected payout
-- ---------------------------------------------------------------------------

create or replace function public.release_creator_payout_lock(
  p_creator_id uuid,
  p_amount_minor integer
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.creator_wallet_balance
  set
    available_balance_minor = available_balance_minor + greatest(p_amount_minor, 0),
    pending_lock_minor = greatest(pending_lock_minor - greatest(p_amount_minor, 0), 0),
    updated_at = now()
  where creator_id = p_creator_id;

  perform public.refresh_creator_wallet_balance(p_creator_id);
end;
$$;

grant execute on function public.release_creator_payout_lock(uuid, integer) to service_role;


-- ========== 20250520160000_creator_phase6_growth_ai.sql ==========

-- =============================================================================
-- Creator Phase 6 — virality, growth score, boost candidates, leaderboard,
-- AI engagement event types.
--
-- Prerequisites (run first):
--   - salvya_products, creator_product_links (Phase 1–2)
--   - creator_events, creator_event_dedup, materialize_creator_metrics (Phase 3–4)
--   - creator_campaign_links (Phase 4, for campaign_* events in record_trusted_creator_event)
--
-- Safe to re-run: uses IF NOT EXISTS / DROP IF EXISTS throughout.
-- Do NOT use partial indexes with now() in the predicate (PostgreSQL 42P17).
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Prerequisite guard
-- -----------------------------------------------------------------------------

do $$
begin
  if to_regclass('public.creator_events') is null then
    raise exception
      'Phase 6 requires public.creator_events. Apply creator Phase 3–4 migrations first.';
  end if;
  if to_regclass('public.salvya_products') is null then
    raise exception
      'Phase 6 requires public.salvya_products.';
  end if;
  if to_regclass('public.creator_product_links') is null then
    raise exception
      'Phase 6 requires public.creator_product_links.';
  end if;
end $$;

-- -----------------------------------------------------------------------------
-- Cleanup: broken partial index from earlier draft (expires_at > now())
-- -----------------------------------------------------------------------------

drop index if exists public.creator_boost_candidates_active_idx;

-- -----------------------------------------------------------------------------
-- Virality snapshots (recomputed by cron)
-- -----------------------------------------------------------------------------

create table if not exists public.creator_virality_snapshots (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid not null references auth.users (id) on delete cascade,
  product_id uuid references public.salvya_products (id) on delete cascade,
  link_id uuid references public.creator_product_links (id) on delete set null,
  viral_score integer not null default 0
    check (viral_score >= 0 and viral_score <= 100),
  viral_stage text not null default 'cold'
    check (viral_stage in ('cold', 'warming', 'hot', 'viral', 'saturated')),
  expected_peak_time timestamptz,
  expected_revenue_multiplier numeric(6, 2) not null default 1.0,
  signals jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create index if not exists creator_virality_snapshots_creator_product_idx
  on public.creator_virality_snapshots (creator_id, product_id);

create index if not exists creator_virality_snapshots_score_idx
  on public.creator_virality_snapshots (viral_score desc, updated_at desc);

-- -----------------------------------------------------------------------------
-- Growth score + rank tier
-- -----------------------------------------------------------------------------

create table if not exists public.creator_growth_scores (
  creator_id uuid primary key references auth.users (id) on delete cascade,
  growth_score integer not null default 0
    check (growth_score >= 0 and growth_score <= 1000),
  rank_tier text not null default 'bronze'
    check (rank_tier in ('bronze', 'silver', 'gold', 'diamond')),
  revenue_growth_pct numeric(8, 2) not null default 0,
  ctr_trend_pct numeric(8, 2) not null default 0,
  consistency_days integer not null default 0,
  virality_component integer not null default 0,
  week_progression jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);

-- -----------------------------------------------------------------------------
-- Organic boost candidates (storefront ranking weight)
-- -----------------------------------------------------------------------------

create table if not exists public.creator_boost_candidates (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.salvya_products (id) on delete cascade,
  creator_id uuid references auth.users (id) on delete set null,
  boost_weight numeric(4, 2) not null default 1.0
    check (boost_weight >= 1.0 and boost_weight <= 1.5),
  reason text not null default '',
  badge text,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

create index if not exists creator_boost_candidates_product_expires_idx
  on public.creator_boost_candidates (product_id, expires_at desc);

-- Query-time filter: WHERE expires_at > now() — index on expires_at only (no now() in predicate).
create index if not exists creator_boost_candidates_expires_idx
  on public.creator_boost_candidates (expires_at desc);

-- -----------------------------------------------------------------------------
-- Weekly leaderboard
-- -----------------------------------------------------------------------------

create table if not exists public.creator_leaderboard_weekly (
  week_key text not null,
  creator_id uuid not null references auth.users (id) on delete cascade,
  growth_score integer not null default 0,
  revenue_minor integer not null default 0,
  viral_score integer not null default 0,
  conversion_rate numeric(8, 2) not null default 0,
  badges jsonb not null default '[]'::jsonb,
  rank_position integer not null default 0,
  display_name text,
  updated_at timestamptz not null default now(),
  primary key (week_key, creator_id)
);

create index if not exists creator_leaderboard_weekly_week_rank_idx
  on public.creator_leaderboard_weekly (week_key, rank_position);

-- -----------------------------------------------------------------------------
-- RLS
-- -----------------------------------------------------------------------------

alter table public.creator_virality_snapshots enable row level security;
alter table public.creator_growth_scores enable row level security;
alter table public.creator_boost_candidates enable row level security;
alter table public.creator_leaderboard_weekly enable row level security;

drop policy if exists "creator_virality_own" on public.creator_virality_snapshots;
create policy "creator_virality_own"
  on public.creator_virality_snapshots
  for select
  to authenticated
  using (auth.uid() = creator_id);

drop policy if exists "creator_virality_public_read" on public.creator_virality_snapshots;
create policy "creator_virality_public_read"
  on public.creator_virality_snapshots
  for select
  using (true);

drop policy if exists "creator_growth_scores_own" on public.creator_growth_scores;
create policy "creator_growth_scores_own"
  on public.creator_growth_scores
  for select
  to authenticated
  using (auth.uid() = creator_id);

drop policy if exists "creator_growth_scores_public" on public.creator_growth_scores;
create policy "creator_growth_scores_public"
  on public.creator_growth_scores
  for select
  using (true);

drop policy if exists "creator_boost_public" on public.creator_boost_candidates;
create policy "creator_boost_public"
  on public.creator_boost_candidates
  for select
  using (true);

drop policy if exists "creator_leaderboard_public" on public.creator_leaderboard_weekly;
create policy "creator_leaderboard_public"
  on public.creator_leaderboard_weekly
  for select
  using (true);

-- Cron / service writes (bypass not needed if using service_role key; explicit for supabase client)
drop policy if exists "creator_virality_service" on public.creator_virality_snapshots;
create policy "creator_virality_service"
  on public.creator_virality_snapshots
  for all
  to service_role
  using (true)
  with check (true);

drop policy if exists creator_growth_scores_service on public.creator_growth_scores;
create policy creator_growth_scores_service
  on public.creator_growth_scores
  for all
  to service_role
  using (true)
  with check (true);

drop policy if exists "creator_boost_service" on public.creator_boost_candidates;
create policy "creator_boost_service"
  on public.creator_boost_candidates
  for all
  to service_role
  using (true)
  with check (true);

drop policy if exists "creator_leaderboard_service" on public.creator_leaderboard_weekly;
create policy "creator_leaderboard_service"
  on public.creator_leaderboard_weekly
  for all
  to service_role
  using (true)
  with check (true);

-- -----------------------------------------------------------------------------
-- Phase 6 AI engagement event types (extends Phase 4)
-- -----------------------------------------------------------------------------

alter table public.creator_events
  drop constraint if exists creator_events_event_type_check;

alter table public.creator_events
  add constraint creator_events_event_type_check
  check (
    event_type in (
      'click', 'order', 'view',
      'campaign_click', 'campaign_order',
      'product_boost_view', 'wallet_view', 'insight_view',
      'ai_insight_view', 'viral_prediction_view', 'growth_score_view', 'boost_suggestion_click'
    )
  );

alter table public.creator_event_dedup
  drop constraint if exists creator_event_dedup_event_type_check;

alter table public.creator_event_dedup
  add constraint creator_event_dedup_event_type_check
  check (
    event_type in (
      'click', 'order', 'view',
      'campaign_click', 'campaign_order',
      'product_boost_view', 'wallet_view', 'insight_view',
      'ai_insight_view', 'viral_prediction_view', 'growth_score_view', 'boost_suggestion_click'
    )
  );

create or replace function public.creator_event_metrics_bucket(p_event_type text)
returns text
language sql
immutable
set search_path = public
as $$
  select case
    when p_event_type in ('click', 'campaign_click') then 'click'
    when p_event_type in ('order', 'campaign_order') then 'order'
    when p_event_type in (
      'view', 'product_boost_view', 'wallet_view', 'insight_view',
      'ai_insight_view', 'viral_prediction_view', 'growth_score_view', 'boost_suggestion_click'
    ) then 'view'
    else null
  end;
$$;

create or replace function public.record_trusted_creator_event(
  p_event_type text,
  p_creator_id uuid,
  p_fingerprint_hash text,
  p_product_id uuid default null,
  p_link_id uuid default null,
  p_tracking_code text default null,
  p_user_id uuid default null,
  p_order_id uuid default null,
  p_metadata jsonb default '{}'::jsonb,
  p_dedup_window_minutes integer default 10,
  p_revenue_minor integer default 0
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id uuid;
  v_code text;
  v_dup boolean := false;
  v_bucket text;
  v_campaign_link_id uuid;
begin
  if p_event_type not in (
    'click', 'order', 'view',
    'campaign_click', 'campaign_order',
    'product_boost_view', 'wallet_view', 'insight_view',
    'ai_insight_view', 'viral_prediction_view', 'growth_score_view', 'boost_suggestion_click'
  ) then
    raise exception 'invalid event_type: %', p_event_type;
  end if;

  v_bucket := public.creator_event_metrics_bucket(p_event_type);

  -- Pure engagement events: insert only, no dedup / link counters / metrics rollup.
  if v_bucket is null and p_order_id is null then
    insert into public.creator_events (
      event_type, creator_id, product_id, link_id, tracking_code, user_id, order_id, metadata
    )
    values (
      p_event_type,
      p_creator_id,
      p_product_id,
      p_link_id,
      nullif(trim(upper(coalesce(p_tracking_code, ''))), ''),
      p_user_id,
      p_order_id,
      coalesce(p_metadata, '{}'::jsonb)
    )
    returning id into v_id;

    return jsonb_build_object('duplicate', false, 'event_id', v_id);
  end if;

  if p_order_id is not null then
    select id into v_id
    from public.creator_events
    where order_id = p_order_id
    limit 1;

    if v_id is not null then
      return jsonb_build_object('duplicate', true, 'event_id', v_id);
    end if;
  end if;

  if p_fingerprint_hash is not null and length(trim(p_fingerprint_hash)) > 0 then
    select true into v_dup
    from public.creator_event_dedup d
    where d.fingerprint_hash = p_fingerprint_hash
      and d.created_at > now() - make_interval(mins => greatest(p_dedup_window_minutes, 1))
    limit 1;

    if v_dup then
      return jsonb_build_object('duplicate', true, 'event_id', null);
    end if;
  end if;

  v_code := nullif(trim(upper(coalesce(p_tracking_code, ''))), '');

  insert into public.creator_events (
    event_type, creator_id, product_id, link_id, tracking_code, user_id, order_id, metadata
  )
  values (
    p_event_type,
    p_creator_id,
    p_product_id,
    p_link_id,
    v_code,
    p_user_id,
    p_order_id,
    coalesce(p_metadata, '{}'::jsonb)
  )
  returning id into v_id;

  if p_fingerprint_hash is not null and length(trim(p_fingerprint_hash)) > 0 then
    insert into public.creator_event_dedup (
      event_type, fingerprint_hash, creator_id, tracking_code, product_id, user_id
    )
    values (
      p_event_type, p_fingerprint_hash, p_creator_id, v_code, p_product_id, p_user_id
    );
  end if;

  if p_link_id is not null and v_bucket in ('click', 'order') then
    if v_bucket = 'click' then
      update public.creator_product_links
      set clicks_count = clicks_count + 1
      where id = p_link_id;
    else
      update public.creator_product_links
      set orders_count = orders_count + 1
      where id = p_link_id;
    end if;
  end if;

  if p_metadata ? 'campaign_link_id' then
    v_campaign_link_id := (p_metadata->>'campaign_link_id')::uuid;

    if v_campaign_link_id is not null and to_regclass('public.creator_campaign_links') is not null then
      if v_bucket = 'click' then
        update public.creator_campaign_links
        set clicks = clicks + 1
        where id = v_campaign_link_id;
      elsif v_bucket = 'order' then
        update public.creator_campaign_links
        set
          orders = orders + 1,
          revenue_minor = revenue_minor + greatest(coalesce(p_revenue_minor, 0), 0)
        where id = v_campaign_link_id;
      end if;
    end if;
  end if;

  if v_bucket is not null then
    perform public.materialize_creator_metrics(
      p_creator_id,
      p_event_type,
      coalesce(p_revenue_minor, 0)
    );
  end if;

  return jsonb_build_object('duplicate', false, 'event_id', v_id);
end;
$$;

grant execute on function public.creator_event_metrics_bucket(text) to authenticated, service_role;
grant execute on function public.record_trusted_creator_event(
  text, uuid, text, uuid, uuid, text, uuid, uuid, jsonb, integer, integer
) to authenticated, service_role;


-- ========== 20250520160100_fix_phase6_boost_index.sql ==========

-- Deprecated: merged into 20250520160000_creator_phase6_growth_ai.sql
-- (drops creator_boost_candidates_active_idx + creates creator_boost_candidates_expires_idx).
-- If Phase 6 tables are missing, run the full Phase 6 migration instead of this file.

select 1;


-- ========== 20250520170000_creator_phase7_notifications.sql ==========

-- Phase 7: Creator studio notifications (separate from storefront member alerts)

CREATE TABLE IF NOT EXISTS public.creator_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (
    type IN (
      'order_from_link',
      'link_milestone',
      'campaign_alert',
      'payout_status',
      'fraud_warning',
      'ai_insight'
    )
  ),
  title text NOT NULL,
  body text,
  href text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  read_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS creator_notifications_creator_created_idx
  ON public.creator_notifications (creator_id, created_at DESC);

CREATE INDEX IF NOT EXISTS creator_notifications_creator_unread_idx
  ON public.creator_notifications (creator_id)
  WHERE read_at IS NULL;

ALTER TABLE public.creator_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY creator_notifications_select_own
  ON public.creator_notifications
  FOR SELECT
  TO authenticated
  USING (creator_id = auth.uid());

CREATE POLICY creator_notifications_update_own
  ON public.creator_notifications
  FOR UPDATE
  TO authenticated
  USING (creator_id = auth.uid())
  WITH CHECK (creator_id = auth.uid());
