import type { SupabaseClient } from "@supabase/supabase-js";
import {
  rowToStorefrontVariant,
  type ProductVariantRow,
  type StorefrontVariant,
} from "@/lib/inventory/types";
import { getSupabasePublicServerClient } from "@/lib/supabase/server";

export async function fetchVariantsForProduct(
  productId: string,
  client?: SupabaseClient | null,
): Promise<StorefrontVariant[]> {
  const db = client ?? getSupabasePublicServerClient();
  if (!db) return [];

  const { data, error } = await db
    .from("product_variants")
    .select("*")
    .eq("product_id", productId)
    .order("size", { ascending: true, nullsFirst: true });

  if (error || !data?.length) return [];
  return (data as ProductVariantRow[]).map(rowToStorefrontVariant);
}

export async function fetchVariantsForProducts(
  productIds: string[],
  client?: SupabaseClient | null,
): Promise<Map<string, StorefrontVariant[]>> {
  const map = new Map<string, StorefrontVariant[]>();
  if (!productIds.length) return map;

  const db = client ?? getSupabasePublicServerClient();
  if (!db) return map;

  const { data, error } = await db.from("product_variants").select("*").in("product_id", productIds);

  if (error || !data) return map;

  for (const row of data as ProductVariantRow[]) {
    const v = rowToStorefrontVariant(row);
    const list = map.get(v.productId) ?? [];
    list.push(v);
    map.set(v.productId, list);
  }
  return map;
}

/** Resolve a live variant by product + size + color id (PDP / checkout). */
export function findVariantForSelection(
  variants: StorefrontVariant[],
  size: string,
  colorId: string,
): StorefrontVariant | null {
  if (!variants.length) return null;

  const normSize = size.trim().toUpperCase() || null;
  const normColor = colorId.trim().toLowerCase() || "default";

  const exact = variants.find(
    (v) =>
      (v.size?.toUpperCase() ?? null) === normSize &&
      v.color.toLowerCase() === normColor,
  );
  if (exact) return exact;

  const bySize = variants.find((v) => (v.size?.toUpperCase() ?? null) === normSize);
  if (bySize) return bySize;

  const byColor = variants.find((v) => v.color.toLowerCase() === normColor);
  if (byColor) return byColor;

  return variants.find((v) => v.color === "default") ?? variants[0] ?? null;
}

export function findVariantById(variants: StorefrontVariant[], variantId: string): StorefrontVariant | null {
  const id = variantId.trim();
  if (!id) return null;
  return variants.find((v) => v.id === id) ?? null;
}
