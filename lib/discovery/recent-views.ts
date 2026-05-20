import type { SupabaseClient } from "@supabase/supabase-js";
import type { StorefrontProductWithVariants } from "@/lib/catalog/attach-variants-to-products";
import { pdpPath } from "@/lib/catalog/storefront-product";
import { getMarketContext } from "@/lib/market/get-market-context";
import { defaultsForCategory } from "@/lib/market/defaults";
import { pricingFromProductRow } from "@/lib/market/product-pricing";
import { marketPriceLabelForProduct } from "@/lib/market/storefront-price";
import { parseProductId } from "@/lib/member/likes-storage";

export type RecentViewItem = {
  productId: string;
  artistSlug: string;
  slug: string;
  title: string;
  href: string;
  imageSrc: string;
  priceLabel: string;
  kind: "hoodie" | "tshirt";
  viewedAt: string;
};

const VIEW_COOLDOWN_MS = 10 * 60 * 1000;

export async function recordProductView(
  service: SupabaseClient,
  userId: string,
  productUuid: string,
): Promise<void> {
  const { data: existing } = await service
    .from("user_recent_views")
    .select("viewed_at")
    .eq("user_id", userId)
    .eq("product_id", productUuid)
    .maybeSingle();

  if (existing?.viewed_at) {
    const last = new Date(existing.viewed_at as string).getTime();
    if (Date.now() - last < VIEW_COOLDOWN_MS) return;
  }

  const now = new Date().toISOString();
  await service.from("user_recent_views").upsert(
    { user_id: userId, product_id: productUuid, viewed_at: now },
    { onConflict: "user_id,product_id" },
  );

  await service.rpc("trim_user_recent_views", { p_user_id: userId });
}

/** Resolve legacy content id or uuid to product uuid. */
export async function resolveProductUuid(
  service: SupabaseClient,
  productRef: string,
): Promise<string | null> {
  if (/^[0-9a-f-]{36}$/i.test(productRef)) return productRef;

  const parsed = parseProductId(productRef);
  if (!parsed) return null;

  const { data } = await service
    .from("salvya_products")
    .select("id")
    .eq("artist_slug", parsed.artistSlug)
    .eq("slug", parsed.sku)
    .eq("status", "live")
    .maybeSingle();

  return data?.id ?? null;
}

export async function fetchRecentViewsForUser(
  service: SupabaseClient,
  userId: string,
  limit = 12,
): Promise<RecentViewItem[]> {
  const { data } = await service
    .from("user_recent_views")
    .select(
      "product_id, viewed_at, salvya_products(id, title, slug, artist_slug, category, images, price_cents, price_eur, price_usd, price_mad, market_prices)",
    )
    .eq("user_id", userId)
    .order("viewed_at", { ascending: false })
    .limit(limit);

  if (!data?.length) return [];

  const market = await getMarketContext();
  const out: RecentViewItem[] = [];

  for (const row of data) {
    const embedded = row.salvya_products;
    const prod = (Array.isArray(embedded) ? embedded[0] : embedded) as {
      id: string;
      title: string;
      slug: string;
      artist_slug: string;
      category: string;
      images: string[];
      price_cents: number;
      price_eur?: number | null;
      price_usd?: number | null;
      price_mad?: number | null;
      market_prices?: unknown;
    } | null;
    if (!prod?.id) continue;

    const pricing = pricingFromProductRow(prod);
    const defaults = defaultsForCategory(pricing.category);
    const kind = prod.category === "tee" ? "tshirt" : "hoodie";
    const stub: StorefrontProductWithVariants = {
      id: prod.id,
      artistSlug: prod.artist_slug,
      slug: prod.slug,
      title: prod.title,
      subtitle: null,
      description: null,
      priceCents: prod.price_cents ?? 0,
      priceEur: pricing.priceEur ?? defaults.eur,
      priceUsd: pricing.priceUsd ?? defaults.usd,
      priceMad: pricing.priceMad ?? defaults.mad,
      marketPrices: pricing.marketPrices ?? {},
      compareAtCents: null,
      category: prod.category as "hoodie",
      productKind: kind,
      images: prod.images ?? [],
      stock: 1,
      soldOut: false,
      lowStock: false,
      isLimitedDrop: false,
      badge: null,
      sizes: [],
      colors: [],
      sizeFit: null,
      material: null,
      featured: false,
      preorder: false,
      preorderShipDate: null,
      metaTitle: null,
      metaDescription: null,
      publishedAt: null,
      variants: [],
    };

    out.push({
      productId: prod.id,
      artistSlug: prod.artist_slug,
      slug: prod.slug,
      title: prod.title,
      href: pdpPath(stub),
      imageSrc: prod.images[0] ?? "",
      priceLabel: marketPriceLabelForProduct(stub, market),
      kind,
      viewedAt: row.viewed_at as string,
    });
  }

  return out;
}
