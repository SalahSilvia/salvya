import { afterEach, describe, expect, it, vi } from "vitest";
import { resolveShopperCountryDetailed, SALVYA_TZ_HEADER } from "@/lib/geo/resolve-country";

describe("resolveShopperCountryDetailed", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("DEV override bypasses all scoring", async () => {
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("SALVYA_DEV_COUNTRY", "MA");
    const headers = new Headers({
      host: "localhost:3000",
      [SALVYA_TZ_HEADER]: "Europe/Paris",
      "accept-language": "fr-FR,fr;q=0.9",
    });
    const result = await resolveShopperCountryDetailed(headers);
    expect(result.country).toBe("MA");
    expect(result.source).toBe("dev");
    expect(result.confidence).toBe("HIGH");
    expect(result.persistable).toBe(true);
    expect(result.weakDetection).toBe(false);
  });

  it("MA edge beats French browser signals", async () => {
    vi.stubEnv("NODE_ENV", "production");
    const headers = new Headers({
      "x-vercel-ip-country": "MA",
      [SALVYA_TZ_HEADER]: "Europe/Paris",
      "accept-language": "fr-FR,fr;q=0.9",
    });
    const result = await resolveShopperCountryDetailed(headers);
    expect(result.country).toBe("MA");
    expect(result.source).toBe("edge");
    expect(result.persistable).toBe(true);
    expect(result.weakDetection).toBe(false);
  });

  it("Europe/Paris + fr-FR without IP is weak and not persistable", async () => {
    vi.stubEnv("NODE_ENV", "production");
    const headers = new Headers({
      [SALVYA_TZ_HEADER]: "Europe/Paris",
      "accept-language": "fr-FR,fr;q=0.9",
    });
    const result = await resolveShopperCountryDetailed(headers);
    expect(result.country).toBe("FR");
    expect(result.weakDetection).toBe(true);
    expect(result.persistable).toBe(false);
    expect(result.confidence).toBe("LOW");
  });

  it("manual override is HIGH and persistable", async () => {
    const headers = new Headers();
    const result = await resolveShopperCountryDetailed(headers, {
      geoManual: true,
      manualCountry: "FR",
    });
    expect(result.country).toBe("FR");
    expect(result.source).toBe("manual");
    expect(result.persistable).toBe(true);
  });

  it("MAD currency hints MA without persisting weak FR", async () => {
    vi.stubEnv("NODE_ENV", "production");
    const headers = new Headers({
      [SALVYA_TZ_HEADER]: "Europe/Paris",
      "accept-language": "fr-FR",
    });
    const result = await resolveShopperCountryDetailed(headers, {
      displayCurrency: "MAD",
    });
    expect(result.country).toBe("MA");
    expect(result.source).toBe("currency-hint");
    expect(result.persistable).toBe(false);
    expect(result.weakDetection).toBe(true);
  });
});
