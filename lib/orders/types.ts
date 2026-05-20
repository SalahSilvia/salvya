export type OrderFulfillmentStatus = "confirmed" | "preparing" | "shipped" | "delivered" | "cancelled";

export type OrderPaymentStatus =
  | "pending"
  | "awaiting_payment_verification"
  | "authorized"
  | "paid"
  | "cod_pending"
  | "failed"
  | "refunded"
  | "refund_requested"
  | "refund_approved"
  | "refund_rejected"
  | "payment_abandoned"
  | "payment_failed"
  | "payment_recovered";

export type ProductionStatus = "pending" | "queued" | "in_production" | "shipped";

export type OrderLineItem = {
  artistSlug: string;
  itemSlug: string;
  productKind: "hoodie" | "tshirt";
  /** Authoritative inventory row — required for checkout. */
  variantId: string;
  displayTitle: string;
  priceLabel: string;
  kindLabel: string;
  qty: number;
  size: string;
  colorId: string;
  colorLabel: string;
  productImageSrc?: string;
  /** Multi-variant bag checkout — each line is quoted and fulfilled separately under one payment. */
  bagLines?: OrderLineItem[];
};

export type OrderShipping = {
  buyerName: string;
  buyerPhone: string;
  buyerEmail: string;
  buyerCountry: string;
  buyerCity: string;
  buyerAddress: string;
  /** Set from admin when order is shipped */
  trackingNumber?: string;
  /** Carrier slug (see shipping-carriers) */
  carrier?: string;
  /** Public tracking page — auto-built or pasted by admin */
  trackingUrl?: string;
  /** ISO timestamp when marked shipped */
  shippedAt?: string;
};

export type OrderPayment = {
  method: "cod" | "paypal";
  instrument?: "paypal_wallet" | "paypal_card";
  paypalOrderId?: string;
  paypalCaptureId?: string;
  paypalVerifiedAt?: string;
};

export type OrderRefundStatus = "requested" | "approved" | "rejected" | "refunded" | "failed" | "processed";

export type CustomerOrder = {
  id: string;
  orderNumber: string;
  placementKey: string;
  userId: string | null;
  /** Saved address row used at checkout (signed-in customers only). */
  shippingAddressId: string | null;
  lineItem: OrderLineItem;
  shipping: OrderShipping;
  payment: OrderPayment;
  fulfillmentStatus: OrderFulfillmentStatus;
  paymentStatus: OrderPaymentStatus;
  productionStatus: ProductionStatus;
  productionStartsAt?: string | null;
  refundStatus?: OrderRefundStatus | null;
  refundAmount?: number | null;
  refundReason?: string | null;
  refundRequestedAt?: string | null;
  refundProcessedAt?: string | null;
  refundedAt?: string | null;
  refundReferenceId?: string | null;
  refundPolicyCode?: string | null;
  refundEligibilityCheckedAt?: string | null;
  orderLocked?: boolean;
  fraudScore?: number;
  paymentAbandonedAt?: string | null;
  paymentFailedAt?: string | null;
  /** Immutable display currency at purchase (MAD / USD / EUR). */
  orderCurrency?: string | null;
  finalPrice?: number | null;
  marketCode?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type PlaceOrderInput = {
  placementKey: string;
  checkoutPath: string;
  lineItem: OrderLineItem;
  shipping: OrderShipping;
  payment: OrderPayment;
  /** Promo discount applied on payment step (cents). Server recomputes PayPal total. */
  discountCents?: number;
  /** Promo code — validated server-side against discountCents. */
  couponCode?: string;
  /** Checkout sessionStorage `savedAt` — rejects stale replays. */
  checkoutSavedAt?: number;
  /** When set, must belong to the authenticated user; persisted on the order row. */
  shippingAddressId?: string;
  /** Creator promo tracking code (from /p/ link or salvya_creator_ref cookie). */
  creatorTrackingCode?: string;
};
