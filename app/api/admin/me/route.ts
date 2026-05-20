import type { NextRequest } from "next/server";
import { logAdminAudit } from "@/lib/admin/audit-log";
import { resolveAdminDisplayName } from "@/lib/admin/admin-me";
import { loadAdminPreferences, saveAdminPreferences, type AdminUserPreferences } from "@/lib/admin/admin-preferences";
import { requireAdminService } from "@/lib/admin/require-admin-service";
import { saveUserProfileDetails } from "@/lib/profile/profile-service";
import { rbacApiJson, rbacApiJsonWithAuthCookies } from "@/lib/auth/api-errors";
import { isAdminCapable, isGodAdmin, roleLabel } from "@/lib/auth/roles";

export async function GET(request: NextRequest) {
  const ctx = await requireAdminService(request);
  if (!ctx.ok) return ctx.response;

  try {
    const preferences = await loadAdminPreferences(ctx.service, ctx.user.id);
    const { data: authData, error: authErr } = await ctx.service.auth.admin.getUserById(ctx.user.id);

    if (authErr) {
      return rbacApiJsonWithAuthCookies(
        ctx.authResponse,
        { ok: false, error: authErr.message },
        { status: 500 },
      );
    }

    const meta = (authData.user?.user_metadata ?? {}) as Record<string, unknown>;
    const displayName = resolveAdminDisplayName(preferences, meta);

    return rbacApiJsonWithAuthCookies(ctx.authResponse, {
      ok: true,
      user: {
        id: ctx.user.id,
        email: ctx.user.email ?? authData.user?.email ?? null,
        role: ctx.user.role,
        roleLabel: roleLabel(ctx.user.role),
        isGodAdmin: isGodAdmin(ctx.user.role),
        isAdminCapable: isAdminCapable(ctx.user.role),
        displayName,
        createdAt: authData.user?.created_at ?? null,
        lastSignInAt: authData.user?.last_sign_in_at ?? null,
        emailConfirmedAt: authData.user?.email_confirmed_at ?? null,
      },
      preferences,
    });
  } catch (e) {
    return rbacApiJsonWithAuthCookies(
      ctx.authResponse,
      { ok: false, error: e instanceof Error ? e.message : "profile_load_failed" },
      { status: 500 },
    );
  }
}

export async function PATCH(request: NextRequest) {
  const ctx = await requireAdminService(request);
  if (!ctx.ok) return ctx.response;

  let body: { displayName?: string; preferences?: Partial<AdminUserPreferences> };
  try {
    body = (await request.json()) as { displayName?: string; preferences?: Partial<AdminUserPreferences> };
  } catch {
    return rbacApiJsonWithAuthCookies(ctx.authResponse, { ok: false, error: "invalid_json" }, { status: 400 });
  }

  try {
    let preferences = await loadAdminPreferences(ctx.service, ctx.user.id);

    if (body.preferences && typeof body.preferences === "object") {
      preferences = await saveAdminPreferences(ctx.service, ctx.user.id, body.preferences);
    }

    if (typeof body.displayName === "string") {
      const displayName = body.displayName.trim().slice(0, 80);
      preferences = await saveAdminPreferences(ctx.service, ctx.user.id, { displayName });
      await saveUserProfileDetails(ctx.service, ctx.user.id, { displayName });
      await logAdminAudit(ctx.service, {
        actorId: ctx.user.id,
        action: "profile.update",
        targetType: "user",
        targetId: ctx.user.id,
        metadata: { displayName },
      });
    }

    if (body.preferences && typeof body.preferences === "object") {
      await logAdminAudit(ctx.service, {
        actorId: ctx.user.id,
        action: "settings.update",
        targetType: "admin_preferences",
        targetId: ctx.user.id,
      });
    }

    const { data: authData } = await ctx.service.auth.admin.getUserById(ctx.user.id);
    const meta = (authData.user?.user_metadata ?? {}) as Record<string, unknown>;

    return rbacApiJsonWithAuthCookies(ctx.authResponse, {
      ok: true,
      user: {
        id: ctx.user.id,
        email: ctx.user.email ?? authData.user?.email ?? null,
        role: ctx.user.role,
        roleLabel: roleLabel(ctx.user.role),
        isGodAdmin: isGodAdmin(ctx.user.role),
        isAdminCapable: isAdminCapable(ctx.user.role),
        displayName: resolveAdminDisplayName(preferences, meta),
        createdAt: authData.user?.created_at ?? null,
        lastSignInAt: authData.user?.last_sign_in_at ?? null,
        emailConfirmedAt: authData.user?.email_confirmed_at ?? null,
      },
      preferences,
    });
  } catch (e) {
    return rbacApiJsonWithAuthCookies(
      ctx.authResponse,
      { ok: false, error: e instanceof Error ? e.message : "profile_save_failed" },
      { status: 500 },
    );
  }
}
