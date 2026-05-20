import type { SalvyaRole } from "@/lib/auth/roles";
import type { AdminUserPreferences } from "@/lib/admin/admin-preferences";

/** Admin-edited name in preferences wins over stale auth metadata. */
export function resolveAdminDisplayName(
  preferences: AdminUserPreferences,
  meta: Record<string, unknown>,
): string {
  const fromPrefs = preferences.displayName.trim();
  if (fromPrefs) return fromPrefs;
  if (typeof meta.display_name === "string") {
    const fromMeta = meta.display_name.trim();
    if (fromMeta) return fromMeta;
  }
  if (typeof meta.full_name === "string") {
    const fromFull = meta.full_name.trim();
    if (fromFull) return fromFull;
  }
  return "";
}

/** Shape returned by GET/PATCH `/api/admin/me`. */
export type AdminMeUser = {
  id: string;
  email: string | null;
  role: SalvyaRole;
  roleLabel: string;
  isGodAdmin: boolean;
  isAdminCapable: boolean;
  displayName: string;
  createdAt: string | null;
  lastSignInAt: string | null;
  emailConfirmedAt: string | null;
};

export type AdminMeResponse = {
  ok?: boolean;
  error?: string;
  user?: AdminMeUser;
  preferences?: AdminUserPreferences;
};
