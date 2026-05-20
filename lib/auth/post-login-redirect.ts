import type { SalvyaRole } from "@/lib/auth/roles";
import { roleSatisfies } from "@/lib/auth/roles";
import { safeNextPath } from "@/lib/auth/login-href";
import { resolveRouteAccess, routeRequiresAuthentication } from "@/lib/auth/route-policy";

/** Default landing path immediately after sign-in (DB role, server-trusted). */
export function defaultHomeForRole(role: SalvyaRole): string {
  if (role === "god_admin") return "/admin/god";
  if (role === "admin") return "/admin";
  if (role === "influencer") return "/creator/dashboard";
  return "/";
}

/**
 * Honors safe `?next=` when the user is allowed to access that destination; otherwise falls back to role default.
 * Admins and creators always land on their hub after a normal sign-in (public `next` like `/` is ignored).
 */
export function resolvePostLoginRedirect(nextRaw: string | null | undefined, role: SalvyaRole): string {
  const next = safeNextPath(nextRaw ?? null);
  const home = defaultHomeForRole(role);

  if (role === "god_admin" || role === "admin" || role === "influencer") {
    if (!next) return home;
    const access = resolveRouteAccess(next);
    if (!routeRequiresAuthentication(access)) return home;
    if (roleSatisfies(role, access.roles)) return next;
    /** Allow staff to land on storefront account when explicitly requested. */
    if (next.startsWith("/account")) return next;
    return home;
  }

  if (!next) return home;
  const access = resolveRouteAccess(next);
  if (!routeRequiresAuthentication(access)) return next;
  if (roleSatisfies(role, access.roles)) return next;
  return home;
}
