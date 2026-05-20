import type { NextRequest } from "next/server";
import type { NextResponse } from "next/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import { rbacApiNotConfigured } from "@/lib/auth/api-errors";
import { requireRole } from "@/lib/auth/require-role";
import type { AuthenticatedSalvyaUser } from "@/lib/auth/roles";
import { GOD_ADMIN_ROLE } from "@/lib/auth/roles";
import { createServiceSupabase } from "@/lib/supabase/service";

export type GodAdminServiceContext =
  | { ok: true; user: AuthenticatedSalvyaUser; service: SupabaseClient; authResponse: NextResponse }
  | { ok: false; response: NextResponse };

/** God Admin only — role changes, full user directory, system secrets view. */
export async function requireGodAdminService(request: NextRequest): Promise<GodAdminServiceContext> {
  const auth = await requireRole(request, [GOD_ADMIN_ROLE]);
  if (!auth.ok) return { ok: false, response: auth.response };

  const service = createServiceSupabase();
  if (!service) {
    return { ok: false, response: rbacApiNotConfigured("Supabase service role not configured") };
  }

  return { ok: true, user: auth.user, service, authResponse: auth.response };
}
