/** Structured server-side payment logs (no secrets, no full PII). */
export function logPaymentEvent(
  event: string,
  meta: Record<string, string | number | boolean | null | undefined>,
): void {
  console.warn(`[payments] ${event}`, meta);
}
