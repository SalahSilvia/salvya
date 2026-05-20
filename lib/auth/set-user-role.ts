import { normalizeSalvyaRole, type SalvyaRole } from "@/lib/auth/roles";
import { createServiceSupabase } from "@/lib/supabase/service";

/**
 * Server-controlled role changes only (service role).
 * Call from protected admin APIs — never from the client.
 */
export async function setUserRoleServer(
  userId: string,
  role: SalvyaRole,
): Promise<{ ok: true } | { ok: false; message: string }> {
  const service = createServiceSupabase();
  if (!service) {
    return { ok: false, message: "Supabase service role not configured" };
  }

  const normalized = normalizeSalvyaRole(role);
  if (!normalized) {
    return { ok: false, message: "Invalid role" };
  }

  const { error: dbError } = await service.from("user_profiles").upsert(
    {
      user_id: userId,
      role: normalized,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" },
  );

  if (dbError) {
    return { ok: false, message: dbError.message };
  }

  const { error: metaError } = await service.auth.admin.updateUserById(userId, {
    app_metadata: { salvya_role: normalized },
  });

  if (metaError) {
    return { ok: false, message: metaError.message };
  }

  return { ok: true };
}
