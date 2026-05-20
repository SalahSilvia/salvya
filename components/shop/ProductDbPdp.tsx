"use client";

import { useMemo, useState } from "react";
import type { ArtistStatusTag } from "@/lib/site-data";
import type { SuggestedShopItem } from "@/lib/discovery/product-suggestions";
import type { LikedItemInput } from "@/lib/member/likes-storage";
import type { StorefrontProductWithVariants } from "@/lib/catalog/attach-variants-to-products";
import {
  colorsForBuyPanel,
  resolveVariantIdForSelection,
  sizeInStockForVariants,
  sizeOptionsFromVariants,
} from "@/lib/catalog/storefront-product";
import {
  buildColorGalleryMap,
  colorOptionId,
  galleryUrlsForColorId,
} from "@/lib/admin/product-color-variants";
import { HoodieGallery } from "@/components/shop/HoodieGallery";
import { ProductBuyPanel } from "@/components/shop/ProductBuyPanel";
import { ProductItemShell } from "@/components/shop/ProductItemShell";

type Props = {
  product: StorefrontProductWithVariants;
  artistSlug: string;
  itemSlug: string;
  artistName: string;
  displayTitle: string;
  priceLabel: string;
  compareAtLabel: string | null;
  backHref: string;
  checkoutHref: string;
  kindLabel: string;
  productKind: "hoodie" | "tshirt";
  artistStatusTag: ArtistStatusTag;
  likedItemInput: LikedItemInput;
  suggestedItems: SuggestedShopItem[];
};

export function ProductDbPdp({
  product,
  artistSlug,
  itemSlug,
  artistName,
  displayTitle,
  priceLabel,
  compareAtLabel,
  backHref,
  checkoutHref,
  kindLabel,
  productKind,
  artistStatusTag,
  likedItemInput,
  suggestedItems,
}: Props) {
  const colorGalleries = useMemo(
    () => buildColorGalleryMap(product.colors, product.images),
    [product.colors, product.images],
  );

  const colorOptions = useMemo(
    () => colorsForBuyPanel(product.colors, product.variants),
    [product.colors, product.variants],
  );

  const sizeOptions = useMemo(
    () => sizeOptionsFromVariants(product.sizes, product.variants),
    [product.sizes, product.variants],
  );

  const defaultColorId = useMemo(() => {
    if (!product.colors.length) return "";
    return colorOptionId(product.colors[0]!, 0);
  }, [product.colors]);

  const defaultSize = useMemo(() => {
    const sizes = sizeOptions.length ? sizeOptions : ["M"];
    const inStock = sizes.find((s) => sizeInStockForVariants(product.variants, s));
    return inStock ?? sizes.find((s) => s === "M") ?? sizes[0] ?? "M";
  }, [product.variants, sizeOptions]);

  const [colorId, setColorId] = useState(defaultColorId);
  const [size, setSize] = useState(defaultSize);

  const selectedVariantId = useMemo(
    () => resolveVariantIdForSelection(product.variants, size, colorId || defaultColorId) ?? "",
    [colorId, defaultColorId, product.variants, size],
  );

  const variantSoldOut = useMemo(() => {
    const v = product.variants.find((x) => x.id === selectedVariantId);
    return v ? v.soldOut : product.soldOut;
  }, [product.soldOut, product.variants, selectedVariantId]);

  const galleryUrls = useMemo(() => {
    if (!product.colors.length) return product.images;
    const id = colorId || defaultColorId;
    return galleryUrlsForColorId(id, colorGalleries, product.images);
  }, [colorGalleries, colorId, defaultColorId, product.colors.length, product.images]);

  return (
    <ProductItemShell
      artistSlug={artistSlug}
      itemSlug={itemSlug}
      artistName={artistName}
      displayTitle={displayTitle}
      priceLabel={priceLabel}
      product={product}
      compareAtLabel={compareAtLabel}
      backHref={backHref}
      checkoutHref={checkoutHref}
      kindLabel={kindLabel}
      productKind={productKind}
      artistStatusTag={artistStatusTag}
      likedItemInput={likedItemInput}
      suggestedItems={suggestedItems}
      purchaseBlock={
        <ProductBuyPanel
          artistSlug={artistSlug}
          itemSlug={itemSlug}
          displayTitle={displayTitle}
          priceLabel={priceLabel}
          productKind={productKind}
          artistStatusTag={artistStatusTag}
          artistName={artistName}
          checkoutHref={checkoutHref}
          actionLayout="sticky-above-nav"
          showReviews={false}
          soldOut={variantSoldOut || product.soldOut}
          sizeOptions={sizeOptions.length ? sizeOptions : undefined}
          colorOptions={colorOptions}
          selectedColorId={product.colors.length ? colorId || defaultColorId : undefined}
          onColorChange={product.colors.length ? setColorId : undefined}
          selectedSize={size}
          onSizeChange={setSize}
          variantId={selectedVariantId}
          sizeInStock={(s) => sizeInStockForVariants(product.variants, s)}
        />
      }
    >
      <HoodieGallery
        key={galleryUrls.join("|")}
        source="urls"
        imageUrls={galleryUrls}
        productName={displayTitle}
      />
    </ProductItemShell>
  );
}
