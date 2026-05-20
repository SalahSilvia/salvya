import type { NextRequest } from "next/server";
import { logAdminAudit } from "@/lib/admin/audit-log";
import { guardAdminMutation } from "@/lib/admin/admin-request-guard";
import {
  loadStoreSettings,
  saveStoreSettingsSection,
  type StoreSettingsBundle,
  type StoreSettingsSection,
} from "@/lib/admin/store-settings";
import { requireAdminService } from "@/lib/admin/require-admin-service";
import { rbacApiJsonWithAuthCookies } from "@/lib/auth/api-errors";

export async function GET(request: NextRequest) {
  const ctx = await requireAdminService(request);
  if (!ctx.ok) return ctx.response;
  try {
    const settings = await loadStoreSettings(ctx.service);
    return rbacApiJsonWithAuthCookies(ctx.authResponse, { ok: true, settings });
  } catch (e) {
    return rbacApiJsonWithAuthCookies(
      ctx.authResponse,
      { ok: false, error: e instanceof Error ? e.message : "settings_load_failed" },
      { status: 500 },
    );
  }
}

export async function PATCH(request: NextRequest) {
  const blocked = guardAdminMutation(request);
  if (blocked) return blocked;

  const ctx = await requireAdminService(request);
  if (!ctx.ok) return ctx.response;

  let body: { section?: keyof StoreSettingsBundle; value?: unknown };
  try {
    body = (await request.json()) as { section?: keyof StoreSettingsBundle; value?: unknown };
  } catch {
    return rbacApiJsonWithAuthCookies(ctx.authResponse, { ok: false, error: "invalid_json" }, { status: 400 });
  }

  const section = body.section as StoreSettingsSection | undefined;
  if (!section || !["platform", "payments", "shipping", "features", "notifications"].includes(section)) {
    return rbacApiJsonWithAuthCookies(ctx.authResponse, { ok: false, error: "invalid_section" }, { status: 400 });
  }
  if (!body.value || typeof body.value !== "object") {
    return rbacApiJsonWithAuthCookies(ctx.authResponse, { ok: false, error: "invalid_value" }, { status: 400 });
  }

  try {
    await saveStoreSettingsSection(
      ctx.service,
      section,
      body.value as StoreSettingsBundle[typeof section],
    );
    await logAdminAudit(ctx.service, {
      actorId: ctx.user.id,
      action: "settings.update",
      targetType: "store_settings",
      targetId: section,
    });
    const settings = await loadStoreSettings(ctx.service);
    return rbacApiJsonWithAuthCookies(ctx.authResponse, { ok: true, settings });
  } catch (e) {
    return rbacApiJsonWithAuthCookies(
      ctx.authResponse,
      { ok: false, error: e instanceof Error ? e.message : "settings_save_failed" },
      { status: 500 },
    );
  }
}
