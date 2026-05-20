import type { User } from "@supabase/supabase-js";

/**
 * Salvya storefront: “logged in” means a Supabase session exists.
 * RBAC roles (`admin`, `influencer`, …) live in `user_profiles` and are enforced server-side;
 * this helper is for guest vs account-holder UX only.
 */
export function requireAuth(user: User | null | undefined): user is User {
  return Boolean(user?.id);
}

export function isAuthenticatedSession(user: User | null | undefined): boolean {
  return requireAuth(user);
}
