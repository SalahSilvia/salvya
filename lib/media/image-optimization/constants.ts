import type { ImageVariantKey } from "@/lib/media/image-optimization/types";

/** Max upload size before processing (client + server). */
export const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;

/** Blog covers may be slightly larger source files. */
export const MAX_BLOG_UPLOAD_BYTES = 10 * 1024 * 1024;

export const ALLOWED_UPLOAD_MIMES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
]);

export const MAX_IMAGE_DIMENSION = 8192;

/** Long cache for immutable variant files (CDN-friendly). */
export const VARIANT_CACHE_CONTROL = "public, max-age=31536000, immutable";

/** Shorter cache when upserting profile/cover (bust via ?v=). */
export const UPSERT_CACHE_CONTROL = "public, max-age=86400";

export const VARIANT_SPECS: Record<
  ImageVariantKey,
  { maxWidth: number; quality: number }
> = {
  thumb: { maxWidth: 150, quality: 72 },
  small: { maxWidth: 480, quality: 78 },
  medium: { maxWidth: 1080, quality: 82 },
  large: { maxWidth: 2048, quality: 85 },
};

export const BLUR_PLACEHOLDER_WIDTH = 24;

export const VARIANT_SUFFIX: Record<ImageVariantKey, string> = {
  thumb: "-thumb",
  small: "-small",
  medium: "-medium",
  large: "-large",
};
