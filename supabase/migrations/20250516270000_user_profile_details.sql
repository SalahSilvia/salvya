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
