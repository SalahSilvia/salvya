import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { runBoostRefreshForAllCreators } from "@/lib/creator/boost-engine";
import { isCronAuthorized } from "@/lib/creator/cron-auth";
import { runViralityUpdateJob } from "@/lib/creator/virality-engine";
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
    const virality = await runViralityUpdateJob(service);
    const boostsRefreshed = await runBoostRefreshForAllCreators(service);
    return NextResponse.json({ ok: true, ...virality, boostsRefreshed });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Virality job failed";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
