import {
  VARIANT_SUFFIX,
} from "@/lib/media/image-optimization/constants";
import type { ImageDisplayContext, ImageVariantKey, ImageVariantUrls } from "@/lib/media/image-optimization/types";

const SUFFIX_PATTERN = /-(thumb|small|medium|large)\.webp(\?.*)?$/i;

/** Detect Salvya optimized variant URLs from Supabase or CDN. */
export function isOptimizedVariantUrl(url: string): boolean {
  return SUFFIX_PATTERN.test(url);
}

export function stripVariantSuffix(url: string): string {
  return url.replace(SUFFIX_PATTERN, "").replace(/\?.*$/, "");
}

/** Derive sibling variant URLs from a medium (primary) URL. */
export function deriveVariantUrls(primaryUrl: string): Partial<ImageVariantUrls> | null {
  if (!primaryUrl || !isOptimizedVariantUrl(primaryUrl)) return null;
  const base = stripVariantSuffix(primaryUrl.split("?")[0] ?? primaryUrl);
  const query = primaryUrl.includes("?") ? primaryUrl.slice(primaryUrl.indexOf("?")) : "";
  const keys = Object.keys(VARIANT_SUFFIX) as ImageVariantKey[];
  const out = {} as ImageVariantUrls;
  for (const key of keys) {
    out[key] = `${base}${VARIANT_SUFFIX[key]}.webp${query}`;
  }
  return out;
}

const CONTEXT_VARIANT: Record<ImageDisplayContext, ImageVariantKey> = {
  thumb: "thumb",
  card: "small",
  gallery: "medium",
  hero: "large",
  banner: "large",
};

export function pickDisplayUrl(
  primaryUrl: string,
  variants?: Partial<ImageVariantUrls> | null,
  context: ImageDisplayContext = "card",
): string {
  const key = CONTEXT_VARIANT[context];
  if (variants?.[key]) return variants[key]!;
  const derived = deriveVariantUrls(primaryUrl);
  if (derived?.[key]) return derived[key]!;
  return primaryUrl;
}

/** Responsive `sizes` hints for Next/Image. */
export function defaultSizesForContext(context: ImageDisplayContext): string {
  switch (context) {
    case "thumb":
      return "96px";
    case "card":
      return "(max-width: 640px) 50vw, 320px";
    case "gallery":
      return "(max-width: 768px) 100vw, 60vw";
    case "banner":
      return "(max-width: 768px) 100vw, 1200px";
    case "hero":
    default:
      return "100vw";
  }
}
