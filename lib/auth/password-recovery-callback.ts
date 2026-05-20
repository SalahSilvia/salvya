/**
 * Supabase `resetPasswordForEmail` `redirectTo` — must be listed in Supabase Dashboard → Authentication → URL configuration
 * (Redirect URLs). Uses PKCE: user lands on `/auth/callback` with `?code=…`, then we send them to `next`.
 */
export function buildPasswordRecoveryRedirectTo(): string {
  if (typeof window === "undefined") return "";
  const origin = window.location.origin;
  const next = "/update-password";
  return `${origin}/auth/callback?next=${encodeURIComponent(next)}`;
}
