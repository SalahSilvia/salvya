import type { SupabaseClient } from "@supabase/supabase-js";
import {
  ACCOUNT_STATUS_DEACTIVATED,
  DEACTIVATE_CONFIRM_PHRASE,
  DELETE_CONFIRM_PHRASE,
} from "@/lib/account/account-status";
import type { SalvyaRole } from "@/lib/auth/roles";

const DEACTIVATE_BAN_DURATION = "876000h";

export type AccountLifecycleAction = "deactivate" | "delete";

export function validateAccountLifecycleRequest(
  action: unknown,
  confirmPhrase: unknown,
  acknowledged: unknown,
): { ok: true; action: AccountLifecycleAction } | { ok: false; error: string } {
  if (action !== "deactivate" && action !== "delete") {
    return { ok: false, error: "invalid_action" };
  }
  if (acknowledged !== true) {
    return { ok: false, error: "acknowledgement_required" };
  }
  const expected = action === "delete" ? DELETE_CONFIRM_PHRASE : DEACTIVATE_CONFIRM_PHRASE;
  const phrase = typeof confirmPhrase === "string" ? confirmPhrase.trim() : "";
  if (phrase !== expected) {
    return { ok: false, error: "confirmation_mismatch" };
  }
  return { ok: true, action };
}

function protectedRoleMessage(role: SalvyaRole): string | null {
  if (role === "admin" || role === "god_admin") {
    return "Admin accounts cannot be deleted or deactivated from the storefront. Contact another administrator.";
  }
  return null;
}

export async function deactivateSalvyaAccount(
  service: SupabaseClient,
  userId: string,
  role: SalvyaRole,
): Promise<void> {
  const blocked = protectedRoleMessage(role);
  if (blocked) throw new Error(blocked);

  const { data: authData, error: readErr } = await service.auth.admin.getUserById(userId);
  if (readErr) throw new Error(readErr.message);
  if (!authData.user) throw new Error("user_not_found");

  const existingMeta = (authData.user.user_metadata ?? {}) as Record<string, unknown>;

  const { error: updateErr } = await service.auth.admin.updateUserById(userId, {
    ban_duration: DEACTIVATE_BAN_DURATION,
    user_metadata: {
      ...existingMeta,
      account_status: ACCOUNT_STATUS_DEACTIVATED,
      deactivated_at: new Date().toISOString(),
    },
  });
  if (updateErr) throw new Error(updateErr.message);

  try {
    await service.auth.admin.signOut(userId, "global");
  } catch {
    /* session revoke best-effort */
  }
}

export async function deleteSalvyaAccount(
  service: SupabaseClient,
  userId: string,
  role: SalvyaRole,
): Promise<void> {
  const blocked = protectedRoleMessage(role);
  if (blocked) throw new Error(blocked);

  const { error } = await service.auth.admin.deleteUser(userId);
  if (error) throw new Error(error.message);
}
