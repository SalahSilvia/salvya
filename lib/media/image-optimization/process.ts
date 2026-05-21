import "server-only";

import sharp from "sharp";
import {
  BLUR_PLACEHOLDER_WIDTH,
  VARIANT_SPECS,
} from "@/lib/media/image-optimization/constants";
import type { ImageVariantKey, ProcessedVariants } from "@/lib/media/image-optimization/types";
import { validateImageDimensions } from "@/lib/media/image-optimization/validate";

const VARIANT_ORDER: ImageVariantKey[] = ["thumb", "small", "medium", "large"];

/**
 * Facebook/Instagram-style pipeline: auto-orient, resize, WebP variants + blur placeholder.
 */
export async function processImageToVariants(input: Buffer): Promise<ProcessedVariants> {
  const pipeline = sharp(input, { animated: false, failOn: "none" }).rotate();
  const meta = await pipeline.metadata();
  const width = meta.width ?? 0;
  const height = meta.height ?? 0;
  const dimErr = validateImageDimensions(width, height);
  if (dimErr) throw new Error(dimErr);

  const variants = {} as Record<ImageVariantKey, Buffer>;
  let outputBytes = 0;

  for (const key of VARIANT_ORDER) {
    const spec = VARIANT_SPECS[key];
    const buf = await sharp(input, { animated: false, failOn: "none" })
      .rotate()
      .resize({
        width: spec.maxWidth,
        height: spec.maxWidth,
        fit: "inside",
        withoutEnlargement: true,
      })
      .webp({ quality: spec.quality, effort: 4, smartSubsample: true })
      .toBuffer();
    variants[key] = buf;
    outputBytes += buf.length;
  }

  const blurBuf = await sharp(input, { animated: false, failOn: "none" })
    .rotate()
    .resize({ width: BLUR_PLACEHOLDER_WIDTH, withoutEnlargement: true })
    .webp({ quality: 42, effort: 2 })
    .toBuffer();

  const blurDataUrl = `data:image/webp;base64,${blurBuf.toString("base64")}`;

  return {
    variants,
    blurDataUrl,
    width,
    height,
    originalBytes: input.length,
    outputBytes,
  };
}
