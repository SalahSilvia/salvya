import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import { reserveVariantStock } from "@/lib/inventory/stock-reservation";
import { restoreVariantStockQty } from "@/lib/inventory/restore-stock";
import { resolveServerCheckoutQuote } from "@/lib/orders/resolve-server-checkout";
import { sanitizePlaceOrderInput } from "@/lib/orders/validate";
import type { OrderLineItem } from "@/lib/orders/types";
import { checkRateLimit, clientIpFromRequest, rateLimitResponse } from "@/lib/security/api-rate-limit";
import { createServiceSupabase } from "@/lib/supabase/service";

function isRecord(x: unknown): x is Record<string, unknown> {
  return typeof x === "object" && x !== null;
}

async function releaseReservation(
  service: SupabaseClient,
  checkoutSessionId: string,
  variantId: string,
  qty: number,
) {
  if (!service) return;
  await service
    .from("stock_reservations")
    .update({ status: "released", updated_at: new Date().toISOString() })
    .eq("checkout_session_id", checkoutSessionId)
    .eq("product_variant_id", variantId)
    .eq("status", "reserved");
  await restoreVariantStockQty(service, variantId, qty);
}

function parseLineItem(raw: unknown): OrderLineItem | null {
  const stub = sanitizePlaceOrderInput({
    placementKey: "reserve",
    checkoutPath: "/checkout",
    lineItem: raw,
    shipping: {
      buyerName: "x",
      buyerPhone: "x",
      buyerEmail: "x@x.com",
      buyerCountry: "MA",
      buyerCity: "x",
      buyerAddress: "x",
    },
    payment: { method: "cod" },
  });
  return (stub?.lineItem as OrderLineItem | undefined) ?? null;
}

export async function POST(request: NextRequest) {
  const ip = clientIpFromRequest(request);
  const rate = checkRateLimit(`checkout:reserve:${ip}`, { limit: 30, windowMs: 60_000 });
  if (!rate.ok) return rateLimitResponse(rate.retryAfterSec);

  const service = createServiceSupabase();
  if (!service) {
    return NextResponse.json({ ok: false, error: "Not configured" }, { status: 503 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }
  if (!isRecord(body)) {
    return NextResponse.json({ ok: false, error: "Invalid body" }, { status: 400 });
  }

  const checkoutSessionId =
    typeof body.checkoutSessionId === "string" ? body.checkoutSessionId.trim() : "";
  if (!checkoutSessionId) {
    return NextResponse.json({ ok: false, error: "checkoutSessionId required" }, { status: 400 });
  }

  const bagLinesRaw = body.bagLines;
  const lines: OrderLineItem[] = [];

  if (Array.isArray(bagLinesRaw) && bagLinesRaw.length > 0) {
    for (const raw of bagLinesRaw) {
      const line = parseLineItem(raw);
      if (!line) {
        return NextResponse.json({ ok: false, error: "Invalid bag line item" }, { status: 400 });
      }
      lines.push(line);
    }
  } else {
    const lineItem = parseLineItem(body.lineItem);
    if (!lineItem) {
      return NextResponse.json({ ok: false, error: "lineItem or bagLines required" }, { status: 400 });
    }
    lines.push(lineItem);
  }

  const reserved: { variantId: string; qty: number }[] = [];

  for (const lineItem of lines) {
    const quoteResult = await resolveServerCheckoutQuote(lineItem, undefined, {
      checkoutSessionId,
    });
    if (!quoteResult.ok) {
      for (const r of reserved) {
        await releaseReservation(service, checkoutSessionId, r.variantId, r.qty);
      }
      return NextResponse.json(
        { ok: false, error: quoteResult.error, code: quoteResult.code },
        { status: quoteResult.status },
      );
    }

    const reservedRow = await reserveVariantStock(
      service,
      quoteResult.quote.variantId,
      quoteResult.quote.qty,
      checkoutSessionId,
    );

    if (!reservedRow.ok) {
      for (const r of reserved) {
        await releaseReservation(service, checkoutSessionId, r.variantId, r.qty);
      }
      return NextResponse.json(
        {
          ok: false,
          error: "This item is out of stock",
          code: "out_of_stock",
          remainingStock: reservedRow.remainingStock,
        },
        { status: 409 },
      );
    }

    reserved.push({ variantId: quoteResult.quote.variantId, qty: quoteResult.quote.qty });
  }

  return NextResponse.json({
    ok: true,
    reservedCount: reserved.length,
    variantId: reserved[0]?.variantId,
  });
}
