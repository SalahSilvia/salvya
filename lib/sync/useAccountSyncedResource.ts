"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useSupabaseUser } from "@/components/member/useSupabaseUser";
import {
  createResourceCrossTab,
  subscribeStorageKeys,
  userKeyFromId,
  type CrossTabMessage,
} from "@/lib/sync/cross-tab";
import {
  bumpLocalRevision,
  markLocalPushed,
  readSyncMeta,
  setRemoteUpdatedAt,
  syncMetaStoragePrefix,
  type SyncScopeMeta,
} from "@/lib/sync/sync-meta";
import { SyncCoordinator, type PendingPush } from "@/lib/sync/sync-coordinator";
import { getTabId } from "@/lib/sync/tab-id";
import type { AccountSyncedResource, AccountSyncedResourceConfig } from "@/lib/sync/types";
import { isStaleRemoteUpdatedAt } from "@/lib/sync/updated-at";

const DEFAULT_DEBOUNCE_MS = 600;
const PUSH_ELECTION_MS = 48;

type ApplyOptions = {
  origin: "self" | "peer" | "remote" | "hydrate";
  broadcast?: boolean;
  bumpRevision?: boolean;
  remoteUpdatedAt?: string | null;
};

/**
 * Shared guest ↔ signed-in sync lifecycle with auth-stress hardening:
 * generation guards, transition lock, deferred pushes, push-epoch invalidation.
 */
export function useAccountSyncedResource<T>(
  config: AccountSyncedResourceConfig<T>,
): AccountSyncedResource<T> {
  const { user, loading: authLoading } = useSupabaseUser();
  const userId = user?.id ?? null;

  const [data, setData] = useState<T>(config.empty);
  const [hydrated, setHydrated] = useState(false);
  const [synced, setSynced] = useState(false);

  const configRef = useRef(config);
  const dataRef = useRef(data);

  useEffect(() => {
    configRef.current = config;
  }, [config]);

  useEffect(() => {
    dataRef.current = data;
  }, [data]);

  const coordinatorRef = useRef(new SyncCoordinator());
  const prevUserIdRef = useRef<string | null>(null);

  const pushTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pushElectionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const transitionChainRef = useRef(Promise.resolve());
  const appliedRevisionRef = useRef(0);
  const deferredPushRef = useRef(false);
  const crossTabRef = useRef<ReturnType<typeof createResourceCrossTab> | null>(null);

  const debounceMs = config.debounceMs ?? DEFAULT_DEBOUNCE_MS;
  const tabId = getTabId();

  const coordinator = coordinatorRef.current;

  const cancelPendingPush = useCallback(() => {
    if (pushTimerRef.current) {
      clearTimeout(pushTimerRef.current);
      pushTimerRef.current = null;
    }
    if (pushElectionTimerRef.current) {
      clearTimeout(pushElectionTimerRef.current);
      pushElectionTimerRef.current = null;
    }
    coordinator.cancelPendingPush();
  }, [coordinator]);

  const finalizeData = useCallback((next: T) => {
    const fin = configRef.current.finalize;
    return fin ? fin(next) : next;
  }, []);

  const broadcastCrossTab = useCallback(
    (type: CrossTabMessage["type"], uid: string | null, meta: SyncScopeMeta) => {
      crossTabRef.current?.broadcast({
        type,
        userKey: userKeyFromId(uid),
        localRevision: meta.localRevision,
        remoteUpdatedAt: meta.remoteUpdatedAt,
      });
    },
    [],
  );

  const applyData = useCallback(
    (next: T, uid: string | null, options: ApplyOptions) => {
      const cfg = configRef.current;
      const finalized = finalizeData(next);
      dataRef.current = finalized;
      cfg.writeLocal(uid, finalized);

      let meta = readSyncMeta(cfg.resourceId, uid);
      if (options.bumpRevision) {
        meta = bumpLocalRevision(cfg.resourceId, uid);
        appliedRevisionRef.current = meta.localRevision;
      } else if (options.origin === "peer") {
        appliedRevisionRef.current = meta.localRevision;
      }

      if (options.remoteUpdatedAt !== undefined) {
        meta = setRemoteUpdatedAt(cfg.resourceId, uid, options.remoteUpdatedAt);
      }

      setData(finalized);

      if (options.broadcast) {
        broadcastCrossTab("local-applied", uid, meta);
      }

      queueMicrotask(() => cfg.onApplied?.());
    },
    [broadcastCrossTab, finalizeData],
  );

  const runRemotePush = useCallback(
    async (uid: string, generation: number, revision: number) => {
      const cfg = configRef.current;
      const pushEpochAtStart = coordinator.pushEpoch;
      const payload = dataRef.current;

      const remote = await cfg.pushRemote(payload);

      if (!coordinator.shouldApplyPushResult(generation, uid, revision, pushEpochAtStart)) {
        return;
      }

      const metaAfter = readSyncMeta(cfg.resourceId, uid);
      if (metaAfter.localRevision !== revision) return;

      if (remote) {
        setSynced(true);
        if (remote.updatedAt) {
          const meta = setRemoteUpdatedAt(cfg.resourceId, uid, remote.updatedAt);
          markLocalPushed(cfg.resourceId, uid);
          broadcastCrossTab("remote-applied", uid, meta);
        }
      }
    },
    [broadcastCrossTab, coordinator],
  );

  const executePushWithElection = useCallback(
    (pending: PendingPush) => {
      const election = coordinator.beginPushElection(
        pending.userId,
        pending.generation,
        pending.revision,
        tabId,
      );
      if (!election) return;

      broadcastCrossTab(
        "push-claim",
        pending.userId,
        readSyncMeta(configRef.current.resourceId, pending.userId),
      );

      if (pushElectionTimerRef.current) clearTimeout(pushElectionTimerRef.current);
      pushElectionTimerRef.current = setTimeout(() => {
        pushElectionTimerRef.current = null;
        const winner = coordinator.electionWinner(pending, tabId);
        coordinator.finishElection(pending);
        if (!winner || winner !== tabId) return;
        void runRemotePush(pending.userId, pending.generation, pending.revision);
      }, PUSH_ELECTION_MS);
    },
    [broadcastCrossTab, coordinator, runRemotePush, tabId],
  );

  const scheduleRemotePush = useCallback(
    (uid: string, generation: number) => {
      if (coordinator.authTransitionInFlight) {
        deferredPushRef.current = true;
        return;
      }

      const meta = readSyncMeta(configRef.current.resourceId, uid);
      const pending = coordinator.scheduleDebounce(uid, generation, meta.localRevision);
      if (!pending) return;

      cancelPendingPush();
      pushTimerRef.current = setTimeout(() => {
        pushTimerRef.current = null;
        if (!coordinator.debounceReady(pending)) return;
        coordinator.pendingDebounce = null;
        executePushWithElection(pending);
      }, debounceMs);
    },
    [cancelPendingPush, coordinator, debounceMs, executePushWithElection],
  );

  const flushDeferredPush = useCallback(() => {
    if (!deferredPushRef.current) return;
    deferredPushRef.current = false;
    const uid = coordinator.userId;
    if (!uid) return;
    scheduleRemotePush(uid, coordinator.generation);
  }, [coordinator, scheduleRemotePush]);

  const runImmediatePush = useCallback(
    async (uid: string, generation: number, payload: T) => {
      const cfg = configRef.current;
      const pushEpochAtStart = coordinator.pushEpoch;
      const revision = readSyncMeta(cfg.resourceId, uid).localRevision;

      const pushed = await cfg.pushRemote(payload);
      if (!coordinator.shouldApplyPushResult(generation, uid, revision, pushEpochAtStart)) {
        return;
      }

      if (pushed) {
        setSynced(true);
        if (pushed.updatedAt) {
          setRemoteUpdatedAt(cfg.resourceId, uid, pushed.updatedAt);
          markLocalPushed(cfg.resourceId, uid);
          broadcastCrossTab("remote-applied", uid, readSyncMeta(cfg.resourceId, uid));
        }
      }
    },
    [broadcastCrossTab, coordinator],
  );

  const applyPeerMessage = useCallback(
    (msg: CrossTabMessage) => {
      const cfg = configRef.current;
      const uid = coordinator.userId;
      if (userKeyFromId(uid) !== msg.userKey) return;
      if (coordinator.authTransitionInFlight) return;

      if (msg.type === "push-claim") {
        coordinator.recordPushClaim({
          userKey: msg.userKey,
          localRevision: msg.localRevision,
          tabId: msg.tabId,
        });
        return;
      }

      if (msg.type === "remote-applied") {
        if (msg.remoteUpdatedAt) {
          setRemoteUpdatedAt(cfg.resourceId, uid, msg.remoteUpdatedAt);
        }
        if (msg.localRevision > appliedRevisionRef.current) {
          const local = cfg.readLocal(uid);
          applyData(local, uid, { origin: "peer", bumpRevision: false, broadcast: false });
          appliedRevisionRef.current = msg.localRevision;
        }
        cancelPendingPush();
        return;
      }

      if (msg.type === "local-applied") {
        if (msg.localRevision <= appliedRevisionRef.current) return;
        cancelPendingPush();
        const local = cfg.readLocal(uid);
        applyData(local, uid, { origin: "peer", bumpRevision: false, broadcast: false });
        appliedRevisionRef.current = msg.localRevision;
      }
    },
    [applyData, cancelPendingPush, coordinator, tabId],
  );

  const reloadFromLocalIfNewer = useCallback(() => {
    if (coordinator.authTransitionInFlight) return;
    const cfg = configRef.current;
    const uid = coordinator.userId;
    const meta = readSyncMeta(cfg.resourceId, uid);
    if (meta.localRevision <= appliedRevisionRef.current) return;
    const local = cfg.readLocal(uid);
    applyData(local, uid, { origin: "peer", bumpRevision: false, broadcast: false });
    appliedRevisionRef.current = meta.localRevision;
  }, [applyData, coordinator]);

  useEffect(() => {
    const cfg = configRef.current;
    const crossTab = createResourceCrossTab(cfg.resourceId, applyPeerMessage);
    crossTabRef.current = crossTab;

    const storagePrefixes = [
      ...cfg.storageKeyPrefixes,
      syncMetaStoragePrefix(cfg.resourceId),
    ];
    const unsubStorage = subscribeStorageKeys(storagePrefixes, reloadFromLocalIfNewer);

    return () => {
      unsubStorage();
      crossTab.close();
      crossTabRef.current = null;
    };
  }, [config.resourceId, applyPeerMessage, reloadFromLocalIfNewer]);

  const hydrateGuest = useCallback(
    async (generation: number) => {
      const cfg = configRef.current;
      if (!coordinator.canApplyAsync(generation, null)) return;

      appliedRevisionRef.current = readSyncMeta(cfg.resourceId, null).localRevision;

      if (cfg.signedInOnly) {
        applyData(cfg.empty, null, { origin: "hydrate", bumpRevision: false, broadcast: false });
        setSynced(false);
        setHydrated(true);
        return;
      }

      const local = cfg.readLocal(null);
      applyData(local, null, { origin: "hydrate", bumpRevision: false, broadcast: false });
      setSynced(false);
      setHydrated(true);
    },
    [applyData, coordinator],
  );

  const hydrateSignedIn = useCallback(
    async (uid: string, generation: number) => {
      const cfg = configRef.current;
      const local = cfg.readLocal(uid);
      const metaBefore = readSyncMeta(cfg.resourceId, uid);
      appliedRevisionRef.current = metaBefore.localRevision;

      const remote = await cfg.fetchRemote();
      if (!coordinator.canApplyAsync(generation, uid)) return;

      if (remote && isStaleRemoteUpdatedAt(remote.updatedAt, metaBefore.remoteUpdatedAt)) {
        applyData(local, uid, {
          origin: "hydrate",
          bumpRevision: false,
          broadcast: false,
          remoteUpdatedAt: metaBefore.remoteUpdatedAt,
        });
        setSynced(true);
        const shouldPush = cfg.pushAfterHydrateIf?.(local) ?? local !== cfg.empty;
        if (shouldPush) {
          if (cfg.pushImmediatelyAfterHydrate) {
            cancelPendingPush();
            await runImmediatePush(uid, generation, local);
          } else {
            scheduleRemotePush(uid, generation);
          }
        }
        setHydrated(true);
        return;
      }

      if (remote) {
        const merged = cfg.mergeRemoteWithLocal
          ? cfg.mergeRemoteWithLocal(remote.data, local)
          : cfg.merge(remote.data, local);
        applyData(merged, uid, {
          origin: "hydrate",
          bumpRevision: false,
          broadcast: false,
          remoteUpdatedAt: remote.updatedAt,
        });
        setSynced(true);
        const shouldPush = cfg.pushAfterHydrateIf?.(merged) ?? merged !== cfg.empty;
        if (shouldPush) {
          if (cfg.pushImmediatelyAfterHydrate) {
            cancelPendingPush();
            await runImmediatePush(uid, generation, merged);
          } else {
            scheduleRemotePush(uid, generation);
          }
        }
      } else {
        applyData(local, uid, { origin: "hydrate", bumpRevision: false, broadcast: false });
        setSynced(false);
      }
      setHydrated(true);
    },
    [applyData, cancelPendingPush, coordinator, runImmediatePush, scheduleRemotePush],
  );

  const mergeGuestIntoUser = useCallback(
    async (uid: string, generation: number) => {
      const cfg = configRef.current;
      const guest = cfg.takeGuestForLoginMerge();
      cfg.clearGuestStorage();
      const userLocal = cfg.readLocal(uid);
      const remote = await cfg.fetchRemote();
      if (!coordinator.canApplyAsync(generation, uid)) return;

      const metaBefore = readSyncMeta(cfg.resourceId, uid);
      const remoteStale =
        remote && isStaleRemoteUpdatedAt(remote.updatedAt, metaBefore.remoteUpdatedAt);

      const remoteData = remoteStale ? cfg.empty : (remote?.data ?? cfg.empty);
      const merged = cfg.mergeRemoteWithLocal
        ? cfg.mergeRemoteWithLocal(remoteData, cfg.merge(userLocal, guest))
        : cfg.merge(remoteData, userLocal, guest);

      applyData(merged, uid, {
        origin: "self",
        bumpRevision: true,
        broadcast: true,
        remoteUpdatedAt: remoteStale ? metaBefore.remoteUpdatedAt : remote?.updatedAt ?? null,
      });
      appliedRevisionRef.current = readSyncMeta(cfg.resourceId, uid).localRevision;
      setSynced(Boolean(remote && !remoteStale));

      const shouldPush =
        cfg.pushAfterLoginMergeIf?.(merged, Boolean(remote && !remoteStale)) ??
        Boolean((remote && !remoteStale) || merged !== cfg.empty);

      if (shouldPush) {
        cancelPendingPush();
        await runImmediatePush(uid, generation, merged);
      }
      setHydrated(true);
    },
    [applyData, cancelPendingPush, coordinator, runImmediatePush],
  );

  const runAuthTransition = useCallback(
    (nextUserId: string | null, prevUserId: string | null) => {
      const generation = coordinator.beginAuthTransition(nextUserId);
      cancelPendingPush();
      deferredPushRef.current = false;
      appliedRevisionRef.current = 0;
      setHydrated(false);

      const isLogin = Boolean(nextUserId && !prevUserId);

      transitionChainRef.current = transitionChainRef.current
        .then(async () => {
          if (isLogin && nextUserId) {
            await mergeGuestIntoUser(nextUserId, generation);
          } else if (nextUserId) {
            await hydrateSignedIn(nextUserId, generation);
          } else {
            await hydrateGuest(generation);
          }
        })
        .catch(() => {
          if (coordinator.canApplyAsync(generation, nextUserId)) {
            setHydrated(true);
          }
        })
        .finally(() => {
          coordinator.endAuthTransition();
          flushDeferredPush();
        });
    },
    [
      cancelPendingPush,
      coordinator,
      flushDeferredPush,
      hydrateGuest,
      hydrateSignedIn,
      mergeGuestIntoUser,
    ],
  );

  useEffect(() => {
    if (authLoading) return;

    const prev = prevUserIdRef.current;
    prevUserIdRef.current = userId;

    if (prev === userId && hydrated) return;

    runAuthTransition(userId, prev);
  }, [authLoading, userId, hydrated, runAuthTransition]);

  useEffect(
    () => () => {
      cancelPendingPush();
    },
    [cancelPendingPush],
  );

  const replaceData = useCallback(
    (next: T) => {
      const uid = coordinator.userId;
      applyData(finalizeData(next), uid, {
        origin: "self",
        bumpRevision: true,
        broadcast: true,
      });
      if (uid) scheduleRemotePush(uid, coordinator.generation);
    },
    [applyData, coordinator, finalizeData, scheduleRemotePush],
  );

  const updateData = useCallback(
    (updater: (prev: T) => T) => {
      setData((prev) => {
        const next = finalizeData(updater(prev));
        const uid = coordinator.userId;
        dataRef.current = next;
        configRef.current.writeLocal(uid, next);
        const meta = bumpLocalRevision(configRef.current.resourceId, uid);
        appliedRevisionRef.current = meta.localRevision;
        broadcastCrossTab("local-applied", uid, meta);
        queueMicrotask(() => configRef.current.onApplied?.());
        if (uid) scheduleRemotePush(uid, coordinator.generation);
        return next;
      });
    },
    [broadcastCrossTab, coordinator, finalizeData, scheduleRemotePush],
  );

  const clearAll = useCallback(() => {
    const uid = coordinator.userId;
    const cfg = configRef.current;
    const generation = coordinator.generation;
    const pushEpochAtStart = coordinator.pushEpoch;

    applyData(cfg.empty, uid, {
      origin: "self",
      bumpRevision: true,
      broadcast: true,
    });

    if (uid) {
      void cfg.clearRemote?.().then((ok) => {
        if (!coordinator.shouldApplyPushResult(generation, uid, appliedRevisionRef.current, pushEpochAtStart)) {
          return;
        }
        if (ok) {
          setSynced(true);
          const meta = setRemoteUpdatedAt(cfg.resourceId, uid, new Date().toISOString());
          markLocalPushed(cfg.resourceId, uid);
          broadcastCrossTab("remote-applied", uid, meta);
        }
      });
    } else {
      setSynced(false);
    }
  }, [applyData, broadcastCrossTab, coordinator]);

  const refresh = useCallback(() => {
    const uid = coordinator.userId;
    const generation = coordinator.generation;
    cancelPendingPush();
    void (async () => {
      if (uid) await hydrateSignedIn(uid, generation);
      else await hydrateGuest(generation);
    })();
  }, [cancelPendingPush, coordinator, hydrateGuest, hydrateSignedIn]);

  const reloadFromLocal = useCallback(() => {
    if (authLoading) return;
    reloadFromLocalIfNewer();
  }, [authLoading, reloadFromLocalIfNewer]);

  const pushNow = useCallback(() => {
    const uid = coordinator.userId;
    if (!uid) return;
    cancelPendingPush();
    void runImmediatePush(uid, coordinator.generation, dataRef.current);
  }, [cancelPendingPush, coordinator, runImmediatePush]);

  const loading = authLoading || !hydrated;

  return {
    data,
    loading,
    synced: Boolean(userId && synced),
    isSignedIn: Boolean(userId),
    userId,
    replaceData,
    updateData,
    clearAll,
    refresh,
    reloadFromLocal,
    pushNow,
  };
}
