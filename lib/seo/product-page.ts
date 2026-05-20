import type { Metadata } from "next";
import type { StorefrontProduct } from "@/lib/catalog/storefront-product";
import { pdpPath } from "@/lib/catalog/storefront-product";
import { getUserMarket } from "@/lib/market/get-user-market";
import { marketPriceLabelForProduct } from "@/lib/market/storefront-price";
import { buildPageMetadata } from "./metadata";
import type { SalvyaLocale } from "./site";

export type ProductSeoFields = {
  metaTitle?: string | null;
  metaDescription?: string | null;
};

export function productPageTitle(productTitle: string, artistName: string, seo?: ProductSeoFields): string {
  if (seo?.metaTitle?.trim()) return seo.metaTitle.trim().slice(0, 70);
  return `${productTitle} — ${artistName}`;
}

export function productPageDescription(
  product: Pick<StorefrontProduct, "title" | "description"> & { priceLabel?: string },
  artistName: string,
  seo?: ProductSeoFields,
): string {
  if (seo?.metaDescription?.trim()) return seo.metaDescription.trim().slice(0, 160);
  const base = product.description?.trim();
  if (base) return base.slice(0, 160);
  const price = product.priceLabel ?? "";
  return `Shop ${product.title} by ${artistName} on Salvya. Official merch with secure checkout. ${price}`
    .trim()
    .slice(0, 160);
}

export function productPageKeywords(
  product: Pick<StorefrontProduct, "title" | "slug" | "productKind">,
  artistName: string,
): string[] {
  const kind = product.productKind === "tshirt" ? "tee" : "hoodie";
  return [
    product.title,
    artistName,
    `${artistName} merch`,
    `official ${kind}`,
    "Salvya",
    "limited drop",
    product.slug.replace(/-/g, " "),
  ];
}

export async function buildProductPageMetadata(
  product: StorefrontProduct,
  artistName: string,
  seo?: ProductSeoFields,
  locale?: string | SalvyaLocale,
): Promise<Metadata> {
  const market = await getUserMarket();
  const path = pdpPath(product);
  const title = productPageTitle(product.title, artistName, seo);
  const description = productPageDescription(
    { ...product, priceLabel: marketPriceLabelForProduct(product, market) },
    artistName,
    seo,
  );
  const image = product.images[0] ?? null;

  return buildPageMetadata({
    title,
    description,
    path,
    locale,
    image,
    imageAlt: `${product.title} — ${artistName}`,
    type: "product",
    keywords: productPageKeywords(product, artistName),
  });
}
