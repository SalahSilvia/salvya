import type { NextRequest } from "next/server";
import type { NextResponse } from "next/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import { rbacApiNotConfigured } from "@/lib/auth/api-errors";
import { requireRole } from "@/lib/auth/require-role";
import { ADMIN_CAPABLE_ROLES, type AuthenticatedSalvyaUser } from "@/lib/auth/roles";
import { guardAdminMutation } from "@/lib/admin/admin-request-guard";
import { createServiceSupabase } from "@/lib/supabase/service";

export type AdminServiceContext =
  | { ok: true; user: AuthenticatedSalvyaUser; service: SupabaseClient; authResponse: NextResponse }
  | { ok: false; response: NextResponse };

/**
 * Admin Route Handler guard + Supabase service client (bypasses RLS for operational queries).
 * Always pair with requireRole — never trust client role hints.
 */
export async function requireAdminService(request: NextRequest): Promise<AdminServiceContext> {
  const blocked = guardAdminMutation(request);
  if (blocked) return { ok: false, response: blocked };

  const auth = await requireRole(request, ADMIN_CAPABLE_ROLES);
  if (!auth.ok) return { ok: false, response: auth.response };

  const service = createServiceSupabase();
  if (!service) {
    return { ok: false, response: rbacApiNotConfigured("Supabase service role not configured") };
  }

  return { ok: true, user: auth.user, service, authResponse: auth.response };
}
