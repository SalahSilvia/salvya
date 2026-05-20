import type { SupabaseClient } from "@supabase/supabase-js";
import type { CurrencyCode } from "@/lib/currency/config";
import { getFxRate as getFxRateFromEnv } from "@/lib/currency/config";

type PairKey = `${CurrencyCode}_${CurrencyCode}`;

let rateCache: Map<PairKey, number> | null = null;
let cacheLoadedAt = 0;
const CACHE_TTL_MS = 5 * 60 * 1000;

function pairKey(from: CurrencyCode, to: CurrencyCode): PairKey {
  return `${from}_${to}`;
}

/** Load latest FX pairs from Supabase into process memory (server only). */
export async function loadFxRatesIntoCache(service: SupabaseClient): Promise<void> {
  const { data, error } = await service
    .from("fx_rates")
    .select("base_currency, quote_currency, rate, effective_at")
    .order("effective_at", { ascending: false });

  if (error) {
    if (error.code === "42P01") return;
    console.warn("[fx-store] load failed", error.message);
    return;
  }

  const next = new Map<PairKey, number>();
  for (const row of data ?? []) {
    const from = row.base_currency as CurrencyCode;
    const to = row.quote_currency as CurrencyCode;
    const key = pairKey(from, to);
    if (!next.has(key) && typeof row.rate === "number") {
      next.set(key, Number(row.rate));
    }
  }
  rateCache = next;
  cacheLoadedAt = Date.now();
}

export function getFxRateWithCache(from: CurrencyCode, to: CurrencyCode): number {
  if (from === to) return 1;
  if (rateCache && Date.now() - cacheLoadedAt < CACHE_TTL_MS) {
    const direct = rateCache.get(pairKey(from, to));
    if (direct && direct > 0) return direct;
    const inverse = rateCache.get(pairKey(to, from));
    if (inverse && inverse > 0) return 1 / inverse;
  }
  return getFxRateFromEnv(from, to);
}

export async function ensureFxRatesLoaded(service: SupabaseClient | null): Promise<void> {
  if (!service) return;
  if (rateCache && Date.now() - cacheLoadedAt < CACHE_TTL_MS) return;
  await loadFxRatesIntoCache(service);
}

export function clearFxRateCache(): void {
  rateCache = null;
  cacheLoadedAt = 0;
}
