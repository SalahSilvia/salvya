import type { NextRequest } from "next/server";
import { isAppLocale } from "@/i18n/routing";
import { rbacApiJsonWithAuthCookies } from "@/lib/auth/api-errors";
import { requireAuthenticated } from "@/lib/auth/require-role";
import { parseDisplayCurrency } from "@/lib/currency/config";
import { normalizeCountryCode } from "@/lib/geo/country-map";
import { loadUserGeoPreferences, saveUserGeoPreferences } from "@/lib/market/user-geo-preferences";

export async function GET(request: NextRequest) {
  const auth = await requireAuthenticated(request);
  if (!auth.ok) return auth.response;

  const prefs = await loadUserGeoPreferences(auth.user.id);
  return rbacApiJsonWithAuthCookies(auth.response, { ok: true, prefs });
}

export async function PATCH(request: NextRequest) {
  const auth = await requireAuthenticated(request);
  if (!auth.ok) return auth.response;

  let body: { country?: string; locale?: string; displayCurrency?: string };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return rbacApiJsonWithAuthCookies(auth.response, { ok: false, error: "invalid_json" }, { status: 400 });
  }

  const country = body.country !== undefined ? normalizeCountryCode(body.country) : undefined;
  const localeRaw =
    typeof body.locale === "string" ? body.locale.trim().toLowerCase() : "";
  const locale = isAppLocale(localeRaw) ? localeRaw : undefined;
  const displayCurrency =
    body.displayCurrency !== undefined ? parseDisplayCurrency(body.displayCurrency) : undefined;

  if (body.country !== undefined && !country) {
    return rbacApiJsonWithAuthCookies(auth.response, { ok: false, error: "invalid_country" }, { status: 400 });
  }

  try {
    await saveUserGeoPreferences(auth.user.id, {
      country: country ?? undefined,
      locale,
      displayCurrency: displayCurrency ?? undefined,
    });
    return rbacApiJsonWithAuthCookies(auth.response, { ok: true });
  } catch (e) {
    return rbacApiJsonWithAuthCookies(
      auth.response,
      { ok: false, error: e instanceof Error ? e.message : "save_failed" },
      { status: 500 },
    );
  }
}
