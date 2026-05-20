import { sanitizeCartLines } from "@/lib/cart/validate";
import type { CartLine } from "@/lib/cart/types";
import { syncRemoteRequest } from "@/lib/sync/remote-request";

export type RemoteCartResponse = {
  lines: CartLine[];
  updatedAt: string | null;
};

function toPayload(result: { lines?: unknown; updatedAt?: string | null }): RemoteCartResponse {
  return {
    lines: sanitizeCartLines(result.lines),
    updatedAt: typeof result.updatedAt === "string" ? result.updatedAt : null,
  };
}

export async function fetchRemoteCart(): Promise<RemoteCartResponse | null> {
  const result = await syncRemoteRequest<{ lines?: unknown; updatedAt?: string | null }>({
    method: "GET",
    path: "/api/cart",
  });
  if (!result.ok) return null;
  return toPayload(result.data);
}

export async function pushRemoteCart(lines: CartLine[]): Promise<RemoteCartResponse | null> {
  const result = await syncRemoteRequest<{ lines?: unknown; updatedAt?: string | null }>({
    method: "PUT",
    path: "/api/cart",
    body: { lines },
  });
  if (!result.ok) return null;
  return toPayload(result.data);
}

export async function clearRemoteCart(): Promise<boolean> {
  const result = await syncRemoteRequest<{ cleared?: boolean }>({
    method: "DELETE",
    path: "/api/cart",
  });
  return result.ok || result.reason === "auth";
}
