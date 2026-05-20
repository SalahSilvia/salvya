import { sanitizeArtistFollows } from "@/lib/follows/validate";
import type { ArtistFollowRecord } from "@/lib/member/artist-follows-storage";
import { syncRemoteRequest } from "@/lib/sync/remote-request";

export type RemoteFollowsResponse = {
  follows: ArtistFollowRecord[];
  updatedAt: string | null;
};

function toPayload(result: { follows?: unknown; updatedAt?: string | null }): RemoteFollowsResponse {
  return {
    follows: sanitizeArtistFollows(result.follows),
    updatedAt: typeof result.updatedAt === "string" ? result.updatedAt : null,
  };
}

export async function fetchRemoteFollows(): Promise<RemoteFollowsResponse | null> {
  const result = await syncRemoteRequest<{ follows?: unknown; updatedAt?: string | null }>({
    method: "GET",
    path: "/api/artist-follows",
  });
  if (!result.ok) return null;
  return toPayload(result.data);
}

export async function pushRemoteFollows(
  follows: ArtistFollowRecord[],
): Promise<RemoteFollowsResponse | null> {
  const result = await syncRemoteRequest<{ follows?: unknown; updatedAt?: string | null }>({
    method: "PUT",
    path: "/api/artist-follows",
    body: { follows },
  });
  if (!result.ok) return null;
  return toPayload(result.data);
}

export async function clearRemoteFollows(): Promise<boolean> {
  const result = await syncRemoteRequest<{ cleared?: boolean }>({
    method: "DELETE",
    path: "/api/artist-follows",
  });
  return result.ok || result.reason === "auth";
}
