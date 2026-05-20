import { NextResponse } from "next/server";
import { loadActiveBoostWeights } from "@/lib/creator/boost-engine";
import { loadPublishedProductsForDiscovery } from "@/lib/discovery/build-discovery-catalog";
import { fetchTrendingProductIds } from "@/lib/discovery/metrics-store";
import { pdpPath } from "@/lib/catalog/storefront-product";
import { getMarketContext } from "@/lib/market/get-market-context";
import { marketPriceLabelForProduct } from "@/lib/market/storefront-price";
import { createServiceSupabase } from "@/lib/supabase/service";

export const revalidate = 600;

export async function GET() {
  const [trendingIds, catalog, market] = await Promise.all([
    fetchTrendingProductIds(16),
    loadPublishedProductsForDiscovery(64),
    getMarketContext(),
  ]);

  const byId = new Map(catalog.products.map((p) => [p.id, p]));
  const ordered = trendingIds.map((id) => byId.get(id)).filter(Boolean);

  let boostMap = new Map<string, number>();
  try {
    const service = createServiceSupabase();
    if (service) boostMap = await loadActiveBoostWeights(service);
  } catch {
    /* organic boost optional */
  }

  const boostedScore = (productId: string, base: number) => {
    const mult = boostMap.get(productId) ?? 1;
    return base * mult;
  };

  const fallback = [...catalog.products]
    .sort(
      (a, b) =>
        boostedScore(b.id, b.metrics?.trendingScore ?? 0) -
        boostedScore(a.id, a.metrics?.trendingScore ?? 0),
    )
    .slice(0, 12);

  const items = (ordered.length ? ordered : fallback).slice(0, 12).map((p) => ({
    id: p!.id,
    title: p!.title,
    href: pdpPath(p!),
    imageSrc: p!.images[0] ?? "",
    priceLabel: marketPriceLabelForProduct(p!, market),
    artistSlug: p!.artistSlug,
    kind: p!.productKind,
    trendingScore: p!.metrics?.trendingScore ?? 0,
  }));

  return NextResponse.json(
    { ok: true, items },
    { headers: { "Cache-Control": "public, s-maxage=600, stale-while-revalidate=1200" } },
  );
}
