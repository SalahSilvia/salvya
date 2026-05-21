-- Image optimization: allow AVIF uploads; CDN-friendly cache hints documented in app upload layer.

UPDATE storage.buckets
SET
  allowed_mime_types = ARRAY[
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'image/avif'
  ]::text[],
  file_size_limit = 10485760
WHERE id IN ('product-images', 'artist-images', 'blog-images');
