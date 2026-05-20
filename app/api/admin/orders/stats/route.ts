import type { NextRequest } from "next/server";
import {
  sinceIsoForRange,
  parseOrderDateRange,
  parsePaymentMethodFilter,
  type OrderPaymentMethodFilter,
} from "@/lib/admin/order-filters";
import type { OrderWorkflowTab } from "@/lib/admin/order-workflow";
import { requireAdminService } from "@/lib/admin/require-admin-service";
import { adminOrderTotalCentsFromDbRow } from "@/lib/admin/order-money";
import { rbacApiJson } from "@/lib/auth/api-errors";
import { isOrderLineItem } from "@/lib/orders/validate";

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

  const startOfDay = new Date();
  startOfDay.setUTCHours(0, 0, 0, 0);
  const dayIso = startOfDay.toISOString();

  const countHead = async (build: () => Promise<{ count: number | null; error: { code?: string; message: string } | null }>) => {
    const { count, error } = await build();
    if (error) {
      if (error.code === "42P01" || error.message.includes("does not exist")) return 0;
      throw new Error(error.message);
    }
    return count ?? 0;
  };

  try {
    const tabCounts = {} as Record<OrderWorkflowTab, number>;

    tabCounts.all = await countHead(async () =>
      applyRangeAndMethod(
        ctx.service.from("customer_orders").select("*", { count: "exact", head: true }),
        since,
        method,
      ),
    );

    tabCounts.pending = await countHead(async () =>
      applyRangeAndMethod(
        ctx.service.from("customer_orders").select("*", { count: "exact", head: true }),
        since,
        method,
      ).in("payment_status", ["pending", "cod_pending"]),
    );

    tabCounts.paid = await countHead(async () =>
      applyRangeAndMethod(
        ctx.service.from("customer_orders").select("*", { count: "exact", head: true }),
        since,
        method,
      ).in("payment_status", ["paid", "authorized"]),
    );

    tabCounts.processing = await countHead(async () =>
      applyRangeAndMethod(
        ctx.service.from("customer_orders").select("*", { count: "exact", head: true }),
        since,
        method,
      ).eq("fulfillment_status", "preparing"),
    );

    tabCounts.shipped = await countHead(async () =>
      applyRangeAndMethod(
        ctx.service.from("customer_orders").select("*", { count: "exact", head: true }),
        since,
        method,
      ).eq("fulfillment_status", "shipped"),
    );

    tabCounts.delivered = await countHead(async () =>
      applyRangeAndMethod(
        ctx.service.from("customer_orders").select("*", { count: "exact", head: true }),
        since,
        method,
      ).eq("fulfillment_status", "delivered"),
    );

    tabCounts.cancelled = await countHead(async () =>
      applyRangeAndMethod(
        ctx.service.from("customer_orders").select("*", { count: "exact", head: true }),
        since,
        method,
      ).eq("fulfillment_status", "cancelled"),
    );

    const todayOrderCount = await countHead(async () =>
      ctx.service.from("customer_orders").select("*", { count: "exact", head: true }).gte("created_at", dayIso),
    );

    const readyToShip = await countHead(async () =>
      applyRangeAndMethod(
        ctx.service.from("customer_orders").select("*", { count: "exact", head: true }),
        since,
        method,
      )
        .eq("fulfillment_status", "confirmed")
        .in("payment_status", ["paid", "authorized", "cod_pending"]),
    );

    let todayRevenueCents = 0;
    const { data: todayRows, error: todayErr } = await ctx.service
      .from("customer_orders")
      .select("line_item, final_price, order_currency")
      .gte("created_at", dayIso)
      .limit(500);

    if (!todayErr && todayRows) {
      for (const row of todayRows) {
        if (isOrderLineItem(row.line_item)) {
          todayRevenueCents += adminOrderTotalCentsFromDbRow(row);
        }
      }
    }

    return rbacApiJson({
      ok: true,
      tabCounts,
      todayOrderCount,
      todayRevenueCents,
      readyToShip,
    });
  } catch (e) {
    return rbacApiJson({ ok: false, error: e instanceof Error ? e.message : "Stats failed" }, { status: 500 });
  }
}
