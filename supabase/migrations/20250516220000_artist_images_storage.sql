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
