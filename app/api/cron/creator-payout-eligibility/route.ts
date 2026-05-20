import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { isCronAuthorized } from "@/lib/creator/cron-auth";
import { runCreatorPayoutEligibilityJob } from "@/lib/creator/payout-eligibility";
import { createServiceSupabase } from "@/lib/supabase/service";

export async function GET(request: NextRequest) {
  return POST(request);
}

export async function POST(request: NextRequest) {
  if (!isCronAuthorized(request)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const service = createServiceSupabase();
  if (!service) {
    return NextResponse.json({ ok: false, error: "Not configured" }, { status: 503 });
  }

  try {
    const result = await runCreatorPayoutEligibilityJob(service);
    return NextResponse.json({ ok: true, ...result });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Payout eligibility job failed";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
