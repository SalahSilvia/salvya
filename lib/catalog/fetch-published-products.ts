import { attachVariantsToProducts } from "@/lib/catalog/attach-variants-to-products";
import { rowToStorefrontProduct, type StorefrontProduct } from "@/lib/catalog/storefront-product";
import type { StorefrontProductWithVariants } from "@/lib/catalog/attach-variants-to-products";
import type { SalvyaProductRow } from "@/lib/admin/types";
import { getSupabasePublicServerClient } from "@/lib/supabase/server";

function mapRows(data: unknown): StorefrontProduct[] {
  if (!Array.isArray(data)) return [];
  return data
    .map((row) => rowToStorefrontProduct(row as SalvyaProductRow))
    .filter((p) => p.images.length > 0 || p.title.length > 0);
}

async function mapRowsWithVariants(data: unknown): Promise<StorefrontProductWithVariants[]> {
  return attachVariantsToProducts(mapRows(data));
}

export async function fetchPublishedProductsByArtist(
  artistSlug: string,
): Promise<StorefrontProductWithVariants[]> {
  const client = getSupabasePublicServerClient();
  if (!client) return [];

  const slug = artistSlug.trim().toLowerCase();
  if (!slug) return [];

  const { data, error } = await client
    .from("salvya_products")
    .select("*")
    .eq("artist_slug", slug)
    .eq("status", "live")
    .order("updated_at", { ascending: false })
    .limit(48);

  if (error) {
    if (error.code === "42P01" || error.message.includes("does not exist")) return [];
    return [];
  }

  return mapRowsWithVariants(data);
}

export async function fetchPublishedProductBySlug(
  artistSlug: string,
  productSlug: string,
): Promise<StorefrontProductWithVariants | null> {
  const client = getSupabasePublicServerClient();
  if (!client) return null;

  const artist = artistSlug.trim().toLowerCase();
  const slug = productSlug.trim().toLowerCase();
  if (!artist || !slug) return null;

  const { data, error } = await client
    .from("salvya_products")
    .select("*")
    .eq("artist_slug", artist)
    .eq("slug", slug)
    .eq("status", "live")
    .maybeSingle();

  if (error || !data) {
    if (error?.code === "42P01" || error?.message.includes("does not exist")) return null;
    return null;
  }

  const base = rowToStorefrontProduct(data as SalvyaProductRow);
  const [withVariants] = await attachVariantsToProducts([base]);
  return withVariants ?? null;
}

export async function fetchFeaturedPublishedProducts(
  limit = 12,
): Promise<StorefrontProductWithVariants[]> {
  const client = getSupabasePublicServerClient();
  if (!client) return [];

  const { data, error } = await client
    .from("salvya_products")
    .select("*")
    .eq("status", "live")
    .order("updated_at", { ascending: false })
    .limit(80);

  if (error) {
    if (error.code === "42P01" || error.message.includes("does not exist")) return [];
    return [];
  }

  const products = mapRows(data).filter((p) => p.featured && p.images.length > 0).slice(0, limit);
  return attachVariantsToProducts(products);
}

export async function fetchAllPublishedProducts(limit = 64): Promise<StorefrontProductWithVariants[]> {
  const client = getSupabasePublicServerClient();
  if (!client) return [];

  const { data, error } = await client
    .from("salvya_products")
    .select("*")
    .eq("status", "live")
    .order("updated_at", { ascending: false })
    .limit(limit);

  if (error) {
    if (error.code === "42P01" || error.message.includes("does not exist")) return [];
    return [];
  }

  return mapRowsWithVariants(data);
}
