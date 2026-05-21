import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { buildAuthCallbackUrl } from "@/lib/auth/auth-callback-url";

describe("buildAuthCallbackUrl", () => {
  const prev = process.env.NEXT_PUBLIC_SITE_URL;

  beforeEach(() => {
    process.env.NEXT_PUBLIC_SITE_URL = "https://www.salvyastore.com";
  });

  afterEach(() => {
    if (prev === undefined) delete process.env.NEXT_PUBLIC_SITE_URL;
    else process.env.NEXT_PUBLIC_SITE_URL = prev;
  });

  it("builds production callback without next", () => {
    expect(buildAuthCallbackUrl(null)).toBe("https://www.salvyastore.com/auth/callback");
  });

  it("preserves safe next path", () => {
    expect(buildAuthCallbackUrl("/bag")).toBe(
      "https://www.salvyastore.com/auth/callback?next=%2Fbag",
    );
  });

  it("rejects open redirects in next", () => {
    expect(buildAuthCallbackUrl("https://evil.test")).toBe(
      "https://www.salvyastore.com/auth/callback",
    );
  });
});
