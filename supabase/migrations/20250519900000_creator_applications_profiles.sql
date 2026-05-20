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
