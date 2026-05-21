import type { SupabaseClient } from "@supabase/supabase-js";
import { buildAuthCallbackUrl } from "@/lib/auth/auth-callback-url";
import { formatSupabaseAuthError } from "@/lib/supabase/auth-errors";

export type GoogleSignInResult =
  | { ok: true }
  | { ok: false; message: string };

/**
 * Starts Google OAuth (PKCE). Session is completed on `/auth/callback`.
 * Guest bag/likes merge via existing `onAuthStateChange` in sync providers.
 */
export async function signInWithGoogle(
  supabase: SupabaseClient,
  options?: { next?: string | null },
): Promise<GoogleSignInResult> {
  const redirectTo = buildAuthCallbackUrl(options?.next ?? null);
  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo,
      queryParams: {
        access_type: "offline",
        prompt: "consent",
      },
    },
  });

  if (error) {
    return { ok: false, message: formatSupabaseAuthError(error.message) };
  }
  return { ok: true };
}
