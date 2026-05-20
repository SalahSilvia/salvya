import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { isCronAuthorized } from "@/lib/creator/cron-auth";
import { recomputeProductMetrics } from "@/lib/discovery/recompute-metrics";
import { createServiceSupabase } from "@/lib/supabase/service";

export async function POST(request: NextRequest) {
  return runDiscoveryMetrics(request);
}

export async function GET(request: NextRequest) {
  return runDiscoveryMetrics(request);
}

async function runDiscoveryMetrics(request: NextRequest) {
  if (!isCronAuthorized(request)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const service = createServiceSupabase();
  if (!service) {
    return NextResponse.json({ ok: false, error: "Not configured" }, { status: 503 });
  }

  try {
    const result = await recomputeProductMetrics(service);
    return NextResponse.json({ ok: true, ...result });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "recompute_failed";
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
