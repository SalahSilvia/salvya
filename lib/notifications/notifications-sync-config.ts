import { fetchRemoteNotifications, pushRemoteNotifications } from "@/lib/notifications/api-client";
import { defaultNotificationPrefs } from "@/lib/notifications/defaults";
import { dispatchNotificationsChanged } from "@/lib/notifications/events";
import {
  migrateLocalNotificationsIfNeeded,
  writeLocalNotificationItems,
  writeLocalNotificationPrefs,
} from "@/lib/notifications/local-notifications";
import { mergeNotifications } from "@/lib/notifications/merge";
import type { InAppNotificationV1, NotificationPrefsV1 } from "@/lib/notifications/types";
import { sanitizeNotificationPrefs } from "@/lib/notifications/validate";
import type { AccountSyncedResourceConfig } from "@/lib/sync/types";

export type NotificationSnapshot = {
  items: InAppNotificationV1[];
  prefs: NotificationPrefsV1;
};

const EMPTY_NOTIFICATIONS: NotificationSnapshot = {
  items: [],
  prefs: defaultNotificationPrefs(),
};

function mergeSnapshots(...sources: NotificationSnapshot[]): NotificationSnapshot {
  let items: InAppNotificationV1[] = [];
  let prefs = defaultNotificationPrefs();

  for (const snap of sources) {
    if (!snap) continue;
    items = mergeNotifications(items, snap.items);
    prefs = sanitizeNotificationPrefs({ ...prefs, ...snap.prefs, v: 1 as const });
  }

  return { items, prefs };
}

function readLocal(userId: string | null): NotificationSnapshot {
  if (!userId) return EMPTY_NOTIFICATIONS;
  const local = migrateLocalNotificationsIfNeeded(userId);
  return { items: local.items, prefs: local.prefs };
}

function writeLocal(userId: string | null, snap: NotificationSnapshot): void {
  if (!userId) return;
  writeLocalNotificationItems(userId, snap.items);
  writeLocalNotificationPrefs(userId, snap.prefs);
}

/** Remote first, then local — `read` is preserved if either side marked read. */
function mergeRemoteWithLocal(
  remote: NotificationSnapshot,
  local: NotificationSnapshot,
): NotificationSnapshot {
  return mergeSnapshots(remote, local);
}

export const notificationsSyncConfig: AccountSyncedResourceConfig<NotificationSnapshot> = {
  resourceId: "notifications",
  storageKeyPrefixes: [
    "salvya-notifications-",
    "salvya-in-app-notifications-",
    "salvya-notification-prefs-",
  ],
  debounceMs: 600,
  empty: EMPTY_NOTIFICATIONS,
  merge: mergeSnapshots,
  signedInOnly: true,
  mergeRemoteWithLocal,
  readLocal,
  writeLocal,
  takeGuestForLoginMerge: () => EMPTY_NOTIFICATIONS,
  clearGuestStorage: () => {},
  fetchRemote: async () => {
    const remote = await fetchRemoteNotifications();
    return remote
      ? { data: { items: remote.items, prefs: remote.prefs }, updatedAt: remote.updatedAt }
      : null;
  },
  pushRemote: async (snap) => {
    const remote = await pushRemoteNotifications(snap.items, snap.prefs);
    return remote
      ? { data: { items: remote.items, prefs: remote.prefs }, updatedAt: remote.updatedAt }
      : null;
  },
  onApplied: dispatchNotificationsChanged,
  pushImmediatelyAfterHydrate: true,
  pushAfterHydrateIf: (snap) => snap.items.length > 0,
};
