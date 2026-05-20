import type { SupabaseClient } from "@supabase/supabase-js";
import type { SalvyaProductRow } from "@/lib/admin/types";
import { fetchPublishedProductBySlug } from "@/lib/catalog/fetch-published-products";
import { pdpPath, rowToStorefrontProduct } from "@/lib/catalog/storefront-product";
import {
  buildTrackingCodeSeed,
  randomTrackingSuffix,
  withTrackingSuffix,
} from "@/lib/creator/generate-tracking-code";
import { buildPromoRedirectUrl } from "@/lib/creator/promo-url";
import {
  encodeCreatorProductSlug,
  type CreatorProductLinkRow,
  type CreatorProductLinkWithProduct,
} from "@/lib/creator/product-link-types";
import { loadCreatorProfileByUserId } from "@/lib/creator/application-service";

function toCount(value: unknown): number {
  if (typeof value === "number" && Number.isFinite(value)) return Math.max(0, Math.floor(value));
  if (typeof value === "string" && value.trim() !== "") {
    const n = Number(value);
    if (Number.isFinite(n)) return Math.max(0, Math.floor(n));
  }
  return 0;
}

function normalizeCreatorLinkRow(row: Record<string, unknown>): CreatorProductLinkRow {
  return {
    id: String(row.id ?? ""),
    creator_id: String(row.creator_id ?? row.user_id ?? ""),
    product_id: String(row.product_id ?? ""),
    creator_code: String(row.creator_code ?? ""),
    tracking_code: String(row.tracking_code ?? ""),
    slug: String(row.slug ?? ""),
    clicks_count: toCount(row.clicks_count),
    orders_count: toCount(row.orders_count),
    created_at: String(row.created_at ?? new Date().toISOString()),
  };
}

function safeRowToStorefrontProduct(row: SalvyaProductRow) {
  try {
    const images = Array.isArray(row.images)
      ? row.images.filter((u): u is string => typeof u === "string")
      : [];
    const stock =
      typeof row.stock === "number" && Number.isFinite(row.stock)
        ? row.stock
        : toCount(row.stock);
    const priceCents =
      typeof row.price_cents === "number" && Number.isFinite(row.price_cents)
        ? row.price_cents
        : toCount(row.price_cents);

    return rowToStorefrontProduct({
      ...row,
      images,
      stock,
      price_cents: priceCents,
    });
  } catch {
    return null;
  }
}

export async function generateUniqueTrackingCode(
  service: SupabaseClient,
  creatorCode: string,
  productTitle: string,
): Promise<string> {
  const seed = buildTrackingCodeSeed(creatorCode, productTitle);
  for (let i = 0; i < 16; i += 1) {
    const candidate = withTrackingSuffix(seed, randomTrackingSuffix(3));
    const { data } = await service
      .from("creator_product_links")
      .select("id")
      .eq("tracking_code", candidate)
      .maybeSingle();
    if (!data) return candidate;
  }
  return withTrackingSuffix(seed, `${Date.now().toString(36).toUpperCase().slice(-4)}`);
}

export async function loadCreatorLinkByTrackingCode(
  service: SupabaseClient,
  trackingCode: string,
): Promise<(CreatorProductLinkRow & { artist_slug: string; product_slug: string; category: string }) | null> {
  const code = trackingCode.trim().toUpperCase();
  if (!code) return null;

  const { data: linkRow, error } = await service
    .from("creator_product_links")
    .select("*")
    .eq("tracking_code", code)
    .maybeSingle();

  if (error || !linkRow) {
    if (error?.code === "42P01") return null;
    return null;
  }

  const row = linkRow as CreatorProductLinkRow;
  const { data: productRow } = await service
    .from("salvya_products")
    .select("artist_slug, slug, category")
    .eq("id", row.product_id)
    .maybeSingle();

  if (!productRow) return null;

  return {
    ...row,
    artist_slug: productRow.artist_slug as string,
    product_slug: productRow.slug as string,
    category: productRow.category as string,
  };
}

export function productPdpPathFromParts(artistSlug: string, productSlug: string, category: string): string {
  const kind = category === "tee" ? "tshirt" : "hoodie";
  const base = `/artist/${artistSlug}`;
  return kind === "tshirt"
    ? `${base}/tshirt/${encodeURIComponent(productSlug)}`
    : `${base}/item/${encodeURIComponent(productSlug)}`;
}

export async function createCreatorProductLink(
  service: SupabaseClient,
  userId: string,
  productId: string,
): Promise<{ ok: true; link: CreatorProductLinkWithProduct } | { ok: false; error: string }> {
  const profile = await loadCreatorProfileByUserId(service, userId);
  if (!profile?.creator_code) {
    return { ok: false, error: "Creator profile not found. Complete approval first." };
  }

  const { data: productRow, error: productErr } = await service
    .from("salvya_products")
    .select("*")
    .eq("id", productId)
    .eq("status", "live")
    .maybeSingle();

  if (productErr) return { ok: false, error: productErr.message };
  if (!productRow) return { ok: false, error: "Product not found or not live." };

  const product = rowToStorefrontProduct(productRow as SalvyaProductRow);
  const slug = encodeCreatorProductSlug(product.artistSlug, product.slug);

  const { data: existing } = await service
    .from("creator_product_links")
    .select("*")
    .eq("creator_id", userId)
    .eq("product_id", productId)
    .maybeSingle();

  if (existing) {
    const link = await enrichLinkRow(service, existing as CreatorProductLinkRow);
    return { ok: true, link };
  }

  const trackingCode = (
    await generateUniqueTrackingCode(service, profile.creator_code, product.title)
  ).toUpperCase();

  const { data, error } = await service
    .from("creator_product_links")
    .insert({
      creator_id: userId,
      product_id: productId,
      creator_code: profile.creator_code,
      tracking_code: trackingCode,
      slug,
    })
    .select("*")
    .single();

  if (error) {
    if (error.code === "23505") {
      const { data: dup } = await service
        .from("creator_product_links")
        .select("*")
        .eq("creator_id", userId)
        .eq("product_id", productId)
        .maybeSingle();
      if (dup) {
        const link = await enrichLinkRow(service, dup as CreatorProductLinkRow);
        return { ok: true, link };
      }
    }
    return { ok: false, error: error.message };
  }

  const link = await enrichLinkRow(service, data as CreatorProductLinkRow);
  return { ok: true, link };
}

async function enrichLinkRow(
  service: SupabaseClient,
  row: CreatorProductLinkRow,
): Promise<CreatorProductLinkWithProduct> {
  const { data, error } = await service
    .from("salvya_products")
    .select("*")
    .eq("id", row.product_id)
    .maybeSingle();

  if (error && error.code !== "PGRST116") {
    // Product lookup failed — still return the link shell for stats/lists.
    return {
      ...row,
      product: null,
      shareUrl: buildPromoRedirectUrl(row.tracking_code),
    };
  }

  const product = data ? safeRowToStorefrontProduct(data as SalvyaProductRow) : null;
  return {
    ...row,
    product,
    shareUrl: buildPromoRedirectUrl(row.tracking_code),
  };
}

async function fetchCreatorLinkRows(
  service: SupabaseClient,
  userId: string,
): Promise<CreatorProductLinkRow[]> {
  const { data, error } = await service
    .from("creator_product_links")
    .select("*")
    .eq("creator_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    if (
      error.code === "42P01" ||
      error.message.includes("does not exist") ||
      error.message.includes("creator_product_links")
    ) {
      return [];
    }
    throw new Error(error.message);
  }

  return (data ?? []).map((row) => normalizeCreatorLinkRow(row as Record<string, unknown>));
}

export async function listCreatorProductLinks(
  service: SupabaseClient,
  userId: string,
): Promise<CreatorProductLinkWithProduct[]> {
  const rows = await fetchCreatorLinkRows(service, userId);
  const enriched = await Promise.all(
    rows.map(async (row) => {
      try {
        return await enrichLinkRow(service, row);
      } catch {
        return {
          ...row,
          product: null,
          shareUrl: buildPromoRedirectUrl(row.tracking_code),
        };
      }
    }),
  );
  return enriched;
}

export async function loadCreatorLinkForProduct(
  service: SupabaseClient,
  userId: string,
  productId: string,
): Promise<CreatorProductLinkWithProduct | null> {
  const { data } = await service
    .from("creator_product_links")
    .select("*")
    .eq("creator_id", userId)
    .eq("product_id", productId)
    .maybeSingle();

  if (!data) return null;
  return enrichLinkRow(service, data as CreatorProductLinkRow);
}

export async function resolveProductForCreatorSlug(
  artistSlug: string,
  productSlug: string,
) {
  return fetchPublishedProductBySlug(artistSlug, productSlug);
}

export { pdpPath, buildPromoRedirectUrl };
