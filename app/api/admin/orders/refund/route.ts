import type { NextRequest } from "next/server";
import { requireAdminService } from "@/lib/admin/require-admin-service";
import { rbacApiJson } from "@/lib/auth/api-errors";
import { isGodAdmin } from "@/lib/auth/roles";
import { pushOrderNotification } from "@/lib/notifications/push-order-event";
import { CUSTOMER_ORDER_SELECT } from "@/lib/orders/order-db-row";
import {
  dbRowToRefundPolicy,
  generateRefundReferenceId,
} from "@/lib/orders/order-refund-policy";
import { logPaymentAudit } from "@/lib/orders/payment-audit";
import { assertRefundAllowed } from "@/lib/orders/refund-policy";
import { rowToCustomerOrder } from "@/lib/orders/validate";
import { refundPayPalCapture } from "@/lib/paypal/refund";
import { isPayPalServerConfigured } from "@/lib/paypal/config";
import { computePayPalCheckoutTotal } from "@/lib/paypal/checkout-amount";
import { resolveCheckoutDiscount } from "@/lib/orders/resolve-discount";
import { voidCreatorEarningsForOrder } from "@/lib/creator/earnings-service";
import { restoreOrderLineItemStock } from "@/lib/inventory/restore-stock";
import type { OrderLineItem } from "@/lib/orders/types";

function isRecord(x: unknown): x is Record<string, unknown> {
  return typeof x === "object" && x !== null;
}

export async function POST(request: NextRequest) {
  const admin = await requireAdminService(request);
  if (!admin.ok) return admin.response;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return rbacApiJson({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }
  if (!isRecord(body)) return rbacApiJson({ ok: false, error: "Invalid body" }, { status: 400 });

  const orderId = typeof body.orderId === "string" ? body.orderId.trim() : "";
  const reason = typeof body.reason === "string" ? body.reason.trim().slice(0, 2000) : "";
  const actionRaw = typeof body.action === "string" ? body.action.trim() : "execute";
  const action =
    actionRaw === "reject" || actionRaw === "approve" || actionRaw === "process" || actionRaw === "execute"
      ? actionRaw
      : "execute";
  const godOverride = Boolean(body.godOverride) && isGodAdmin(admin.user.role);
  const idempotencyKey =
    typeof body.idempotencyKey === "string" ? body.idempotencyKey.trim().slice(0, 108) : `refund-${orderId}`;

  if (!orderId) return rbacApiJson({ ok: false, error: "Missing orderId" }, { status: 400 });
  if (!reason) return rbacApiJson({ ok: false, error: "Refund reason is required" }, { status: 400 });

  const { data: row, error: loadErr } = await admin.service
    .from("customer_orders")
    .select(CUSTOMER_ORDER_SELECT)
    .eq("id", orderId)
    .maybeSingle();

  if (loadErr) return rbacApiJson({ ok: false, error: loadErr.message }, { status: 500 });
  if (!row) return rbacApiJson({ ok: false, error: "Not found" }, { status: 404 });

  if (row.refund_status === "refunded" || row.refund_status === "processed") {
    const order = rowToCustomerOrder(row);
    return rbacApiJson({ ok: true, order, alreadyRefunded: true });
  }

  const policyOrder = dbRowToRefundPolicy(row);
  if (!policyOrder) return rbacApiJson({ ok: false, error: "Invalid order row" }, { status: 500 });

  if (action === "approve") {
    const now = new Date().toISOString();
    const { data: updated, error: upErr } = await admin.service
      .from("customer_orders")
      .update({
        refund_status: "approved",
        refund_reason: reason,
        refund_processed_at: now,
        payment_status: "refund_approved",
        updated_at: now,
      })
      .eq("id", orderId)
      .select(CUSTOMER_ORDER_SELECT)
      .maybeSingle();

    if (upErr) return rbacApiJson({ ok: false, error: upErr.message }, { status: 500 });

    await logPaymentAudit(admin.service, {
      orderId,
      eventType: "refund_approved",
      statusAfter: "refund_approved",
      metadata: { reason },
      actorUserId: admin.user.id,
    });

    if (row.user_id) {
      await pushOrderNotification(admin.service, {
        userId: row.user_id,
        event: "refund_approved",
        orderId,
        orderNumber: row.order_number,
        sendEmail: true,
        buyerEmail: (row.shipping as { buyerEmail?: string })?.buyerEmail,
      }).catch(() => undefined);
    }

    return rbacApiJson({ ok: true, order: updated ? rowToCustomerOrder(updated) : null });
  }

  if (action === "process") {
    if (row.refund_status !== "refunded") {
      return rbacApiJson(
        { ok: false, error: "Order must be refunded before marking processed" },
        { status: 400 },
      );
    }
    const now = new Date().toISOString();
    const { data: updated, error: upErr } = await admin.service
      .from("customer_orders")
      .update({
        refund_status: "processed",
        refund_processed_at: now,
        order_locked: false,
        updated_at: now,
      })
      .eq("id", orderId)
      .select(CUSTOMER_ORDER_SELECT)
      .maybeSingle();

    if (upErr) return rbacApiJson({ ok: false, error: upErr.message }, { status: 500 });

    await logPaymentAudit(admin.service, {
      orderId,
      eventType: "refund_processed",
      statusAfter: "processed",
      metadata: { reason },
      actorUserId: admin.user.id,
    });

    if (row.user_id) {
      await pushOrderNotification(admin.service, {
        userId: row.user_id,
        event: "refund_processed",
        orderId,
        orderNumber: row.order_number,
        sendEmail: true,
        buyerEmail: (row.shipping as { buyerEmail?: string })?.buyerEmail,
      }).catch(() => undefined);
    }

    return rbacApiJson({ ok: true, order: updated ? rowToCustomerOrder(updated) : null });
  }

  if (action === "reject") {
    const now = new Date().toISOString();
    const { data: updated, error: upErr } = await admin.service
      .from("customer_orders")
      .update({
        refund_status: "rejected",
        refund_reason: reason,
        refund_processed_at: now,
        payment_status: "refund_rejected",
        order_locked: false,
        updated_at: now,
      })
      .eq("id", orderId)
      .select(CUSTOMER_ORDER_SELECT)
      .maybeSingle();

    if (upErr) return rbacApiJson({ ok: false, error: upErr.message }, { status: 500 });

    await logPaymentAudit(admin.service, {
      orderId,
      eventType: "refund_rejected",
      statusBefore: row.payment_status,
      statusAfter: "refund_rejected",
      metadata: { reason, godOverride },
      actorUserId: admin.user.id,
    });

    if (row.user_id) {
      await pushOrderNotification(admin.service, {
        userId: row.user_id,
        event: "refund_rejected",
        orderId,
        orderNumber: row.order_number,
        extraBody: reason,
        sendEmail: true,
        buyerEmail: (row.shipping as { buyerEmail?: string })?.buyerEmail,
      }).catch(() => undefined);
    }

    return rbacApiJson({ ok: true, order: updated ? rowToCustomerOrder(updated) : null });
  }

  if (action !== "execute") {
    return rbacApiJson({ ok: false, error: "Unknown action" }, { status: 400 });
  }

  try {
    assertRefundAllowed(policyOrder, { godOverride });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Refund not allowed";
    return rbacApiJson({ ok: false, error: msg, code: "policy_blocked" }, { status: 403 });
  }

  if (row.refund_status !== "approved" && row.refund_status !== "requested" && !godOverride) {
    return rbacApiJson(
      { ok: false, error: "Approve the refund before executing PayPal capture refund" },
      { status: 400 },
    );
  }

  if (row.refund_status === "requested" && row.refund_idempotency_key === idempotencyKey) {
    return rbacApiJson({ ok: false, error: "Refund already in progress" }, { status: 409 });
  }

  const order = rowToCustomerOrder(row);
  if (!order) return rbacApiJson({ ok: false, error: "Invalid order row" }, { status: 500 });

  const refundReferenceId =
    (row.refund_reference_id as string | null) ?? generateRefundReferenceId(row.order_number);
  const now = new Date().toISOString();

  await admin.service
    .from("customer_orders")
    .update({
      refund_status: "approved",
      refund_reason: reason,
      refund_reference_id: refundReferenceId,
      refund_processed_at: now,
      refund_idempotency_key: idempotencyKey,
      payment_status: "refund_approved",
      updated_at: now,
    })
    .eq("id", orderId);

  await logPaymentAudit(admin.service, {
    orderId,
    eventType: "refund_approved",
    statusBefore: row.payment_status,
    statusAfter: "refund_approved",
    metadata: { reason, refundReferenceId, godOverride },
    actorUserId: admin.user.id,
  });

  if (row.user_id) {
    await pushOrderNotification(admin.service, {
      userId: row.user_id,
      event: "refund_approved",
      orderId,
      orderNumber: row.order_number,
      sendEmail: true,
      buyerEmail: (row.shipping as { buyerEmail?: string })?.buyerEmail,
    }).catch(() => undefined);
  }

  if (order.payment.method === "cod") {
    const { data: codUpdated, error: codErr } = await admin.service
      .from("customer_orders")
      .update({
        refund_status: "refunded",
        refunded_at: new Date().toISOString(),
        payment_status: "refunded",
        fulfillment_status: "cancelled",
        updated_at: new Date().toISOString(),
      })
      .eq("id", orderId)
      .select(CUSTOMER_ORDER_SELECT)
      .maybeSingle();

    if (codErr) return rbacApiJson({ ok: false, error: codErr.message }, { status: 500 });

    await logPaymentAudit(admin.service, {
      orderId,
      eventType: "refund_completed",
      statusAfter: "refunded",
      metadata: { method: "cod", refundReferenceId },
      actorUserId: admin.user.id,
    });

    if (row.user_id) {
      await pushOrderNotification(admin.service, {
        userId: row.user_id,
        event: "refund_completed",
        orderId,
        orderNumber: row.order_number,
        sendEmail: true,
        buyerEmail: (row.shipping as { buyerEmail?: string })?.buyerEmail,
      }).catch(() => undefined);
    }

    try {
      await voidCreatorEarningsForOrder(admin.service, orderId);
    } catch {
      /* non-fatal */
    }

    const lineItem = row.line_item as OrderLineItem;
    if (lineItem?.variantId) {
      await restoreOrderLineItemStock(admin.service, lineItem).catch(() => undefined);
    }

    return rbacApiJson({ ok: true, order: codUpdated ? rowToCustomerOrder(codUpdated) : order });
  }

  if (order.payment.method !== "paypal" || order.paymentStatus !== "paid") {
    return rbacApiJson(
      { ok: false, error: "Only paid PayPal orders can be refunded through PayPal capture" },
      { status: 400 },
    );
  }

  const captureId = order.payment.paypalCaptureId ?? (row.paypal_capture_id as string | null);
  if (!captureId) {
    return rbacApiJson({ ok: false, error: "Missing PayPal capture id on order" }, { status: 400 });
  }

  if (!isPayPalServerConfigured()) {
    return rbacApiJson({ ok: false, error: "PayPal is not configured" }, { status: 503 });
  }

  const discountResult = resolveCheckoutDiscount(
    order.lineItem.priceLabel,
    order.lineItem.qty,
    undefined,
    0,
  );
  const discountCents = "discountCents" in discountResult ? discountResult.discountCents : 0;
  const paypalAmount = computePayPalCheckoutTotal(
    order.lineItem.priceLabel,
    order.lineItem.qty,
    discountCents,
  );

  const refunded = await refundPayPalCapture(captureId, {
    amount: { currency_code: paypalAmount.currency_code, value: paypalAmount.value },
    idempotencyKey,
  });

  if (!refunded.ok) {
    await admin.service
      .from("customer_orders")
      .update({
        refund_status: "failed",
        updated_at: new Date().toISOString(),
      })
      .eq("id", orderId);

    await logPaymentAudit(admin.service, {
      orderId,
      eventType: "paypal_refund_failed",
      statusAfter: "failed",
      metadata: { message: refunded.message },
      actorUserId: admin.user.id,
    });

    await admin.service.from("order_status_history").insert({
      order_id: orderId,
      fulfillment_status: order.fulfillmentStatus,
      payment_status: order.paymentStatus,
      previous_fulfillment: null,
      note: `Refund failed: ${refunded.message}`,
      actor_user_id: admin.user.id,
    });

    return rbacApiJson({ ok: false, error: refunded.message }, { status: refunded.status >= 500 ? 503 : 402 });
  }

  const refundAmount = Number.parseFloat(paypalAmount.value);
  const { data: updated, error: upErr } = await admin.service
    .from("customer_orders")
    .update({
      refund_status: "refunded",
      refund_amount: Number.isFinite(refundAmount) ? refundAmount : null,
      refunded_at: new Date().toISOString(),
      paypal_refund_id: refunded.refundId,
      payment_status: "refunded",
      fulfillment_status: "cancelled",
      updated_at: new Date().toISOString(),
    })
    .eq("id", orderId)
    .select(CUSTOMER_ORDER_SELECT)
    .maybeSingle();

  if (upErr) return rbacApiJson({ ok: false, error: upErr.message }, { status: 500 });

  await logPaymentAudit(admin.service, {
    orderId,
    eventType: "paypal_refund_success",
    statusAfter: "refunded",
    metadata: { paypalRefundId: refunded.refundId, refundReferenceId },
    actorUserId: admin.user.id,
  });

  await admin.service.from("order_status_history").insert({
    order_id: orderId,
    fulfillment_status: order.fulfillmentStatus,
    payment_status: "refunded",
    previous_fulfillment: null,
    note: `Refunded via PayPal (${refunded.refundId}). ${reason}`,
    actor_user_id: admin.user.id,
  });

  if (row.user_id) {
    await pushOrderNotification(admin.service, {
      userId: row.user_id,
      event: "refund_completed",
      orderId,
      orderNumber: row.order_number,
      sendEmail: true,
      buyerEmail: (row.shipping as { buyerEmail?: string })?.buyerEmail,
    }).catch(() => undefined);
  }

  try {
    await voidCreatorEarningsForOrder(admin.service, orderId);
  } catch {
    /* non-fatal */
  }

  const lineItem = row.line_item as OrderLineItem;
  if (lineItem?.variantId) {
    await restoreOrderLineItemStock(admin.service, lineItem).catch(() => undefined);
  }

  const finalOrder = updated ? rowToCustomerOrder(updated) : order;
  return rbacApiJson({ ok: true, order: finalOrder, refundId: refunded.refundId, refundReferenceId });
}
