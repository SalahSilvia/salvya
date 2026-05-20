import type { SupabaseClient } from "@supabase/supabase-js";
import { parseProductId } from "@/lib/member/likes-storage";
import {
  computePopularityScore,
  computeTrendingScore,
} from "@/lib/discovery/ranking";
import { invalidateMetricsCache } from "@/lib/discovery/metrics-store";

type ViewAgg = { v24: number; v7: number; carts: number };

function hoursAgo(h: number): string {
  return new Date(Date.now() - h * 60 * 60 * 1000).toISOString();
}

/** Map analytics `product_id` (artist:type:slug) → salvya_products.id */
async function buildProductIdLookup(service: SupabaseClient): Promise<Map<string, string>> {
  const { data } = await service.from("salvya_products").select("id, artist_slug, slug, category");
  const map = new Map<string, string>();
  if (!data) return map;
  for (const row of data) {
    const slug = row.slug as string;
    const artist = row.artist_slug as string;
    const cat = row.category as string;
    const kind = cat === "tee" ? "tee" : "hoodie";
    const legacyId = `${artist}:${kind}:${encodeURIComponent(slug)}`;
    map.set(legacyId, row.id as string);
    map.set(`${artist}:${kind}:${slug}`, row.id as string);
    map.set(row.id as string, row.id as string);
  }
  return map;
}

export async function recomputeProductMetrics(service: SupabaseClient): Promise<{ updated: number }> {
  const since24 = hoursAgo(24);
  const since7 = hoursAgo(24 * 7);
  const lookup = await buildProductIdLookup(service);

  const viewAgg = new Map<string, ViewAgg>();

  const bump = (pid: string, field: keyof ViewAgg, n = 1) => {
    const cur = viewAgg.get(pid) ?? { v24: 0, v7: 0, carts: 0 };
    cur[field] += n;
    viewAgg.set(pid, cur);
  };

  const { data: events } = await service
    .from("analytics_events")
    .select("event_type, product_id, created_at")
    .gte("created_at", since7)
    .in("event_type", ["product_view", "add_to_cart"])
    .limit(50_000);

  for (const e of events ?? []) {
    const raw = e.product_id as string | null;
    if (!raw) continue;
    const uuid = lookup.get(raw) ?? lookup.get(decodeURIComponent(raw));
    if (!uuid) {
      const parsed = parseProductId(raw);
      if (parsed) {
        const key = `${parsed.artistSlug}:${parsed.type}:${encodeURIComponent(parsed.sku)}`;
        const id = lookup.get(key);
        if (!id) continue;
        const created = e.created_at as string;
        if (e.event_type === "product_view") {
          bump(id, "v7");
          if (created >= since24) bump(id, "v24");
        } else if (e.event_type === "add_to_cart") {
          bump(id, "carts");
        }
      }
      continue;
    }
    const created = e.created_at as string;
    if (e.event_type === "product_view") {
      bump(uuid, "v7");
      if (created >= since24) bump(uuid, "v24");
    } else if (e.event_type === "add_to_cart") {
      bump(uuid, "carts");
    }
  }

  const salesAgg = new Map<string, { s24: number; s7: number }>();

  const { data: orders } = await service
    .from("customer_orders")
    .select("created_at, payment_status, product_snapshot")
    .gte("created_at", since7)
    .in("payment_status", ["paid", "cod_pending"])
    .limit(10_000);

  for (const o of orders ?? []) {
    const snap = o.product_snapshot as { productId?: string } | null;
    const pid = snap?.productId;
    if (!pid || !lookup.has(pid)) {
      if (pid && /^[0-9a-f-]{36}$/i.test(pid)) {
        /* already uuid */
      } else continue;
    }
    const uuid =
      pid && /^[0-9a-f-]{36}$/i.test(pid) ? pid : lookup.get(pid ?? "") ?? null;
    if (!uuid) continue;
    const cur = salesAgg.get(uuid) ?? { s24: 0, s7: 0 };
    cur.s7 += 1;
    if ((o.created_at as string) >= since24) cur.s24 += 1;
    salesAgg.set(uuid, cur);
  }

  const { data: products } = await service.from("salvya_products").select("id").eq("status", "live");
  const rows: Record<string, unknown>[] = [];
  const now = new Date().toISOString();

  for (const p of products ?? []) {
    const id = p.id as string;
    const views = viewAgg.get(id) ?? { v24: 0, v7: 0, carts: 0 };
    const sales = salesAgg.get(id) ?? { s24: 0, s7: 0 };
    const conversionRate = views.v7 > 0 ? Math.min(1, sales.s7 / views.v7) : 0;
    const trendingScore = computeTrendingScore({
      sales24h: sales.s24,
      cartAdds: views.carts,
      views24h: views.v24,
    });
    const popularityScore = computePopularityScore({
      views7d: views.v7,
      sales7d: sales.s7,
      conversionRate,
    });

    rows.push({
      product_id: id,
      views_24h: views.v24,
      views_7d: views.v7,
      sales_24h: sales.s24,
      sales_7d: sales.s7,
      cart_adds: views.carts,
      conversion_rate: conversionRate,
      trending_score: trendingScore,
      popularity_score: popularityScore,
      metrics_updated_at: now,
    });
  }

  if (!rows.length) {
    invalidateMetricsCache();
    return { updated: 0 };
  }

  const { error } = await service.from("product_metrics").upsert(rows, { onConflict: "product_id" });
  if (error) throw new Error(error.message);

  invalidateMetricsCache();
  return { updated: rows.length };
}
