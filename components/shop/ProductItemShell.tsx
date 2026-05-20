import Link from "next/link";
import type { ReactNode } from "react";
import type { SuggestedShopItem } from "@/lib/discovery/product-suggestions";
import type { LikedItemInput } from "@/lib/member/likes-storage";
import type { StorefrontProduct } from "@/lib/catalog/storefront-product";
import type { ArtistStatusTag } from "@/lib/site-data";
import { ProductMetaViewContent } from "@/components/analytics/ProductMetaViewContent";
import { RecordProductView } from "@/components/discovery/RecordProductView";
import { ProductGalleryHeaderActions } from "@/components/shop/ProductGalleryHeaderActions";
import { ProductImageDoubleTapLike } from "@/components/shop/ProductImageDoubleTapLike";
import { ProductItemDetailSections } from "@/components/shop/ProductItemDetailSections";

type Props = {
  artistSlug: string;
  itemSlug: string;
  artistName: string;
  displayTitle: string;
  priceLabel: string;
  backHref: string;
  checkoutHref: string;
  kindLabel: string;
  productKind: "hoodie" | "tshirt";
  artistStatusTag: ArtistStatusTag;
  likedItemInput: LikedItemInput;
  suggestedItems?: SuggestedShopItem[];
  product: StorefrontProduct;
  compareAtLabel?: string | null;
  purchaseBlock?: ReactNode;
  children: ReactNode;
};

export function ProductItemShell({
  artistSlug,
  itemSlug,
  artistName,
  displayTitle,
  priceLabel,
  backHref,
  checkoutHref,
  kindLabel,
  productKind,
  artistStatusTag,
  likedItemInput,
  suggestedItems,
  product,
  compareAtLabel,
  purchaseBlock,
  children,
}: Props) {
  const stockPill = product.soldOut
    ? { label: "Sold out", className: "border-red-400/30 bg-red-500/10 text-red-100/90" }
    : product.lowStock
      ? { label: `Only ${product.stock} left`, className: "border-amber-400/30 bg-amber-500/10 text-amber-100/90" }
      : product.preorder
        ? { label: "Pre-order", className: "border-[#2D6BFF]/30 bg-[#2D6BFF]/10 text-[#c5d4ff]" }
        : { label: "In stock", className: "border-emerald-400/30 bg-emerald-500/10 text-emerald-100/90" };

  return (
    <div className="min-h-dvh w-full overflow-x-hidden bg-[#050508] text-white">
      <h1 className="sr-only">
        {displayTitle} — {artistName}
      </h1>

      <main
        className={`w-full max-w-none pt-0 ${
          purchaseBlock
            ? "pb-8 max-md:pb-[calc(10.5rem+env(safe-area-inset-bottom))]"
            : "pb-8"
        }`}
      >
        <ProductMetaViewContent
          artistSlug={artistSlug}
          itemSlug={itemSlug}
          productKind={productKind}
          displayTitle={displayTitle}
          priceLabel={priceLabel}
        />
        <RecordProductView artistSlug={artistSlug} itemSlug={itemSlug} productKind={productKind} />
        <div className="relative w-full">
          <Link
            href={backHref}
            className="absolute left-[max(1rem,env(safe-area-inset-left))] z-30 inline-flex h-10 items-center gap-2 rounded-full border border-white/[0.12] bg-black/45 px-3.5 text-[13px] font-medium text-white/92 shadow-lg shadow-black/40 backdrop-blur-md transition-[background-color,border-color] hover:border-white/[0.18] hover:bg-black/55"
            style={{ top: "max(0.75rem, env(safe-area-inset-top))" }}
          >
            <span aria-hidden className="text-[15px] leading-none opacity-85">
              ←
            </span>
            Shop
          </Link>

          <ProductGalleryHeaderActions
            artistSlug={artistSlug}
            artistName={artistName}
            displayTitle={displayTitle}
            backHref={backHref}
            likedItemInput={likedItemInput}
            style={{ top: "max(0.75rem, env(safe-area-inset-top))" }}
          />

          <ProductImageDoubleTapLike input={likedItemInput}>{children}</ProductImageDoubleTapLike>
        </div>

        <section
          aria-labelledby="product-detail-title"
          className="relative z-10 -mt-8 w-full sm:-mt-10"
        >
          <div className="rounded-t-[1.5rem] border border-white/[0.08] border-b-0 bg-gradient-to-b from-[#0e0e14] via-[#0a0a0f] to-[#09090d] sm:rounded-t-[1.75rem]">
            <div className="h-px w-full bg-gradient-to-r from-transparent via-[#2D6BFF]/45 to-transparent opacity-90" aria-hidden />

            <div className="mx-auto max-w-6xl pl-[max(1.25rem,env(safe-area-inset-left))] pr-[max(1.25rem,env(safe-area-inset-right))] pb-8 pt-9 sm:pb-10 sm:pt-11">
              <div className="mx-auto max-w-3xl">
                <p className="text-[11px] font-semibold uppercase tracking-normal text-white/38">
                  <span className="text-[#8fa8e8]">{kindLabel}</span>
                  <span className="mx-2 text-white/20">/</span>
                  {artistName}
                </p>

                <div className="mt-5 flex flex-row items-start justify-between gap-4 sm:mt-6 sm:items-end sm:gap-8">
                  <div className="min-w-0 max-w-[min(100%,22rem)] flex-1 pr-2 sm:max-w-none sm:pr-4">
                    <h2
                      id="product-detail-title"
                      className="text-[1.75rem] font-semibold leading-[1.12] tracking-[-0.045em] text-white sm:text-[2rem]"
                    >
                      {displayTitle}
                    </h2>
                    {product.subtitle ? (
                      <p className="mt-1.5 text-[14px] leading-snug text-white/48">{product.subtitle}</p>
                    ) : null}
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1.5 text-right">
                    <span
                      className={`inline-flex rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-normal ${stockPill.className}`}
                    >
                      {stockPill.label}
                    </span>
                    <span className="text-[10px] font-semibold uppercase tracking-normal text-white/35">Price</span>
                    {compareAtLabel ? (
                      <p className="text-[13px] font-medium tabular-nums text-white/35 line-through">{compareAtLabel}</p>
                    ) : null}
                    <p className="text-[1.5rem] font-semibold tabular-nums tracking-[-0.03em] text-white whitespace-nowrap sm:text-[1.85rem]">
                      {priceLabel.split(" · ")[0]}
                    </p>
                  </div>
                </div>

                {product.description?.trim() ? (
                  <p className="mt-6 max-w-xl text-[15px] leading-relaxed text-white/44 sm:text-[16px]">
                    {product.description.trim()}
                  </p>
                ) : null}
              </div>
            </div>
          </div>
        </section>

        <ProductItemDetailSections
          artistSlug={artistSlug}
          artistName={artistName}
          displayTitle={displayTitle}
          product={product}
          productKind={productKind}
          itemSlug={itemSlug}
          suggestedItems={suggestedItems}
          purchaseBlock={purchaseBlock}
        />
      </main>
    </div>
  );
}
