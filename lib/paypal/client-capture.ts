/** Extract capture id from PayPal JS SDK capture() response (browser). */
export function extractPayPalCaptureIdFromClientDetails(details: unknown): string | undefined {
  if (!details || typeof details !== "object") return undefined;
  const d = details as Record<string, unknown>;
  const pu = d.purchase_units;
  if (!Array.isArray(pu) || !pu[0] || typeof pu[0] !== "object") return undefined;
  const payments = (pu[0] as Record<string, unknown>).payments;
  if (!payments || typeof payments !== "object") return undefined;
  const captures = (payments as Record<string, unknown>).captures;
  if (!Array.isArray(captures) || !captures[0] || typeof captures[0] !== "object") return undefined;
  const id = (captures[0] as Record<string, unknown>).id;
  return typeof id === "string" && id.trim() ? id.trim() : undefined;
}
