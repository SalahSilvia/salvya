import { sanitizeLikedItems } from "@/lib/likes/validate";
import type { LikedItemRecord } from "@/lib/member/likes-storage";
import { syncRemoteRequest } from "@/lib/sync/remote-request";

export type RemoteLikesResponse = {
  items: LikedItemRecord[];
  updatedAt: string | null;
};

function toPayload(result: { items?: unknown; updatedAt?: string | null }): RemoteLikesResponse {
  return {
    items: sanitizeLikedItems(result.items),
    updatedAt: typeof result.updatedAt === "string" ? result.updatedAt : null,
  };
}

export async function fetchRemoteLikes(): Promise<RemoteLikesResponse | null> {
  const result = await syncRemoteRequest<{ items?: unknown; updatedAt?: string | null }>({
    method: "GET",
    path: "/api/likes",
  });
  if (!result.ok) return null;
  return toPayload(result.data);
}

export async function pushRemoteLikes(items: LikedItemRecord[]): Promise<RemoteLikesResponse | null> {
  const result = await syncRemoteRequest<{ items?: unknown; updatedAt?: string | null }>({
    method: "PUT",
    path: "/api/likes",
    body: { items },
  });
  if (!result.ok) return null;
  return toPayload(result.data);
}

export async function clearRemoteLikes(): Promise<boolean> {
  const result = await syncRemoteRequest<{ cleared?: boolean }>({
    method: "DELETE",
    path: "/api/likes",
  });
  return result.ok || result.reason === "auth";
}
