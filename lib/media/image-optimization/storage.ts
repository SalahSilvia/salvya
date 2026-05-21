import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import {
  UPSERT_CACHE_CONTROL,
  VARIANT_CACHE_CONTROL,
  VARIANT_SUFFIX,
} from "@/lib/media/image-optimization/constants";
import type { ImageVariantKey, OptimizedImageResult, ProcessedVariants } from "@/lib/media/image-optimization/types";

function variantPath(basePath: string, key: ImageVariantKey): string {
  return `${basePath}${VARIANT_SUFFIX[key]}.webp`;
}

function publicUrl(
  service: SupabaseClient,
  bucket: string,
  path: string,
  cacheVersion?: string,
): string {
  const { data } = service.storage.from(bucket).getPublicUrl(path);
  if (!cacheVersion) return data.publicUrl;
  const sep = data.publicUrl.includes("?") ? "&" : "?";
  return `${data.publicUrl}${sep}v=${encodeURIComponent(cacheVersion)}`;
}

export async function uploadProcessedVariants(
  service: SupabaseClient,
  bucket: string,
  basePath: string,
  processed: ProcessedVariants,
  options?: { upsert?: boolean; cacheVersion?: string },
): Promise<OptimizedImageResult> {
  const upsert = options?.upsert ?? false;
  const cacheControl = upsert ? UPSERT_CACHE_CONTROL : VARIANT_CACHE_CONTROL;
  const cacheVersion = options?.cacheVersion ?? (upsert ? String(Date.now()) : undefined);

  const keys = Object.keys(processed.variants) as ImageVariantKey[];

  for (const key of keys) {
    const path = variantPath(basePath, key);
    const body = processed.variants[key];
    const { error } = await service.storage.from(bucket).upload(path, body, {
      contentType: "image/webp",
      upsert,
      cacheControl,
    });
    if (error) {
      throw new Error(`Storage upload failed (${path}): ${error.message}`);
    }
  }

  const variants = {} as OptimizedImageResult["variants"];
  for (const key of keys) {
    variants[key] = publicUrl(service, bucket, variantPath(basePath, key), cacheVersion);
  }

  return {
    url: variants.medium,
    basePath,
    variants,
    blurDataUrl: processed.blurDataUrl,
    width: processed.width,
    height: processed.height,
    bytesSaved: Math.max(0, processed.originalBytes - processed.outputBytes),
  };
}
