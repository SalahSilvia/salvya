import type { NextRequest } from "next/server";
import { requireAdminService } from "@/lib/admin/require-admin-service";
import { isShippingCarrierId } from "@/lib/admin/shipping-carriers";
import { buildCarrierTrackingUrl } from "@/lib/admin/tracking-url";
import { rbacApiJson } from "@/lib/auth/api-errors";
import type { OrderFulfillmentStatus, OrderPaymentStatus } from "@/lib/orders/types";
import { runOrderStatusAutomations } from "@/lib/email/automations";
import { CUSTOMER_ORDER_SELECT } from "@/lib/orders/order-db-row";
import { rowToCustomerOrder } from "@/lib/orders/validate";
import { settleCreatorEarningsOnOrderPaid } from "@/lib/creator/earnings-service";

const ORDER_SELECT = CUSTOMER_ORDER_SELECT;

const FULFILLMENT: OrderFulfillmentStatus[] = ["confirmed", "preparing", "shipped", "delivered", "cancelled"];
const PAYMENT: OrderPaymentStatus[] = [
  "pending",
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
];

function isRecord(x: unknown): x is Record<string, unknown> {
  return typeof x === "object" && x !== null;
}

function mapHistoryRow(row: {
  id: string;
  order_id: string;
  fulfillment_status: string;
  payment_status: string | null;
  previous_fulfillment: string | null;
  note: string | null;
  actor_user_id: string | null;
  created_at: string;
}) {
  return {
    id: row.id,
    orderId: row.order_id,
    fulfillmentStatus: row.fulfillment_status,
    paymentStatus: row.payment_status,
    previousFulfillment: row.previous_fulfillment,
    note: row.note,
    actorUserId: row.actor_user_id,
    createdAt: row.created_at,
  };
}

export async function GET(request: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const admin = await requireAdminService(request);
  if (!admin.ok) return admin.response;

  const { id } = await ctx.params;
  if (!id) return rbacApiJson({ ok: false, error: "Missing id" }, { status: 400 });

  const { data, error } = await admin.service.from("customer_orders").select(ORDER_SELECT).eq("id", id).maybeSingle();

  if (error) return rbacApiJson({ ok: false, error: error.message }, { status: 500 });
  if (!data) return rbacApiJson({ ok: false, error: "Not found" }, { status: 404 });

  const order = rowToCustomerOrder(data);
  if (!order) return rbacApiJson({ ok: false, error: "Invalid order row" }, { status: 500 });

  const { data: histRows, error: hErr } = await admin.service
    .from("order_status_history")
    .select("id, order_id, fulfillment_status, payment_status, previous_fulfillment, note, actor_user_id, created_at")
    .eq("order_id", id)
    .order("created_at", { ascending: false })
    .limit(100);

  let history: ReturnType<typeof mapHistoryRow>[] = [];
  if (hErr) {
    if (hErr.code !== "42P01" && !hErr.message.includes("does not exist")) {
      return rbacApiJson({ ok: false, error: hErr.message }, { status: 500 });
    }
  } else {
    history = (histRows ?? []).map(mapHistoryRow);
  }

  return rbacApiJson({ ok: true, order, history });
}

export async function PATCH(request: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const admin = await requireAdminService(request);
  if (!admin.ok) return admin.response;

  const { id } = await ctx.params;
  if (!id) return rbacApiJson({ ok: false, error: "Missing id" }, { status: 400 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return rbacApiJson({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }
  if (!isRecord(body)) return rbacApiJson({ ok: false, error: "Invalid body" }, { status: 400 });

  const { data: existingRow, error: loadErr } = await admin.service
    .from("customer_orders")
    .select(ORDER_SELECT)
    .eq("id", id)
    .maybeSingle();

  if (loadErr) return rbacApiJson({ ok: false, error: loadErr.message }, { status: 500 });
  if (!existingRow) return rbacApiJson({ ok: false, error: "Not found" }, { status: 404 });

  const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };

  if (typeof body.fulfillmentStatus === "string" && FULFILLMENT.includes(body.fulfillmentStatus as OrderFulfillmentStatus)) {
    patch.fulfillment_status = body.fulfillmentStatus;
  }
  if (typeof body.paymentStatus === "string" && PAYMENT.includes(body.paymentStatus as OrderPaymentStatus)) {
    patch.payment_status = body.paymentStatus;
  }

  const shippingPatch: Record<string, unknown> =
    typeof existingRow.shipping === "object" && existingRow.shipping !== null && !Array.isArray(existingRow.shipping)
      ? { ...(existingRow.shipping as Record<string, unknown>) }
      : {};

  if (typeof body.trackingNumber === "string") {
    const t = body.trackingNumber.trim().slice(0, 120);
    if (t) shippingPatch.trackingNumber = t;
    else delete shippingPatch.trackingNumber;
    patch.shipping = shippingPatch;
  }

  if (typeof body.carrier === "string") {
    const c = body.carrier.trim().toLowerCase();
    if (c && isShippingCarrierId(c)) shippingPatch.carrier = c;
    else delete shippingPatch.carrier;
    patch.shipping = shippingPatch;
  }

  if (typeof body.trackingUrl === "string") {
    const u = body.trackingUrl.trim().slice(0, 500);
    if (u) shippingPatch.trackingUrl = u;
    else delete shippingPatch.trackingUrl;
    patch.shipping = shippingPatch;
  }

  const hasStatusChange =
    typeof body.fulfillmentStatus === "string" || typeof body.paymentStatus === "string";
  const hasShippingMetaChange =
    typeof body.trackingNumber === "string" ||
    typeof body.carrier === "string" ||
    typeof body.trackingUrl === "string";

  if (!hasStatusChange && !hasShippingMetaChange) {
    return rbacApiJson({ ok: false, error: "No valid fields to update" }, { status: 400 });
  }

  const prevFulfillment = String(existingRow.fulfillment_status);
  const prevPayment = String(existingRow.payment_status);
  const nextFulfillment =
    typeof patch.fulfillment_status === "string" ? (patch.fulfillment_status as string) : prevFulfillment;
  const nextPayment = typeof patch.payment_status === "string" ? (patch.payment_status as string) : prevPayment;

  const fulfillmentChanged = typeof body.fulfillmentStatus === "string" && nextFulfillment !== prevFulfillment;
  const paymentChanged = typeof body.paymentStatus === "string" && nextPayment !== prevPayment;

  if (nextFulfillment === "shipped" && fulfillmentChanged) {
    const existingShippedAt =
      typeof shippingPatch.shippedAt === "string" ? shippingPatch.shippedAt : undefined;
    if (!existingShippedAt) {
      shippingPatch.shippedAt = new Date().toISOString();
      patch.shipping = shippingPatch;
    }
  }

  const prevShipping =
    typeof existingRow.shipping === "object" && existingRow.shipping !== null && !Array.isArray(existingRow.shipping)
      ? (existingRow.shipping as Record<string, unknown>)
      : {};
  const mergedShipping = { ...prevShipping, ...shippingPatch };
  const nextTracking =
    typeof mergedShipping.trackingNumber === "string" ? mergedShipping.trackingNumber.trim() : "";
  const nextCarrier = typeof mergedShipping.carrier === "string" ? mergedShipping.carrier : "";
  if (nextTracking && nextCarrier && !mergedShipping.trackingUrl && typeof body.trackingUrl !== "string") {
    const auto = buildCarrierTrackingUrl(nextCarrier, nextTracking);
    if (auto) {
      shippingPatch.trackingUrl = auto;
      patch.shipping = { ...mergedShipping, ...shippingPatch };
    }
  }

  const prevTracking = typeof prevShipping.trackingNumber === "string" ? prevShipping.trackingNumber.trim() : "";
  const prevCarrier = typeof prevShipping.carrier === "string" ? prevShipping.carrier : "";
  const prevUrl = typeof prevShipping.trackingUrl === "string" ? prevShipping.trackingUrl.trim() : "";
  const nextUrl =
    typeof patch.shipping === "object" &&
    patch.shipping !== null &&
    !Array.isArray(patch.shipping) &&
    typeof (patch.shipping as Record<string, unknown>).trackingUrl === "string"
      ? String((patch.shipping as Record<string, unknown>).trackingUrl).trim()
      : prevUrl;
  const trackingMetaChanged =
    hasShippingMetaChange &&
    (nextTracking !== prevTracking || nextCarrier !== prevCarrier || nextUrl !== prevUrl);

  if (hasShippingMetaChange) {
    patch.shipping = { ...prevShipping, ...shippingPatch };
  }

  const { data, error } = await admin.service
    .from("customer_orders")
    .update(patch)
    .eq("id", id)
    .select(ORDER_SELECT)
    .maybeSingle();

  if (error) return rbacApiJson({ ok: false, error: error.message }, { status: 500 });
  if (!data) return rbacApiJson({ ok: false, error: "Not found" }, { status: 404 });

  if (fulfillmentChanged || paymentChanged || trackingMetaChanged) {
    const noteRaw = typeof body.note === "string" ? body.note.trim().slice(0, 2000) : "";
    let note = noteRaw || null;
    if (!note && trackingMetaChanged && !fulfillmentChanged && !paymentChanged) {
      const parts = [
        nextTracking ? `Tracking ${nextTracking}` : null,
        nextCarrier ? `via ${nextCarrier}` : null,
      ].filter(Boolean);
      note = parts.length ? parts.join(" ") : "Shipping details updated";
    }
    const { error: insErr } = await admin.service.from("order_status_history").insert({
      order_id: id,
      fulfillment_status: nextFulfillment,
      payment_status: nextPayment,
      previous_fulfillment: fulfillmentChanged ? prevFulfillment : null,
      note,
      actor_user_id: admin.user.id,
    });
    if (insErr && insErr.code !== "42P01" && !insErr.message.includes("does not exist")) {
      return rbacApiJson({ ok: false, error: insErr.message }, { status: 500 });
    }
  }

  const order = rowToCustomerOrder(data);
  if (!order) return rbacApiJson({ ok: false, error: "Invalid order row" }, { status: 500 });

  const { data: histRows } = await admin.service
    .from("order_status_history")
    .select("id, order_id, fulfillment_status, payment_status, previous_fulfillment, note, actor_user_id, created_at")
    .eq("order_id", id)
    .order("created_at", { ascending: false })
    .limit(100);

  const history = (histRows ?? []).map(mapHistoryRow);

  if (paymentChanged && nextPayment === "paid") {
    try {
      await settleCreatorEarningsOnOrderPaid(admin.service, id);
    } catch {
      /* non-fatal */
    }
  }

  if (fulfillmentChanged || paymentChanged) {
    try {
      await runOrderStatusAutomations(admin.service, order, {
        prevFulfillment: prevFulfillment as OrderFulfillmentStatus,
        nextFulfillment: nextFulfillment as OrderFulfillmentStatus,
        prevPayment: prevPayment as OrderPaymentStatus,
        nextPayment: nextPayment as OrderPaymentStatus,
        trackingNumber: order.shipping.trackingNumber,
        trackingUrl: order.shipping.trackingUrl,
      });
    } catch {
      /* non-fatal */
    }
  }

  return rbacApiJson({ ok: true, order, history });
}
