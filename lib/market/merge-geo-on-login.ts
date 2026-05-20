import type { SupabaseClient } from "@supabase/supabase-js";
import { isAppLocale } from "@/i18n/routing";
import { loadUserGeoPreferences, saveUserGeoPreferences } from "@/lib/market/user-geo-preferences";
import { normalizeCountryCode } from "@/lib/geo/country-map";
import type { CurrencyCode } from "@/lib/currency/config";

/** Merge cookie/geo hints into DB profile on login — DB remains source of truth when set. */
export async function mergeGeoPreferencesOnLogin(
  service: SupabaseClient,
  userId: string,
  cookieHints?: {
    country?: string | null;
    locale?: string | null;
    displayCurrency?: CurrencyCode | null;
  },
): Promise<void> {
  const existing = await loadUserGeoPreferences(userId);
  const patch: Parameters<typeof saveUserGeoPreferences>[1] = {};

  if (!existing.country && cookieHints?.country) {
    patch.country = normalizeCountryCode(cookieHints.country);
  }
  if (!existing.locale && cookieHints?.locale) {
    const locale = cookieHints.locale.trim().toLowerCase();
    if (isAppLocale(locale)) patch.locale = locale;
  }
  if (!existing.displayCurrency && cookieHints?.displayCurrency) {
    patch.displayCurrency = cookieHints.displayCurrency;
  }

  if (Object.keys(patch).length > 0) {
    await saveUserGeoPreferences(userId, patch);
  }
}
