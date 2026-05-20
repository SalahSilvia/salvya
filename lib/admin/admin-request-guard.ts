import type { NextRequest } from "next/server";
import type { NextResponse } from "next/server";
import { rbacApiJson } from "@/lib/auth/api-errors";

const MUTATION_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

/**
 * Blocks obvious cross-site admin mutations when Origin/Host are present and mismatched.
 * Browsers send Origin on cross-origin POST; same-origin fetches from admin UI match.
 */
export function assertAdminSameOrigin(request: NextRequest): { ok: true } | { ok: false; error: string } {
  if (!MUTATION_METHODS.has(request.method)) return { ok: true };

  const host = request.headers.get("host")?.toLowerCase();
  const origin = request.headers.get("origin");
  if (!origin || !host) return { ok: true };

  try {
    const originHost = new URL(origin).host.toLowerCase();
    if (originHost !== host) {
      return { ok: false, error: "Cross-origin admin request blocked" };
    }
  } catch {
    return { ok: false, error: "Invalid origin header" };
  }

  return { ok: true };
}

export function adminMutationBlockedResponse(request: NextRequest, message: string) {
  return rbacApiJson({ ok: false, error: message }, { status: 403 });
}

export function guardAdminMutation(request: NextRequest): NextResponse | null {
  const check = assertAdminSameOrigin(request);
  if (!check.ok) return adminMutationBlockedResponse(request, check.error);
  return null;
}
