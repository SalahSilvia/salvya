import { NextResponse, type NextRequest } from "next/server";
import { normalizeOrderNumberInput } from "@/lib/orders/order-number";
import { rowToCustomerOrder } from "@/lib/orders/validate";
import { createServiceSupabase } from "@/lib/supabase/service";

function jsonResponse(body: unknown, init?: ResponseInit) {
  const res = NextResponse.json(body, init);
  res.headers.set("Cache-Control", "private, no-store");
  return res;
}

export async function POST(request: NextRequest) {
  const service = createServiceSupabase();
  if (!service) {
    return jsonResponse({ error: "Tracking not configured" }, { status: 503 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonResponse({ error: "Invalid JSON" }, { status: 400 });
  }

  if (typeof body !== "object" || body === null) {
    return jsonResponse({ error: "Invalid payload" }, { status: 400 });
  }

  const orderNumber = normalizeOrderNumberInput(String((body as { orderNumber?: string }).orderNumber ?? ""));
  const email = String((body as { email?: string }).email ?? "")
    .trim()
    .toLowerCase();

  if (!orderNumber || orderNumber.length < 4) {
    return jsonResponse({ error: "Enter a valid order number" }, { status: 400 });
  }
  if (!email.includes("@")) {
    return jsonResponse({ error: "Enter the email used at checkout" }, { status: 400 });
  }

  const { data, error } = await service
    .from("customer_orders")
    .select(
      "id, order_number, placement_key, user_id, shipping_address_id, line_item, shipping, payment, fulfillment_status, payment_status, created_at, updated_at",
    )
    .eq("order_number", orderNumber)
    .maybeSingle();

  if (error) {
    return jsonResponse({ error: error.message }, { status: 500 });
  }

  if (!data) {
    return jsonResponse({ found: false }, { status: 404 });
  }

  const shippingEmail =
    typeof data.shipping === "object" &&
    data.shipping !== null &&
    typeof (data.shipping as { buyerEmail?: string }).buyerEmail === "string"
      ? (data.shipping as { buyerEmail: string }).buyerEmail.trim().toLowerCase()
      : "";

  if (shippingEmail !== email) {
    return jsonResponse({ found: false }, { status: 404 });
  }

  const order = rowToCustomerOrder(data);
  if (!order) {
    return jsonResponse({ error: "Order data invalid" }, { status: 500 });
  }

  return jsonResponse({ found: true, order });
}
