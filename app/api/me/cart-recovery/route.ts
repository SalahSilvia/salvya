import type { NextRequest } from "next/server";
import { rbacApiJsonWithAuthCookies } from "@/lib/auth/api-errors";
import { requireAuthenticated } from "@/lib/auth/require-role";
import { fetchRecoverableCart } from "@/lib/orders/abandoned-checkout";
import { createServiceSupabase } from "@/lib/supabase/service";

export async function GET(request: NextRequest) {
  const auth = await requireAuthenticated(request);
  if (!auth.ok) return auth.response;

  const service = createServiceSupabase();
  if (!service) {
    return rbacApiJsonWithAuthCookies(auth.response, { ok: true, lines: null });
  }

  const lines = await fetchRecoverableCart(service, auth.user.id);
  return rbacApiJsonWithAuthCookies(auth.response, { ok: true, lines });
}
