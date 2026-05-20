import type { SupabaseClient } from "@supabase/supabase-js";
import {
  buildVariantMatrixFromMetadata,
  isPlaceholderVariantSet,
  type VariantMatrixEntry,
} from "@/lib/inventory/build-variant-matrix";
import { fetchVariantsForProduct } from "@/lib/catalog/fetch-product-variants";

export type SyncProductVariantsResult = {
  ok: boolean;
  productId: string;
  variantCount: number;
  totalStock: number;
  created: number;
  updated: number;
  removedPlaceholders: number;
  error?: string;
};

function matrixKey(size: string, color: string): string {
  return `${size.trim().toUpperCase()}|${color.trim().toLowerCase()}`;
}

async function removePlaceholderVariants(service: SupabaseClient, productId: string): Promise<number> {
  const { data, error } = await service
    .from("product_variants")
    .delete()
    .eq("product_id", productId)
    .eq("color", "default")
    .is("size", null)
    .select("id");

  if (error) return 0;
  return data?.length ?? 0;
}

export async function syncProductVariants(
  service: SupabaseClient,
  opts: {
    productId: string;
    artistSlug: string;
    productSlug: string;
    stock: number;
    metadata: Record<string, unknown>;
  },
): Promise<SyncProductVariantsResult> {
  const productId = opts.productId.trim();
  const base: SyncProductVariantsResult = {
    ok: false,
    productId,
    variantCount: 0,
    totalStock: 0,
    created: 0,
    updated: 0,
    removedPlaceholders: 0,
  };

  if (!productId) {
    return { ...base, error: "missing_product_id" };
  }

  const existing = await fetchVariantsForProduct(productId, service);
  const matrix = buildVariantMatrixFromMetadata({
    artistSlug: opts.artistSlug,
    productSlug: opts.productSlug,
    metadata: opts.metadata,
    productStock: opts.stock,
    existingVariants: existing,
  });

  if (!matrix.length) {
    return { ...base, error: "empty_variant_matrix" };
  }

  const existingByKey = new Map(existing.map((v) => [matrixKey(v.size ?? "", v.color), v.id]));
  let created = 0;
  let updated = 0;

  for (const row of matrix) {
    const key = matrixKey(row.size, row.color);
    const existingId = existingByKey.get(key);
    const payload = {
      product_id: productId,
      size: row.size,
      color: row.color,
      stock: row.stock,
      sku: row.sku,
      price_delta_cents: 0,
      updated_at: new Date().toISOString(),
    };

    if (existingId) {
      const { error } = await service.from("product_variants").update(payload).eq("id", existingId);
      if (error) return { ...base, error: error.message };
      updated += 1;
    } else {
      const { error } = await service.from("product_variants").insert(payload);
      if (error) {
        if (error.code === "23505") {
          const { error: retryErr } = await service
            .from("product_variants")
            .update(payload)
            .eq("product_id", productId)
            .eq("size", row.size)
            .eq("color", row.color);
          if (retryErr) return { ...base, error: retryErr.message };
          updated += 1;
        } else {
          return { ...base, error: error.message };
        }
      } else {
        created += 1;
      }
    }
  }

  let removedPlaceholders = 0;
  if (isPlaceholderVariantSet(existing) && matrix.length > 1) {
    removedPlaceholders = await removePlaceholderVariants(service, productId);
  }

  const totalStock = matrix.reduce((sum, v) => sum + v.stock, 0);
  await service
    .from("salvya_products")
    .update({ stock: totalStock, updated_at: new Date().toISOString() })
    .eq("id", productId);

  return {
    ok: true,
    productId,
    variantCount: matrix.length,
    totalStock,
    created,
    updated,
    removedPlaceholders,
  };
}

export async function syncAllProductVariants(
  service: SupabaseClient,
  opts?: { limit?: number; onlyLive?: boolean },
): Promise<{
  ok: boolean;
  synced: number;
  failed: number;
  errors: string[];
  totalVariants: number;
}> {
  const limit = opts?.limit ?? 2000;
  let query = service.from("salvya_products").select("id, artist_slug, slug, stock, metadata, status").limit(limit);
  if (opts?.onlyLive !== false) {
    query = query.eq("status", "live");
  }

  const { data, error } = await query;
  if (error) {
    return { ok: false, synced: 0, failed: 0, errors: [error.message], totalVariants: 0 };
  }

  const errors: string[] = [];
  let synced = 0;
  let failed = 0;
  let totalVariants = 0;

  for (const row of data ?? []) {
    const metadata =
      typeof row.metadata === "object" && row.metadata !== null ? (row.metadata as Record<string, unknown>) : {};
    const result = await syncProductVariants(service, {
      productId: row.id as string,
      artistSlug: row.artist_slug as string,
      productSlug: row.slug as string,
      stock: typeof row.stock === "number" ? row.stock : 0,
      metadata,
    });
    if (!result.ok) {
      failed += 1;
      errors.push(`${row.slug}: ${result.error ?? "sync_failed"}`);
      continue;
    }
    synced += 1;
    totalVariants += result.variantCount;
  }

  return { ok: errors.length === 0, synced, failed, errors, totalVariants };
}
