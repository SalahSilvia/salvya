import type { NextRequest } from "next/server";
import {
  loadCreatorApplicationByUserId,
  loadCreatorProfileByUserId,
  submitCreatorApplication,
} from "@/lib/creator/application-service";
import { validateCreatorApplicationInput } from "@/lib/creator/application-validation";
import { rbacApiJson, rbacApiNotConfigured } from "@/lib/auth/api-errors";
import { requireAuthenticated } from "@/lib/auth/require-role";
import { createServiceSupabase } from "@/lib/supabase/service";

/** Applicant reads own application + profile code (authenticated). */
export async function GET(request: NextRequest) {
  const auth = await requireAuthenticated(request);
  if (!auth.ok) return auth.response;

  const service = createServiceSupabase();
  if (!service) return rbacApiNotConfigured("Supabase service role not configured");

  try {
    const [application, profile] = await Promise.all([
      loadCreatorApplicationByUserId(service, auth.user.id),
      loadCreatorProfileByUserId(service, auth.user.id),
    ]);

    return rbacApiJson({
      ok: true,
      application,
      profile,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to load application";
    return rbacApiJson({ ok: false, error: message }, { status: 500 });
  }
}

/** Submit creator application (customer role, pending). */
export async function POST(request: NextRequest) {
  const auth = await requireAuthenticated(request);
  if (!auth.ok) return auth.response;

  if (auth.user.role !== "customer") {
    return rbacApiJson({ ok: false, error: "Only customer accounts can apply." }, { status: 403 });
  }

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return rbacApiJson({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = validateCreatorApplicationInput(body);
  if (!parsed.ok) return rbacApiJson({ ok: false, error: parsed.error }, { status: 400 });

  const service = createServiceSupabase();
  if (!service) return rbacApiNotConfigured("Supabase service role not configured");

  const result = await submitCreatorApplication(service, auth.user.id, parsed.data);
  if (!result.ok) {
    const status = result.error.includes("pending") ? 409 : 400;
    return rbacApiJson({ ok: false, error: result.error }, { status });
  }

  return rbacApiJson({ ok: true, application: result.application });
}
