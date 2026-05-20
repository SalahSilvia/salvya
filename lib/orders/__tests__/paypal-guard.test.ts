import { describe, expect, it, vi } from "vitest";
import { checkPayPalOrderIdempotency } from "@/lib/orders/paypal-guard";

const ORDER_ROW = {
  id: "ord-1",
  order_number: "SVY-TEST-1",
  placement_key: "pk-abc",
  user_id: null,
  shipping_address_id: null,
  line_item: {
    artistSlug: "test",
    itemSlug: "item",
    productKind: "hoodie" as const,
    displayTitle: "Test",
    priceLabel: "100 DH",
    kindLabel: "Hoodie",
    qty: 1,
    size: "M",
    colorId: "ink",
    colorLabel: "Ink",
    variantId: "00000000-0000-4000-8000-000000000001",
  },
  shipping: {
    buyerName: "Test",
    buyerPhone: "+212600000000",
    buyerEmail: "test@example.com",
    buyerCountry: "MA",
    buyerCity: "Casablanca",
    buyerAddress: "1 Test St",
  },
  payment: { method: "paypal" as const, paypalOrderId: "PP-1", paypalCaptureId: "CAP-1" },
  fulfillment_status: "confirmed",
  payment_status: "paid",
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

function mockService(byPaypal: unknown, byCapture: unknown = null) {
  const maybeSinglePaypal = vi.fn().mockResolvedValue({ data: byPaypal, error: null });
  const maybeSingleCapture = vi.fn().mockResolvedValue({ data: byCapture, error: null });

  const chainPaypal = {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    maybeSingle: maybeSinglePaypal,
  };
  const chainCapture = {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    maybeSingle: maybeSingleCapture,
  };

  let call = 0;
  return {
    from: vi.fn(() => {
      call += 1;
      return call === 1 ? chainPaypal : chainCapture;
    }),
  } as unknown as Parameters<typeof checkPayPalOrderIdempotency>[0];
}

describe("checkPayPalOrderIdempotency", () => {
  it("proceeds when no existing PayPal order", async () => {
    const service = mockService(null);
    const result = await checkPayPalOrderIdempotency(service, "PP-NEW", "pk-new");
    expect(result.action).toBe("proceed");
  });

  it("returns existing order for same placement key", async () => {
    const service = mockService(ORDER_ROW);
    const result = await checkPayPalOrderIdempotency(service, "PP-1", "pk-abc", "CAP-1");
    expect(result.action).toBe("return_existing");
    if (result.action === "return_existing") {
      expect(result.order.orderNumber).toBe("SVY-TEST-1");
    }
  });

  it("rejects duplicate PayPal order for different placement", async () => {
    const service = mockService(ORDER_ROW);
    const result = await checkPayPalOrderIdempotency(service, "PP-1", "pk-other");
    expect(result.action).toBe("reject_duplicate");
  });

  it("rejects empty PayPal order id", async () => {
    const service = mockService(null);
    const result = await checkPayPalOrderIdempotency(service, "  ", "pk-1");
    expect(result.action).toBe("reject_duplicate");
  });
});
