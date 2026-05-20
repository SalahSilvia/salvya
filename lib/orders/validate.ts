import type {
  CustomerOrder,
  OrderFulfillmentStatus,
  OrderLineItem,
  OrderPayment,
  OrderPaymentStatus,
  OrderRefundStatus,
  OrderShipping,
  PlaceOrderInput,
  ProductionStatus,
} from "@/lib/orders/types";

function isRecord(x: unknown): x is Record<string, unknown> {
  return typeof x === "object" && x !== null;
}

function isOrderLineItemCore(x: unknown, allowBagLines: boolean): x is OrderLineItem {
  if (!isRecord(x)) return false;
  const bagLines = x.bagLines;
  if (bagLines !== undefined) {
    if (!allowBagLines || !Array.isArray(bagLines) || bagLines.length < 1) return false;
    if (!bagLines.every((line) => isOrderLineItemCore(line, false))) return false;
  }
  return (
    typeof x.artistSlug === "string" &&
    typeof x.itemSlug === "string" &&
    (x.productKind === "hoodie" || x.productKind === "tshirt") &&
    typeof x.displayTitle === "string" &&
    typeof x.priceLabel === "string" &&
    typeof x.kindLabel === "string" &&
    typeof x.qty === "number" &&
    x.qty >= 1 &&
    x.qty <= 5 &&
    typeof x.size === "string" &&
    typeof x.colorId === "string" &&
    typeof x.colorLabel === "string" &&
    typeof x.variantId === "string" &&
    x.variantId.trim().length > 0
  );
}

export function isOrderLineItem(x: unknown): x is OrderLineItem {
  return isOrderLineItemCore(x, true);
}

export function isOrderShipping(x: unknown): x is OrderShipping {
  if (!isRecord(x)) return false;
  return (
    typeof x.buyerName === "string" &&
    typeof x.buyerPhone === "string" &&
    typeof x.buyerEmail === "string" &&
    typeof x.buyerCountry === "string" &&
    typeof x.buyerCity === "string" &&
    typeof x.buyerAddress === "string"
  );
}

export function isOrderPayment(x: unknown): x is OrderPayment {
  if (!isRecord(x)) return false;
  if (x.method !== "cod" && x.method !== "paypal") return false;
  if (x.instrument !== undefined && x.instrument !== "paypal_wallet" && x.instrument !== "paypal_card") {
    return false;
  }
  if (x.paypalOrderId !== undefined && typeof x.paypalOrderId !== "string") return false;
  if (x.paypalCaptureId !== undefined && typeof x.paypalCaptureId !== "string") return false;
  if (x.paypalVerifiedAt !== undefined && typeof x.paypalVerifiedAt !== "string") return false;
  return true;
}

const FULFILLMENT: OrderFulfillmentStatus[] = ["confirmed", "preparing", "shipped", "delivered", "cancelled"];
const PAYMENT: OrderPaymentStatus[] = [
  "pending",
  "awaiting_payment_verification",
  "authorized",
  "paid",
  "cod_pending",
  "failed",
  "refunded",
  "refund_requested",
  "refund_approved",
  "refund_rejected",
  "payment_abandoned",
  "payment_failed",
  "payment_recovered",
];

const PRODUCTION: ProductionStatus[] = ["pending", "queued", "in_production", "shipped"];

const REFUND: OrderRefundStatus[] = ["requested", "approved", "rejected", "refunded", "failed", "processed"];

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function optionalUuid(x: unknown): string | null {
  if (x === null || x === undefined) return null;
  if (typeof x !== "string") return null;
  const s = x.trim();
  if (!s) return null;
  return UUID_RE.test(s) ? s : null;
}

export function rowToCustomerOrder(row: {
  id: string;
  order_number: string;
  placement_key: string;
  user_id: string | null;
  shipping_address_id?: string | null;
  line_item: unknown;
  shipping: unknown;
  payment: unknown;
  fulfillment_status: string;
  payment_status: string;
  production_status?: string | null;
  production_starts_at?: string | null;
  refund_status?: string | null;
  refund_amount?: number | null;
  refund_reason?: string | null;
  refund_requested_at?: string | null;
  refund_processed_at?: string | null;
  refund_eligibility_checked_at?: string | null;
  refund_policy_code?: string | null;
  refunded_at?: string | null;
  refund_reference_id?: string | null;
  order_locked?: boolean | null;
  fraud_score?: number | null;
  payment_abandoned_at?: string | null;
  payment_failed_at?: string | null;
  order_currency?: string | null;
  final_price?: number | null;
  market_code?: string | null;
  created_at: string;
  updated_at: string;
}): CustomerOrder | null {
  if (!isOrderLineItem(row.line_item) || !isOrderShipping(row.shipping) || !isOrderPayment(row.payment)) {
    return null;
  }
  if (!FULFILLMENT.includes(row.fulfillment_status as OrderFulfillmentStatus)) return null;
  if (!PAYMENT.includes(row.payment_status as OrderPaymentStatus)) return null;
  const productionRaw = row.production_status ?? "pending";
  if (!PRODUCTION.includes(productionRaw as ProductionStatus)) return null;
  return {
    id: row.id,
    orderNumber: row.order_number,
    placementKey: row.placement_key,
    userId: row.user_id,
    shippingAddressId: optionalUuid(row.shipping_address_id),
    lineItem: row.line_item,
    shipping: row.shipping,
    payment: row.payment,
    fulfillmentStatus: row.fulfillment_status as OrderFulfillmentStatus,
    paymentStatus: row.payment_status as OrderPaymentStatus,
    productionStatus: productionRaw as ProductionStatus,
    ...(typeof row.production_starts_at === "string" ? { productionStartsAt: row.production_starts_at } : {}),
    ...(row.refund_status && REFUND.includes(row.refund_status as OrderRefundStatus)
      ? { refundStatus: row.refund_status as OrderRefundStatus }
      : {}),
    ...(typeof row.refund_amount === "number" ? { refundAmount: row.refund_amount } : {}),
    ...(typeof row.refund_reason === "string" ? { refundReason: row.refund_reason } : {}),
    ...(typeof row.refund_requested_at === "string" ? { refundRequestedAt: row.refund_requested_at } : {}),
    ...(typeof row.refund_processed_at === "string" ? { refundProcessedAt: row.refund_processed_at } : {}),
    ...(typeof row.refunded_at === "string" ? { refundedAt: row.refunded_at } : {}),
    ...(typeof row.refund_reference_id === "string" ? { refundReferenceId: row.refund_reference_id } : {}),
    ...(typeof row.refund_policy_code === "string" ? { refundPolicyCode: row.refund_policy_code } : {}),
    ...(typeof row.refund_eligibility_checked_at === "string"
      ? { refundEligibilityCheckedAt: row.refund_eligibility_checked_at }
      : {}),
    ...(row.order_locked === true ? { orderLocked: true } : {}),
    ...(typeof row.fraud_score === "number" ? { fraudScore: row.fraud_score } : {}),
    ...(typeof row.payment_abandoned_at === "string" ? { paymentAbandonedAt: row.payment_abandoned_at } : {}),
    ...(typeof row.payment_failed_at === "string" ? { paymentFailedAt: row.payment_failed_at } : {}),
    ...(typeof row.order_currency === "string" ? { orderCurrency: row.order_currency } : {}),
    ...(typeof row.final_price === "number" ? { finalPrice: row.final_price } : {}),
    ...(typeof row.market_code === "string" ? { marketCode: row.market_code } : {}),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function sanitizePlaceOrderInput(body: unknown): PlaceOrderInput | null {
  if (!isRecord(body)) return null;
  if (typeof body.placementKey !== "string" || !body.placementKey.trim()) return null;
  if (typeof body.checkoutPath !== "string" || !body.checkoutPath.trim()) return null;
  if (!isOrderLineItem(body.lineItem)) return null;
  if (!isOrderShipping(body.shipping)) return null;
  if (!isOrderPayment(body.payment)) return null;

  const email = body.shipping.buyerEmail.trim().toLowerCase();
  if (!email.includes("@")) return null;

  let shippingAddressId: string | undefined;
  if (body.shippingAddressId !== undefined) {
    if (typeof body.shippingAddressId !== "string") return null;
    const id = body.shippingAddressId.trim();
    if (!UUID_RE.test(id)) return null;
    shippingAddressId = id;
  }

  let discountCents: number | undefined;
  if (body.discountCents !== undefined) {
    if (typeof body.discountCents !== "number" || !Number.isFinite(body.discountCents)) return null;
    const dc = Math.floor(body.discountCents);
    if (dc < 0 || dc > 10_000_000) return null;
    discountCents = dc;
  }

  let couponCode: string | undefined;
  if (body.couponCode !== undefined) {
    if (typeof body.couponCode !== "string") return null;
    const c = body.couponCode.trim();
    if (c.length > 64) return null;
    couponCode = c || undefined;
  }

  let checkoutSavedAt: number | undefined;
  if (body.checkoutSavedAt !== undefined) {
    if (typeof body.checkoutSavedAt !== "number" || !Number.isFinite(body.checkoutSavedAt)) return null;
    checkoutSavedAt = body.checkoutSavedAt;
  }

  let creatorTrackingCode: string | undefined;
  if (body.creatorTrackingCode !== undefined) {
    if (typeof body.creatorTrackingCode !== "string") return null;
    const code = body.creatorTrackingCode.trim().toUpperCase();
    if (code.length < 4 || code.length > 64) return null;
    creatorTrackingCode = code;
  }

  const payment: OrderPayment =
    body.payment.method === "cod"
      ? { method: "cod" }
      : {
          method: "paypal",
          ...(body.payment.instrument ? { instrument: body.payment.instrument } : {}),
          ...(body.payment.paypalOrderId?.trim()
            ? { paypalOrderId: body.payment.paypalOrderId.trim() }
            : {}),
          ...(body.payment.paypalCaptureId?.trim()
            ? { paypalCaptureId: body.payment.paypalCaptureId.trim() }
            : {}),
        };

  return {
    placementKey: body.placementKey.trim(),
    checkoutPath: body.checkoutPath.trim(),
    lineItem: body.lineItem,
    shipping: {
      ...body.shipping,
      buyerEmail: email,
      buyerName: body.shipping.buyerName.trim(),
      buyerPhone: body.shipping.buyerPhone.trim(),
      buyerCity: body.shipping.buyerCity.trim(),
      buyerAddress: body.shipping.buyerAddress.trim(),
      buyerCountry: body.shipping.buyerCountry.trim().toUpperCase(),
    },
    payment,
    ...(discountCents !== undefined ? { discountCents } : {}),
    ...(couponCode ? { couponCode } : {}),
    ...(checkoutSavedAt !== undefined ? { checkoutSavedAt } : {}),
    ...(shippingAddressId ? { shippingAddressId } : {}),
    ...(creatorTrackingCode ? { creatorTrackingCode } : {}),
  };
}
