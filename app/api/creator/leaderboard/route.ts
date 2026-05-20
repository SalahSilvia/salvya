import type { NextRequest } from "next/server";
import {
  getLeaderboardContextForCreator,
  getWeeklyLeaderboard,
} from "@/lib/creator/leaderboard-service";
import { requireCreator } from "@/lib/creator/require-creator";
import { rbacApiJson, rbacApiNotConfigured } from "@/lib/auth/api-errors";
import { createServiceSupabase } from "@/lib/supabase/service";

export async function GET(request: NextRequest) {
  const auth = await requireCreator(request);
  if (!auth.ok) return auth.response;

  const service = createServiceSupabase();
  if (!service) return rbacApiNotConfigured();

  const weekKey = request.nextUrl.searchParams.get("week") ?? undefined;

  try {
    const [leaderboard, context] = await Promise.all([
      getWeeklyLeaderboard(service, weekKey ?? undefined),
      getLeaderboardContextForCreator(service, auth.user.id),
    ]);

    return rbacApiJson({
      ok: true,
      leaderboard,
      you: context,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to load leaderboard";
    return rbacApiJson({ ok: false, error: message }, { status: 500 });
  }
}
