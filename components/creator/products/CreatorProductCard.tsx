"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import type { StorefrontProductWithVariants } from "@/lib/catalog/attach-variants-to-products";
import { encodeCreatorProductSlug } from "@/lib/creator/product-link-types";
import { kindLabelFromProduct, priceLabelForProduct } from "@/lib/catalog/storefront-product";
import { CreatorProductCardImage } from "@/components/creator/products/CreatorProductCardImage";
import { creatorCardSurface, creatorCtaButton, creatorCtaGhost } from "@/lib/theme/creator-accent";

type Props = {
  product: StorefrontProductWithVariants;
  index: number;
  isPromoted: boolean;
  busy: boolean;
  onPromote: () => void;
};

export function CreatorProductCard({ product, index, isPromoted, busy, onPromote }: Props) {
  const reduceMotion = useReducedMotion();
  const detailSlug = encodeCreatorProductSlug(product.artistSlug, product.slug);

  return (
    <motion.li
      initial={reduceMotion ? false : { opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.04, 0.35), duration: 0.4 }}
      className={`group flex flex-col overflow-hidden rounded-[1.25rem] ${creatorCardSurface} transition-shadow duration-300 hover:shadow-[0_28px_70px_-32px_rgba(139,92,246,0.45)]`}
    >
      <Link href={`/creator/products/${detailSlug}`} className="relative block aspect-[4/5] overflow-hidden bg-[#0a0810]">
        <CreatorProductCardImage product={product} title={product.title} />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#08050e] via-[#08050e]/20 to-transparent opacity-90"
        />
        <div className="absolute left-3 right-3 top-3 flex items-start justify-between gap-2">
          <span className="rounded-lg border border-white/15 bg-black/45 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-white/75 backdrop-blur-md">
            {product.artistSlug}
          </span>
          {isPromoted ? (
            <span className="inline-flex items-center gap-1 rounded-full border border-fuchsia-400/35 bg-fuchsia-500/25 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-fuchsia-100 backdrop-blur-md">
              <span aria-hidden className="text-emerald-300">✓</span> Live
            </span>
          ) : null}
        </div>
        <div className="absolute bottom-3 left-3 right-3">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-fuchsia-300/70">
            {kindLabelFromProduct(product)}
          </p>
          <p className="mt-1 line-clamp-2 text-[15px] font-semibold leading-snug text-white">{product.title}</p>
        </div>
      </Link>

      <div className="flex flex-1 flex-col p-4 pt-3">
        <p className="text-[14px] font-semibold text-emerald-200/90">{priceLabelForProduct(product)}</p>
        {product.category ? (
          <p className="mt-1 text-[12px] text-white/38">{product.category}</p>
        ) : null}

        <div className="mt-auto flex flex-col gap-2 pt-4">
          <button
            type="button"
            disabled={busy}
            onClick={onPromote}
            className={`min-h-11 rounded-xl text-[13px] font-semibold text-white transition-transform disabled:opacity-60 ${
              isPromoted ? creatorCtaGhost : creatorCtaButton
            } ${!isPromoted && !busy ? "hover:scale-[1.01] active:scale-[0.99]" : ""}`}
          >
            {busy ? (
              <span className="inline-flex items-center justify-center gap-2">
                <span className="size-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                Creating link…
              </span>
            ) : isPromoted ? (
              "Copy promo link"
            ) : (
              "Promote product"
            )}
          </button>
          <Link
            href={`/creator/products/${detailSlug}`}
            className="text-center text-[12px] font-semibold text-white/42 transition-colors hover:text-fuchsia-200/90"
          >
            Product details →
          </Link>
        </div>
      </div>
    </motion.li>
  );
}
