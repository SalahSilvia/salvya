import type { NextRequest } from "next/server";
import { rbacApiJsonWithAuthCookies } from "@/lib/auth/api-errors";
import { requireAuthenticated } from "@/lib/auth/require-role";
import { pushOrderNotification } from "@/lib/notifications/push-order-event";
import { CUSTOMER_ORDER_SELECT } from "@/lib/orders/order-db-row";
import {
  dbRowToRefundPolicy,
  generateRefundReferenceId,
} from "@/lib/orders/order-refund-policy";
import { logPaymentAudit } from "@/lib/orders/payment-audit";
import { assessRefundEligibility, assertRefundAllowed } from "@/lib/orders/refund-policy";
import { rowToCustomerOrder } from "@/lib/orders/validate";
import { createServiceSupabase } from "@/lib/supabase/service";

function isRecord(x: unknown): x is Record<string, unknown> {
  return typeof x === "object" && x !== null;
}

export async function POST(request: NextRequest) {
  const auth = await requireAuthenticated(request);
  if (!auth.ok) return auth.response;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return rbacApiJsonWithAuthCookies(auth.response, { ok: false, error: "Invalid JSON" }, { status: 400 });
  }
  if (!isRecord(body)) {
    return rbacApiJsonWithAuthCookies(auth.response, { ok: false, error: "Invalid body" }, { status: 400 });
  }

  const orderId = typeof body.orderId === "string" ? body.orderId.trim() : "";
  const reason = typeof body.reason === "string" ? body.reason.trim().slice(0, 2000) : "";
  if (!orderId) {
    return rbacApiJsonWithAuthCookies(auth.response, { ok: false, error: "Missing orderId" }, { status: 400 });
  }
  if (!reason) {
    return rbacApiJsonWithAuthCookies(auth.response, { ok: false, error: "Refund reason is required" }, { status: 400 });
  }

  const service = createServiceSupabase();
  if (!service) {
    return rbacApiJsonWithAuthCookies(
      auth.response,
      { ok: false, error: "Not configured" },
      { status: 503 },
    );
  }

  const { data: row, error: loadErr } = await service
    .from("customer_orders")
    .select(CUSTOMER_ORDER_SELECT)
    .eq("id", orderId)
    .eq("user_id", auth.user.id)
    .maybeSingle();

  if (loadErr) {
    return rbacApiJsonWithAuthCookies(auth.response, { ok: false, error: loadErr.message }, { status: 500 });
  }
  if (!row) {
    return rbacApiJsonWithAuthCookies(auth.response, { ok: false, error: "Not found" }, { status: 404 });
  }

  const policyOrder = dbRowToRefundPolicy(row);
  if (!policyOrder) {
    return rbacApiJsonWithAuthCookies(auth.response, { ok: false, error: "Invalid order" }, { status: 500 });
  }

  const eligibility = assessRefundEligibility(policyOrder);
  try {
    assertRefundAllowed(policyOrder);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Refund not allowed";
    return rbacApiJsonWithAuthCookies(
      auth.response,
      { ok: false, error: msg, code: "not_eligible", eligibility },
      { status: 403 },
    );
  }

  const now = new Date().toISOString();
  const refundReferenceId = generateRefundReferenceId(row.order_number);

  const { data: updated, error: upErr } = await service
    .from("customer_orders")
    .update({
      refund_status: "requested",
      refund_reason: reason,
      refund_requested_at: now,
      refund_reference_id: refundReferenceId,
      refund_eligibility_checked_at: now,
      refund_policy_code: eligibility.policyReason,
      order_locked: true,
      payment_status: "refund_requested",
      updated_at: now,
    })
    .eq("id", orderId)
    .select(CUSTOMER_ORDER_SELECT)
    .maybeSingle();

  if (upErr) {
    return rbacApiJsonWithAuthCookies(auth.response, { ok: false, error: upErr.message }, { status: 500 });
  }

  await logPaymentAudit(service, {
    orderId,
    eventType: "refund_requested",
    statusBefore: row.payment_status,
    statusAfter: "refund_requested",
    metadata: { reason, refundReferenceId, policyReason: eligibility.policyReason, autoReview: "admin_required" },
    actorUserId: auth.user.id,
  });

  const order = updated ? rowToCustomerOrder(updated) : null;
  const buyerEmail = (row.shipping as { buyerEmail?: string })?.buyerEmail;

  await pushOrderNotification(service, {
    userId: auth.user.id,
    event: "refund_requested",
    orderId,
    orderNumber: row.order_number,
    sendEmail: true,
    buyerEmail,
  }).catch(() => undefined);

  return rbacApiJsonWithAuthCookies(auth.response, {
    ok: true,
    order,
    refundReferenceId,
    eligibility,
    message: "Refund request submitted for admin review. No automatic refunds are issued.",
  });
}
