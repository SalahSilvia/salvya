import type { SalvyaProductCategory } from "@/lib/admin/types";
import type { CurrencyCode } from "@/lib/currency/config";
import { formatMoneyMinor } from "@/lib/currency/display";
import { defaultsForCategory } from "@/lib/market/defaults";
import { marketToCurrency } from "@/lib/market/country-to-market";
import type {
  MarketCode,
  MarketPriceEntry,
  MarketPricesMap,
  ResolvedMarketPrice,
} from "@/lib/market/types";

export type ProductPricingSource = {
  id: string;
  category: SalvyaProductCategory;
  priceEur: number | null;
  priceUsd: number | null;
  priceMad: number | null;
  priceCents: number;
  marketPrices: MarketPricesMap | null;
};

function parseMarketPrices(raw: unknown): MarketPricesMap {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return {};
  const out: MarketPricesMap = {};
  for (const key of ["MA", "EU", "US"] as const) {
    const entry = (raw as Record<string, unknown>)[key];
    if (!entry || typeof entry !== "object" || Array.isArray(entry)) continue;
    const currency = (entry as { currency?: string }).currency;
    const price = (entry as { price?: number }).price;
    if (
      (currency === "EUR" || currency === "USD" || currency === "MAD") &&
      typeof price === "number" &&
      Number.isFinite(price) &&
      price >= 0
    ) {
      out[key] = { currency, price };
    }
  }
  return out;
}

export function pricingFromProductRow(row: {
  id: string;
  category: string;
  price_cents: number;
  price_eur?: number | null;
  price_usd?: number | null;
  price_mad?: number | null;
  market_prices?: unknown;
}): ProductPricingSource {
  const category = (row.category === "tee" ? "tee" : row.category === "hoodie" ? "hoodie" : "other") as SalvyaProductCategory;
  const defaults = defaultsForCategory(category);
  return {
    id: row.id,
    category,
    priceEur: typeof row.price_eur === "number" ? row.price_eur : defaults.eur,
    priceUsd: typeof row.price_usd === "number" ? row.price_usd : defaults.usd,
    priceMad: typeof row.price_mad === "number" ? row.price_mad : defaults.mad,
    priceCents: row.price_cents,
    marketPrices: parseMarketPrices(row.market_prices),
  };
}

function columnPriceForMarket(source: ProductPricingSource, market: MarketCode): number {
  if (market === "MA") return source.priceMad ?? defaultsForCategory(source.category).mad;
  if (market === "US") return source.priceUsd ?? defaultsForCategory(source.category).usd;
  return source.priceEur ?? defaultsForCategory(source.category).eur;
}

function entryForMarket(source: ProductPricingSource, market: MarketCode): MarketPriceEntry {
  const fromJson = source.marketPrices?.[market];
  if (fromJson && fromJson.price >= 0) {
    return { currency: fromJson.currency, price: fromJson.price };
  }
  const amount = columnPriceForMarket(source, market);
  return { currency: marketToCurrency(market), price: amount };
}

export function getMarketPrice(
  source: ProductPricingSource,
  marketCode: MarketCode,
  locale?: string,
): ResolvedMarketPrice {
  const entry = entryForMarket(source, marketCode);
  const unitCents = Math.max(0, Math.round(entry.price * 100));
  return {
    marketCode,
    currency: entry.currency,
    unitAmount: entry.price,
    unitCents,
    displayPrice: formatMoneyMinor({ amountCents: unitCents, currency: entry.currency }, { locale }),
  };
}

export function lineTotalForQty(unit: ResolvedMarketPrice, qty: number): ResolvedMarketPrice {
  const q = Math.max(1, Math.min(5, Math.floor(qty)));
  const unitCents = unit.unitCents * q;
  return {
    marketCode: unit.marketCode,
    currency: unit.currency,
    unitAmount: unit.unitAmount * q,
    unitCents,
    displayPrice: formatMoneyMinor(
      { amountCents: unitCents, currency: unit.currency as CurrencyCode },
      {},
    ),
  };
}

export function eurCentsFromPricing(source: ProductPricingSource): number {
  const eur = source.priceEur ?? defaultsForCategory(source.category).eur;
  return Math.max(0, Math.round(eur * 100));
}
