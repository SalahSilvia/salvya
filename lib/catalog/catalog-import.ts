import {
  ARTIST_FOLDER_CATALOG_SLUGS,
  getArtistHoodieCarouselItems,
  getArtistTshirtCarouselItems,
  type ArtistFolderCatalogSlug,
} from "@/lib/artist-folder-catalog";
import { slugifyTitle } from "@/lib/admin/types";
import { IMPORT_DEFAULT_STOCK, importPricingForCategory } from "@/lib/catalog/catalog-import-prices";
import {
  artistHoodies,
  formatOversizeHoodieTitle,
  formatOversizeTshirtTitle,
  orderHoodieImages,
  shopImageSrc,
} from "@/lib/shop-data";
import { buildFolderColorImportEntries } from "@/lib/catalog/catalog-folder-colors";
import {
  folderHoodieImageEntries,
  folderTeeImageEntries,
} from "@/lib/catalog/catalog-folder-import-entries";
import { artistShopFileExists } from "@/lib/catalog/artist-shop-file";
import { enrichCatalogImportRows, statsFromImportRows } from "@/lib/catalog/catalog-smart-enrich";
import type { SalvyaProductCategory } from "@/lib/admin/types";
import { ARTIST_FOLDER_CATALOG_SYNC_MAX } from "@/lib/artist-folder-catalog";

export type CatalogImportSource = "folder_hoodie" | "folder_tee" | "legacy_hoodie";

export type CatalogImportRow = {
  /** Stable key for upsert: artist + category + slug */
  importKey: string;
  source: CatalogImportSource;
  artistSlug: string;
  slug: string;
  category: SalvyaProductCategory;
  title: string;
  description: string | null;
  priceCents: number;
  priceEur: number;
  priceUsd: number;
  priceMad: number;
  marketPrices: Record<string, unknown>;
  images: string[];
  stock: number;
  isLimitedDrop: boolean;
  publishState: "published";
  metadata: Record<string, unknown>;
};

/** Hoodie uses base slug; tee uses `{base}-tee` so (artist_slug, slug) stays unique in Supabase. */
export function folderNameToProductSlug(folder: string, category?: SalvyaProductCategory): string {
  const base = slugifyTitle(folder.replace(/_/g, " "));
  if (!base) return category === "tee" ? "tee-item" : "hoodie-item";
  if (category === "tee") return `${base}-tee`;
  return base;
}

function rowKey(artistSlug: string, category: SalvyaProductCategory, slug: string): string {
  return `${artistSlug}|${category}|${slug}`;
}

function folderHoodieRows(artistSlug: ArtistFolderCatalogSlug): CatalogImportRow[] {
  const prices = importPricingForCategory("hoodie");
  return getArtistHoodieCarouselItems(artistSlug, ARTIST_FOLDER_CATALOG_SYNC_MAX).map((item) => {
    const slug = folderNameToProductSlug(item.folder, "hoodie");
    const colorImport = buildFolderColorImportEntries(
      folderHoodieImageEntries(artistSlug, item.folder, item.orderedFiles),
    );
    return {
      importKey: rowKey(artistSlug, "hoodie", slug),
      source: "folder_hoodie",
      artistSlug,
      slug,
      category: "hoodie",
      title: formatOversizeHoodieTitle(item.title),
      description: null,
      priceCents: prices.priceCents,
      priceEur: prices.priceEur,
      priceUsd: prices.priceUsd,
      priceMad: prices.priceMad,
      marketPrices: prices.marketPrices,
      images: colorImport.images,
      stock: IMPORT_DEFAULT_STOCK,
      isLimitedDrop: false,
      publishState: "published",
      metadata: {
        catalogSource: "folder_hoodie",
        importKey: rowKey(artistSlug, "hoodie", slug),
        folderName: item.folder,
        displayPriceLabel: `${prices.priceMad} MAD`,
        ...(colorImport.colors.length ? { colors: colorImport.colors } : {}),
      },
    };
  });
}

function folderTeeRows(artistSlug: ArtistFolderCatalogSlug): CatalogImportRow[] {
  const prices = importPricingForCategory("tee");
  return getArtistTshirtCarouselItems(artistSlug, ARTIST_FOLDER_CATALOG_SYNC_MAX).map((item) => {
    const slug = folderNameToProductSlug(item.folder, "tee");
    const colorImport = buildFolderColorImportEntries(
      folderTeeImageEntries(artistSlug, item.folder, item.orderedFiles),
    );
    return {
      importKey: rowKey(artistSlug, "tee", slug),
      source: "folder_tee",
      artistSlug,
      slug,
      category: "tee",
      title: formatOversizeTshirtTitle(item.title),
      description: null,
      priceCents: prices.priceCents,
      priceEur: prices.priceEur,
      priceUsd: prices.priceUsd,
      priceMad: prices.priceMad,
      marketPrices: prices.marketPrices,
      images: colorImport.images,
      stock: IMPORT_DEFAULT_STOCK,
      isLimitedDrop: false,
      publishState: "published",
      metadata: {
        catalogSource: "folder_tee",
        importKey: rowKey(artistSlug, "tee", slug),
        folderName: item.folder,
        displayPriceLabel: `${prices.priceMad} MAD`,
        ...(colorImport.colors.length ? { colors: colorImport.colors } : {}),
      },
    };
  });
}

function legacyHoodieRows(): CatalogImportRow[] {
  const prices = importPricingForCategory("hoodie");
  return artistHoodies
    .filter((h) => h.images.some((img) => artistShopFileExists(h.artistSlug, img.file)))
    .flatMap((h): CatalogImportRow[] => {
      const slug = h.itemSlug.trim().toLowerCase();
      const ordered = orderHoodieImages(h.images);
      const images = ordered
        .filter((img) => artistShopFileExists(h.artistSlug, img.file))
        .map((img) => shopImageSrc(h.artistSlug, img.file));
      if (!images.length) return [];
      return [
        {
          importKey: rowKey(h.artistSlug, "hoodie", slug),
          source: "legacy_hoodie",
          artistSlug: h.artistSlug,
          slug,
          category: "hoodie",
          title: formatOversizeHoodieTitle(h.name),
          description: null,
          priceCents: prices.priceCents,
          priceEur: prices.priceEur,
          priceUsd: prices.priceUsd,
          priceMad: prices.priceMad,
          marketPrices: prices.marketPrices,
          images,
          stock: IMPORT_DEFAULT_STOCK,
          isLimitedDrop: false,
          publishState: "published",
          metadata: {
            catalogSource: "legacy_hoodie",
            importKey: rowKey(h.artistSlug, "hoodie", slug),
            displayPriceLabel: h.priceLabel,
          },
        },
      ];
    });
}

/** Scan filesystem folders + legacy static hoodies into normalized import rows (deduped by importKey). */
export function collectCatalogImportRows(): CatalogImportRow[] {
  const map = new Map<string, CatalogImportRow>();

  for (const artistSlug of ARTIST_FOLDER_CATALOG_SLUGS) {
    for (const row of [...folderHoodieRows(artistSlug), ...folderTeeRows(artistSlug)]) {
      map.set(row.importKey, row);
    }
  }

  for (const row of legacyHoodieRows()) {
    map.set(row.importKey, row);
  }

  const sorted = [...map.values()].sort((a, b) => {
    const artist = a.artistSlug.localeCompare(b.artistSlug);
    if (artist !== 0) return artist;
    return a.title.localeCompare(b.title, undefined, { sensitivity: "base" });
  });

  return enrichCatalogImportRows(sorted);
}

export type CatalogImportPreview = {
  total: number;
  byArtist: Record<string, number>;
  byCategory: Record<string, number>;
  bySource: Record<string, number>;
  withColorways: number;
  withModelShots: number;
  withFullMerchandising: number;
  missingRoots: string[];
};

export function previewCatalogImport(): CatalogImportPreview {
  const rows = collectCatalogImportRows();
  const stats = statsFromImportRows(rows);
  const bySource: Record<string, number> = {};

  for (const row of rows) {
    bySource[row.source] = (bySource[row.source] ?? 0) + 1;
  }

  const missingRoots: string[] = [];
  for (const slug of ARTIST_FOLDER_CATALOG_SLUGS) {
    if ((stats.byArtist[slug] ?? 0) === 0) missingRoots.push(slug);
  }

  return {
    total: stats.total,
    byArtist: stats.byArtist,
    byCategory: stats.byCategory,
    bySource,
    withColorways: stats.withColorways,
    withModelShots: stats.withModelShots,
    withFullMerchandising: stats.withFullMerchandising,
    missingRoots,
  };
}
