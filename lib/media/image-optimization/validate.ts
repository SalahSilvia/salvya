import {
  ALLOWED_UPLOAD_MIMES,
  MAX_IMAGE_DIMENSION,
  MAX_UPLOAD_BYTES,
} from "@/lib/media/image-optimization/constants";

export type ImageValidationResult =
  | { ok: true; mime: string; byteLength: number }
  | { ok: false; error: string };

export function validateImageUpload(
  buffer: Buffer,
  mime: string,
  maxBytes: number = MAX_UPLOAD_BYTES,
): ImageValidationResult {
  if (!buffer.length) {
    return { ok: false, error: "Empty image file." };
  }
  if (buffer.length > maxBytes) {
    const mb = Math.round(maxBytes / (1024 * 1024));
    return { ok: false, error: `Image must be ${mb} MB or smaller.` };
  }
  const normalized = mime?.toLowerCase() || "image/jpeg";
  if (!ALLOWED_UPLOAD_MIMES.has(normalized)) {
    return { ok: false, error: "Use JPEG, PNG, WebP, GIF, or AVIF." };
  }
  return { ok: true, mime: normalized, byteLength: buffer.length };
}

/** Sharp metadata guard — call after decode. */
export function validateImageDimensions(width: number, height: number): string | null {
  if (!width || !height) return "Could not read image dimensions.";
  if (width > MAX_IMAGE_DIMENSION || height > MAX_IMAGE_DIMENSION) {
    return `Image dimensions must be under ${MAX_IMAGE_DIMENSION}px.`;
  }
  return null;
}
