import type { User } from "@supabase/supabase-js";
import type { NextRequest } from "next/server";
import type { NextResponse } from "next/server";
import { normalizeSalvyaRole, type AuthenticatedSalvyaUser, type SalvyaRole } from "@/lib/auth/roles";
import { createAppServerSupabase, isAppServerSupabaseConfigured } from "@/lib/supabase/server-app";
import { createServerSupabase, getSsrEnv } from "@/lib/supabase/server-ssr";
import { createServiceSupabase } from "@/lib/supabase/service";

type ProfileRow = { role: string };

/**
 * Trusted role lookup from Postgres (service role).
 * Never read role from client state or user_metadata alone.
 */
export async function getUserRoleById(userId: string): Promise<SalvyaRole | null> {
  const service = createServiceSupabase();
  if (!service) return null;

  const { data, error } = await service
    .from("user_profiles")
    .select("role")
    .eq("user_id", userId)
    .maybeSingle<ProfileRow>();

  if (error) return null;

  const normalized = normalizeSalvyaRole(data?.role);
  if (normalized) return normalized;

  return ensureUserProfile(userId);
}

/** Backfill profile for users created before RBAC migration. */
async function ensureUserProfile(userId: string): Promise<SalvyaRole> {
  const service = createServiceSupabase();
  if (!service) return "customer";

  const { data: authUser } = await service.auth.admin.getUserById(userId);
  const metaRole = normalizeSalvyaRole(authUser.user?.user_metadata?.salvya_role) ?? "customer";
  const role: SalvyaRole =
    metaRole === "admin" || metaRole === "god_admin" ? "customer" : metaRole;

  await service.from("user_profiles").upsert(
    { user_id: userId, role, updated_at: new Date().toISOString() },
    { onConflict: "user_id" },
  );

  return role;
}

export async function getAuthenticatedUserFromRequest(
  request: NextRequest,
  response: NextResponse,
): Promise<User | null> {
  if (!getSsrEnv()) return null;

  try {
    const supabase = createServerSupabase(request, response);
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();
    if (error || !user) return null;
    return user;
  } catch {
    return null;
  }
}

/** Route Handler / middleware: session user + DB role. */
export async function getAuthenticatedSalvyaUser(
  request: NextRequest,
  response: NextResponse,
): Promise<AuthenticatedSalvyaUser | null> {
  const user = await getAuthenticatedUserFromRequest(request, response);
  if (!user) return null;

  const role = await getUserRoleById(user.id);
  if (!role) return null;

  return { id: user.id, email: user.email, role };
}

/** Server Component: session user + DB role. */
export async function getServerSalvyaUser(): Promise<AuthenticatedSalvyaUser | null> {
  if (!isAppServerSupabaseConfigured()) return null;

  try {
    const supabase = await createAppServerSupabase();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();
    if (error || !user) return null;

    const role = await getUserRoleById(user.id);
    if (!role) return null;

    return { id: user.id, email: user.email, role };
  } catch {
    return null;
  }
}
