import type { SupabaseClient } from "@supabase/supabase-js";
import { rowToProductMetrics, type ProductMetrics, type ProductMetricsRow } from "@/lib/discovery/types";
import { getSupabasePublicServerClient } from "@/lib/supabase/server";

type CacheEntry = { at: number; map: Map<string, ProductMetrics> };

let metricsCache: CacheEntry | null = null;
const METRICS_CACHE_MS = 10 * 60 * 1000;

export async function loadProductMetricsMap(
  client?: SupabaseClient | null,
): Promise<Map<string, ProductMetrics>> {
  const now = Date.now();
  if (metricsCache && now - metricsCache.at < METRICS_CACHE_MS) {
    return metricsCache.map;
  }

  const db = client ?? getSupabasePublicServerClient();
  if (!db) return new Map();

  const { data, error } = await db.from("product_metrics").select("*").limit(500);
  if (error) {
    if (error.code === "42P01" || error.message.includes("does not exist")) return new Map();
    return metricsCache?.map ?? new Map();
  }

  const map = new Map<string, ProductMetrics>();
  for (const row of (data ?? []) as ProductMetricsRow[]) {
    const m = rowToProductMetrics(row);
    map.set(m.productId, m);
  }
  metricsCache = { at: now, map };
  return map;
}

export async function fetchTrendingProductIds(
  limit = 12,
  client?: SupabaseClient | null,
): Promise<string[]> {
  const db = client ?? getSupabasePublicServerClient();
  if (!db) return [];

  const { data, error } = await db
    .from("product_metrics")
    .select("product_id")
    .order("trending_score", { ascending: false })
    .limit(limit);

  if (error || !data) return [];
  return data.map((r) => r.product_id as string).filter(Boolean);
}

export function invalidateMetricsCache(): void {
  metricsCache = null;
}
