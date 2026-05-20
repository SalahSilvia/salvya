import type { SupabaseClient } from "@supabase/supabase-js";
import {
  EMPTY_PROFILE_DETAILS,
  MAX_PROFILE_JSON_BYTES,
  type SalvyaProfileDetails,
} from "@/lib/profile/types";

type ProfileRow = { profile: unknown };

function isMissingProfileColumn(error: { code?: string; message?: string }): boolean {
  const msg = error.message ?? "";
  return (
    error.code === "42703" ||
    error.code === "PGRST204" ||
    msg.includes("column") && msg.includes("profile") ||
    msg.includes("'profile'")
  );
}

async function syncAuthProfileMetadata(
  service: SupabaseClient,
  userId: string,
  next: SalvyaProfileDetails,
): Promise<void> {
  const displayName = next.displayName || null;
  const { error: metaErr } = await service.auth.admin.updateUserById(userId, {
    user_metadata: {
      display_name: displayName,
      full_name: displayName,
      avatar_url: next.avatarUrl,
      phone: next.phone || null,
      country: next.country || null,
    },
  });
  if (metaErr) throw new Error(metaErr.message);
}

async function ensureUserProfileRow(service: SupabaseClient, userId: string): Promise<void> {
  const { data } = await service.from("user_profiles").select("user_id").eq("user_id", userId).maybeSingle();
  if (data?.user_id) return;

  const { data: authData } = await service.auth.admin.getUserById(userId);
  const metaRole = authData.user?.user_metadata?.salvya_role;
  const role = metaRole === "influencer" || metaRole === "creator" ? "influencer" : "customer";

  const { error } = await service.from("user_profiles").insert({
    user_id: userId,
    role,
    profile: {},
    updated_at: new Date().toISOString(),
  });
  if (error && error.code !== "23505") throw new Error(error.message);
}

function trimStr(v: unknown, max: number): string {
  return typeof v === "string" ? v.trim().slice(0, max) : "";
}

function trimUrl(v: unknown, max: number): string | null {
  if (v === null || v === undefined || v === "") return null;
  if (typeof v !== "string") return null;
  const s = v.trim();
  if (!s) return null;
  return s.slice(0, max);
}

export function parseProfileDetails(raw: unknown): SalvyaProfileDetails {
  if (!raw || typeof raw !== "object") return { ...EMPTY_PROFILE_DETAILS };
  const o = raw as Record<string, unknown>;
  return {
    displayName: trimStr(o.displayName, 80),
    username: trimStr(o.username, 32).replace(/^@/, ""),
    bio: trimStr(o.bio, 280),
    phone: trimStr(o.phone, 32),
    country: trimStr(o.country, 8).toUpperCase(),
    avatarUrl: trimUrl(o.avatarUrl, 512_000),
    coverUrl: trimUrl(o.coverUrl, 512_000),
  };
}

export function mergeProfileDetails(
  current: SalvyaProfileDetails,
  patch: Partial<SalvyaProfileDetails>,
): SalvyaProfileDetails {
  return {
    displayName: patch.displayName !== undefined ? trimStr(patch.displayName, 80) : current.displayName,
    username: patch.username !== undefined ? trimStr(patch.username, 32).replace(/^@/, "") : current.username,
    bio: patch.bio !== undefined ? trimStr(patch.bio, 280) : current.bio,
    phone: patch.phone !== undefined ? trimStr(patch.phone, 32) : current.phone,
    country: patch.country !== undefined ? trimStr(patch.country, 8).toUpperCase() : current.country,
    avatarUrl: patch.avatarUrl !== undefined ? trimUrl(patch.avatarUrl, 512_000) : current.avatarUrl,
    coverUrl: patch.coverUrl !== undefined ? trimUrl(patch.coverUrl, 512_000) : current.coverUrl,
  };
}

function assertProfileSize(details: SalvyaProfileDetails): void {
  const bytes = new TextEncoder().encode(JSON.stringify(details)).length;
  if (bytes > MAX_PROFILE_JSON_BYTES) {
    throw new Error("profile_too_large");
  }
}

export async function loadUserProfileDetails(
  service: SupabaseClient,
  userId: string,
): Promise<SalvyaProfileDetails> {
  const { data, error } = await service
    .from("user_profiles")
    .select("profile")
    .eq("user_id", userId)
    .maybeSingle<ProfileRow>();

  if (error) {
    if (error.code === "42P01" || error.message.includes("does not exist") || isMissingProfileColumn(error)) {
      return { ...EMPTY_PROFILE_DETAILS };
    }
    throw new Error(error.message);
  }

  return parseProfileDetails(data?.profile);
}

export async function saveUserProfileDetails(
  service: SupabaseClient,
  userId: string,
  patch: Partial<SalvyaProfileDetails>,
): Promise<SalvyaProfileDetails> {
  await ensureUserProfileRow(service, userId);
  const current = await loadUserProfileDetails(service, userId);
  const next = mergeProfileDetails(current, patch);
  assertProfileSize(next);

  const rowPatch: Record<string, unknown> = {
    profile: next,
    updated_at: new Date().toISOString(),
  };
  if (patch.country !== undefined) {
    rowPatch.country = next.country || null;
  }

  const { error } = await service.from("user_profiles").update(rowPatch).eq("user_id", userId);

  if (error) {
    if (isMissingProfileColumn(error) || error.code === "42P01") {
      await syncAuthProfileMetadata(service, userId, next);
      return next;
    }
    throw new Error(error.message);
  }

  await syncAuthProfileMetadata(service, userId, next);
  return next;
}

/** Merge auth metadata when profile json is empty (legacy users). */
export function profileFromAuthMetadata(meta: Record<string, unknown> | undefined): Partial<SalvyaProfileDetails> {
  if (!meta) return {};
  const displayName =
    typeof meta.display_name === "string"
      ? meta.display_name
      : typeof meta.full_name === "string"
        ? meta.full_name
        : "";
  const avatarUrl = typeof meta.avatar_url === "string" ? meta.avatar_url : null;
  const phone = typeof meta.phone === "string" ? meta.phone : "";
  const country = typeof meta.country === "string" ? meta.country : "";
  return { displayName, avatarUrl, phone, country };
}
