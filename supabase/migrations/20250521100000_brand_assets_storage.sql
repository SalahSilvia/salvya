-- Site brand assets (favicon, marks) — public CDN URLs referenced from store_settings.platform.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'brand-assets',
  'brand-assets',
  true,
  2097152,
  array['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml', 'image/x-icon']::text[]
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "brand_assets_public_read" on storage.objects;
create policy "brand_assets_public_read"
  on storage.objects for select
  using (bucket_id = 'brand-assets');

drop policy if exists "brand_assets_service_write" on storage.objects;
create policy "brand_assets_service_write"
  on storage.objects for insert
  with check (bucket_id = 'brand-assets');

drop policy if exists "brand_assets_service_update" on storage.objects;
create policy "brand_assets_service_update"
  on storage.objects for update
  using (bucket_id = 'brand-assets');

drop policy if exists "brand_assets_service_delete" on storage.objects;
create policy "brand_assets_service_delete"
  on storage.objects for delete
  using (bucket_id = 'brand-assets');
