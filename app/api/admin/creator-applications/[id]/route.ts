import type { NextRequest } from "next/server";
import { logAdminAudit } from "@/lib/admin/audit-log";
import {
  approveCreatorApplication,
  rejectCreatorApplication,
} from "@/lib/creator/application-service";
import { rbacApiJson } from "@/lib/auth/api-errors";
import { requireAdminService } from "@/lib/admin/require-admin-service";
import { setUserRoleServer } from "@/lib/auth/set-user-role";

type RouteCtx = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, ctx: RouteCtx) {
  const admin = await requireAdminService(request);
  if (!admin.ok) return admin.response;

  const { id } = await ctx.params;

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return rbacApiJson({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  const action = String(body.action ?? "").trim();
  if (action !== "approve" && action !== "reject") {
    return rbacApiJson({ ok: false, error: "action must be approve or reject" }, { status: 400 });
  }

  if (action === "reject") {
    const result = await rejectCreatorApplication(admin.service, id);
    if (!result.ok) return rbacApiJson({ ok: false, error: result.error }, { status: 500 });

    const { data: app } = await admin.service
      .from("creator_applications")
      .select("user_id")
      .eq("id", id)
      .maybeSingle();

    if (app?.user_id) {
      await setUserRoleServer(app.user_id as string, "customer");
    }

    await logAdminAudit(admin.service, {
      actorId: admin.user.id,
      action: "creator_application.reject",
      targetType: "creator_application",
      targetId: id,
      metadata: {},
    });

    return rbacApiJson({ ok: true, status: "rejected" });
  }

  const approved = await approveCreatorApplication(admin.service, id);
  if (!approved.ok) return rbacApiJson({ ok: false, error: approved.error }, { status: 500 });

  const roleResult = await setUserRoleServer(approved.application.user_id, "influencer");
  if (!roleResult.ok) {
    return rbacApiJson({ ok: false, error: roleResult.message }, { status: 500 });
  }

  await logAdminAudit(admin.service, {
    actorId: admin.user.id,
    action: "creator_application.approve",
    targetType: "creator_application",
    targetId: id,
    metadata: {
      userId: approved.application.user_id,
      creatorCode: approved.creatorCode,
    },
  });

  return rbacApiJson({
    ok: true,
    status: "approved",
    creatorCode: approved.creatorCode,
  });
}
