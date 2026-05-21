# Salvya image optimization

Uploads through admin APIs and blog sync are processed server-side with **Sharp**:

| Variant | Max width | Use |
|---------|-----------|-----|
| `thumb` | 150px | Avatars, rails |
| `small` | 480px | Cards, grids |
| `medium` | 1080px | **Default DB URL** |
| `large` | 2048px | PDP, hero |

Each upload stores `{basePath}-{variant}.webp` in Supabase Storage with long-lived `Cache-Control` for CDN caching.

## Display

Use `SalvyaOptimizedImage` (blur placeholder, lazy load, responsive `sizes`, Next.js AVIF/WebP).

## Client uploads

`postOptimizedImageUpload()` retries failed uploads (3 attempts, backoff).

## Supabase

Apply migration `20250520100000_image_optimization_storage.sql`. Re-upload assets to generate variants.
