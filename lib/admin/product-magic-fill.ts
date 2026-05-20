import type { ProductColorOption } from "@/lib/admin/product-metadata";
import { buildSalvyaGtin13 } from "@/lib/barcode/salvya-gtin";
import { CATALOG_DEFAULT_SIZES } from "@/lib/catalog/catalog-merchandising-defaults";
import {
  IMPORT_HOODIE_PRICE_CENTS,
  IMPORT_TEE_PRICE_CENTS,
} from "@/lib/catalog/catalog-import-prices";
import { slugifyTitle } from "@/lib/admin/types";
import { artists } from "@/lib/site-data";

const DEFAULT_MATERIAL = {
  hoodie: "100% organic cotton fleece, 400gsm",
  tee: "100% organic cotton jersey, 240gsm",
} as const;

const DEFAULT_SIZE_FIT =
  "Oversized fit — size down for a regular look. Model is 1m82 wearing L.";

const DEFAULT_SHIPPING = "Ships in 3–5 business days from EU";
const DEFAULT_CARE = "Machine wash cold, inside out. Do not tumble dry.";
const DEFAULT_MAX_PER_ORDER = 2;
const COMPARE_AT_EUR = "59";

const MAGIC_COLORS: ProductColorOption[] = [
  { id: "black", name: "Black", hex: "#0a0a0a" },
  { id: "white", name: "White", hex: "#f5f5f5" },
];

export type ProductMagicFillInput = {
  artistSlug?: string;
  category?: string;
  title?: string;
};

export type ProductMagicFillResult = {
  title: string;
  subtitle: string;
  description: string;
  artistSlug: string;
  slug: string;
  priceEuros: string;
  category: string;
  stock: string;
  sku: string;
  compareAtEuros: string;
  sizeFit: string;
  material: string;
  featured: boolean;
  badge: string;
  sizes: string[];
  colors: ProductColorOption[];
  careInstructions: string;
  shippingNote: string;
  metaTitle: string;
  metaDescription: string;
  maxPerOrder: string;
  limited: boolean;
  lowStockThreshold: string;
};

function artistDisplayName(artistSlug: string): string {
  return artists.find((a) => a.slug === artistSlug)?.name ?? artistSlug;
}

function isLimitedArtist(artistSlug: string): boolean {
  return artists.find((a) => a.slug === artistSlug)?.statusTag === "LIMITED DROP";
}

function categoryKind(category: string): { label: string; kind: string; priceCents: number } {
  if (category === "tee") {
    return { label: "T-shirt oversize", kind: "oversize tee", priceCents: IMPORT_TEE_PRICE_CENTS };
  }
  if (category === "accessories") {
    return { label: "Accessories", kind: "piece", priceCents: IMPORT_TEE_PRICE_CENTS };
  }
  if (category === "other") {
    return { label: "Product", kind: "item", priceCents: IMPORT_HOODIE_PRICE_CENTS };
  }
  return { label: "Hoodie oversize", kind: "oversize hoodie", priceCents: IMPORT_HOODIE_PRICE_CENTS };
}

export function extractProductShortName(title: string | undefined): string {
  if (!title?.trim()) return "New drop";
  const fromPattern = title.match(/\.\.\s*(.+)$/i)?.[1]?.trim();
  return fromPattern || title.trim();
}

function centsToEurosString(cents: number): string {
  const eur = cents / 100;
  return Number.isInteger(eur) ? String(eur) : String(eur);
}

/** One-click defaults for admin “New product” — merchandising, SEO, SKU, variants. */
export function buildAdminProductMagicFill(input: ProductMagicFillInput = {}): ProductMagicFillResult {
  const category = input.category?.trim() || "hoodie";
  const artistSlug = (input.artistSlug?.trim() || artists[0]?.slug || "elgrandetoto").toLowerCase();
  const { label, kind, priceCents } = categoryKind(category);
  const productName = extractProductShortName(input.title);
  const title = input.title?.trim() || `${label} .. ${productName}`;
  const slug = slugifyTitle(title);
  const artist = artistDisplayName(artistSlug);
  const limited = isLimitedArtist(artistSlug);
  const material =
    category === "tee" ? DEFAULT_MATERIAL.tee : category === "hoodie" ? DEFAULT_MATERIAL.hoodie : DEFAULT_MATERIAL.hoodie;

  const description = [
    `${productName} — official ${artist} ${kind} on Salvya.`,
    `Available in Black and White.`,
    material,
    DEFAULT_SIZE_FIT,
    "Authentic artist merchandise with premium print and fabric quality.",
  ].join("\n\n");

  const metaTitle = title.length <= 70 ? title : `${title.slice(0, 67)}...`;
  const metaDescription = `Official ${artist} merch — ${productName}. ${DEFAULT_SHIPPING.replace(/\.$/, "")}.`.slice(0, 160);

  return {
    title,
    subtitle: `${label.replace(/^T-shirt/, "Oversize tee")} · ${productName}`,
    description,
    artistSlug,
    slug,
    priceEuros: centsToEurosString(priceCents),
    category,
    stock: "12",
    sku: buildSalvyaGtin13({ artistSlug, category, slug }),
    compareAtEuros: COMPARE_AT_EUR,
    sizeFit: DEFAULT_SIZE_FIT,
    material,
    featured: false,
    badge: limited ? "Limited" : "",
    sizes: [...CATALOG_DEFAULT_SIZES],
    colors: MAGIC_COLORS.map((c) => ({ ...c })),
    careInstructions: DEFAULT_CARE,
    shippingNote: DEFAULT_SHIPPING,
    metaTitle,
    metaDescription,
    maxPerOrder: String(DEFAULT_MAX_PER_ORDER),
    limited,
    lowStockThreshold: "5",
  };
}
