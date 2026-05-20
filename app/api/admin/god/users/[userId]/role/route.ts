import type { NextRequest } from "next/server";
import { logAdminAudit } from "@/lib/admin/audit-log";
import { guardAdminMutation } from "@/lib/admin/admin-request-guard";
import { requireGodAdminService } from "@/lib/admin/require-god-admin-service";
import { rbacApiJson } from "@/lib/auth/api-errors";
import { normalizeSalvyaRole, type SalvyaRole } from "@/lib/auth/roles";
import { setUserRoleServer } from "@/lib/auth/set-user-role";

type RouteCtx = { params: Promise<{ userId: string }> };

export async function PATCH(request: NextRequest, ctx: RouteCtx) {
  const blocked = guardAdminMutation(request);
  if (blocked) return blocked;

  const god = await requireGodAdminService(request);
  if (!god.ok) return god.response;

  const { userId } = await ctx.params;

  let body: { role?: string };
  try {
    body = (await request.json()) as { role?: string };
  } catch {
    return rbacApiJson({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  const nextRole = normalizeSalvyaRole(body.role);
  if (!nextRole) {
    return rbacApiJson({ ok: false, error: "invalid_role" }, { status: 400 });
  }

  if (userId === god.user.id && nextRole !== "god_admin") {
    return rbacApiJson({ ok: false, error: "Cannot demote your own God Admin account" }, { status: 400 });
  }

  const result = await setUserRoleServer(userId, nextRole as SalvyaRole);
  if (!result.ok) {
    return rbacApiJson({ ok: false, error: result.message }, { status: 500 });
  }

  await logAdminAudit(god.service, {
    actorId: god.user.id,
    action: "god.role_change",
    targetType: "user",
    targetId: userId,
    metadata: { role: nextRole },
  });

  return rbacApiJson({ ok: true, userId, role: nextRole });
}
