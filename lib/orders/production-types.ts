export type ProductionStatus = "pending" | "queued" | "in_production" | "shipped";

export const PRODUCTION_STATUSES: ProductionStatus[] = [
  "pending",
  "queued",
  "in_production",
  "shipped",
];

export type RefundLifecycleStatus =
  | "requested"
  | "approved"
  | "rejected"
  | "refunded"
  | "failed"
  | "processed"
  | null;

export type ExtendedPaymentStatus =
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

export type SalvyaNotificationEvent =
  | "refund_requested"
  | "refund_approved"
  | "refund_rejected"
  | "refund_completed"
  | "refund_processed"
  | "payment_failed"
  | "payment_abandoned";

export type PaymentAuditEventType =
  | SalvyaNotificationEvent
  | "paypal_capture_success"
  | "paypal_capture_failed"
  | "paypal_refund_success"
  | "paypal_refund_failed"
  | "production_status_change"
  | "admin_refund_override";

/** Default hours from order creation until production starts (if not set). */
export const DEFAULT_PRODUCTION_LEAD_HOURS = 48;

/** @deprecated Use ORDER_CANCELLATION_REFUND_HOURS — refunds use order-age window, not pre-production offset. */
export const REFUND_WINDOW_HOURS_BEFORE_PRODUCTION = 24;

/** Hours after order placement when cancellation/refund may still be requested. */
export const ORDER_CANCELLATION_REFUND_HOURS = 24;
