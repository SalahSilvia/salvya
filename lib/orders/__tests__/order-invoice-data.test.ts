import { describe, expect, it } from "vitest";
import { buildOrderInvoiceDocument } from "@/lib/orders/order-invoice-data";
import type { CustomerOrder } from "@/lib/orders/types";

const baseOrder: CustomerOrder = {
  id: "00000000-0000-4000-8000-000000000099",
  orderNumber: "SV-TEST-001",
  placementKey: "pk",
  userId: "u1",
  shippingAddressId: null,
  lineItem: {
    artistSlug: "elgrandetoto",
    itemSlug: "night-run",
    productKind: "hoodie",
    variantId: "00000000-0000-4000-8000-000000000001",
    displayTitle: "Night Run Hoodie",
    priceLabel: "175 MAD",
    kindLabel: "Hoodie",
    qty: 1,
    size: "M",
    colorId: "black",
    colorLabel: "Black",
  },
  shipping: {
    buyerName: "Test Buyer",
    buyerPhone: "+212600000000",
    buyerEmail: "buyer@example.com",
    buyerCountry: "MA",
    buyerCity: "Casablanca",
    buyerAddress: "123 Test St",
  },
  payment: { method: "cod" },
  fulfillmentStatus: "confirmed",
  paymentStatus: "cod_pending",
  productionStatus: "pending",
  orderCurrency: "MAD",
  finalPrice: 175,
  createdAt: "2026-05-18T12:00:00.000Z",
  updatedAt: "2026-05-18T12:00:00.000Z",
};

describe("buildOrderInvoiceDocument", () => {
  it("includes SKU display and proof note", () => {
    const doc = buildOrderInvoiceDocument(
      baseOrder,
      {
        variantSku: "8437012012345",
        variantId: baseOrder.lineItem.variantId,
      },
      new Map([[baseOrder.lineItem.variantId, "8437012012345"]]),
    );

    expect(doc.orderNumber).toBe("SV-TEST-001");
    expect(doc.lines).toHaveLength(1);
    expect(doc.lines[0]!.skuDisplay).toMatch(/8437/);
    expect(doc.proofNote).toContain("proof of purchase");
  });
});
