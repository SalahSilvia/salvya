import { NextResponse, type NextRequest } from "next/server";
import { resolveBagCheckout } from "@/lib/cart/resolve-bag-checkout";
import type { CartLine } from "@/lib/cart/types";
import { isCartLine } from "@/lib/cart/validate";
import { createServerSupabase, getSsrEnv } from "@/lib/supabase/server-ssr";

function json(body: unknown, status = 200) {
  const res = NextResponse.json(body, { status });
  res.headers.set("Cache-Control", "private, no-store");
  return res;
}

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return json({ error: "Invalid JSON" }, 400);
  }

  const rawLines = (body as { lines?: unknown })?.lines;
  if (!Array.isArray(rawLines) || !rawLines.length) {
    return json({ error: "Bag is empty", code: "bag_empty" }, 400);
  }

  const lines = rawLines.filter(isCartLine) as CartLine[];
  if (!lines.length) {
    return json({ error: "Invalid bag lines", code: "invalid_lines" }, 400);
  }

  let userId: string | null = null;
  const env = getSsrEnv();
  if (env) {
    const res = json({});
    try {
      const supabase = createServerSupabase(request, res);
      const {
        data: { user },
      } = await supabase.auth.getUser();
      userId = user?.id ?? null;
    } catch {
      /* guest */
    }
  }

  const result = await resolveBagCheckout(lines, userId);
  if (!result.ok) {
    return json({ error: result.error, code: result.code, lineId: result.lineId }, result.status);
  }

  const { bag } = result;
  return json({
    summaryTitle: bag.summaryTitle,
    subtotalLabel: bag.subtotalLabel,
    subtotalCents: bag.subtotal.unitCents,
    currency: bag.subtotal.currency,
    marketCode: bag.subtotal.marketCode,
    lines: bag.lines.map((row) => ({
      lineId: row.lineId,
      displayTitle: row.orderLine.displayTitle,
      colorLabel: row.orderLine.colorLabel,
      colorId: row.orderLine.colorId,
      size: row.orderLine.size,
      kindLabel: row.orderLine.kindLabel,
      qty: row.orderLine.qty,
      priceLabel: row.orderLine.priceLabel,
      unitPriceLabel: row.unitPriceLabel,
      productImageSrc: row.productImageSrc,
      variantId: row.orderLine.variantId,
      artistSlug: row.orderLine.artistSlug,
      itemSlug: row.orderLine.itemSlug,
      productKind: row.orderLine.productKind,
    })),
  });
}
