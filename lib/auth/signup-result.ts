import type { AuthError, User } from "@supabase/supabase-js";
import { formatSupabaseAuthError } from "@/lib/supabase/auth-errors";

export type SignUpOutcome =
  | { kind: "created"; needsEmailConfirmation: boolean }
  | { kind: "existing_email"; message: string }
  | { kind: "error"; message: string };

/** Supabase returns a user with no identities when the email is already registered (email confirmation on). */
export function isExistingEmailSignUpUser(user: User | null | undefined): boolean {
  if (!user) return false;
  const identities = user.identities;
  return Array.isArray(identities) && identities.length === 0;
}

function isDuplicateEmailError(message: string): boolean {
  const m = message.toLowerCase();
  return (
    m.includes("user already registered") ||
    m.includes("already been registered") ||
    m.includes("already registered") ||
    m.includes("email address is already") ||
    m.includes("user with this email")
  );
}

export function interpretSignUpResponse(input: {
  user: User | null;
  session: { access_token: string } | null;
  error: AuthError | null;
}): SignUpOutcome {
  if (input.error) {
    const msg = formatSupabaseAuthError(input.error.message);
    if (isDuplicateEmailError(input.error.message)) {
      return {
        kind: "existing_email",
        message: "An account with this email already exists. Sign in with that email instead of creating a new account.",
      };
    }
    return { kind: "error", message: msg };
  }

  if (isExistingEmailSignUpUser(input.user)) {
    return {
      kind: "existing_email",
      message: "An account with this email already exists. Sign in with that email instead of creating a new account.",
    };
  }

  if (input.session) {
    return { kind: "created", needsEmailConfirmation: false };
  }

  if (input.user) {
    return { kind: "created", needsEmailConfirmation: true };
  }

  return {
    kind: "error",
    message: "We could not create your account. Check your details and try again.",
  };
}
