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
