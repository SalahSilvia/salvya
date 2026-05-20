import type { SyncApiErrorBody } from "@/lib/api/sync-api";

export type SyncFetchFailureReason = "auth" | "network" | "client" | "server";

export type SyncFetchResult<T> =
  | { ok: true; data: T; updatedAt: string | null }
  | { ok: false; reason: SyncFetchFailureReason; message?: string };

const RETRYABLE_STATUS = new Set([408, 425, 429, 500, 502, 503, 504]);
const MAX_ATTEMPTS = 3;
const BASE_DELAY_MS = 280;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isRetryableStatus(status: number): boolean {
  return RETRYABLE_STATUS.has(status);
}

function parseErrorMessage(json: unknown): string | undefined {
  if (!json || typeof json !== "object") return undefined;
  const body = json as SyncApiErrorBody & { error?: string | { message?: string } };
  if (body.ok === false && body.error && typeof body.error === "object" && "message" in body.error) {
    return String(body.error.message);
  }
  if (typeof body.error === "string") return body.error;
  return undefined;
}

export type SyncRemoteRequestOptions = {
  method: "GET" | "PUT" | "DELETE";
  path: string;
  body?: unknown;
  /** When true, 401 is auth failure; when false, treated as unauthenticated guest. */
  requireAuth?: boolean;
};

/**
 * Fetch a Salvya account-sync API with retries on transient failures.
 * Never throws — callers treat `ok: false` as "keep local truth".
 */
export async function syncRemoteRequest<T extends Record<string, unknown>>(
  options: SyncRemoteRequestOptions,
): Promise<SyncFetchResult<T>> {
  const { method, path, body, requireAuth = true } = options;

  let lastReason: SyncFetchFailureReason = "network";
  let lastMessage: string | undefined;

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    if (attempt > 0) {
      await sleep(BASE_DELAY_MS * 2 ** (attempt - 1));
    }

    try {
      const res = await fetch(path, {
        method,
        credentials: "include",
        headers: body !== undefined ? { "Content-Type": "application/json" } : undefined,
        body: body !== undefined ? JSON.stringify(body) : undefined,
      });

      if (res.status === 401) {
        return { ok: false, reason: "auth" };
      }

      let json: unknown;
      try {
        json = await res.json();
      } catch {
        lastReason = "client";
        lastMessage = "Invalid response";
        if (!isRetryableStatus(res.status) || attempt === MAX_ATTEMPTS - 1) {
          return { ok: false, reason: lastReason, message: lastMessage };
        }
        continue;
      }

      if (!res.ok) {
        lastReason = res.status >= 500 ? "server" : "client";
        lastMessage = parseErrorMessage(json);
        if (isRetryableStatus(res.status) && attempt < MAX_ATTEMPTS - 1) continue;
        return { ok: false, reason: lastReason, message: lastMessage };
      }

      const record = json as { ok?: boolean; updatedAt?: string | null };
      if (record.ok === false) {
        lastReason = "server";
        lastMessage = parseErrorMessage(json);
        if (attempt < MAX_ATTEMPTS - 1) continue;
        return { ok: false, reason: lastReason, message: lastMessage };
      }

      const updatedAt =
        typeof record.updatedAt === "string" ? record.updatedAt : record.updatedAt ?? null;

      return { ok: true, data: record as T, updatedAt };
    } catch {
      lastReason = "network";
      lastMessage = "Network unavailable";
      if (attempt < MAX_ATTEMPTS - 1) continue;
    }
  }

  return { ok: false, reason: lastReason, message: lastMessage };
}
