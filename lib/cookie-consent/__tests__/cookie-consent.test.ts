import { describe, expect, it } from "vitest";
import {
  acceptAllCookies,
  dismissCookieBannerImplicit,
  essentialOnlyCookies,
  hasConsentDecision,
  shouldEnableAnalytics,
  shouldEnableMarketing,
} from "@/lib/cookie-consent";
import type { CookiePreferencesV1 } from "@/lib/cookie-preferences";

describe("cookie-consent", () => {
  it("allows analytics before any decision", () => {
    expect(hasConsentDecision(null)).toBe(false);
    expect(shouldEnableAnalytics(null)).toBe(true);
    expect(shouldEnableMarketing(null)).toBe(true);
  });

  it("blocks optional cookies after essential only", () => {
    const prefs: CookiePreferencesV1 = {
      v: 1,
      functional: false,
      analytics: false,
      marketing: false,
      savedAt: new Date().toISOString(),
      consentSource: "settings_essential",
    };
    expect(hasConsentDecision(prefs)).toBe(true);
    expect(shouldEnableAnalytics(prefs)).toBe(false);
    expect(shouldEnableMarketing(prefs)).toBe(false);
  });

  it("keeps optional cookies on after banner dismiss", () => {
    const prefs: CookiePreferencesV1 = {
      v: 1,
      functional: true,
      analytics: true,
      marketing: true,
      savedAt: new Date().toISOString(),
      consentSource: "banner_dismiss",
      bannerDismissed: true,
    };
    expect(hasConsentDecision(prefs)).toBe(true);
    expect(shouldEnableAnalytics(prefs)).toBe(true);
    expect(shouldEnableMarketing(prefs)).toBe(true);
  });

  it("accept all sets consent source", () => {
    const prefs = acceptAllCookies();
    expect(prefs).toMatchObject({
      analytics: true,
      marketing: true,
      consentSource: "banner_accept",
    });
  });

  it("essential only helper sets source", () => {
    const prefs = essentialOnlyCookies();
    expect(prefs.consentSource).toBe("settings_essential");
  });

  it("dismiss helper keeps collection on", () => {
    const prefs = dismissCookieBannerImplicit();
    expect(prefs.consentSource).toBe("banner_dismiss");
    expect(prefs.analytics).toBe(true);
  });
});
