/** Checkout sessionStorage payload expires after this (prevents stale payment retries). */
export const CHECKOUT_SESSION_MAX_AGE_MS = 48 * 60 * 60 * 1000;

export function isCheckoutSessionExpired(savedAt: number | undefined): boolean {
  if (!savedAt || !Number.isFinite(savedAt)) return true;
  return Date.now() - savedAt > CHECKOUT_SESSION_MAX_AGE_MS;
}

export function checkoutSessionExpiryMessage(): string {
  return "Your checkout session expired. Please start again from the product page.";
}
