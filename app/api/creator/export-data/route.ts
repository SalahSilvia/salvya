import type { NextRequest } from "next/server";
import { creatorExportToCsv, exportCreatorData } from "@/lib/creator/export-data-service";
import { requireCreator } from "@/lib/creator/require-creator";
import { rbacApiJson, rbacApiNotConfigured } from "@/lib/auth/api-errors";
import { createServiceSupabase } from "@/lib/supabase/service";

export async function GET(request: NextRequest) {
  const auth = await requireCreator(request);
  if (!auth.ok) return auth.response;

  const service = createServiceSupabase();
  if (!service) return rbacApiNotConfigured();

  const formatParam = request.nextUrl.searchParams.get("format");
  const format = formatParam === "csv" ? "csv" : "json";

  const result = await exportCreatorData(service, auth.user.id, format);
  if (!result.ok) {
    return rbacApiJson({ ok: false, error: result.error }, { status: 429 });
  }

  if (format === "csv") {
    const csv = creatorExportToCsv(result.data);
    return new Response(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="salvya-creator-export-${Date.now()}.csv"`,
        "Cache-Control": "private, no-store",
      },
    });
  }

  return rbacApiJson({ ok: true, export: result.data });
}
