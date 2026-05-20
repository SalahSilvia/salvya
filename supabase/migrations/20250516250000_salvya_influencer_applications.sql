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
