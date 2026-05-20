import type { SupabaseClient } from "@supabase/supabase-js";
import { collectCatalogImportRows, type CatalogImportRow } from "@/lib/catalog/catalog-import";
import { rowHasPublishableGallery } from "@/lib/catalog/catalog-smart-enrich";
import type { SalvyaProductRow } from "@/lib/admin/types";
import { artistShopUrlResolvesOnDisk } from "@/lib/catalog/artist-shop-file";
import { syncProductVariants } from "@/lib/inventory/sync-product-variants";

export type CatalogSyncResult = {
  ok: boolean;
  inserted: number;
  updated: number;
  skipped: number;
  errors: string[];
  totalCandidates: number;
  withColorways: number;
  withModelShots: number;
  /** Rows deduped by importKey during collection. */
  dedupedCandidates: number;
  duplicateSlugWarnings: number;
  variantsSynced: number;
  variantSyncErrors: string[];
};

function metadataImportKey(meta: unknown): string | null {
  if (typeof meta !== "object" || meta === null) return null;
  const key = (meta as Record<string, unknown>).importKey;
  return typeof key === "string" && key.trim() ? key.trim() : null;
}

function metadataFolderName(meta: unknown): string | null {
  if (typeof meta !== "object" || meta === null) return null;
  const name = (meta as Record<string, unknown>).folderName;
  return typeof name === "string" && name.trim() ? name.trim() : null;
}

function findExistingId(
  row: CatalogImportRow,
  byImportKey: Map<string, string>,
  byArtistSlug: Map<string, SalvyaProductRow[]>,
): string | null {
  const fromKey = byImportKey.get(row.importKey);
  if (fromKey) return fromKey;

  const artistRows = byArtistSlug.get(row.artistSlug) ?? [];
  const folderName =
    typeof row.metadata.folderName === "string" ? row.metadata.folderName : null;

  if (folderName) {
    const byFolder = artistRows.find(
      (p) => metadataFolderName(p.metadata) === folderName && p.category === row.category,
    );
    if (byFolder) return byFolder.id;
  }

  const match = artistRows.find((p) => p.slug === row.slug && p.category === row.category);
  return match?.id ?? null;
}

export async function syncCatalogToSupabase(
  service: SupabaseClient,
  opts?: { dryRun?: boolean },
): Promise<CatalogSyncResult> {
  const candidates = collectCatalogImportRows();
  let withColorways = 0;
  let withModelShots = 0;
  for (const row of candidates) {
    const colors = (row.metadata as { colors?: { models?: string[] }[] }).colors;
    if (Array.isArray(colors) && colors.length) withColorways += 1;
    if (colors?.some((c) => (c.models?.length ?? 0) > 0)) withModelShots += 1;
  }

  const slugKeys = new Set<string>();
  let duplicateSlugWarnings = 0;
  for (const row of candidates) {
    const key = `${row.artistSlug}|${row.slug}`;
    if (slugKeys.has(key)) duplicateSlugWarnings += 1;
    else slugKeys.add(key);
  }

  const result: CatalogSyncResult = {
    ok: true,
    inserted: 0,
    updated: 0,
    skipped: 0,
    errors: [],
    totalCandidates: candidates.length,
    withColorways,
    withModelShots,
    dedupedCandidates: slugKeys.size,
    duplicateSlugWarnings,
    variantsSynced: 0,
    variantSyncErrors: [],
  };

  if (candidates.length === 0) return result;

  const { data: existing, error: loadErr } = await service.from("salvya_products").select("*").limit(2000);

  if (loadErr) {
    result.ok = false;
    result.errors.push(loadErr.message);
    return result;
  }

  const rows = (existing ?? []) as SalvyaProductRow[];
  const byImportKey = new Map<string, string>();
  const byArtistSlug = new Map<string, SalvyaProductRow[]>();

  for (const p of rows) {
    const list = byArtistSlug.get(p.artist_slug) ?? [];
    list.push(p);
    byArtistSlug.set(p.artist_slug, list);
    const ik = metadataImportKey(p.metadata);
    if (ik) byImportKey.set(ik, p.id);
  }

  for (const row of candidates) {
    if (!rowHasPublishableGallery(row)) {
      result.skipped += 1;
      continue;
    }

    if (
      row.source === "legacy_hoodie" &&
      !row.images.some((url) => artistShopUrlResolvesOnDisk(url))
    ) {
      result.skipped += 1;
      continue;
    }

    const existingId = findExistingId(row, byImportKey, byArtistSlug);
    const payload = {
      title: row.title,
      description: row.description,
      slug: row.slug,
      artist_slug: row.artistSlug,
      price_cents: row.priceCents,
      price_eur: row.priceEur,
      price_usd: row.priceUsd,
      price_mad: row.priceMad,
      market_prices: row.marketPrices,
      category: row.category,
      images: row.images,
      stock: row.stock,
      is_limited_drop: row.isLimitedDrop,
      published: row.publishState === "published",
      publish_state: row.publishState,
      status: row.publishState === "published" ? "live" : row.publishState === "archived" ? "archived" : "draft",
      low_stock_threshold: 5,
      metadata: row.metadata,
      updated_at: new Date().toISOString(),
    };

    if (opts?.dryRun) {
      if (existingId) result.updated += 1;
      else result.inserted += 1;
      continue;
    }

    let productId = existingId;

    if (existingId) {
      const { error } = await service.from("salvya_products").update(payload).eq("id", existingId);
      if (error) {
        result.errors.push(`${row.importKey}: ${error.message}`);
        continue;
      }
      result.updated += 1;
    } else {
      const { data: inserted, error } = await service.from("salvya_products").insert(payload).select("id").single();
      if (error) {
        result.errors.push(`${row.importKey}: ${error.message}`);
        continue;
      }
      productId = inserted?.id ?? null;
      result.inserted += 1;
    }

    if (productId) {
      const meta =
        typeof row.metadata === "object" && row.metadata !== null
          ? (row.metadata as Record<string, unknown>)
          : {};
      const variantSync = await syncProductVariants(service, {
        productId,
        artistSlug: row.artistSlug,
        productSlug: row.slug,
        stock: row.stock,
        metadata: meta,
      });
      if (variantSync.ok) {
        result.variantsSynced += 1;
      } else {
        result.variantSyncErrors.push(`${row.importKey}: ${variantSync.error ?? "variant_sync_failed"}`);
      }
    }
  }

  result.ok = result.errors.length === 0;
  return result;
}
