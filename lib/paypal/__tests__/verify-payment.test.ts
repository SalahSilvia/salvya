import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { PayPalOrder } from "@/lib/paypal/types";
import { verifyPayPalPayment } from "@/lib/paypal/verify-payment";

const getPayPalOrder = vi.fn();
const capturePayPalOrder = vi.fn();

vi.mock("@/lib/paypal/server", () => ({
  getPayPalOrder: (...args: unknown[]) => getPayPalOrder(...args),
  capturePayPalOrder: (...args: unknown[]) => capturePayPalOrder(...args),
}));

function completedOrder(overrides: Partial<PayPalOrder> = {}): PayPalOrder {
  return {
    id: "ORDER-1",
    status: "COMPLETED",
    purchase_units: [
      {
        amount: { currency_code: "USD", value: "25.00" },
        payments: {
          captures: [{ id: "CAP-1", status: "COMPLETED", amount: { currency_code: "USD", value: "25.00" } }],
        },
      },
    ],
    ...overrides,
  };
}

describe("verifyPayPalPayment", () => {
  beforeEach(() => {
    getPayPalOrder.mockReset();
    capturePayPalOrder.mockReset();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("accepts a completed order with matching amount", async () => {
    getPayPalOrder.mockResolvedValue({ ok: true, order: completedOrder() });

    const result = await verifyPayPalPayment({
      paypalOrderId: "ORDER-1",
      paypalCaptureId: "CAP-1",
      expected: { currency_code: "USD", value: "25.00" },
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.paypalCaptureId).toBe("CAP-1");
      expect(result.paypalOrderId).toBe("ORDER-1");
    }
  });

  it("rejects amount mismatch", async () => {
    getPayPalOrder.mockResolvedValue({ ok: true, order: completedOrder() });

    const result = await verifyPayPalPayment({
      paypalOrderId: "ORDER-1",
      expected: { currency_code: "USD", value: "99.00" },
    });

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe("amount_mismatch");
  });

  it("server-captures approved orders", async () => {
    getPayPalOrder.mockResolvedValue({
      ok: true,
      order: { ...completedOrder(), status: "APPROVED" },
    });
    capturePayPalOrder.mockResolvedValue({ ok: true, order: completedOrder() });

    const result = await verifyPayPalPayment({
      paypalOrderId: "ORDER-1",
      expected: { currency_code: "USD", value: "25.00" },
    });

    expect(capturePayPalOrder).toHaveBeenCalledWith("ORDER-1");
    expect(result.ok).toBe(true);
  });

  it("rejects duplicate capture id mismatch", async () => {
    getPayPalOrder.mockResolvedValue({ ok: true, order: completedOrder() });

    const result = await verifyPayPalPayment({
      paypalOrderId: "ORDER-1",
      paypalCaptureId: "OTHER-CAP",
      expected: { currency_code: "USD", value: "25.00" },
    });

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe("capture_mismatch");
  });

  it("rejects cancelled payments", async () => {
    getPayPalOrder.mockResolvedValue({
      ok: true,
      order: { ...completedOrder(), status: "VOIDED" },
    });

    const result = await verifyPayPalPayment({
      paypalOrderId: "ORDER-1",
      expected: { currency_code: "USD", value: "25.00" },
    });

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe("not_completed");
  });

  it("surfaces PayPal API errors", async () => {
    getPayPalOrder.mockResolvedValue({ ok: false, status: 503, message: "upstream" });

    const result = await verifyPayPalPayment({
      paypalOrderId: "ORDER-1",
      expected: { currency_code: "USD", value: "25.00" },
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.code).toBe("paypal_api_error");
      expect(result.httpStatus).toBe(503);
    }
  });
});
