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
