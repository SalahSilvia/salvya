"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  type ReactNode,
} from "react";
import { notifyFollowedArtist } from "@/lib/notifications/automation";
import { followsSyncConfig } from "@/lib/follows/follows-sync-config";
import { subscribeArtistFollows } from "@/lib/follows/events";
import type { ArtistFollowRecord } from "@/lib/member/artist-follows-storage";
import { useAccountSyncedResource } from "@/lib/sync/useAccountSyncedResource";

type FollowMeta = {
  name: string;
  profileImage: string;
};

export type ArtistFollowsContextValue = {
  follows: ArtistFollowRecord[];
  followCount: number;
  loading: boolean;
  synced: boolean;
  isSignedIn: boolean;
  isFollowing: (slug: string) => boolean;
  followArtist: (slug: string, meta: FollowMeta) => void;
  unfollowArtist: (slug: string) => void;
  toggleFollow: (slug: string, meta: FollowMeta) => boolean;
  refresh: () => void;
};

const ArtistFollowsContext = createContext<ArtistFollowsContextValue | null>(null);

function sortFollows(rows: ArtistFollowRecord[]): ArtistFollowRecord[] {
  return [...rows].sort((a, b) => b.followedAt - a.followedAt);
}

export function ArtistFollowsProvider({ children }: { children: ReactNode }) {
  const sync = useAccountSyncedResource(followsSyncConfig);

  useEffect(() => {
    return subscribeArtistFollows(sync.reloadFromLocal);
  }, [sync.reloadFromLocal]);

  const slugSet = useMemo(() => new Set(sync.data.map((f) => f.slug)), [sync.data]);
  const isFollowing = useCallback((slug: string) => slugSet.has(slug), [slugSet]);

  const followArtist = useCallback(
    (slug: string, meta: FollowMeta) => {
      if (!sync.isSignedIn) return;
      if (slugSet.has(slug)) return;
      sync.updateData((prev) =>
        sortFollows([
          { slug, name: meta.name, profileImage: meta.profileImage, followedAt: Date.now() },
          ...prev.filter((f) => f.slug !== slug),
        ]),
      );
      notifyFollowedArtist(meta.name, slug, meta.profileImage);
    },
    [slugSet, sync.isSignedIn, sync.updateData],
  );

  const unfollowArtist = useCallback(
    (slug: string) => {
      if (!slugSet.has(slug)) return;
      sync.updateData((prev) => prev.filter((f) => f.slug !== slug));
    },
    [slugSet, sync.updateData],
  );

  const toggleFollow = useCallback(
    (slug: string, meta: FollowMeta) => {
      if (slugSet.has(slug)) {
        unfollowArtist(slug);
        return false;
      }
      if (!sync.isSignedIn) {
        return false;
      }
      followArtist(slug, meta);
      return true;
    },
    [followArtist, slugSet, sync.isSignedIn, unfollowArtist],
  );

  const value = useMemo<ArtistFollowsContextValue>(
    () => ({
      follows: sync.data,
      followCount: sync.data.length,
      loading: sync.loading,
      synced: sync.synced,
      isSignedIn: sync.isSignedIn,
      isFollowing,
      followArtist,
      unfollowArtist,
      toggleFollow,
      refresh: sync.refresh,
    }),
    [
      sync.data,
      sync.loading,
      sync.synced,
      sync.isSignedIn,
      sync.refresh,
      isFollowing,
      followArtist,
      unfollowArtist,
      toggleFollow,
    ],
  );

  return <ArtistFollowsContext.Provider value={value}>{children}</ArtistFollowsContext.Provider>;
}

export function useArtistFollows(): ArtistFollowsContextValue {
  const ctx = useContext(ArtistFollowsContext);
  if (!ctx) throw new Error("useArtistFollows must be used within ArtistFollowsProvider");
  return ctx;
}
