"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import type { StorefrontProduct } from "@/lib/catalog/storefront-product";
import { collectProductImageCandidates } from "@/lib/catalog/product-image-candidates";

type Props = {
  product: StorefrontProduct | null;
  title: string;
  className?: string;
};

export function CreatorLinkThumb({ product, title, className = "size-20" }: Props) {
  const candidates = useMemo(
    () => (product ? collectProductImageCandidates(product) : []),
    [product],
  );
  const [index, setIndex] = useState(0);
  const src = index < candidates.length ? candidates[index] : null;

  return (
    <div className={`relative shrink-0 overflow-hidden rounded-xl bg-[#0a0810] ring-1 ring-white/[0.08] ${className}`}>
      {src ? (
        <Image
          src={src}
          alt={title}
          fill
          className="object-cover"
          sizes="80px"
          onError={() => setIndex((i) => i + 1)}
        />
      ) : (
        <div className="flex h-full items-center justify-center bg-gradient-to-br from-violet-900/35 to-[#0a0810] text-[10px] font-semibold uppercase tracking-wide text-white/25">
          —
        </div>
      )}
    </div>
  );
}
