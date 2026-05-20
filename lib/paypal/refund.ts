import { paypalRequest } from "@/lib/paypal/server";

export type RefundCaptureResult =
  | { ok: true; refundId: string; status: string }
  | { ok: false; status: number; message: string };

type RefundBody = {
  id?: string;
  status?: string;
};

export async function refundPayPalCapture(
  captureId: string,
  opts?: { amount?: { currency_code: string; value: string }; idempotencyKey?: string },
): Promise<RefundCaptureResult> {
  const id = captureId.trim();
  if (!id) return { ok: false, status: 400, message: "Missing capture id" };

  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (opts?.idempotencyKey?.trim()) {
    headers["PayPal-Request-Id"] = opts.idempotencyKey.trim().slice(0, 108);
  }

  const body = opts?.amount
    ? JSON.stringify({ amount: { currency_code: opts.amount.currency_code, value: opts.amount.value } })
    : "{}";

  const res = await paypalRequest(`/v2/payments/captures/${encodeURIComponent(id)}/refund`, {
    method: "POST",
    headers,
    body,
  });

  let parsed: RefundBody = {};
  try {
    parsed = (await res.json()) as RefundBody;
  } catch {
    parsed = {};
  }

  if (!res.ok || !parsed.id) {
    const msg =
      typeof (parsed as { message?: string }).message === "string"
        ? (parsed as { message: string }).message
        : `PayPal refund failed (${res.status})`;
    return { ok: false, status: res.status, message: msg };
  }

  return { ok: true, refundId: parsed.id, status: parsed.status ?? "COMPLETED" };
}
