import { beforeEach, describe, expect, it, vi } from "vitest";
import { getMarketContext } from "@/lib/market/get-market-context";

const cookiesMock = vi.fn();
const headersMock = vi.fn();
const loadUserGeoPreferences = vi.fn();

vi.mock("next/headers", () => ({
  cookies: () => cookiesMock(),
  headers: () => headersMock(),
}));

vi.mock("@/lib/market/user-geo-preferences", () => ({
  loadUserGeoPreferences: (...args: unknown[]) => loadUserGeoPreferences(...args),
}));

describe("getMarketContext", () => {
  beforeEach(() => {
    cookiesMock.mockReset();
    headersMock.mockReset();
    loadUserGeoPreferences.mockReset();
    cookiesMock.mockResolvedValue({
      get: (name: string) => {
        if (name === "salvya_pref_country") return { value: "MA" };
        return undefined;
      },
    });
    headersMock.mockResolvedValue(new Headers());
    loadUserGeoPreferences.mockResolvedValue({
      country: null,
      locale: null,
      displayCurrency: null,
    });
  });

  it("maps Morocco cookie to MA market", async () => {
    const ctx = await getMarketContext();
    expect(ctx.marketCode).toBe("MA");
    expect(ctx.currency).toBe("MAD");
    expect(ctx.originalBaseCurrency).toBe("EUR");
  });

  it("loads profile country when userId provided", async () => {
    loadUserGeoPreferences.mockResolvedValue({
      country: "US",
      locale: "en",
      displayCurrency: "USD",
    });
    const ctx = await getMarketContext({ userId: "user-1" });
    expect(ctx.marketCode).toBe("US");
    expect(ctx.source).toBe("profile");
  });

  it("prefers saved pref cookie over detected when both set", async () => {
    cookiesMock.mockResolvedValue({
      get: (name: string) => {
        if (name === "salvya_pref_country") return { value: "FR" };
        if (name === "salvya_detected_country") return { value: "MA" };
        if (name === "salvya_geo_resolved") return { value: "1" };
        return undefined;
      },
    });
    const ctx = await getMarketContext();
    expect(ctx.marketCode).toBe("EU");
    expect(ctx.countryCode).toBe("FR");
  });

  it("ignores stale detected cookie without geo_resolved", async () => {
    cookiesMock.mockResolvedValue({
      get: (name: string) => {
        if (name === "salvya_detected_country") return { value: "FR" };
        return undefined;
      },
    });
    headersMock.mockResolvedValue(new Headers({ "x-vercel-ip-country": "MA" }));
    const ctx = await getMarketContext();
    expect(ctx.marketCode).toBe("MA");
  });

  it("keeps manual pref when geo_manual set even if detected differs", async () => {
    cookiesMock.mockResolvedValue({
      get: (name: string) => {
        if (name === "salvya_pref_country") return { value: "FR" };
        if (name === "salvya_detected_country") return { value: "MA" };
        if (name === "salvya_geo_manual") return { value: "1" };
        return undefined;
      },
    });
    const ctx = await getMarketContext();
    expect(ctx.marketCode).toBe("EU");
  });

  it("weak geo cookie does not use detected FR for market tier", async () => {
    cookiesMock.mockResolvedValue({
      get: (name: string) => {
        if (name === "salvya_detected_country") return { value: "FR" };
        if (name === "salvya_geo_weak") return { value: "1" };
        return undefined;
      },
    });
    const ctx = await getMarketContext();
    expect(ctx.marketCode).toBe("EU");
    expect(ctx.countryCode).toBeNull();
  });

  it("MAD display currency upgrades market to MA when country was FR", async () => {
    cookiesMock.mockResolvedValue({
      get: (name: string) => {
        if (name === "salvya_pref_country") return { value: "FR" };
        if (name === "salvya_display_currency") return { value: "MAD" };
        return undefined;
      },
    });
    const ctx = await getMarketContext();
    expect(ctx.marketCode).toBe("MA");
    expect(ctx.countryCode).toBe("MA");
  });

  it("keeps France market when display currency is MAD but manual lock on FR", async () => {
    cookiesMock.mockResolvedValue({
      get: (name: string) => {
        if (name === "salvya_pref_country") return { value: "FR" };
        if (name === "salvya_display_currency") return { value: "MAD" };
        if (name === "salvya_geo_manual") return { value: "1" };
        return undefined;
      },
    });
    const ctx = await getMarketContext();
    expect(ctx.marketCode).toBe("EU");
    expect(ctx.displayCurrency).toBe("MAD");
  });
});
