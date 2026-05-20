import type { ProductMetadata } from "@/lib/admin/product-metadata";
import { buildSalvyaGtin13 } from "@/lib/barcode/salvya-gtin";
import type { CatalogImportRow } from "@/lib/catalog/catalog-import";
import {
  IMPORT_HOODIE_PRICE_CENTS,
  IMPORT_TEE_PRICE_CENTS,
} from "@/lib/catalog/catalog-import-prices";
import type { ProductColorOption } from "@/lib/admin/product-metadata";
import { artists } from "@/lib/site-data";

export const CATALOG_DEFAULT_SIZES = ["XS", "S", "M", "L", "XL", "2XL"] as const;

const DEFAULT_MATERIAL = {
  hoodie: "100% organic cotton fleece, 400gsm",
  tee: "100% organic cotton jersey, 240gsm",
} as const;

const DEFAULT_SIZE_FIT =
  "Oversized fit — size down for a regular look. Model is 1m82 wearing L.";

const DEFAULT_SHIPPING = "Ships in 3–5 business days from EU";

const DEFAULT_CARE = "Machine wash cold, inside out. Do not tumble dry.";

const DEFAULT_MAX_PER_ORDER = 2;

/** Strikethrough MSRP in EUR cents (admin compare-at field). */
const COMPARE_AT_CENTS = {
  hoodie: 5900,
  tee: 5900,
} as const;

function artistDisplayName(artistSlug: string): string {
  return artists.find((a) => a.slug === artistSlug)?.name ?? artistSlug;
}

function artistStatusTag(artistSlug: string): string | undefined {
  return artists.find((a) => a.slug === artistSlug)?.statusTag;
}

function productShortName(row: CatalogImportRow, folderName?: string): string {
  const fromTitle = row.title.match(/\.\.\s*(.+)$/i)?.[1]?.trim();
  return fromTitle || folderName?.trim() || row.slug;
}

function catalogSku(row: CatalogImportRow): string {
  return buildSalvyaGtin13({
    artistSlug: row.artistSlug,
    category: row.category,
    slug: row.slug,
  });
}

function salePriceCents(row: CatalogImportRow): number {
  return row.category === "tee" ? IMPORT_TEE_PRICE_CENTS : IMPORT_HOODIE_PRICE_CENTS;
}

function compareAtCentsFor(row: CatalogImportRow): number | undefined {
  const compare = row.category === "tee" ? COMPARE_AT_CENTS.tee : COMPARE_AT_CENTS.hoodie;
  const sale = salePriceCents(row);
  return compare > sale ? compare : undefined;
}

function badgeFor(row: CatalogImportRow): string | undefined {
  if (row.isLimitedDrop) return "Limited";
  if (artistStatusTag(row.artistSlug) === "LIMITED DROP") return "Limited";
  return undefined;
}

function buildDescription(
  row: CatalogImportRow,
  folderName: string | undefined,
  colors: ProductColorOption[],
): string {
  const artist = artistDisplayName(row.artistSlug);
  const name = productShortName(row, folderName);
  const kind = row.category === "tee" ? "oversize tee" : "oversize hoodie";
  const material = row.category === "tee" ? DEFAULT_MATERIAL.tee : DEFAULT_MATERIAL.hoodie;
  const colorLine =
    colors.length > 1
      ? `Available in ${colors.map((c) => c.name).join(" and ")}.`
      : colors.length === 1
        ? `Color: ${colors[0]!.name}.`
        : "";

  return [
    `${name} — official ${artist} ${kind} on Salvya.`,
    colorLine,
    material,
    DEFAULT_SIZE_FIT,
    "Authentic artist merchandise with premium print and fabric quality.",
  ]
    .filter(Boolean)
    .join("\n\n");
}

function seoTitle(row: CatalogImportRow): string {
  const t = row.title.trim();
  return t.length <= 70 ? t : t.slice(0, 67) + "...";
}

function seoDescription(row: CatalogImportRow, folderName: string | undefined): string {
  const artist = artistDisplayName(row.artistSlug);
  const name = productShortName(row, folderName);
  const base = `Official ${artist} merch — ${name}. ${DEFAULT_SHIPPING.replace(/\.$/, "")}.`;
  return base.length <= 160 ? base : base.slice(0, 157) + "...";
}

export type CatalogMerchandisingBundle = {
  description: string;
  metadata: ProductMetadata;
};

/** Full merchandising + SEO + variants defaults for catalog sync. */
export function buildCatalogMerchandising(
  row: CatalogImportRow,
  folderName: string | undefined,
  colors: ProductColorOption[],
): CatalogMerchandisingBundle {
  const subtitle =
    folderName != null
      ? `${row.category === "tee" ? "Oversize tee" : "Oversize hoodie"} · ${folderName.trim()}`
      : undefined;

  const compareAt = compareAtCentsFor(row);
  const badge = badgeFor(row);

  const metadata: ProductMetadata = {
    sku: catalogSku(row),
    compareAtCents: compareAt,
    material: row.category === "tee" ? DEFAULT_MATERIAL.tee : DEFAULT_MATERIAL.hoodie,
    sizeFit: DEFAULT_SIZE_FIT,
    sizes: [...CATALOG_DEFAULT_SIZES],
    careInstructions: DEFAULT_CARE,
    shippingNote: DEFAULT_SHIPPING,
    maxPerOrder: DEFAULT_MAX_PER_ORDER,
    preorder: false,
    metaTitle: seoTitle(row),
    metaDescription: seoDescription(row, folderName),
  };

  if (subtitle) metadata.subtitle = subtitle;
  if (badge) metadata.badge = badge;

  return {
    description: buildDescription(row, folderName, colors),
    metadata,
  };
}
