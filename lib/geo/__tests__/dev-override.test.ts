import { afterEach, describe, expect, it, vi } from "vitest";
import { resolveDevOverride, SALVYA_DEV_GEO_QUERY } from "@/lib/geo/dev-override";

describe("resolveDevOverride", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("uses SALVYA_DEV_COUNTRY env in development", () => {
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("SALVYA_DEV_COUNTRY", "MA");
    const headers = new Headers();
    const r = resolveDevOverride(headers);
    expect(r?.country).toBe("MA");
    expect(r?.source).toBe("env");
  });

  it("uses ?geo= query in development", () => {
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("SALVYA_DEV_COUNTRY", "");
    const headers = new Headers();
    const params = new URLSearchParams({ [SALVYA_DEV_GEO_QUERY]: "MA" });
    const r = resolveDevOverride(headers, params);
    expect(r?.country).toBe("MA");
    expect(r?.source).toBe("query");
  });

  it("returns null in production", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("SALVYA_DEV_COUNTRY", "MA");
    const r = resolveDevOverride(new Headers());
    expect(r).toBeNull();
  });
});
