"use client";

import Image, { type ImageProps } from "next/image";
import { useMemo, useState } from "react";
import {
  defaultSizesForContext,
  deriveVariantUrls,
  pickDisplayUrl,
} from "@/lib/media/image-optimization/variant-urls";
import type { ImageDisplayContext, ImageVariantUrls } from "@/lib/media/image-optimization/types";
import { shouldUnoptimizeProductImage } from "@/lib/media/product-image-url-client";

type Props = Omit<ImageProps, "src" | "placeholder" | "blurDataURL"> & {
  src: string;
  variants?: Partial<ImageVariantUrls> | null;
  blurDataUrl?: string | null;
  /** Drives default `sizes` and which variant URL to prefer. */
  context?: ImageDisplayContext;
  /** Fixed aspect wrapper — prevents CLS (e.g. `aspect-[4/5]`). */
  aspectClassName?: string;
  showSkeleton?: boolean;
};

/**
 * Production image component: lazy load, blur placeholder, responsive sizes, Next optimizer.
 */
export function SalvyaOptimizedImage({
  src,
  variants,
  blurDataUrl,
  context = "card",
  aspectClassName,
  showSkeleton = true,
  alt,
  className,
  sizes,
  priority,
  fill,
  width,
  height,
  ...rest
}: Props) {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);

  const resolvedVariants = useMemo(
    () => variants ?? deriveVariantUrls(src) ?? null,
    [src, variants],
  );

  const displaySrc = useMemo(
    () => (failed && resolvedVariants?.large ? resolvedVariants.large : pickDisplayUrl(src, resolvedVariants, context)),
    [context, failed, resolvedVariants, src],
  );

  const unoptimized = shouldUnoptimizeProductImage(displaySrc);
  const resolvedSizes = sizes ?? defaultSizesForContext(context);
  const useBlur = Boolean(blurDataUrl?.startsWith("data:image"));

  const image = (
    <Image
      {...rest}
      src={displaySrc}
      alt={alt}
      fill={fill}
      width={width}
      height={height}
      sizes={resolvedSizes}
      priority={priority}
      loading={priority ? undefined : "lazy"}
      placeholder={useBlur ? "blur" : "empty"}
      blurDataURL={useBlur ? blurDataUrl! : undefined}
      unoptimized={unoptimized}
      className={className}
      onLoad={() => setLoaded(true)}
      onError={() => {
        if (!failed) setFailed(true);
      }}
    />
  );

  if (!aspectClassName) return image;

  return (
    <div className={`relative overflow-hidden ${aspectClassName}`}>
      {showSkeleton && !loaded ? (
        <div
          className="absolute inset-0 animate-pulse bg-neutral-200/80"
          style={
            useBlur
              ? {
                  backgroundImage: `url(${blurDataUrl})`,
                  backgroundSize: "cover",
                  filter: "blur(12px)",
                  transform: "scale(1.05)",
                }
              : undefined
          }
          aria-hidden
        />
      ) : null}
      {image}
    </div>
  );
}
