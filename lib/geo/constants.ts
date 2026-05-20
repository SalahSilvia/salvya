/** ISO 3166-1 alpha-2 detected country (set by middleware). */
export const COOKIE_DETECTED_COUNTRY = "salvya_detected_country";

/** User chose display currency (EUR | MAD | USD). */
export const COOKIE_DISPLAY_CURRENCY = "salvya_display_currency";

/** User dismissed geo suggestion or completed a switch (1 = resolved). */
export const COOKIE_GEO_RESOLVED = "salvya_geo_resolved";

/** Optional explicit country preference from user. */
export const COOKIE_PREF_COUNTRY = "salvya_pref_country";

/** User explicitly picked country in menu (do not auto-switch on VPN). */
export const COOKIE_GEO_MANUAL = "salvya_geo_manual";

/** Weak timezone/locale-only detection (session-scoped, no pref lock). */
export const COOKIE_GEO_WEAK = "salvya_geo_weak";

export const GEO_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

/** Short-lived cookies for weak detection (4h). */
export const GEO_WEAK_COOKIE_MAX_AGE = 60 * 60 * 4;
