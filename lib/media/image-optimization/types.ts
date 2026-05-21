/** Generated size keys (Instagram/Facebook-style responsive set). */
export type ImageVariantKey = "thumb" | "small" | "medium" | "large";

export type ImageVariantUrls = Record<ImageVariantKey, string>;

/** API + storage payload returned after an optimized upload. */
export type OptimizedImageResult = {
  /** Primary URL for DB fields — medium variant. */
  url: string;
  /** Storage path prefix without variant suffix (e.g. `artist/hoodie-abc`). */
  basePath: string;
  variants: ImageVariantUrls;
  blurDataUrl: string;
  width: number;
  height: number;
  bytesSaved: number;
};

export type ProcessedVariants = {
  variants: Record<ImageVariantKey, Buffer>;
  blurDataUrl: string;
  width: number;
  height: number;
  originalBytes: number;
  outputBytes: number;
};

export type ImageDisplayContext = "thumb" | "card" | "gallery" | "hero" | "banner";
