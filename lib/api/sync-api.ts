import { NextResponse } from "next/server";

export type SyncApiErrorCode =
  | "unauthorized"
  | "forbidden"
  | "invalid_json"
  | "validation"
  | "not_configured"
  | "supabase"
  | "internal";

export type SyncApiErrorBody = {
  ok: false;
  error: { code: SyncApiErrorCode; message: string };
  synced: false;
};

export type SyncApiSuccessBody<T extends Record<string, unknown>> = {
  ok: true;
  synced: true;
} & T;

export function syncApiJson(
  body: SyncApiErrorBody | (Record<string, unknown> & { ok: boolean }),
  init?: ResponseInit,
): NextResponse {
  const res = NextResponse.json(body, init);
  res.headers.set("Cache-Control", "private, no-store");
  return res;
}

export function syncApiOk<T extends Record<string, unknown>>(
  payload: T,
  init?: ResponseInit,
): NextResponse {
  return syncApiJson({ ok: true, synced: true, ...payload }, init);
}

export function syncApiError(
  code: SyncApiErrorCode,
  message: string,
  status: number,
): NextResponse {
  return syncApiJson(
    { ok: false, error: { code, message }, synced: false },
    { status },
  );
}

export function syncApiUnauthorized(): NextResponse {
  return syncApiError("unauthorized", "Unauthorized", 401);
}

export function syncApiForbidden(): NextResponse {
  return syncApiError("forbidden", "Forbidden", 403);
}

export function syncApiNotConfigured(message: string): NextResponse {
  return syncApiError("not_configured", message, 503);
}

export function syncApiInvalidJson(): NextResponse {
  return syncApiError("invalid_json", "Invalid JSON", 400);
}

export function syncApiSupabaseError(message: string): NextResponse {
  return syncApiError("supabase", message, 500);
}

export function syncApiInternalError(message: string): NextResponse {
  return syncApiError("internal", message, 500);
}

/** Guest-safe empty payload when Supabase env is missing (dev without .env). */
export function syncApiUnconfiguredGet<T extends Record<string, unknown>>(empty: T): NextResponse {
  return syncApiJson({
    ok: true,
    synced: false,
    ...empty,
    updatedAt: null,
  });
}
