import { colorOptionId } from "@/lib/admin/product-color-variants";
import {
  storefrontFrontImageUrl,
  storefrontModelImageUrl,
  storefrontShopCardImageUrl,
} from "@/lib/catalog/storefront-image-slots";
import { parseProductMetadata, type ProductColorOption } from "@/lib/admin/product-metadata";
import { normalizeProductImageList, normalizeProductImageUrl } from "@/lib/media/product-image-url-core";
import { rowToAdminProduct, type SalvyaProductRow } from "@/lib/admin/types";
import type { StorefrontVariant } from "@/lib/inventory/types";
import { findVariantForSelection } from "@/lib/catalog/fetch-product-variants";
import { formatBaseCentsForDisplay, type FormatPriceOptions } from "@/lib/currency/display";
import { getBaseCurrency, type CurrencyCode } from "@/lib/currency/config";
import type { MarketContext } from "@/lib/market/market-context";
import type { MarketPricesMap } from "@/lib/market/types";
import { priceLabelForContext } from "@/lib/market/resolve-display-price";

export type StorefrontProduct = {
  id: string;
  artistSlug: string;
  slug: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  priceCents: number;
  priceEur: number;
  priceUsd: number;
  priceMad: number;
  marketPrices: MarketPricesMap;
  compareAtCents: number | null;
  category: "hoodie" | "tee" | "accessories" | "other";
  productKind: "hoodie" | "tshirt";
  images: string[];
  stock: number;
  soldOut: boolean;
  lowStock: boolean;
  isLimitedDrop: boolean;
  badge: string | null;
  sizes: string[];
  colors: ProductColorOption[];
  sizeFit: string | null;
  material: string | null;
  featured: boolean;
  preorder: boolean;
  preorderShipDate: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  publishedAt: string | null;
};

export type StorefrontCarouselItem = {
  id: string;
  artistSlug: string;
  slug: string;
  title: string;
  priceLabel: string;
  imageUrl: string | null;
  /** On-model shot when available (editorial sections). */
  modelImageUrl?: string | null;
  href: string;
  kind: "hoodie" | "tshirt";
  badge?: string;
  soldOut?: boolean;
  limited?: boolean;
};

export function formatPriceCents(cents: number, opts?: FormatPriceOptions): string {
  const currency = opts?.currency ?? getBaseCurrency();
  return formatBaseCentsForDisplay(cents, currency, opts);
}

export function productKindFromCategory(category: StorefrontProduct["category"]): "hoodie" | "tshirt" {
  if (category === "tee") return "tshirt";
  return "hoodie";
}

export function kindLabelFromProduct(product: StorefrontProduct): string {
  if (product.category === "tee") return "Tee";
  if (product.category === "hoodie") return "Hoodie";
  if (product.category === "accessories") return "Accessories";
  return "Item";
}

export function priceLabelForProduct(
  product: StorefrontProduct,
  opts?: FormatPriceOptions & { currency?: CurrencyCode },
): string {
  return `${formatPriceCents(product.priceCents, opts)} · ${kindLabelFromProduct(product)}`;
}

export function pdpPath(product: StorefrontProduct): string {
  const base = `/artist/${product.artistSlug}`;
  return product.productKind === "tshirt"
    ? `${base}/tshirt/${encodeURIComponent(product.slug)}`
    : `${base}/item/${encodeURIComponent(product.slug)}`;
}

function normalizeColorImageOptions(colors: ProductColorOption[]): ProductColorOption[] {
  return colors.map((c) => {
    const front = c.front ? normalizeProductImageUrl(c.front) ?? c.front : undefined;
    const back = c.back ? normalizeProductImageUrl(c.back) ?? c.back : undefined;
    const models = c.models
      ?.map((m) => (m ? normalizeProductImageUrl(m) ?? m : null))
      .filter((m): m is string => Boolean(m));
    return {
      ...c,
      ...(front ? { front } : {}),
      ...(back ? { back } : {}),
      ...(models?.length ? { models } : {}),
    };
  });
}

export function rowToStorefrontProduct(row: SalvyaProductRow): StorefrontProduct {
  const admin = rowToAdminProduct(row);
  const meta = parseProductMetadata(row.metadata ?? {});
  const productKind = productKindFromCategory(admin.category as StorefrontProduct["category"]);
  const colors = normalizeColorImageOptions(meta.colors ?? []);

  return {
    id: admin.id,
    artistSlug: admin.artistSlug,
    slug: admin.slug,
    title: admin.title,
    subtitle: meta.subtitle ?? null,
    description: admin.description,
    priceCents: admin.priceCents,
    priceEur: admin.priceEur ?? admin.priceCents / 100,
    priceUsd: admin.priceUsd ?? admin.priceCents / 100,
    priceMad: admin.priceMad ?? admin.priceCents / 100,
    marketPrices: (admin.marketPrices as MarketPricesMap) ?? {},
    compareAtCents: meta.compareAtCents ?? null,
    category: admin.category as StorefrontProduct["category"],
    productKind,
    images: normalizeProductImageList(admin.images),
    stock: admin.stock,
    soldOut: admin.soldOut,
    lowStock: admin.lowStock,
    isLimitedDrop: admin.isLimitedDrop,
    badge: meta.badge ?? null,
    sizes: meta.sizes ?? [],
    colors,
    sizeFit: meta.sizeFit ?? null,
    material: meta.material ?? null,
    featured: meta.featured ?? false,
    preorder: meta.preorder ?? false,
    preorderShipDate: meta.preorderShipDate ?? null,
    metaTitle: meta.metaTitle ?? null,
    metaDescription: meta.metaDescription ?? null,
    publishedAt: admin.publishedAt ?? admin.updatedAt ?? null,
  };
}

export function toCarouselItem(
  product: StorefrontProduct,
  marketOrOpts?: MarketContext | (FormatPriceOptions & { currency?: CurrencyCode }),
): StorefrontCarouselItem {
  const priceLabel =
    marketOrOpts && "marketCode" in marketOrOpts && "locale" in marketOrOpts
      ? priceLabelForContext(product, marketOrOpts)
      : priceLabelForProduct(
          product,
          marketOrOpts as (FormatPriceOptions & { currency?: CurrencyCode }) | undefined,
        );
  return {
    id: product.id,
    artistSlug: product.artistSlug,
    slug: product.slug,
    title: product.title,
    priceLabel,
    imageUrl: storefrontShopCardImageUrl(product),
    modelImageUrl: storefrontModelImageUrl(product),
    href: pdpPath(product),
    kind: product.productKind,
    badge: product.badge ?? (product.isLimitedDrop ? "Limited" : undefined),
    soldOut: product.soldOut,
    limited: product.isLimitedDrop,
  };
}

export function colorsForBuyPanel(colors: ProductColorOption[], variants: StorefrontVariant[] = []) {
  if (!colors.length) return undefined;
  return colors.map((c, i) => {
    const id = colorOptionId(c, i);
    const hasStock = variants.some((v) => v.color.toLowerCase() === id.toLowerCase() && v.stock > 0);
    const anyStock = variants.length === 0 || hasStock;
    return {
      id,
      label: c.name,
      swatch: c.hex ? "ring-1 ring-white/15" : "bg-zinc-700 ring-1 ring-white/10",
      swatchStyle: c.hex ? { backgroundColor: c.hex } : undefined,
      inStock: anyStock,
    };
  });
}

export function sizeOptionsFromVariants(
  productSizes: string[],
  variants: StorefrontVariant[],
): string[] {
  const fromMeta = productSizes.length ? productSizes : [];
  const fromVariants = variants
    .map((v) => v.size?.toUpperCase())
    .filter((s): s is string => Boolean(s));
  const merged = [...new Set([...fromMeta, ...fromVariants])];
  return merged.length ? merged : productSizes;
}

export function resolveVariantIdForSelection(
  variants: StorefrontVariant[],
  size: string,
  colorId: string,
): string | null {
  return findVariantForSelection(variants, size, colorId)?.id ?? null;
}

export function sizeInStockForVariants(variants: StorefrontVariant[], size: string): boolean {
  if (!variants.length) return true;
  const norm = size.trim().toUpperCase();
  return variants.some((v) => (v.size?.toUpperCase() ?? null) === norm && v.stock > 0);
}

export {
  storefrontBackImageUrl,
  storefrontFrontImageUrl,
  storefrontModelImageUrl,
  storefrontShopCardImageUrl,
} from "@/lib/catalog/storefront-image-slots";
