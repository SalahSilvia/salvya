import { describe, expect, it } from "vitest";
import {
  assessRefundEligibility,
  assertRefundAllowed,
  cancellationRefundDeadline,
} from "@/lib/orders/refund-policy";
import type { RefundPolicyOrder } from "@/lib/orders/refund-policy";
import { ORDER_CANCELLATION_REFUND_HOURS } from "@/lib/orders/production-types";

function baseOrder(overrides: Partial<RefundPolicyOrder> = {}): RefundPolicyOrder {
  const createdAt = new Date("2026-05-18T10:00:00.000Z").toISOString();
  return {
    id: "o1",
    createdAt,
    paymentStatus: "paid",
    paymentMethod: "paypal",
    productionStatus: "pending",
    productionStartsAt: null,
    refundStatus: null,
    fulfillmentStatus: "confirmed",
    ...overrides,
  };
}

describe("refund-policy", () => {
  it("allows refund within 24h while production pending", () => {
    const order = baseOrder();
    const now = new Date(new Date(order.createdAt).getTime() + 60 * 60 * 1000);
    const result = assessRefundEligibility(order, now);
    expect(result.eligible).toBe(true);
    expect(result.code).toBe("eligible");
    expect(result.policyReason).toBe("24h cancellation rule");
  });

  it("blocks refund after 24h from order", () => {
    const order = baseOrder();
    const deadline = cancellationRefundDeadline(order.createdAt);
    const now = new Date(deadline.getTime() + 60_000);
    const result = assessRefundEligibility(order, now);
    expect(result.eligible).toBe(false);
    expect(result.code).toBe("window_closed");
    expect(result.policyReason).toBe("24h cancellation rule");
  });

  it("blocks refund when production started", () => {
    const order = baseOrder({ productionStatus: "in_production" });
    const result = assessRefundEligibility(order);
    expect(result.eligible).toBe(false);
    expect(result.code).toBe("production_started");
    expect(result.policyReason).toBe("Production started");
  });

  it("blocks refund when production queued", () => {
    const order = baseOrder({ productionStatus: "queued" });
    const result = assessRefundEligibility(order);
    expect(result.eligible).toBe(false);
    expect(result.code).toBe("production_started");
  });

  it("assertRefundAllowed throws when blocked", () => {
    const order = baseOrder({ productionStatus: "shipped" });
    expect(() => assertRefundAllowed(order)).toThrow(/production/i);
  });

  it("god override does not throw when blocked", () => {
    const order = baseOrder({ productionStatus: "shipped" });
    expect(() => assertRefundAllowed(order, { godOverride: true })).not.toThrow();
  });

  it("deadline is 24h after creation", () => {
    const order = baseOrder();
    const deadline = cancellationRefundDeadline(order.createdAt);
    const hours = (deadline.getTime() - new Date(order.createdAt).getTime()) / (60 * 60 * 1000);
    expect(hours).toBe(ORDER_CANCELLATION_REFUND_HOURS);
  });

  it("allows Morocco COD cancel after 24h while not delivered", () => {
    const order = baseOrder({
      paymentMethod: "cod",
      marketCode: "MA",
      buyerCountry: "Morocco",
    });
    const now = new Date(new Date(order.createdAt).getTime() + 48 * 60 * 60 * 1000);
    const result = assessRefundEligibility(order, now);
    expect(result.eligible).toBe(true);
    expect(result.policyReason).toBe("Morocco COD cancellation");
  });

  it("blocks Morocco COD after delivery", () => {
    const order = baseOrder({
      paymentMethod: "cod",
      marketCode: "MA",
      fulfillmentStatus: "delivered",
    });
    const result = assessRefundEligibility(order);
    expect(result.eligible).toBe(false);
    expect(result.code).toBe("delivered_no_refund");
  });
});
