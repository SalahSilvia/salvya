export {
  normalizeProductImageUrl as normalizeProductImageUrlClient,
} from "@/lib/media/product-image-url-core";

/** Use unoptimized Next/Image for same-origin API/media paths. */
export function shouldUnoptimizeProductImage(src: string): boolean {
  return src.startsWith("/api/") || src.startsWith("/media/");
}
