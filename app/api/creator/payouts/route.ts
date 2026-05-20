import type { NextRequest } from "next/server";
import {
  getCreatorPayoutTotals,
  listCreatorPayoutRecords,
} from "@/lib/creator/payout-service";
import { requireCreator } from "@/lib/creator/require-creator";
import { rbacApiJson, rbacApiNotConfigured } from "@/lib/auth/api-errors";
import { createServiceSupabase } from "@/lib/supabase/service";

export async function GET(request: NextRequest) {
  const auth = await requireCreator(request);
  if (!auth.ok) return auth.response;

  const service = createServiceSupabase();
  if (!service) return rbacApiNotConfigured();

  try {
    const [payouts, totals] = await Promise.all([
      listCreatorPayoutRecords(service, auth.user.id),
      getCreatorPayoutTotals(service, auth.user.id),
    ]);

    return rbacApiJson({ ok: true, payouts, totals });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to load payouts";
    return rbacApiJson({ ok: false, error: message }, { status: 500 });
  }
}
