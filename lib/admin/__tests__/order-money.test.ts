import { describe, expect, it } from "vitest";
import {
  adminOrderTotalCents,
  formatAdminOrderTotal,
  formatOrderTotalPaid,
  orderTotalMinor,
} from "@/lib/admin/order-money";
import type { CustomerOrder } from "@/lib/orders/types";

const baseLineItem = {
  artistSlug: "artist",
  itemSlug: "tee",
  displayTitle: "Tee",
  priceLabel: "175 DH · Oversized",
  qty: 1,
  variantId: "v1",
  productKind: "tshirt",
  kindLabel: "Oversized",
  colorId: "black",
  colorLabel: "Black",
} as CustomerOrder["lineItem"];

describe("order-money", () => {
  it("uses stored final_price and order_currency instead of mislabeling as EUR", () => {
    const order = {
      lineItem: baseLineItem,
      finalPrice: 175,
      orderCurrency: "MAD",
    } as Pick<CustomerOrder, "lineItem" | "finalPrice" | "orderCurrency">;

    expect(orderTotalMinor(order).currency).toBe("MAD");
    expect(orderTotalMinor(order).amountCents).toBe(17500);
    expect(formatOrderTotalPaid(order)).toMatch(/175/);
    expect(formatOrderTotalPaid(order)).not.toMatch(/€\s*175/);
    expect(adminOrderTotalCents(order)).toBeLessThan(17500);
    expect(formatAdminOrderTotal(order)).toMatch(/€/);
  });
});
