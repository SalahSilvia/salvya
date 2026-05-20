import type { NextRequest } from "next/server";
import { rbacApiJson } from "@/lib/auth/api-errors";
import { requireAdminService } from "@/lib/admin/require-admin-service";

export async function GET(request: NextRequest) {
  const admin = await requireAdminService(request);
  if (!admin.ok) return admin.response;

  const { count, error } = await admin.service
    .from("creator_applications")
    .select("*", { count: "exact", head: true })
    .eq("status", "pending");

  if (error) {
    if (error.code === "42P01" || error.message.includes("does not exist")) {
      return rbacApiJson({ ok: true, pending: 0 });
    }
    return rbacApiJson({ ok: false, error: error.message }, { status: 500 });
  }

  return rbacApiJson({ ok: true, pending: count ?? 0 });
}
