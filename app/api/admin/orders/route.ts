import type { NextRequest } from "next/server";
import { sinceIsoForRange, parseOrderDateRange, parsePaymentMethodFilter } from "@/lib/admin/order-filters";
import { parseOrderWorkflowTab } from "@/lib/admin/order-workflow";
import { parseShippingQueue } from "@/lib/admin/shipping-workflow";
import { requireAdminService } from "@/lib/admin/require-admin-service";
import { rbacApiJson } from "@/lib/auth/api-errors";
import type { OrderFulfillmentStatus, OrderPaymentStatus } from "@/lib/orders/types";
import { rowToCustomerOrder } from "@/lib/orders/validate";

const ORDER_SELECT =
  "id, order_number, placement_key, user_id, shipping_address_id, line_item, shipping, payment, fulfillment_status, payment_status, final_price, order_currency, created_at, updated_at";

const FULFILLMENT: OrderFulfillmentStatus[] = ["confirmed", "preparing", "shipped", "delivered", "cancelled"];
const PAYMENT: OrderPaymentStatus[] = ["pending", "authorized", "paid", "cod_pending", "failed"];

function escapeIlike(s: string): string {
  return s.replace(/\\/g, "\\\\").replace(/%/g, "\\%").replace(/_/g, "\\_");
}

export async function GET(request: NextRequest) {
  const ctx = await requireAdminService(request);
  if (!ctx.ok) return ctx.response;

  const url = new URL(request.url);
  const limit = Math.min(100, Math.max(5, parseInt(url.searchParams.get("limit") ?? "25", 10) || 25));
  const cursor = url.searchParams.get("cursor");
  const q = (url.searchParams.get("q") ?? "").trim();
  const workflow = parseOrderWorkflowTab(url.searchParams.get("workflow"));
  const shippingQueue = parseShippingQueue(url.searchParams.get("shipping"));
  const fulfillment = url.searchParams.get("fulfillment") as OrderFulfillmentStatus | null;
  const payment = url.searchParams.get("payment") as OrderPaymentStatus | null;
  const sort = (url.searchParams.get("sort") ?? "desc").toLowerCase() === "asc" ? "asc" : "desc";
  const range = parseOrderDateRange(url.searchParams.get("range"));
  const methodFilter = parsePaymentMethodFilter(url.searchParams.get("method"));
  const since = sinceIsoForRange(range);

  let query = ctx.service
    .from("customer_orders")
    .select(ORDER_SELECT)
    .order("created_at", { ascending: sort === "asc" })
    .limit(limit + 1);

  if (workflow !== "all") {
    switch (workflow) {
      case "pending":
        query = query.in("payment_status", ["pending", "cod_pending"]);
        break;
      case "paid":
        query = query.in("payment_status", ["paid", "authorized"]);
        break;
      case "processing":
        query = query.eq("fulfillment_status", "preparing");
        break;
      case "shipped":
        query = query.eq("fulfillment_status", "shipped");
        break;
      case "delivered":
        query = query.eq("fulfillment_status", "delivered");
        break;
      case "cancelled":
        query = query.eq("fulfillment_status", "cancelled");
        break;
      default:
        break;
    }
  } else {
    if (fulfillment && FULFILLMENT.includes(fulfillment)) {
      query = query.eq("fulfillment_status", fulfillment);
    }
    if (payment && PAYMENT.includes(payment)) {
      query = query.eq("payment_status", payment);
    }
  }

  if (cursor) {
    if (sort === "asc") {
      query = query.gt("created_at", cursor);
    } else {
      query = query.lt("created_at", cursor);
    }
  }

  if (since) {
    query = query.gte("created_at", since);
  }
  if (methodFilter === "cod") {
    query = query.filter("payment->>method", "eq", "cod");
  } else if (methodFilter === "paypal") {
    query = query.filter("payment->>method", "eq", "paypal");
  }

  if (q) {
    const esc = escapeIlike(q);
    query = query.or(`order_number.ilike.%${esc}%,shipping->>buyerEmail.ilike.%${esc}%`);
  }

  const { data, error } = await query;

  if (error) {
    return rbacApiJson({ ok: false, error: error.message }, { status: 500 });
  }

  const rows = data ?? [];
  const hasMore = rows.length > limit;
  const slice = hasMore ? rows.slice(0, limit) : rows;
  const nextCursor = hasMore ? slice[slice.length - 1]?.created_at : null;

  const orders = slice.map(rowToCustomerOrder).filter((o): o is NonNullable<typeof o> => Boolean(o));

  return rbacApiJson({
    ok: true,
    orders,
    nextCursor,
    sort,
    workflow,
    shippingQueue,
  });
}
