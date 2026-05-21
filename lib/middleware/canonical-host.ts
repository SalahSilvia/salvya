import type { NextRequest } from "next/server";
import { safeRedirect } from "@/lib/middleware/safe-redirect";
import type { NextResponse } from "next/server";

export const CANONICAL_PRODUCTION_HOST = "www.salvyastore.com";
const APEX_PRODUCTION_HOST = "salvyastore.com";

function requestHostname(request: NextRequest): string {
  const raw =
    request.headers.get("x-forwarded-host") ??
    request.headers.get("host") ??
    request.nextUrl.host;
  return raw.split(":")[0]?.toLowerCase() ?? "";
}

export function isCanonicalProductionHost(request: NextRequest): boolean {
  return requestHostname(request) === CANONICAL_PRODUCTION_HOST;
}

/** Apex `salvyastore.com` on Vercel production — single hop to www. */
export function needsApexToWwwRedirect(request: NextRequest): boolean {
  if (process.env.VERCEL_ENV && process.env.VERCEL_ENV !== "production") {
    return false;
  }
  if (!process.env.VERCEL_ENV && process.env.NODE_ENV !== "production") {
    return false;
  }
  return requestHostname(request) === APEX_PRODUCTION_HOST;
}

export function apexToWwwRedirect(request: NextRequest): NextResponse | null {
  if (!needsApexToWwwRedirect(request)) return null;
  const url = request.nextUrl.clone();
  url.protocol = "https:";
  url.host = CANONICAL_PRODUCTION_HOST;
  return safeRedirect(request, url, 308);
}
