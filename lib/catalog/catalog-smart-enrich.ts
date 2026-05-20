import type { ProductColorOption } from "@/lib/admin/product-metadata";
import { primaryProductImages, colorOptionId } from "@/lib/admin/product-color-variants";
import type { CatalogImportRow } from "@/lib/catalog/catalog-import";
import {
  buildCatalogMerchandising,
  CATALOG_DEFAULT_SIZES,
} from "@/lib/catalog/catalog-merchandising-defaults";

export { CATALOG_DEFAULT_SIZES };

const COLOR_HEX: Record<string, string> = {
  black: "#1a1a1a",
  white: "#f5f5f0",
};

function parseColors(meta: Record<string, unknown>): ProductColorOption[] {
  const raw = meta.colors;
  if (!Array.isArray(raw)) return [];
  return raw.filter((c): c is ProductColorOption => typeof c === "object" && c !== null && "name" in c);
}

function enrichColor(color: ProductColorOption, index: number): ProductColorOption {
  const id = color.id?.trim() || colorOptionId(color, index);
  const name = color.name?.trim() || "Default";
  const key = id.toLowerCase();
  const hex =
    color.hex && /^#[0-9a-fA-F]{3,8}$/.test(color.hex)
      ? color.hex
      : COLOR_HEX[key] ?? color.hex;

  const out: ProductColorOption = { id, name };
  if (hex) out.hex = hex;
  if (color.front?.trim()) out.front = color.front.trim();
  if (color.back?.trim()) out.back = color.back.trim();
  const models = (color.models ?? []).map((u) => u.trim()).filter(Boolean).slice(0, 8);
  if (models.length) out.models = models;
  return out;
}

export function rowHasPublishableGallery(row: CatalogImportRow): boolean {
  if (row.images.length > 0) return true;
  return parseColors(row.metadata).some(
    (c) => Boolean(c.front?.trim() || c.back?.trim() || (c.models?.length ?? 0) > 0),
  );
}

export function resolveRowImages(row: CatalogImportRow, colors: ProductColorOption[]): string[] {
  if (row.images.length) return row.images;
  return primaryProductImages(colors, { front: null, back: null, models: [] });
}

/** Normalize gallery, colors, merchandising, SEO, and copy before Supabase upsert. */
export function enrichCatalogImportRow(row: CatalogImportRow): CatalogImportRow {
  const folderName =
    typeof row.metadata.folderName === "string" ? row.metadata.folderName : undefined;

  const colors = parseColors(row.metadata).map(enrichColor);
  const images = resolveRowImages(row, colors);
  const modelShotCount = colors.reduce((n, c) => n + (c.models?.length ?? 0), 0);

  const merch = buildCatalogMerchandising(row, folderName, colors);

  const metadata: Record<string, unknown> = {
    ...row.metadata,
    ...merch.metadata,
    lastCatalogSyncAt: new Date().toISOString(),
    catalogSyncVersion: 4,
  };

  if (colors.length) metadata.colors = colors;
  else delete metadata.colors;

  if (modelShotCount > 0) metadata.hasModelShots = true;
  if (colors.length) metadata.colorwayCount = colors.length;

  return {
    ...row,
    description: merch.description,
    images,
    stock: row.stock > 0 ? row.stock : 12,
    publishState: "published",
    metadata,
  };
}

export function enrichCatalogImportRows(rows: CatalogImportRow[]): CatalogImportRow[] {
  return rows.map(enrichCatalogImportRow).filter(rowHasPublishableGallery);
}

export type CatalogImportStats = {
  total: number;
  withColorways: number;
  withModelShots: number;
  withFullMerchandising: number;
  byArtist: Record<string, number>;
  byCategory: Record<string, number>;
};

function hasFullMerchandising(meta: Record<string, unknown>): boolean {
  return Boolean(
    meta.sku &&
      meta.sizes &&
      meta.material &&
      meta.sizeFit &&
      meta.shippingNote &&
      meta.careInstructions &&
      meta.metaTitle &&
      meta.metaDescription,
  );
}

export function statsFromImportRows(rows: CatalogImportRow[]): CatalogImportStats {
  const byArtist: Record<string, number> = {};
  const byCategory: Record<string, number> = {};
  let withColorways = 0;
  let withModelShots = 0;
  let withFullMerchandising = 0;

  for (const row of rows) {
    byArtist[row.artistSlug] = (byArtist[row.artistSlug] ?? 0) + 1;
    byCategory[row.category] = (byCategory[row.category] ?? 0) + 1;
    const colors = parseColors(row.metadata);
    if (colors.length) withColorways += 1;
    if (colors.some((c) => (c.models?.length ?? 0) > 0)) withModelShots += 1;
    if (hasFullMerchandising(row.metadata)) withFullMerchandising += 1;
  }

  return {
    total: rows.length,
    withColorways,
    withModelShots,
    withFullMerchandising,
    byArtist,
    byCategory,
  };
}
