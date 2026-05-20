import type { SupabaseClient } from "@supabase/supabase-js";
import {
  buildCreatorCodeSeed,
  randomCreatorCodeSuffix,
  withCreatorCodeSuffix,
} from "@/lib/creator/generate-creator-code";
import type {
  CreatorApplicationInput,
  CreatorApplicationRow,
  CreatorApplicationStatus,
  CreatorProfileRow,
} from "@/lib/creator/types";

export async function loadCreatorApplicationByUserId(
  service: SupabaseClient,
  userId: string,
): Promise<CreatorApplicationRow | null> {
  const { data, error } = await service
    .from("creator_applications")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    if (error.code === "42P01" || error.message.includes("does not exist")) return null;
    throw new Error(error.message);
  }

  return (data as CreatorApplicationRow | null) ?? null;
}

export async function loadCreatorProfileByUserId(
  service: SupabaseClient,
  userId: string,
): Promise<CreatorProfileRow | null> {
  const { data, error } = await service
    .from("creator_profiles")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    if (error.code === "42P01" || error.message.includes("does not exist")) return null;
    throw new Error(error.message);
  }

  return (data as CreatorProfileRow | null) ?? null;
}

/** Prefer Phase 1 table; fall back to legacy influencer applications. */
export async function loadCreatorApplicationStatusForSession(
  service: SupabaseClient,
  userId: string,
): Promise<CreatorApplicationStatus | null> {
  const app = await loadCreatorApplicationByUserId(service, userId);
  if (app) return app.status;

  const { data: legacy } = await service
    .from("salvya_influencer_applications")
    .select("status")
    .eq("user_id", userId)
    .maybeSingle();

  const status = legacy?.status;
  if (status === "pending" || status === "approved" || status === "rejected") {
    return status === "approved" ? "approved" : status;
  }
  if (status === "suspended") return "rejected";

  return null;
}

export async function submitCreatorApplication(
  service: SupabaseClient,
  userId: string,
  input: CreatorApplicationInput,
): Promise<{ ok: true; application: CreatorApplicationRow } | { ok: false; error: string }> {
  const existing = await loadCreatorApplicationByUserId(service, userId);
  if (existing?.status === "pending") {
    return { ok: false, error: "You already have a pending application." };
  }
  if (existing?.status === "approved") {
    return { ok: false, error: "You are already an approved creator." };
  }

  const row = {
    user_id: userId,
    full_name: input.fullName,
    country: input.country,
    instagram_username: input.instagramUsername,
    instagram_link: input.instagramLink,
    followers_count: input.followersCount,
    niche: input.niche,
    message: input.message ?? null,
    status: "pending" as const,
  };

  if (existing?.status === "rejected") {
    const { data, error } = await service
      .from("creator_applications")
      .update(row)
      .eq("user_id", userId)
      .select("*")
      .single();

    if (error) return { ok: false, error: error.message };
    return { ok: true, application: data as CreatorApplicationRow };
  }

  const { data, error } = await service.from("creator_applications").insert(row).select("*").single();

  if (error) {
    if (error.code === "23505") {
      return { ok: false, error: "You already submitted an application." };
    }
    return { ok: false, error: error.message };
  }

  return { ok: true, application: data as CreatorApplicationRow };
}

export async function generateUniqueCreatorCode(
  service: SupabaseClient,
  fullName: string,
  niche: CreatorApplicationInput["niche"],
): Promise<string> {
  const seed = buildCreatorCodeSeed(fullName, niche);

  for (let attempt = 0; attempt < 12; attempt += 1) {
    const suffix = attempt === 0 ? randomCreatorCodeSuffix().slice(0, 1) : randomCreatorCodeSuffix();
    const candidate = withCreatorCodeSuffix(seed, suffix);

    const { data } = await service
      .from("creator_profiles")
      .select("id")
      .eq("creator_code", candidate)
      .maybeSingle();

    if (!data) return candidate;
  }

  return `${seed}${Date.now().toString(36).toUpperCase().slice(-4)}`.slice(0, 12);
}

export async function approveCreatorApplication(
  service: SupabaseClient,
  applicationId: string,
): Promise<
  | { ok: true; application: CreatorApplicationRow; creatorCode: string }
  | { ok: false; error: string }
> {
  const { data: app, error: loadErr } = await service
    .from("creator_applications")
    .select("*")
    .eq("id", applicationId)
    .maybeSingle();

  if (loadErr) return { ok: false, error: loadErr.message };
  if (!app) return { ok: false, error: "Application not found." };

  const application = app as CreatorApplicationRow;
  if (application.status === "approved") {
    const profile = await loadCreatorProfileByUserId(service, application.user_id);
    return {
      ok: true,
      application,
      creatorCode: profile?.creator_code ?? "",
    };
  }

  const creatorCode = await generateUniqueCreatorCode(
    service,
    application.full_name,
    application.niche,
  );

  const { error: profileErr } = await service.from("creator_profiles").upsert(
    {
      user_id: application.user_id,
      creator_code: creatorCode,
      status: "active",
    },
    { onConflict: "user_id" },
  );

  if (profileErr) return { ok: false, error: profileErr.message };

  const { error: appErr } = await service
    .from("creator_applications")
    .update({ status: "approved" })
    .eq("id", applicationId);

  if (appErr) return { ok: false, error: appErr.message };

  return { ok: true, application, creatorCode };
}

export async function rejectCreatorApplication(
  service: SupabaseClient,
  applicationId: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const { error } = await service
    .from("creator_applications")
    .update({ status: "rejected" })
    .eq("id", applicationId);

  if (error) return { ok: false, error: error.message };
  return { ok: true };
}
