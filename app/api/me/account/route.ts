import type { NextRequest } from "next/server";
import { rbacApiJsonWithAuthCookies } from "@/lib/auth/api-errors";
import { requireAuthenticated } from "@/lib/auth/require-role";
import {
  deactivateSalvyaAccount,
  deleteSalvyaAccount,
  validateAccountLifecycleRequest,
} from "@/lib/account/account-lifecycle";
import { createServiceSupabase } from "@/lib/supabase/service";

function errorMessage(code: string): string {
  switch (code) {
    case "acknowledgement_required":
      return "Please confirm that you understand this action cannot be undone.";
    case "confirmation_mismatch":
      return "Confirmation phrase does not match. Check spelling and try again.";
    case "invalid_action":
      return "Invalid request.";
    case "service_unavailable":
      return "Account changes are temporarily unavailable. Try again later.";
    default:
      return code;
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireAuthenticated(request);
  if (!auth.ok) return auth.response;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return rbacApiJsonWithAuthCookies(auth.response, { ok: false, error: "invalid_json" }, { status: 400 });
  }

  const o = body && typeof body === "object" ? (body as Record<string, unknown>) : {};
  const validated = validateAccountLifecycleRequest(o.action, o.confirmPhrase, o.acknowledged);
  if (!validated.ok) {
    return rbacApiJsonWithAuthCookies(
      auth.response,
      { ok: false, error: errorMessage(validated.error) },
      { status: 400 },
    );
  }

  const service = createServiceSupabase();
  if (!service) {
    return rbacApiJsonWithAuthCookies(
      auth.response,
      { ok: false, error: errorMessage("service_unavailable") },
      { status: 503 },
    );
  }

  try {
    if (validated.action === "deactivate") {
      await deactivateSalvyaAccount(service, auth.user.id, auth.user.role);
    } else {
      await deleteSalvyaAccount(service, auth.user.id, auth.user.role);
    }
    return rbacApiJsonWithAuthCookies(auth.response, { ok: true, action: validated.action });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "account_action_failed";
    const status =
      msg.includes("Admin accounts") || msg.includes("cannot be deleted") ? 403 : 500;
    return rbacApiJsonWithAuthCookies(auth.response, { ok: false, error: msg }, { status });
  }
}
