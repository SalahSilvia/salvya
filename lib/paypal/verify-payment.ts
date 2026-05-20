import { paypalAmountsMatch, normalizePayPalCurrency } from "@/lib/paypal/amount-match";
import type { PayPalCheckoutAmount } from "@/lib/paypal/checkout-amount";
import { capturePayPalOrder, getPayPalOrder } from "@/lib/paypal/server";
import type { PayPalCapture, PayPalOrder } from "@/lib/paypal/types";

export type VerifyPayPalPaymentInput = {
  paypalOrderId: string;
  paypalCaptureId?: string;
  expected: PayPalCheckoutAmount;
};

export type VerifyPayPalPaymentSuccess = {
  ok: true;
  paypalOrderId: string;
  paypalCaptureId: string;
  verifiedAt: string;
};

export type VerifyPayPalPaymentFailure = {
  ok: false;
  code:
    | "missing_order_id"
    | "paypal_api_error"
    | "not_completed"
    | "amount_mismatch"
    | "currency_mismatch"
    | "missing_capture"
    | "capture_mismatch";
  message: string;
  httpStatus: number;
};

export type VerifyPayPalPaymentResult = VerifyPayPalPaymentSuccess | VerifyPayPalPaymentFailure;

function firstCapture(order: PayPalOrder): PayPalCapture | null {
  const unit = order.purchase_units?.[0];
  const captures = unit?.payments?.captures;
  if (!captures?.length) return null;
  return captures.find((c) => c.status === "COMPLETED") ?? captures[0] ?? null;
}

function unitAmount(order: PayPalOrder): { currency_code: string; value: string } | null {
  const amount = order.purchase_units?.[0]?.amount;
  if (!amount?.currency_code || !amount.value) return null;
  return amount;
}

function validateCompletedOrder(
  order: PayPalOrder,
  expected: PayPalCheckoutAmount,
  paypalCaptureId?: string,
): VerifyPayPalPaymentResult {
  if (order.status !== "COMPLETED") {
    return {
      ok: false,
      code: "not_completed",
      message: "PayPal payment is not completed. Try again or use another method.",
      httpStatus: 402,
    };
  }

  const unit = unitAmount(order);
  if (!unit) {
    return {
      ok: false,
      code: "not_completed",
      message: "PayPal order is missing amount details.",
      httpStatus: 402,
    };
  }

  const expectedCur = normalizePayPalCurrency(expected.currency_code);
  const actualCur = normalizePayPalCurrency(unit.currency_code);
  if (expectedCur !== actualCur) {
    return {
      ok: false,
      code: "currency_mismatch",
      message: "Payment currency does not match your order.",
      httpStatus: 402,
    };
  }

  if (!paypalAmountsMatch(expected.value, unit.value)) {
    return {
      ok: false,
      code: "amount_mismatch",
      message: "Payment amount does not match your order total.",
      httpStatus: 402,
    };
  }

  const capture = firstCapture(order);
  if (!capture?.id) {
    return {
      ok: false,
      code: "missing_capture",
      message: "PayPal capture was not found on this order.",
      httpStatus: 402,
    };
  }

  if (capture.status !== "COMPLETED") {
    return {
      ok: false,
      code: "not_completed",
      message: "PayPal capture is not completed.",
      httpStatus: 402,
    };
  }

  if (paypalCaptureId?.trim() && paypalCaptureId.trim() !== capture.id) {
    return {
      ok: false,
      code: "capture_mismatch",
      message: "PayPal capture id does not match the verified payment.",
      httpStatus: 402,
    };
  }

  if (capture.amount?.currency_code && capture.amount.value) {
    const capCur = normalizePayPalCurrency(capture.amount.currency_code);
    if (capCur !== expectedCur || !paypalAmountsMatch(expected.value, capture.amount.value)) {
      return {
        ok: false,
        code: "amount_mismatch",
        message: "Captured amount does not match your order total.",
        httpStatus: 402,
      };
    }
  }

  return {
    ok: true,
    paypalOrderId: order.id,
    paypalCaptureId: capture.id,
    verifiedAt: new Date().toISOString(),
  };
}

/**
 * Verify a PayPal checkout order with PayPal's API (source of truth).
 * If the buyer approved but capture only happened client-side, we accept COMPLETED orders.
 * If still APPROVED, we attempt a server-side capture once.
 */
export async function verifyPayPalPayment(input: VerifyPayPalPaymentInput): Promise<VerifyPayPalPaymentResult> {
  const paypalOrderId = input.paypalOrderId.trim();
  if (!paypalOrderId) {
    return {
      ok: false,
      code: "missing_order_id",
      message: "PayPal order id is required.",
      httpStatus: 400,
    };
  }

  const lookup = await getPayPalOrder(paypalOrderId);
  if (!lookup.ok) {
    console.warn("[paypal] order lookup failed", { paypalOrderId, status: lookup.status, message: lookup.message });
    return {
      ok: false,
      code: "paypal_api_error",
      message: "Could not verify PayPal payment. Try again in a moment.",
      httpStatus: lookup.status >= 500 ? 503 : 402,
    };
  }

  let order = lookup.order;

  if (order.status === "APPROVED") {
    const captured = await capturePayPalOrder(paypalOrderId);
    if (!captured.ok) {
      console.warn("[paypal] server capture failed", { paypalOrderId, message: captured.message });
      return {
        ok: false,
        code: "paypal_api_error",
        message: "PayPal payment could not be captured. Try again.",
        httpStatus: captured.status >= 500 ? 503 : 402,
      };
    }
    order = captured.order;
  }

  if (order.status === "VOIDED" || order.status === "CANCELLED") {
    return {
      ok: false,
      code: "not_completed",
      message: "This PayPal payment was cancelled.",
      httpStatus: 402,
    };
  }

  return validateCompletedOrder(order, input.expected, input.paypalCaptureId);
}
