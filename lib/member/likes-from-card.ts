import type { PremiumTrendingCard } from "@/lib/home/premium-trending";
import type { ElgrandetotoFolderHoodieItem } from "@/lib/elgrandetoto-hoodie-fs";
import type { ElgrandetotoFolderTshirtItem } from "@/lib/elgrandetoto-tshirt-fs";
import { artistCatalogHoodieImageSrc } from "@/lib/elgrandetoto-hoodie-public";
import { artistCatalogTshirtImageSrc } from "@/lib/elgrandetoto-tshirt-public";
import type { StorefrontCarouselItem, StorefrontProduct } from "@/lib/catalog/storefront-product";
import { pdpPath, priceLabelForProduct } from "@/lib/catalog/storefront-product";
import type { SearchProductHit } from "@/lib/member/search-catalog";
import { makeProductId, type LikedItemInput, type LikedProductType } from "@/lib/member/likes-storage";
import { formatOversizeHoodieTitle, formatOversizeTshirtTitle, HOODIE_PRICE_LABEL, TSHIRT_PRICE_LABEL } from "@/lib/shop-data";

function skuFromPremiumId(card: PremiumTrendingCard): string {
  const scoped = `${card.artistSlug}-${card.kind === "hoodie" ? "h" : "t"}-`;
  if (card.id.startsWith(scoped)) return card.id.slice(scoped.length);
  if (card.kind === "hoodie") return card.id.replace(/^h-/, "");
  return card.id.replace(/^t-/, "");
}

function storageTypeFromKind(kind: PremiumTrendingCard["kind"]): LikedProductType {
  return kind === "hoodie" ? "hoodie" : "tee";
}

export function productIdFromPremiumCard(card: PremiumTrendingCard): string {
  const sku = skuFromPremiumId(card);
  return makeProductId(card.artistSlug, storageTypeFromKind(card.kind), sku);
}

export function likedItemInputFromSearchHit(hit: SearchProductHit): LikedItemInput {
  const type: LikedProductType = hit.kind === "hoodie" ? "hoodie" : "tee";
  return {
    productId: hit.productId,
    type,
    artistSlug: hit.artistSlug,
    title: hit.title,
    imageSrc: hit.imageSrc,
    href: hit.href,
    priceLabel: hit.priceLabel,
    artistLabel: hit.artistLabel,
  };
}

export function likedItemInputFromPremiumCard(card: PremiumTrendingCard): LikedItemInput {
  const sku = skuFromPremiumId(card);
  const type = storageTypeFromKind(card.kind);
  return {
    productId: makeProductId(card.artistSlug, type, sku),
    type,
    artistSlug: card.artistSlug,
    title: card.title,
    imageSrc: card.imageSrc,
    href: card.href,
    priceLabel: card.priceLabel,
    artistLabel: card.artistLabel,
  };
}

export function likedItemInputFromArtistFolderHoodie(
  artistSlug: string,
  item: ElgrandetotoFolderHoodieItem,
  firstFile: string,
): LikedItemInput {
  const label =
    artistSlug === "elgrandetoto"
      ? "ELGRANDETOTO"
      : artistSlug === "babygang"
        ? "BABYGANG"
        : artistSlug === "inkonnu"
          ? "INKONNU"
          : artistSlug.replace(/-/g, " ").toUpperCase();
  return {
    productId: makeProductId(artistSlug, "hoodie", item.folder),
    type: "hoodie",
    artistSlug,
    title: formatOversizeHoodieTitle(item.title),
    imageSrc: artistCatalogHoodieImageSrc(artistSlug, item.folder, firstFile),
    href: `/artist/${artistSlug}/item/${encodeURIComponent(item.folder)}`,
    priceLabel: HOODIE_PRICE_LABEL,
    artistLabel: label,
  };
}

export function likedItemInputFromElgrandetotoHoodie(item: ElgrandetotoFolderHoodieItem, firstFile: string): LikedItemInput {
  return likedItemInputFromArtistFolderHoodie("elgrandetoto", item, firstFile);
}

export function likedItemInputFromPdp(params: {
  artistSlug: string;
  productKind: "hoodie" | "tshirt";
  itemSlug: string;
  displayTitle: string;
  priceLabel: string;
  imageSrc: string;
}): LikedItemInput {
  const { artistSlug, productKind, itemSlug, displayTitle, priceLabel, imageSrc } = params;
  const type: LikedProductType = productKind === "hoodie" ? "hoodie" : "tee";
  const href =
    productKind === "hoodie"
      ? `/artist/${artistSlug}/item/${encodeURIComponent(itemSlug)}`
      : `/artist/${artistSlug}/tshirt/${encodeURIComponent(itemSlug)}`;
  const label =
    artistSlug === "elgrandetoto"
      ? "ELGRANDETOTO"
      : artistSlug === "babygang"
        ? "BABYGANG"
        : artistSlug === "inkonnu"
          ? "INKONNU"
          : artistSlug.replace(/-/g, " ").toUpperCase();
  return {
    productId: makeProductId(artistSlug, type, itemSlug),
    type,
    artistSlug,
    title: displayTitle,
    imageSrc,
    href,
    priceLabel,
    artistLabel: label,
  };
}

function artistLabelFromSlug(artistSlug: string): string {
  if (artistSlug === "elgrandetoto") return "ELGRANDETOTO";
  if (artistSlug === "babygang") return "BABYGANG";
  if (artistSlug === "inkonnu") return "INKONNU";
  return artistSlug.replace(/-/g, " ").toUpperCase();
}

export function likedItemInputFromStorefrontCarousel(item: StorefrontCarouselItem): LikedItemInput {
  const type: LikedProductType = item.kind === "hoodie" ? "hoodie" : "tee";
  return {
    productId: makeProductId(item.artistSlug, type, item.slug),
    type,
    artistSlug: item.artistSlug,
    title: item.title,
    imageSrc: item.imageUrl ?? "",
    href: item.href,
    priceLabel: item.priceLabel,
    artistLabel: artistLabelFromSlug(item.artistSlug),
  };
}

export function likedItemInputFromStorefrontProduct(
  product: StorefrontProduct,
  priceLabel?: string,
): LikedItemInput {
  const type: LikedProductType = product.productKind === "hoodie" ? "hoodie" : "tee";
  return {
    productId: makeProductId(product.artistSlug, type, product.slug),
    type,
    artistSlug: product.artistSlug,
    title: product.title,
    imageSrc: product.images[0] ?? "",
    href: pdpPath(product),
    priceLabel: priceLabel?.trim() || priceLabelForProduct(product),
    artistLabel: artistLabelFromSlug(product.artistSlug),
  };
}

export function likedItemInputFromElgrandetotoTshirt(
  artistSlug: string,
  item: ElgrandetotoFolderTshirtItem,
  firstFile: string,
): LikedItemInput {
  return {
    productId: makeProductId(artistSlug, "tee", item.folder),
    type: "tee",
    artistSlug,
    title: formatOversizeTshirtTitle(item.title),
    imageSrc: artistCatalogTshirtImageSrc(artistSlug, item.folder, firstFile),
    href: `/artist/${artistSlug}/tshirt/${encodeURIComponent(item.folder)}`,
    priceLabel: TSHIRT_PRICE_LABEL,
    artistLabel:
      artistSlug === "elgrandetoto"
        ? "ELGRANDETOTO"
        : artistSlug === "babygang"
          ? "BABYGANG"
          : artistSlug === "inkonnu"
            ? "INKONNU"
            : artistSlug.replace(/-/g, " ").toUpperCase(),
  };
}
