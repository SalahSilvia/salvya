"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  type ReactNode,
} from "react";
import { notifyLikedItem } from "@/lib/notifications/automation";
import { likesSyncConfig } from "@/lib/likes/likes-sync-config";
import { subscribeLikes } from "@/lib/likes/events";
import type { LikedItemInput, LikedItemRecord } from "@/lib/member/likes-storage";
import { useAccountSyncedResource } from "@/lib/sync/useAccountSyncedResource";

export type LikesContextValue = {
  items: LikedItemRecord[];
  loading: boolean;
  synced: boolean;
  isSignedIn: boolean;
  likeItem: (input: LikedItemInput) => void;
  unlikeItem: (productId: string) => void;
  toggleLike: (input: LikedItemInput) => void;
  isLiked: (productId: string) => boolean;
  getLikedItems: () => LikedItemRecord[];
  refresh: () => void;
};

const LikesContext = createContext<LikesContextValue | null>(null);

function sortItems(items: LikedItemRecord[]): LikedItemRecord[] {
  return [...items].sort((a, b) => b.timestamp - a.timestamp);
}

export function LikesProvider({ children }: { children: ReactNode }) {
  const sync = useAccountSyncedResource(likesSyncConfig);

  useEffect(() => {
    return subscribeLikes(sync.reloadFromLocal);
  }, [sync.reloadFromLocal]);

  const likeItem = useCallback(
    (input: LikedItemInput) => {
      if (!sync.isSignedIn) return;
      const next: LikedItemRecord = { ...input, timestamp: Date.now() };
      sync.updateData((prev) =>
        sortItems([next, ...prev.filter((x) => x.productId !== input.productId)]),
      );
    },
    [sync.isSignedIn, sync.updateData],
  );

  const unlikeItem = useCallback(
    (productId: string) => {
      sync.updateData((prev) => prev.filter((x) => x.productId !== productId));
    },
    [sync.updateData],
  );

  const toggleLike = useCallback(
    (input: LikedItemInput) => {
      sync.updateData((prev) => {
        const exists = prev.some((x) => x.productId === input.productId);
        if (exists) {
          return prev.filter((x) => x.productId !== input.productId);
        }
        if (!sync.isSignedIn) {
          return prev;
        }
        const next: LikedItemRecord = { ...input, timestamp: Date.now() };
        if (typeof navigator !== "undefined" && navigator.vibrate) {
          try {
            navigator.vibrate(8);
          } catch {
            /* ignore */
          }
        }
        notifyLikedItem({ title: input.title, href: input.href, imageSrc: input.imageSrc });
        return sortItems([next, ...prev.filter((x) => x.productId !== input.productId)]);
      });
    },
    [sync.isSignedIn, sync.updateData],
  );

  const likedIds = useMemo(() => new Set(sync.data.map((i) => i.productId)), [sync.data]);
  const isLiked = useCallback((productId: string) => likedIds.has(productId), [likedIds]);
  const getLikedItems = useCallback(() => sync.data, [sync.data]);

  const value = useMemo<LikesContextValue>(
    () => ({
      items: sync.data,
      loading: sync.loading,
      synced: sync.synced,
      isSignedIn: sync.isSignedIn,
      likeItem,
      unlikeItem,
      toggleLike,
      isLiked,
      getLikedItems,
      refresh: sync.refresh,
    }),
    [
      sync.data,
      sync.loading,
      sync.synced,
      sync.isSignedIn,
      sync.refresh,
      likeItem,
      unlikeItem,
      toggleLike,
      isLiked,
      getLikedItems,
    ],
  );

  return <LikesContext.Provider value={value}>{children}</LikesContext.Provider>;
}

export function useLikes(): LikesContextValue {
  const ctx = useContext(LikesContext);
  if (!ctx) throw new Error("useLikes must be used within LikesProvider");
  return ctx;
}
