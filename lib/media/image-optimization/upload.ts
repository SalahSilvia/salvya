import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import { processImageToVariants } from "@/lib/media/image-optimization/process";
import { uploadProcessedVariants } from "@/lib/media/image-optimization/storage";
import type { OptimizedImageResult } from "@/lib/media/image-optimization/types";
import { validateImageUpload } from "@/lib/media/image-optimization/validate";

export type UploadOptimizedOptions = {
  maxBytes?: number;
  upsert?: boolean;
  cacheVersion?: string;
};

/**
 * Validate → compress/resize → upload thumb/small/medium/large WebP variants to Supabase.
 */
export async function uploadOptimizedImage(
  service: SupabaseClient,
  bucket: string,
  basePath: string,
  input: Buffer,
  mime: string,
  options?: UploadOptimizedOptions,
): Promise<OptimizedImageResult> {
  const validation = validateImageUpload(input, mime, options?.maxBytes);
  if (!validation.ok) throw new Error(validation.error);

  const processed = await processImageToVariants(input);
  return uploadProcessedVariants(service, bucket, basePath, processed, {
    upsert: options?.upsert,
    cacheVersion: options?.cacheVersion,
  });
}
