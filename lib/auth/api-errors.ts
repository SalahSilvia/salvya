import { NextResponse } from "next/server";
import { forwardSetCookiesFrom } from "@/lib/http/forward-set-cookie";

export type RbacApiErrorCode = "unauthorized" | "forbidden" | "not_configured" | "internal";

export function rbacApiJson(
  body: Record<string, unknown>,
  init?: ResponseInit,
): NextResponse {
  const res = NextResponse.json(body, init);
  res.headers.set("Cache-Control", "private, no-store");
  return res;
}

/** Same as `rbacApiJson` but appends refreshed auth cookies from `requireRole` / `requireAdminService`. */
export function rbacApiJsonWithAuthCookies(
  authResponse: NextResponse,
  body: Record<string, unknown>,
  init?: ResponseInit,
): NextResponse {
  const res = rbacApiJson(body, init);
  forwardSetCookiesFrom(authResponse, res);
  return res;
}

export function rbacApiUnauthorized(message = "Unauthorized"): NextResponse {
  return rbacApiJson(
    { ok: false, error: { code: "unauthorized" as const, message } },
    { status: 401 },
  );
}

export function rbacApiForbidden(message = "Forbidden"): NextResponse {
  return rbacApiJson(
    { ok: false, error: { code: "forbidden" as const, message } },
    { status: 403 },
  );
}

export function rbacApiNotConfigured(message = "Auth not configured"): NextResponse {
  return rbacApiJson(
    { ok: false, error: { code: "not_configured" as const, message } },
    { status: 503 },
  );
}
