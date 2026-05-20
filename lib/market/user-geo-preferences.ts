import type { AppLocale } from "@/i18n/routing";
import { isAppLocale } from "@/i18n/routing";
import { parseDisplayCurrency, type CurrencyCode } from "@/lib/currency/config";
import { normalizeCountryCode } from "@/lib/geo/country-map";
import { createServiceSupabase } from "@/lib/supabase/service";

export type UserGeoPreferences = {
  country: string | null;
  locale: AppLocale | null;
  displayCurrency: CurrencyCode | null;
};

function parseCurrency(raw: unknown): CurrencyCode | null {
  if (typeof raw !== "string") return null;
  const c = raw.trim().toUpperCase();
  if (c === "EUR" || c === "USD" || c === "MAD") return c;
  return null;
}

function parseLocale(raw: unknown): AppLocale | null {
  if (typeof raw !== "string") return null;
  const l = raw.trim().toLowerCase();
  return isAppLocale(l) ? l : null;
}

export async function loadUserGeoPreferences(userId: string): Promise<UserGeoPreferences> {
  const service = createServiceSupabase();
  if (!service) return { country: null, locale: null, displayCurrency: null };

  const { data } = await service
    .from("user_profiles")
    .select("country, locale, display_currency, profile")
    .eq("user_id", userId)
    .maybeSingle();

  if (!data) return { country: null, locale: null, displayCurrency: null };

  const profile =
    data.profile && typeof data.profile === "object" && !Array.isArray(data.profile)
      ? (data.profile as Record<string, unknown>)
      : {};

  const country =
    normalizeCountryCode(typeof data.country === "string" ? data.country : null) ??
    normalizeCountryCode(typeof profile.country === "string" ? profile.country : null) ??
    normalizeCountryCode(typeof profile.preferredCountry === "string" ? profile.preferredCountry : null) ??
    normalizeCountryCode(typeof profile.countryCode === "string" ? profile.countryCode : null);

  const locale =
    parseLocale(data.locale) ??
    parseLocale(profile.locale) ??
    parseLocale(profile.preferredLocale);

  const displayCurrency =
    parseDisplayCurrency(data.display_currency) ??
    parseDisplayCurrency(profile.displayCurrency) ??
    parseDisplayCurrency(profile.display_currency);

  return { country, locale, displayCurrency };
}

export async function saveUserGeoPreferences(
  userId: string,
  prefs: Partial<UserGeoPreferences>,
): Promise<void> {
  const service = createServiceSupabase();
  if (!service) throw new Error("service_unavailable");

  const { data: existing } = await service
    .from("user_profiles")
    .select("profile")
    .eq("user_id", userId)
    .maybeSingle();

  const profile =
    existing?.profile && typeof existing.profile === "object" && !Array.isArray(existing.profile)
      ? { ...(existing.profile as Record<string, unknown>) }
      : {};

  const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };

  if (prefs.country !== undefined) {
    const c = normalizeCountryCode(prefs.country);
    patch.country = c;
    profile.country = c;
    profile.preferredCountry = c;
  }
  if (prefs.locale !== undefined && prefs.locale) {
    patch.locale = prefs.locale;
    profile.locale = prefs.locale;
  }
  if (prefs.displayCurrency !== undefined && prefs.displayCurrency) {
    patch.display_currency = prefs.displayCurrency;
    profile.displayCurrency = prefs.displayCurrency;
  }

  patch.profile = profile;

  const { error } = await service.from("user_profiles").update(patch).eq("user_id", userId);
  if (error) throw new Error(error.message);
}
