-- Products: slug unique per artist (not globally) so folder names can repeat across artists.

alter table public.salvya_products drop constraint if exists salvya_products_slug_key;

create unique index if not exists salvya_products_artist_slug_slug_uidx
  on public.salvya_products (artist_slug, slug);
