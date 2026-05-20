/**
 * Notification channel prefs — re-exports. Prefer `useNotifications()` from NotificationsProvider.
 */

export const NOTIFICATION_PREFS_CHANGED = "salvya-notifications-changed";

export type { NotificationPrefsV1 } from "@/lib/notifications/types";

export { defaultNotificationPrefs } from "@/lib/notifications/defaults";
export { prefsAllowKind } from "@/lib/notifications/validate";

import { dispatchNotificationsChanged, subscribeNotifications } from "@/lib/notifications/events";
import {
  readLocalNotificationItems,
  readLocalNotificationPrefs,
  writeLocalNotificationPrefs,
} from "@/lib/notifications/local-notifications";
import { prefsAllowKind, unreadCount } from "@/lib/notifications/validate";
import type { NotificationPrefsV1 } from "@/lib/notifications/types";

export { dispatchNotificationsChanged as dispatchNotificationPrefsChanged };

export function loadNotificationPrefs(userId: string): NotificationPrefsV1 {
  return readLocalNotificationPrefs(userId);
}

export function saveNotificationPrefs(userId: string, next: NotificationPrefsV1): void {
  writeLocalNotificationPrefs(userId, next);
  dispatchNotificationsChanged();
}

export function subscribeNotificationPrefs(onChange: () => void): () => void {
  return subscribeNotifications(onChange);
}

/** Unread items allowed by channel toggles (reads local cache). */
export function unreadInAppCountForUser(userId: string): number {
  const prefs = readLocalNotificationPrefs(userId);
  const items = readLocalNotificationItems(userId);
  return unreadCount(items, prefs);
}
