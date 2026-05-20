import type { NextRequest } from "next/server";
import type { AdminCreatorApplication } from "@/lib/creator/types";
import { rbacApiJson } from "@/lib/auth/api-errors";
import { requireAdminService } from "@/lib/admin/require-admin-service";

export async function GET(request: NextRequest) {
  const admin = await requireAdminService(request);
  if (!admin.ok) return admin.response;

  const status = request.nextUrl.searchParams.get("status") ?? "pending";
  const q = request.nextUrl.searchParams.get("q")?.trim() ?? "";

  let query = admin.service
    .from("creator_applications")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200);

  if (status !== "all") {
    query = query.eq("status", status);
  }

  const { data, error } = await query;

  if (error) {
    if (error.code === "42P01" || error.message.includes("does not exist")) {
      return rbacApiJson({ ok: true, applications: [], counts: { pending: 0, approved: 0, rejected: 0 } });
    }
    return rbacApiJson({ ok: false, error: error.message }, { status: 500 });
  }

  const rows = data ?? [];
  const userIds = [...new Set(rows.map((r) => r.user_id as string))];

  const { data: profiles } = await admin.service
    .from("user_profiles")
    .select("user_id, role")
    .in("user_id", userIds.length ? userIds : ["00000000-0000-0000-0000-000000000000"]);

  const authUsers = await Promise.all(
    userIds.slice(0, 50).map(async (id) => {
      const { data: u } = await admin.service.auth.admin.getUserById(id);
      return { id, email: u?.user?.email ?? null };
    }),
  );

  const roleByUser = new Map((profiles ?? []).map((p) => [p.user_id as string, p.role as string]));
  const emailByUser = new Map(authUsers.map((u) => [u.id, u.email]));

  let applications: AdminCreatorApplication[] = rows.map((row) => ({
    ...(row as AdminCreatorApplication),
    applicantEmail: emailByUser.get(row.user_id as string) ?? null,
    profileRole: roleByUser.get(row.user_id as string) ?? null,
  }));

  if (q) {
    const needle = q.toLowerCase();
    applications = applications.filter(
      (a) =>
        a.full_name.toLowerCase().includes(needle) ||
        a.instagram_username.toLowerCase().includes(needle) ||
        a.country.toLowerCase().includes(needle) ||
        (a.applicantEmail?.toLowerCase().includes(needle) ?? false),
    );
  }

  const counts = { pending: 0, approved: 0, rejected: 0 };
  for (const row of rows) {
    const s = row.status as keyof typeof counts;
    if (s in counts) counts[s] += 1;
  }

  return rbacApiJson({ ok: true, applications, counts });
}
