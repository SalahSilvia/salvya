/**
 * In-app notifications — re-exports. Prefer `useNotifications()` from NotificationsProvider.
 */

export const IN_APP_NOTIFICATIONS_CHANGED = "salvya-notifications-changed";

export type { InAppNotifKind, InAppNotificationV1 } from "@/lib/notifications/types";

import { dispatchNotificationsChanged, subscribeNotifications } from "@/lib/notifications/events";
import type { InAppNotificationV1 } from "@/lib/notifications/types";
import {
  readLocalNotificationItems,
  writeLocalNotificationItems,
} from "@/lib/notifications/local-notifications";

export { dispatchNotificationsChanged };

export function loadInAppNotifications(userId: string): InAppNotificationV1[] {
  return readLocalNotificationItems(userId);
}

export function saveInAppNotifications(userId: string, items: InAppNotificationV1[]): void {
  writeLocalNotificationItems(userId, items);
  dispatchNotificationsChanged();
}

export function markNotificationRead(userId: string, id: string): void {
  const items = readLocalNotificationItems(userId);
  const next = items.map((n) => (n.id === id ? { ...n, read: true } : n));
  saveInAppNotifications(userId, next);
}

export function markAllNotificationsRead(userId: string): void {
  const items = readLocalNotificationItems(userId);
  const next = items.map((n) => ({ ...n, read: true }));
  saveInAppNotifications(userId, next);
}

export function subscribeInAppNotifications(onChange: () => void): () => void {
  return subscribeNotifications(onChange);
}
