/** Result from a remote fetch/push; `data` is the domain payload merged with local state. */

export type SyncRemotePayload<T> = {

  data: T;

  updatedAt: string | null;

};



export type AccountSyncedResourceConfig<T> = {

  /** Channel + meta namespace (`cart`, `likes`, `follows`, `notifications`). */

  resourceId: string;

  /** localStorage key prefixes for cross-tab `storage` fallback. */

  storageKeyPrefixes: string[];

  /** Debounced delay before PUT (default 600ms). */

  debounceMs?: number;

  /** Empty value used after clear and as merge fallback. */

  empty: T;

  /** Merge local/remote/guest slices (domain-specific). */

  merge: (...sources: T[]) => T;

  /**

   * Read persisted state for the active session.

   * `null` userId = guest (include legacy migration when applicable).

   */

  readLocal: (userId: string | null) => T;

  writeLocal: (userId: string | null, data: T) => void;

  /** Snapshot guest-only storage for login merge (before guest is cleared). */

  takeGuestForLoginMerge: () => T;

  /** Clear guest storage after `takeGuestForLoginMerge`. */

  clearGuestStorage: () => void;

  fetchRemote: () => Promise<SyncRemotePayload<T> | null>;

  pushRemote: (data: T) => Promise<SyncRemotePayload<T> | null>;

  clearRemote?: () => Promise<boolean>;

  /** Fired after local persist + React state update (e.g. cart changed event). */

  onApplied?: () => void;

  /** Schedule debounced push after signed-in hydrate when merge succeeded remotely. */

  pushAfterHydrateIf?: (data: T) => boolean;

  /** Immediate push after login merge when remote exists or bag has lines. */

  pushAfterLoginMergeIf?: (data: T, hadRemote: boolean) => boolean;

  /** No guest persistence — signed-out state uses `empty` only (notifications). */

  signedInOnly?: boolean;

  /** Custom merge when remote payload shape differs from `merge(...sources)`. */

  mergeRemoteWithLocal?: (remote: T, local: T) => T;

  /** Push immediately after signed-in hydrate (not debounced). */

  pushImmediatelyAfterHydrate?: boolean;

  /** Normalize before every local write / state apply (e.g. sort likes). */

  finalize?: (data: T) => T;

};



export type AccountSyncedResource<T> = {

  data: T;

  loading: boolean;

  synced: boolean;

  isSignedIn: boolean;

  userId: string | null;

  /** Replace data, persist locally, debounced push when signed in. */

  replaceData: (next: T) => void;

  /** Functional update with same persist/push rules as today’s bag mutations. */

  updateData: (updater: (prev: T) => T) => void;

  /** Clear local (+ remote when signed in). */

  clearAll: () => void;

  /** Re-fetch remote and merge (signed in) or reload guest local. */

  refresh: () => void;

  /** Reload from localStorage only (cross-tab / custom event). */

  reloadFromLocal: () => void;

  /** Persist current data to the server immediately (skips debounce). */
  pushNow: () => void;
};


