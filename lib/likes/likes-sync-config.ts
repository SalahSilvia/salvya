import { clearRemoteLikes, fetchRemoteLikes, pushRemoteLikes } from "@/lib/likes/api-client";
import { dispatchLikesChanged } from "@/lib/likes/events";
import {
  migrateLegacyLikesToGuestIfNeeded,
  readGuestLikesLocal,
  readUserLikesLocal,
  writeGuestLikesLocal,
  writeUserLikesLocal,
} from "@/lib/likes/local-likes";
import { mergeLikedItems } from "@/lib/likes/merge";
import type { LikedItemRecord } from "@/lib/member/likes-storage";
import type { AccountSyncedResourceConfig } from "@/lib/sync/types";

const EMPTY_LIKES: LikedItemRecord[] = [];

function sortItems(items: LikedItemRecord[]): LikedItemRecord[] {
  return [...items].sort((a, b) => b.timestamp - a.timestamp);
}

function readLocal(userId: string | null): LikedItemRecord[] {
  if (userId) return readUserLikesLocal(userId);
  return migrateLegacyLikesToGuestIfNeeded();
}

function writeLocal(userId: string | null, items: LikedItemRecord[]): void {
  if (userId) writeUserLikesLocal(userId, items);
  else writeGuestLikesLocal(items);
}

function isNonEmpty(items: LikedItemRecord[]): boolean {
  return items.length > 0;
}

export const likesSyncConfig: AccountSyncedResourceConfig<LikedItemRecord[]> = {
  resourceId: "likes",
  storageKeyPrefixes: ["salvya-likes-", "salvya-liked-items-v1"],
  debounceMs: 600,
  empty: EMPTY_LIKES,
  merge: mergeLikedItems,
  finalize: sortItems,
  readLocal,
  writeLocal,
  takeGuestForLoginMerge: readGuestLikesLocal,
  clearGuestStorage: () => writeGuestLikesLocal([]),
  fetchRemote: async () => {
    const remote = await fetchRemoteLikes();
    return remote ? { data: remote.items, updatedAt: remote.updatedAt } : null;
  },
  pushRemote: async (items) => {
    const remote = await pushRemoteLikes(items);
    return remote ? { data: remote.items, updatedAt: remote.updatedAt } : null;
  },
  clearRemote: clearRemoteLikes,
  onApplied: dispatchLikesChanged,
  pushAfterHydrateIf: isNonEmpty,
  pushAfterLoginMergeIf: (items, hadRemote) => hadRemote || isNonEmpty(items),
};
