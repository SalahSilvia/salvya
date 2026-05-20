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
