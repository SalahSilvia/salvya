import type { SupabaseClient } from "@supabase/supabase-js";

export type AdminUserPreferences = {
  displayName: string;
  notifyNewOrders: boolean;
  notifyInfluencerApplications: boolean;
  notifyLowStock: boolean;
  compactNav: boolean;
  /** ISO timestamp — orders created after this count as unread in admin nav. */
  ordersLastSeenAt: string | null;
};

export const DEFAULT_ADMIN_PREFERENCES: AdminUserPreferences = {
  displayName: "",
  notifyNewOrders: true,
  notifyInfluencerApplications: true,
  notifyLowStock: true,
  compactNav: false,
  ordersLastSeenAt: null,
};

const PREFS_KEY = "admin_preferences";

type PrefsMap = Record<string, Partial<AdminUserPreferences>>;

function mergePrefs(partial?: Partial<AdminUserPreferences>): AdminUserPreferences {
  return { ...DEFAULT_ADMIN_PREFERENCES, ...partial };
}

export async function loadAdminPreferences(
  service: SupabaseClient,
  userId: string,
): Promise<AdminUserPreferences> {
  const { data, error } = await service.from("store_settings").select("value").eq("key", PREFS_KEY).maybeSingle();
  if (error) {
    if (error.code === "42P01" || error.message.includes("does not exist")) {
      return { ...DEFAULT_ADMIN_PREFERENCES };
    }
    throw new Error(error.message);
  }
  const map = (data?.value && typeof data.value === "object" ? data.value : {}) as PrefsMap;
  return mergePrefs(map[userId]);
}

export async function saveAdminPreferences(
  service: SupabaseClient,
  userId: string,
  patch: Partial<AdminUserPreferences>,
): Promise<AdminUserPreferences> {
  const { data, error: loadErr } = await service.from("store_settings").select("value").eq("key", PREFS_KEY).maybeSingle();
  if (loadErr && loadErr.code !== "42P01" && !loadErr.message.includes("does not exist")) {
    throw new Error(loadErr.message);
  }
  const map = (data?.value && typeof data.value === "object" ? data.value : {}) as PrefsMap;
  const next = mergePrefs({ ...map[userId], ...patch });
  map[userId] = next;
  const { error } = await service.from("store_settings").upsert({ key: PREFS_KEY, value: map }, { onConflict: "key" });
  if (error) throw new Error(error.message);
  return next;
}
