import type { NextRequest } from "next/server";
import { rbacApiJsonWithAuthCookies } from "@/lib/auth/api-errors";
import { requireAuthenticated } from "@/lib/auth/require-role";
import { createServiceSupabase } from "@/lib/supabase/service";

export async function GET(request: NextRequest) {
  const auth = await requireAuthenticated(request);
  if (!auth.ok) return auth.response;

  const service = createServiceSupabase();
  if (!service) {
    return rbacApiJsonWithAuthCookies(
      auth.response,
      { ok: false, error: "Not configured", count: 0 },
      { status: 503 },
    );
  }

  const { count, error } = await service
    .from("customer_orders")
    .select("id", { count: "exact", head: true })
    .eq("user_id", auth.user.id)
    .not("fulfillment_status", "eq", "delivered")
    .not("fulfillment_status", "eq", "cancelled");

  if (error) {
    return rbacApiJsonWithAuthCookies(auth.response, { ok: false, error: error.message, count: 0 }, { status: 500 });
  }

  return rbacApiJsonWithAuthCookies(auth.response, { ok: true, count: count ?? 0 });
}
