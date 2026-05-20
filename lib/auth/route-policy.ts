import type { SalvyaRole } from "@/lib/auth/roles";

export type RouteAccessKind = "public" | "page" | "api";

export type RouteAccessRequirement = {
  kind: RouteAccessKind;
  roles: readonly SalvyaRole[];
};

const PAGE_RULES: { prefix: string; roles: readonly SalvyaRole[] }[] = [
  { prefix: "/admin/god", roles: ["god_admin"] },
  { prefix: "/admin", roles: ["admin", "god_admin"] },
  /** Creator workspace — same login as customers; role-gated dashboard only. */
  { prefix: "/creator/dashboard", roles: ["influencer", "admin", "god_admin"] },
  { prefix: "/creator/products", roles: ["influencer", "admin", "god_admin"] },
  { prefix: "/creator/links", roles: ["influencer", "admin", "god_admin"] },
  { prefix: "/creator/wallet", roles: ["influencer", "admin", "god_admin"] },
  { prefix: "/creator/analytics", roles: ["influencer", "admin", "god_admin"] },
  { prefix: "/creator/more", roles: ["influencer", "admin", "god_admin"] },
  { prefix: "/creator/apply", roles: ["customer", "influencer", "admin", "god_admin"] },
  { prefix: "/creator/application-status", roles: ["customer", "influencer", "admin", "god_admin"] },
  /** Signed-in account surfaces (hub `/account` stays public with sign-in CTA). */
  { prefix: "/account/profile", roles: ["customer", "influencer", "admin", "god_admin"] },
  { prefix: "/account/settings", roles: ["customer", "influencer", "admin", "god_admin"] },
  { prefix: "/account/refunds", roles: ["customer", "influencer", "admin", "god_admin"] },
  { prefix: "/account", roles: ["customer", "influencer", "admin", "god_admin"] },
  { prefix: "/admin/payments", roles: ["admin", "god_admin"] },
];

const API_RULES: { prefix: string; roles: readonly SalvyaRole[] }[] = [
  { prefix: "/api/admin/god", roles: ["god_admin"] },
  { prefix: "/api/admin", roles: ["admin", "god_admin"] },
  { prefix: "/api/creator/product-links", roles: ["influencer", "admin", "god_admin"] },
  { prefix: "/api/creator/stats", roles: ["influencer", "admin", "god_admin"] },
  { prefix: "/api/creator", roles: ["customer", "influencer", "admin", "god_admin"] },
  { prefix: "/api/me", roles: ["customer", "influencer", "admin", "god_admin"] },
  { prefix: "/api/account", roles: ["customer", "influencer", "admin", "god_admin"] },
  { prefix: "/api/auth/me", roles: ["customer", "influencer", "admin", "god_admin"] },
];

function matchPrefix(pathname: string, prefix: string): boolean {
  return pathname === prefix || pathname.startsWith(`${prefix}/`);
}

/** Longest-prefix wins so `/admin/god` does not fall through to `/admin`. */
function sortRulesByPrefixLength<T extends { prefix: string }>(rules: T[]): T[] {
  return [...rules].sort((a, b) => b.prefix.length - a.prefix.length);
}

/**
 * Central route → role map for middleware and tests.
 * Public storefront routes return { kind: "public" }.
 */
export function resolveRouteAccess(pathname: string): RouteAccessRequirement {
  for (const rule of sortRulesByPrefixLength(API_RULES)) {
    if (matchPrefix(pathname, rule.prefix)) {
      return { kind: "api", roles: rule.roles };
    }
  }

  for (const rule of sortRulesByPrefixLength(PAGE_RULES)) {
    if (matchPrefix(pathname, rule.prefix)) {
      return { kind: "page", roles: rule.roles };
    }
  }

  return { kind: "public", roles: [] };
}

export function routeRequiresAuthentication(access: RouteAccessRequirement): boolean {
  return access.kind !== "public";
}
