"use client";

import { useMemo, useState } from "react";
import { SalvyaOptimizedImage } from "@/components/media/SalvyaOptimizedImage";
import type { StorefrontProductWithVariants } from "@/lib/catalog/attach-variants-to-products";
import { collectProductImageCandidates } from "@/lib/catalog/product-image-candidates";
import { deriveVariantUrls } from "@/lib/media/image-optimization/variant-urls";

type Props = {
  product: StorefrontProductWithVariants;
  title: string;
};

/** Product card image with client fallback if a URL 404s after hydration. */
export function CreatorProductCardImage({ product, title }: Props) {
  const candidates = useMemo(() => collectProductImageCandidates(product), [product]);
  const [index, setIndex] = useState(0);
  const src = index < candidates.length ? candidates[index] : null;
  const variants = useMemo(() => (src ? deriveVariantUrls(src) : null), [src]);

  if (!src) {
    return (
      <div className="flex h-full items-center justify-center bg-gradient-to-br from-violet-900/30 to-[#0a0810] text-[12px] text-white/30">
        No image
      </div>
    );
  }

  return (
    <SalvyaOptimizedImage
      src={src}
      variants={variants}
      alt={title}
      fill
      context="card"
      className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
      sizes="(max-width:640px) 50vw, 320px"
      onError={() => {
        setIndex((i) => i + 1);
      }}
    />
  );
}
