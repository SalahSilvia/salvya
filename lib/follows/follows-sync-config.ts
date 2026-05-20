import { clearRemoteFollows, fetchRemoteFollows, pushRemoteFollows } from "@/lib/follows/api-client";
import { dispatchArtistFollowsChanged } from "@/lib/follows/events";
import {
  migrateLegacyFollowsToGuestIfNeeded,
  readGuestFollowsLocal,
  readUserFollowsLocal,
  writeGuestFollowsLocal,
  writeUserFollowsLocal,
} from "@/lib/follows/local-follows";
import { mergeArtistFollows } from "@/lib/follows/merge";
import type { ArtistFollowRecord } from "@/lib/member/artist-follows-storage";
import type { AccountSyncedResourceConfig } from "@/lib/sync/types";

const EMPTY_FOLLOWS: ArtistFollowRecord[] = [];

function sortFollows(rows: ArtistFollowRecord[]): ArtistFollowRecord[] {
  return [...rows].sort((a, b) => b.followedAt - a.followedAt);
}

function readLocal(userId: string | null): ArtistFollowRecord[] {
  if (userId) return readUserFollowsLocal(userId);
  return migrateLegacyFollowsToGuestIfNeeded();
}

function writeLocal(userId: string | null, rows: ArtistFollowRecord[]): void {
  if (userId) writeUserFollowsLocal(userId, rows);
  else writeGuestFollowsLocal(rows);
}

function isNonEmpty(rows: ArtistFollowRecord[]): boolean {
  return rows.length > 0;
}

export const followsSyncConfig: AccountSyncedResourceConfig<ArtistFollowRecord[]> = {
  resourceId: "follows",
  storageKeyPrefixes: ["salvya-follows-", "salvya-artist-follows-v1", "salvya-artist-favorites"],
  debounceMs: 600,
  empty: EMPTY_FOLLOWS,
  merge: mergeArtistFollows,
  finalize: sortFollows,
  readLocal,
  writeLocal,
  takeGuestForLoginMerge: readGuestFollowsLocal,
  clearGuestStorage: () => writeGuestFollowsLocal([]),
  fetchRemote: async () => {
    const remote = await fetchRemoteFollows();
    return remote ? { data: remote.follows, updatedAt: remote.updatedAt } : null;
  },
  pushRemote: async (rows) => {
    const remote = await pushRemoteFollows(rows);
    return remote ? { data: remote.follows, updatedAt: remote.updatedAt } : null;
  },
  clearRemote: clearRemoteFollows,
  onApplied: dispatchArtistFollowsChanged,
  pushAfterHydrateIf: isNonEmpty,
  pushAfterLoginMergeIf: (rows, hadRemote) => hadRemote || isNonEmpty(rows),
};
