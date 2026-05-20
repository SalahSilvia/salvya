import type { AuthenticatedSalvyaUser } from "@/lib/auth/roles";
import { buildSessionPayload, type SalvyaSessionPayload } from "@/lib/auth/session-payload";
import {
  loadUserProfileDetails,
  profileFromAuthMetadata,
} from "@/lib/profile/profile-service";
import { createServiceSupabase } from "@/lib/supabase/service";

/** Trusted session + profile for API responses (service role). */
export async function loadSessionForUser(user: AuthenticatedSalvyaUser): Promise<SalvyaSessionPayload> {
  const service = createServiceSupabase();
  if (!service) throw new Error("service_unavailable");

  const { data: authData, error: authErr } = await service.auth.admin.getUserById(user.id);
  if (authErr) throw new Error(authErr.message);

  const email = user.email ?? authData.user?.email ?? null;
  const meta = (authData.user?.user_metadata ?? {}) as Record<string, unknown>;

  let profile = await loadUserProfileDetails(service, user.id);
  const fromAuth = profileFromAuthMetadata(meta);
  if (!profile.displayName && fromAuth.displayName) {
    profile = { ...profile, displayName: fromAuth.displayName };
  }
  if (!profile.avatarUrl && fromAuth.avatarUrl) {
    profile = { ...profile, avatarUrl: fromAuth.avatarUrl ?? null };
  }

  const displayName =
    profile.displayName ||
    (typeof meta.display_name === "string" ? meta.display_name : "") ||
    (typeof meta.full_name === "string" ? meta.full_name : "") ||
    (email ? email.split("@")[0] : "");

  let applicationStatus: "pending" | "approved" | "rejected" | "suspended" | null = null;
  const { loadCreatorApplicationStatusForSession } = await import("@/lib/creator/application-service");
  const phase1Status = await loadCreatorApplicationStatusForSession(service, user.id);
  if (phase1Status) {
    applicationStatus = phase1Status;
  } else {
    const { data: appRow } = await service
      .from("salvya_influencer_applications")
      .select("status")
      .eq("user_id", user.id)
      .maybeSingle();

    if (
      appRow?.status === "pending" ||
      appRow?.status === "approved" ||
      appRow?.status === "rejected" ||
      appRow?.status === "suspended"
    ) {
      applicationStatus = appRow.status;
    }
  }

  return buildSessionPayload(user, email, displayName, profile, applicationStatus);
}
