import type { NextRequest } from "next/server";
import { rbacApiJson, rbacApiJsonWithAuthCookies } from "@/lib/auth/api-errors";
import { requireAuthenticated } from "@/lib/auth/require-role";
import {
  loadUserProfileDetails,
  profileFromAuthMetadata,
  saveUserProfileDetails,
} from "@/lib/profile/profile-service";
import type { SalvyaProfileDetails } from "@/lib/profile/types";
import { createServiceSupabase } from "@/lib/supabase/service";

async function loadWithAuthFallback(userId: string): Promise<SalvyaProfileDetails> {
  const service = createServiceSupabase();
  if (!service) throw new Error("service_unavailable");

  let profile = await loadUserProfileDetails(service, userId);
  const { data: authData } = await service.auth.admin.getUserById(userId);
  const meta = (authData.user?.user_metadata ?? {}) as Record<string, unknown>;
  const fromAuth = profileFromAuthMetadata(meta);

  const hasContent =
    profile.displayName ||
    profile.username ||
    profile.bio ||
    profile.phone ||
    profile.country ||
    profile.avatarUrl ||
    profile.coverUrl;

  if (!hasContent) {
    if (fromAuth.displayName || fromAuth.avatarUrl || fromAuth.phone || fromAuth.country) {
      profile = { ...profile, ...fromAuth };
    }
  } else {
    profile = {
      ...profile,
      displayName: profile.displayName || fromAuth.displayName || "",
      phone: profile.phone || fromAuth.phone || "",
      country: profile.country || fromAuth.country || "",
      avatarUrl: profile.avatarUrl ?? fromAuth.avatarUrl ?? null,
    };
  }

  return profile;
}

export async function GET(request: NextRequest) {
  const auth = await requireAuthenticated(request);
  if (!auth.ok) return auth.response;

  const service = createServiceSupabase();
  if (!service) {
    return rbacApiJsonWithAuthCookies(auth.response, { ok: false, error: "service_unavailable" }, { status: 503 });
  }

  try {
    const profile = await loadWithAuthFallback(auth.user.id);
    return rbacApiJsonWithAuthCookies(auth.response, { ok: true, profile });
  } catch (e) {
    return rbacApiJsonWithAuthCookies(
      auth.response,
      { ok: false, error: e instanceof Error ? e.message : "profile_load_failed" },
      { status: 500 },
    );
  }
}

export async function PATCH(request: NextRequest) {
  const auth = await requireAuthenticated(request);
  if (!auth.ok) return auth.response;

  let body: Partial<SalvyaProfileDetails>;
  try {
    body = (await request.json()) as Partial<SalvyaProfileDetails>;
  } catch {
    return rbacApiJsonWithAuthCookies(auth.response, { ok: false, error: "invalid_json" }, { status: 400 });
  }

  const service = createServiceSupabase();
  if (!service) {
    return rbacApiJsonWithAuthCookies(auth.response, { ok: false, error: "service_unavailable" }, { status: 503 });
  }

  try {
    const profile = await saveUserProfileDetails(service, auth.user.id, body);
    return rbacApiJsonWithAuthCookies(auth.response, { ok: true, profile });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "profile_save_failed";
    const status = msg === "profile_too_large" ? 413 : 500;
    return rbacApiJsonWithAuthCookies(auth.response, { ok: false, error: msg }, { status });
  }
}
