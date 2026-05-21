import { getAuthRedirectOrigin } from "@/lib/auth/auth-origin";
import { safeNextPath } from "@/lib/auth/login-href";

/** PKCE callback used by Google OAuth, email confirmation, and password recovery. */
export function buildAuthCallbackUrl(next?: string | null): string {
  const origin = getAuthRedirectOrigin();
  const safe = safeNextPath(next ?? null);
  const base = `${origin}/auth/callback`;
  if (!safe) return base;
  return `${base}?next=${encodeURIComponent(safe)}`;
}
