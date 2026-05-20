"use client";

import type { CSSProperties } from "react";
import { ProductHeartButton } from "@/components/likes/ProductHeartButton";
import { ProductKickerMenu } from "@/components/shop/ProductKickerMenu";
import { PreviewBagHeaderLink } from "@/components/shop/PreviewBagHeaderLink";
import { parseProductId, type LikedItemInput } from "@/lib/member/likes-storage";

const bagBtnClass =
  "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/[0.12] bg-black/45 text-white/85 shadow-lg shadow-black/40 backdrop-blur-md transition-[background-color,border-color,color] hover:border-white/[0.18] hover:bg-black/55 hover:text-white active:scale-[0.97]";

type Props = {
  artistSlug: string;
  artistName: string;
  displayTitle: string;
  backHref: string;
  likedItemInput: LikedItemInput;
  style?: CSSProperties;
};

export function ProductGalleryHeaderActions({
  artistSlug,
  artistName,
  displayTitle,
  backHref,
  likedItemInput,
  style,
}: Props) {
  const parsed = parseProductId(likedItemInput.productId);
  const itemSlug = parsed?.sku ?? "";
  const productKind = likedItemInput.type === "tee" ? "tshirt" : "hoodie";

  return (
    <div
      className="absolute right-[max(1rem,env(safe-area-inset-right))] z-30 flex items-center gap-2"
      style={style}
    >
      <PreviewBagHeaderLink className={bagBtnClass} />
      <ProductHeartButton input={likedItemInput} variant="toolbar" />
      <ProductKickerMenu
        artistSlug={artistSlug}
        artistName={artistName}
        displayTitle={displayTitle}
        backHref={backHref}
        itemSlug={itemSlug}
        productKind={productKind}
      />
    </div>
  );
}
