import type { NextRequest } from "next/server";
import { createCreatorPayoutRequest } from "@/lib/creator/payout-request-service";
import { requireCreator } from "@/lib/creator/require-creator";
import { rbacApiJson, rbacApiNotConfigured } from "@/lib/auth/api-errors";
import { createServiceSupabase } from "@/lib/supabase/service";

export async function POST(request: NextRequest) {
  const auth = await requireCreator(request);
  if (!auth.ok) return auth.response;

  const service = createServiceSupabase();
  if (!service) return rbacApiNotConfigured();

  let body: { amountMinor?: number; method?: "paypal" | "bank" | "manual" } = {};
  try {
    body = (await request.json()) as typeof body;
  } catch {
    body = {};
  }

  const result = await createCreatorPayoutRequest(service, auth.user.id, body);
  if (!result.ok) {
    return rbacApiJson({ ok: false, error: result.error }, { status: 400 });
  }

  return rbacApiJson({ ok: true, request: result.request }, { status: 201 });
}
