/** Shown on the shop after sign-up / sign-in when we want a soft "confirm your email" reminder. */
export const SALVYA_POST_AUTH_NOTICE_KEY = "salvya-post-auth-notice-v1";

export type PostAuthNotice = { v: 1; kind: "confirm_email" };

export function setConfirmEmailNotice(): void {
  if (typeof window === "undefined") return;
  try {
    const payload: PostAuthNotice = { v: 1, kind: "confirm_email" };
    sessionStorage.setItem(SALVYA_POST_AUTH_NOTICE_KEY, JSON.stringify(payload));
  } catch {
    /* quota / private mode */
  }
}

export function clearPostAuthNotice(): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(SALVYA_POST_AUTH_NOTICE_KEY);
  } catch {
    /* */
  }
}

export function readPostAuthNotice(): PostAuthNotice | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(SALVYA_POST_AUTH_NOTICE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as unknown;
    if (
      parsed &&
      typeof parsed === "object" &&
      (parsed as PostAuthNotice).v === 1 &&
      (parsed as PostAuthNotice).kind === "confirm_email"
    ) {
      return parsed as PostAuthNotice;
    }
  } catch {
    /* */
  }
  return null;
}

/** After sign-up when email confirmation is required, pre-fill the login email field. */
export const SALVYA_LOGIN_PREFILL_EMAIL_KEY = "salvya-login-prefill-email";

export function stashLoginPrefillEmail(email: string): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(SALVYA_LOGIN_PREFILL_EMAIL_KEY, email);
  } catch {
    /* */
  }
}

/** Marks that the user should see the friendly post-register message on /login (survives Strict Mode remounts). */
export const SALVYA_AFTER_SIGNUP_HINT_KEY = "salvya-after-signup-hint-v1";

export function setAfterSignupLoginHint(): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(SALVYA_AFTER_SIGNUP_HINT_KEY, "1");
  } catch {
    /* */
  }
}

export function hasAfterSignupLoginHint(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return sessionStorage.getItem(SALVYA_AFTER_SIGNUP_HINT_KEY) === "1";
  } catch {
    return false;
  }
}

export function clearAfterSignupLoginHint(): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(SALVYA_AFTER_SIGNUP_HINT_KEY);
  } catch {
    /* */
  }
}
