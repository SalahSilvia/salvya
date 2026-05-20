/** User-facing copy for common Supabase Auth errors. */
export function formatSupabaseAuthError(message: string): string {
  const m = message.toLowerCase();
  if (m.includes("invalid path") || m.includes("request url")) {
    return "Supabase URL looks wrong. Use only your project root (for example https://YOUR_PROJECT.supabase.co) with no /rest/v1 on the end, then restart the dev server.";
  }
  if (m.includes("invalid login credentials")) {
    return "Wrong email or password.";
  }
  if (m.includes("email not confirmed")) {
    return "Confirm your email first. Check your inbox for a link from Supabase.";
  }
  if (
    m.includes("user already registered") ||
    m.includes("already been registered") ||
    m.includes("already registered") ||
    m.includes("email address is already")
  ) {
    return "An account with this email already exists. Sign in instead of creating a new account.";
  }
  if (m.includes("rate limit") || m.includes("over_email_send_rate_limit") || m.includes("too many requests")) {
    return "Too many emails were sent from this app. Wait a few minutes and try again, or sign in if you already have an account.";
  }
  if (m.includes("password")) {
    return message;
  }
  if (m.includes("network")) {
    return "Network error. Check your connection and try again.";
  }
  return message;
}
