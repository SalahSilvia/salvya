/** Authoritative Salvya roles (stored in public.user_profiles.role). */
export const SALVYA_ROLES = ["customer", "influencer", "admin", "god_admin"] as const;

export type SalvyaRole = (typeof SALVYA_ROLES)[number];

/** UI / product vocabulary — maps DB `influencer` → `"creator"`. */
export type SalvyaClientRole = "admin" | "creator" | "customer" | "god";

export type AuthenticatedSalvyaUser = {
  id: string;
  email?: string | null;
  role: SalvyaRole;
};

/** Roles that can use the admin workspace (/admin, /api/admin). */
export const ADMIN_CAPABLE_ROLES = ["admin", "god_admin"] as const satisfies readonly SalvyaRole[];

/** God Admin — sees everything, manages roles, full audit. */
export const GOD_ADMIN_ROLE = "god_admin" as const satisfies SalvyaRole;

/** Legacy metadata values mapped to DB roles. */
export function normalizeSalvyaRole(raw: unknown): SalvyaRole | null {
  if (raw === "customer" || raw === "influencer" || raw === "admin" || raw === "god_admin") return raw;
  if (raw === "creator") return "influencer";
  if (raw === "god" || raw === "godadmin" || raw === "god-admin") return "god_admin";
  return null;
}

export function isAdminCapable(role: SalvyaRole): boolean {
  return role === "admin" || role === "god_admin";
}

export function isGodAdmin(role: SalvyaRole): boolean {
  return role === "god_admin";
}

/** Maps authoritative DB role to client-facing union. */
export function salvyaRoleToClient(role: SalvyaRole): SalvyaClientRole {
  if (role === "influencer") return "creator";
  if (role === "god_admin") return "god";
  return role;
}

export function roleLabel(role: SalvyaRole): string {
  switch (role) {
    case "god_admin":
      return "God Admin";
    case "admin":
      return "Admin";
    case "influencer":
      return "Creator";
    default:
      return "Customer";
  }
}

/** Admin may access influencer-scoped routes; God Admin inherits all admin powers. */
export function roleSatisfies(actual: SalvyaRole, allowed: readonly SalvyaRole[]): boolean {
  if (allowed.includes(actual)) return true;
  if (actual === "god_admin") {
    if (
      allowed.includes("admin") ||
      allowed.includes("influencer") ||
      allowed.includes("god_admin") ||
      allowed.includes("customer")
    ) {
      return true;
    }
  }
  if (allowed.includes("influencer") && actual === "admin") return true;
  return false;
}

export function isSalvyaRole(value: unknown): value is SalvyaRole {
  return typeof value === "string" && (SALVYA_ROLES as readonly string[]).includes(value);
}
