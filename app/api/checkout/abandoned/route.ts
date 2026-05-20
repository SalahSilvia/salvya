import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { sanitizeCartLines } from "@/lib/cart/validate";
import { upsertAbandonedCheckout } from "@/lib/orders/abandoned-checkout";
import { createServerSupabase, getSsrEnv } from "@/lib/supabase/server-ssr";
import { createServiceSupabase } from "@/lib/supabase/service";

function isRecord(x: unknown): x is Record<string, unknown> {
  return typeof x === "object" && x !== null;
}

export async function POST(request: NextRequest) {
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
  if (!isRecord(body)) return NextResponse.json({ ok: false, error: "Invalid body" }, { status: 400 });

  const placementKey = typeof body.placementKey === "string" ? body.placementKey.trim() : "";
  const checkoutPath = typeof body.checkoutPath === "string" ? body.checkoutPath.trim() : "";
  const buyerEmail = typeof body.buyerEmail === "string" ? body.buyerEmail.trim() : "";
  const paypalOrderId = typeof body.paypalOrderId === "string" ? body.paypalOrderId.trim() : "";
  const cartLines = sanitizeCartLines(body.cartLines);

  if (!placementKey || !checkoutPath || !cartLines?.length) {
    return NextResponse.json({ ok: false, error: "Missing checkout snapshot" }, { status: 400 });
  }

  let userId: string | null = null;
  const env = getSsrEnv();
  if (env) {
    const res = NextResponse.json({ ok: true });
    const supabase = createServerSupabase(request, res);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    userId = user?.id ?? null;
  }

  await upsertAbandonedCheckout(service, {
    userId,
    buyerEmail: buyerEmail || null,
    placementKey,
    checkoutPath,
    cartLines,
    paypalOrderId: paypalOrderId || null,
  });

  return NextResponse.json({ ok: true });
}
