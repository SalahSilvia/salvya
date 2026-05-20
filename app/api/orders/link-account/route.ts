import { NextResponse, type NextRequest } from "next/server";
import { linkGuestOrdersToUser } from "@/lib/orders/link-guest-orders";
import { mergeGeoPreferencesOnLogin } from "@/lib/market/merge-geo-on-login";
import { createServerSupabase, getSsrEnv } from "@/lib/supabase/server-ssr";
import { createServiceSupabase } from "@/lib/supabase/service";

function jsonResponse(body: unknown, init?: ResponseInit) {
  const res = NextResponse.json(body, init);
  res.headers.set("Cache-Control", "private, no-store");
  return res;
}

export async function POST(request: NextRequest) {
  const env = getSsrEnv();
  if (!env) {
    return jsonResponse({ error: "Not configured" }, { status: 503 });
  }

  const service = createServiceSupabase();
  if (!service) {
    return jsonResponse({ error: "Orders not configured" }, { status: 503 });
  }

  const res = jsonResponse({ linkedCount: 0, orderIds: [] });
  try {
    const supabase = createServerSupabase(request, res);
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user?.email) {
      return jsonResponse({ error: "Unauthorized" }, { status: 401 });
    }

    const result = await linkGuestOrdersToUser(service, user.id, user.email);
    await mergeGeoPreferencesOnLogin(service, user.id).catch(() => undefined);
    return jsonResponse({ ok: true, ...result });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Link failed";
    return jsonResponse({ error: message }, { status: 500 });
  }
}
