export const COOKIE_PREFERENCES_STORAGE_KEY = "salvya.cookiePreferences.v1";

/** Dispatched on `window` after preferences are saved (same tab). */
export const COOKIE_PREFERENCES_EVENT = "salvya:cookie-preferences-updated";

export type CookieConsentSource =
  | "banner_accept"
  | "banner_dismiss"
  | "settings_accept_all"
  | "settings_essential"
  | "settings_custom";

export type CookiePreferencesV1 = {
  v: 1;
  functional: boolean;
  analytics: boolean;
  marketing: boolean;
  savedAt: string;
  consentSource?: CookieConsentSource;
  bannerDismissed?: boolean;
};

export function defaultCookiePreferences(): CookiePreferencesV1 {
  return {
    v: 1,
    functional: false,
    analytics: false,
    marketing: false,
    savedAt: new Date().toISOString(),
  };
}

export function loadCookiePreferences(): CookiePreferencesV1 | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(COOKIE_PREFERENCES_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<CookiePreferencesV1>;
    if (parsed.v !== 1) return null;
    const consentSource =
      parsed.consentSource === "banner_accept" ||
      parsed.consentSource === "banner_dismiss" ||
      parsed.consentSource === "settings_accept_all" ||
      parsed.consentSource === "settings_essential" ||
      parsed.consentSource === "settings_custom"
        ? parsed.consentSource
        : undefined;
    return {
      v: 1,
      functional: Boolean(parsed.functional),
      analytics: Boolean(parsed.analytics),
      marketing: Boolean(parsed.marketing),
      savedAt: typeof parsed.savedAt === "string" ? parsed.savedAt : new Date().toISOString(),
      consentSource,
      bannerDismissed: Boolean(parsed.bannerDismissed),
    };
  } catch {
    return null;
  }
}

export function saveCookiePreferences(
  partial: Pick<CookiePreferencesV1, "functional" | "analytics" | "marketing">,
  meta?: Pick<CookiePreferencesV1, "consentSource" | "bannerDismissed">,
): CookiePreferencesV1 {
  const prev = loadCookiePreferences();
  const next: CookiePreferencesV1 = {
    v: 1,
    functional: partial.functional,
    analytics: partial.analytics,
    marketing: partial.marketing,
    savedAt: new Date().toISOString(),
    consentSource: meta?.consentSource ?? prev?.consentSource,
    bannerDismissed: meta?.bannerDismissed ?? prev?.bannerDismissed,
  };
  if (typeof window !== "undefined") {
    window.localStorage.setItem(COOKIE_PREFERENCES_STORAGE_KEY, JSON.stringify(next));
    window.dispatchEvent(new CustomEvent(COOKIE_PREFERENCES_EVENT, { detail: next }));
  }
  return next;
}

export function clearCookiePreferences(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(COOKIE_PREFERENCES_STORAGE_KEY);
  window.dispatchEvent(new CustomEvent(COOKIE_PREFERENCES_EVENT, { detail: null }));
}
