import {
  loadCookiePreferences,
  saveCookiePreferences,
  type CookieConsentSource,
  type CookiePreferencesV1,
} from "@/lib/cookie-preferences";

export type { CookieConsentSource };

/** User made an explicit choice (banner or settings). */
export function hasConsentDecision(prefs: CookiePreferencesV1 | null = loadCookiePreferences()): boolean {
  return Boolean(prefs?.consentSource);
}

/** First-party analytics (page views, heartbeat, time on page). */
export function shouldEnableAnalytics(prefs: CookiePreferencesV1 | null = loadCookiePreferences()): boolean {
  if (!prefs) return true;
  if (prefs.consentSource === "settings_essential") return false;
  return prefs.analytics;
}

/** Third-party marketing pixels (e.g. Meta). */
export function shouldEnableMarketing(prefs: CookiePreferencesV1 | null = loadCookiePreferences()): boolean {
  if (!prefs) return true;
  if (prefs.consentSource === "settings_essential") return false;
  return prefs.marketing;
}

export function shouldEnableFunctional(prefs: CookiePreferencesV1 | null = loadCookiePreferences()): boolean {
  if (!prefs) return true;
  if (prefs.consentSource === "settings_essential") return false;
  return prefs.functional;
}

export function acceptAllCookies(source: CookieConsentSource = "banner_accept"): CookiePreferencesV1 {
  return saveCookiePreferences(
    { functional: true, analytics: true, marketing: true },
    { consentSource: source },
  );
}

export function essentialOnlyCookies(source: CookieConsentSource = "settings_essential"): CookiePreferencesV1 {
  return saveCookiePreferences(
    { functional: false, analytics: false, marketing: false },
    { consentSource: source },
  );
}

/** Banner closed without opening settings — optional cookies stay on (collect anyway). */
export function dismissCookieBannerImplicit(): CookiePreferencesV1 {
  return saveCookiePreferences(
    { functional: true, analytics: true, marketing: true },
    { consentSource: "banner_dismiss", bannerDismissed: true },
  );
}
