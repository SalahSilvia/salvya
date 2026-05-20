import type { MarketCode } from "@/lib/market/types";
import { normalizeCountryCode } from "@/lib/geo/country-map";

const EU_COUNTRIES = new Set([
  "FR",
  "IT",
  "ES",
  "NL",
  "DE",
  "BE",
  "AT",
  "PT",
  "IE",
  "LU",
  "GR",
  "FI",
  "SE",
  "DK",
  "PL",
  "CZ",
  "RO",
  "HU",
  "BG",
  "HR",
  "SK",
  "SI",
  "LT",
  "LV",
  "EE",
  "CY",
  "MT",
  "GB",
  "CH",
  "NO",
]);

export function countryToMarketCode(countryCode: string | null | undefined): MarketCode {
  const code = normalizeCountryCode(countryCode ?? null);
  if (!code || code === "EU") return "EU";
  if (code === "MA") return "MA";
  if (code === "US") return "US";
  if (EU_COUNTRIES.has(code)) return "EU";
  return "EU";
}

export function marketToCurrency(market: MarketCode): "MAD" | "EUR" | "USD" {
  if (market === "MA") return "MAD";
  if (market === "US") return "USD";
  return "EUR";
}
