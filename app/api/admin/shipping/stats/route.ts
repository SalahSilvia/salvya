import type { NextRequest } from "next/server";
import {
  sinceIsoForRange,
  parseOrderDateRange,
  parsePaymentMethodFilter,
  type OrderPaymentMethodFilter,
} from "@/lib/admin/order-filters";
import type { ShippingQueueTab } from "@/lib/admin/shipping-workflow";
import { requireAdminService } from "@/lib/admin/require-admin-service";
import { rbacApiJson } from "@/lib/auth/api-errors";

function applyRangeAndMethod<T extends { gte: (col: string, val: string) => T; filter: (col: string, op: string, val: string) => T }>(
  query: T,
  since: string | null,
  method: OrderPaymentMethodFilter,
): T {
  let q = query;
  if (since) q = q.gte("created_at", since);
  if (method === "cod") q = q.filter("payment->>method", "eq", "cod");
  if (method === "paypal") q = q.filter("payment->>method", "eq", "paypal");
  return q;
}

export async function GET(request: NextRequest) {
  const ctx = await requireAdminService(request);
  if (!ctx.ok) return ctx.response;

  const url = new URL(request.url);
  const range = parseOrderDateRange(url.searchParams.get("range"));
  const method = parsePaymentMethodFilter(url.searchParams.get("method"));
  const since = sinceIsoForRange(range);

  const countHead = async (build: () => Promise<{ count: number | null; error: { code?: string; message: string } | null }>) => {
    const { count, error } = await build();
    if (error) {
      if (error.code === "42P01" || error.message.includes("does not exist")) return 0;
      throw new Error(error.message);
    }
    return count ?? 0;
  };

  try {
    const queueCounts = {} as Record<ShippingQueueTab, number>;

    queueCounts.ready = await countHead(async () =>
      applyRangeAndMethod(
        ctx.service.from("customer_orders").select("*", { count: "exact", head: true }),
        since,
        method,
      )
        .eq("fulfillment_status", "confirmed")
        .in("payment_status", ["paid", "authorized", "cod_pending"]),
    );

    queueCounts.packing = await countHead(async () =>
      applyRangeAndMethod(
        ctx.service.from("customer_orders").select("*", { count: "exact", head: true }),
        since,
        method,
      ).eq("fulfillment_status", "preparing"),
    );

    queueCounts.in_transit = await countHead(async () =>
      applyRangeAndMethod(
        ctx.service.from("customer_orders").select("*", { count: "exact", head: true }),
        since,
        method,
      ).eq("fulfillment_status", "shipped"),
    );

    queueCounts.needs_tracking = await countHead(async () =>
      applyRangeAndMethod(
        ctx.service.from("customer_orders").select("*", { count: "exact", head: true }),
        since,
        method,
      )
        .eq("fulfillment_status", "shipped")
        .or("shipping->>trackingNumber.is.null,shipping->>trackingNumber.eq."),
    );

    queueCounts.delivered = await countHead(async () =>
      applyRangeAndMethod(
        ctx.service.from("customer_orders").select("*", { count: "exact", head: true }),
        since,
        method,
      ).eq("fulfillment_status", "delivered"),
    );

    queueCounts.all = await countHead(async () =>
      applyRangeAndMethod(
        ctx.service.from("customer_orders").select("*", { count: "exact", head: true }),
        since,
        method,
      ).neq("fulfillment_status", "cancelled"),
    );

    return rbacApiJson({
      ok: true,
      queueCounts,
      readyToShip: queueCounts.ready,
      inTransit: queueCounts.in_transit,
      needsTracking: queueCounts.needs_tracking,
    });
  } catch (e) {
    return rbacApiJson({ ok: false, error: e instanceof Error ? e.message : "Stats failed" }, { status: 500 });
  }
}
