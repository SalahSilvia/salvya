import { buildAuthCallbackUrl } from "@/lib/auth/auth-callback-url";

/**
 * Supabase `resetPasswordForEmail` `redirectTo` — must be listed in Supabase Dashboard → Authentication → URL configuration.
 */
export function buildPasswordRecoveryRedirectTo(): string {
  return buildAuthCallbackUrl("/update-password");
}
