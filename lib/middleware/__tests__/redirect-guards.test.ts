import { describe, expect, it } from "vitest";
import { NextRequest } from "next/server";
import {
  CANONICAL_PRODUCTION_HOST,
  apexToWwwRedirect,
  isCanonicalProductionHost,
  needsApexToWwwRedirect,
} from "@/lib/middleware/canonical-host";
import { isStaticMiddlewareBypass, isGeoAndIntlBypass } from "@/lib/middleware/bypass";
import { isSameRedirectTarget, safeRedirect } from "@/lib/middleware/safe-redirect";
import { isAuthEntryPath } from "@/lib/middleware/auth-entry";

function request(url: string): NextRequest {
  return new NextRequest(new URL(url));
}

describe("safeRedirect", () => {
  it("returns next() when destination equals current URL", () => {
    const req = request("https://www.salvyastore.com/en/shop");
    const res = safeRedirect(req, "https://www.salvyastore.com/en/shop");
    expect(res.status).toBe(200);
    expect(res.headers.get("location")).toBeNull();
  });

  it("redirects when host or path differs", () => {
    const req = request("https://salvyastore.com/en/shop");
    const res = safeRedirect(req, "https://www.salvyastore.com/en/shop");
    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toBe("https://www.salvyastore.com/en/shop");
  });

  it("isSameRedirectTarget compares pathname and search", () => {
    const req = request("https://www.salvyastore.com/login?next=%2Fbag");
    expect(isSameRedirectTarget(req, "/login?next=%2Fbag")).toBe(true);
    expect(isSameRedirectTarget(req, "/login")).toBe(false);
  });
});

describe("canonical host", () => {
  it("never redirects www", () => {
    const req = request("https://www.salvyastore.com/fr/shop");
    expect(isCanonicalProductionHost(req)).toBe(true);
    expect(needsApexToWwwRedirect(req)).toBe(false);
    expect(apexToWwwRedirect(req)).toBeNull();
  });

  it("redirects apex to www in production", () => {
    const prev = process.env.VERCEL_ENV;
    process.env.VERCEL_ENV = "production";
    const req = request("https://salvyastore.com/en/shop?ref=1");
    expect(needsApexToWwwRedirect(req)).toBe(true);
    const res = apexToWwwRedirect(req);
    expect(res?.status).toBe(308);
    expect(res?.headers.get("location")).toBe("https://www.salvyastore.com/en/shop?ref=1");
    process.env.VERCEL_ENV = prev;
  });

  it("canonical host constant matches production site", () => {
    expect(CANONICAL_PRODUCTION_HOST).toBe("www.salvyastore.com");
  });
});

describe("middleware bypass", () => {
  it("bypasses static and framework assets", () => {
    expect(isStaticMiddlewareBypass("/favicon.ico")).toBe(true);
    expect(isStaticMiddlewareBypass("/robots.txt")).toBe(true);
    expect(isStaticMiddlewareBypass("/manifest.webmanifest")).toBe(true);
    expect(isStaticMiddlewareBypass("/_next/static/chunks/foo.js")).toBe(true);
    expect(isStaticMiddlewareBypass("/media/catalog/x.webp")).toBe(true);
    expect(isStaticMiddlewareBypass("/en/shop")).toBe(false);
  });

  it("bypasses geo/intl for api and auth", () => {
    expect(isGeoAndIntlBypass("/api/geo/detect")).toBe(true);
    expect(isGeoAndIntlBypass("/auth/callback")).toBe(true);
    expect(isGeoAndIntlBypass("/en/login")).toBe(false);
  });
});

describe("auth entry paths", () => {
  it("recognizes localized login and register", () => {
    expect(isAuthEntryPath("/en/login")).toBe(true);
    expect(isAuthEntryPath("/fr/register")).toBe(true);
    expect(isAuthEntryPath("/auth/callback")).toBe(true);
    expect(isAuthEntryPath("/en/shop")).toBe(false);
  });
});
