export type SyncScopeMeta = {
  localRevision: number;
  remoteUpdatedAt: string | null;
  /** Local revision last acknowledged by a successful remote push. */
  lastPushedRevision: number;
};

const META_PREFIX = "salvya-sync-meta-v1:";

function metaKey(resourceId: string, userId: string | null): string {
  const scope = userId ?? "guest";
  return `${META_PREFIX}${resourceId}:${scope}`;
}

const EMPTY_META: SyncScopeMeta = { localRevision: 0, remoteUpdatedAt: null, lastPushedRevision: 0 };

export function readSyncMeta(resourceId: string, userId: string | null): SyncScopeMeta {
  if (typeof window === "undefined") return { ...EMPTY_META };
  try {
    const raw = window.localStorage.getItem(metaKey(resourceId, userId));
    if (!raw) return { ...EMPTY_META };
    const parsed = JSON.parse(raw) as Partial<SyncScopeMeta>;
    return {
      localRevision:
        typeof parsed.localRevision === "number" && parsed.localRevision >= 0
          ? parsed.localRevision
          : 0,
      remoteUpdatedAt:
        typeof parsed.remoteUpdatedAt === "string" ? parsed.remoteUpdatedAt : null,
      lastPushedRevision:
        typeof parsed.lastPushedRevision === "number" && parsed.lastPushedRevision >= 0
          ? parsed.lastPushedRevision
          : 0,
    };
  } catch {
    return { ...EMPTY_META };
  }
}

export function writeSyncMeta(
  resourceId: string,
  userId: string | null,
  meta: SyncScopeMeta,
): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(metaKey(resourceId, userId), JSON.stringify(meta));
  } catch {
    /* quota / private mode */
  }
}

export function bumpLocalRevision(
  resourceId: string,
  userId: string | null,
): SyncScopeMeta {
  const prev = readSyncMeta(resourceId, userId);
  const next: SyncScopeMeta = { ...prev, localRevision: prev.localRevision + 1 };
  writeSyncMeta(resourceId, userId, next);
  return next;
}

export function setRemoteUpdatedAt(
  resourceId: string,
  userId: string | null,
  remoteUpdatedAt: string | null,
): SyncScopeMeta {
  const prev = readSyncMeta(resourceId, userId);
  const next: SyncScopeMeta = { ...prev, remoteUpdatedAt };
  writeSyncMeta(resourceId, userId, next);
  return next;
}

/** Mark local state as fully reflected on the server (after successful push). */
export function markLocalPushed(resourceId: string, userId: string | null): SyncScopeMeta {
  const prev = readSyncMeta(resourceId, userId);
  const next: SyncScopeMeta = { ...prev, lastPushedRevision: prev.localRevision };
  writeSyncMeta(resourceId, userId, next);
  return next;
}

export function hasUnsyncedLocalChanges(resourceId: string, userId: string | null): boolean {
  const meta = readSyncMeta(resourceId, userId);
  return meta.localRevision > meta.lastPushedRevision;
}

export function syncMetaStoragePrefix(resourceId: string): string {
  return `${META_PREFIX}${resourceId}:`;
}
