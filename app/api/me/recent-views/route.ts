import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { fetchRecentViewsForUser, recordProductView, resolveProductUuid } from "@/lib/discovery/recent-views";
import { createServerSupabase } from "@/lib/supabase/server-ssr";
import { createServiceSupabase } from "@/lib/supabase/service";
import { getSsrEnv } from "@/lib/supabase/server-ssr";

export async function GET(request: NextRequest) {
  const env = getSsrEnv();
  if (!env) return NextResponse.json({ ok: false, error: "Not configured" }, { status: 503 });

  const res = NextResponse.json({ ok: true, items: [] });
  const supabase = createServerSupabase(request, res);
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });

  const service = createServiceSupabase();
  if (!service) return NextResponse.json({ ok: false, error: "Not configured" }, { status: 503 });

  const items = await fetchRecentViewsForUser(service, user.id);
  const json = NextResponse.json({ ok: true, items });
  res.headers.forEach((v, k) => json.headers.set(k, v));
  return json;
}

export async function POST(request: NextRequest) {
  const env = getSsrEnv();
  if (!env) return NextResponse.json({ ok: false, error: "Not configured" }, { status: 503 });

  const res = NextResponse.json({ ok: true });
  const supabase = createServerSupabase(request, res);
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  const productRef =
    body && typeof body === "object" && typeof (body as { productId?: string }).productId === "string"
      ? (body as { productId: string }).productId.trim()
      : "";
  if (!productRef) {
    return NextResponse.json({ ok: false, error: "productId required" }, { status: 400 });
  }

  const service = createServiceSupabase();
  if (!service) return NextResponse.json({ ok: false, error: "Not configured" }, { status: 503 });

  const uuid = await resolveProductUuid(service, productRef);
  if (!uuid) return NextResponse.json({ ok: false, error: "Product not found" }, { status: 404 });

  await recordProductView(service, user.id, uuid);

  const json = NextResponse.json({ ok: true, productId: uuid });
  res.headers.forEach((v, k) => json.headers.set(k, v));
  return json;
}
