import { mergeNotifications } from "@/lib/notifications/merge";
import { sanitizeNotificationPrefs, sanitizeNotifications } from "@/lib/notifications/validate";
import { defaultNotificationPrefs } from "@/lib/notifications/defaults";
import type { InAppNotificationV1, NotificationPrefsV1 } from "@/lib/notifications/types";

const LEGACY_ITEMS_PREFIX = "salvya-in-app-notifications-v1-";
const LEGACY_PREFS_PREFIX = "salvya-notification-prefs-v1-";
const ITEMS_PREFIX = "salvya-notifications-items-v2:";
const PREFS_PREFIX = "salvya-notifications-prefs-v2:";

function readLegacyItems(userId: string): InAppNotificationV1[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(`${LEGACY_ITEMS_PREFIX}${userId}`);
    if (!raw) return [];
    return sanitizeNotifications(JSON.parse(raw) as unknown);
  } catch {
    return [];
  }
}

function readLegacyPrefs(userId: string): NotificationPrefsV1 | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(`${LEGACY_PREFS_PREFIX}${userId}`);
    if (!raw) return null;
    return sanitizeNotificationPrefs(JSON.parse(raw) as unknown);
  } catch {
    return null;
  }
}

export function readLocalNotificationItems(userId: string): InAppNotificationV1[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(`${ITEMS_PREFIX}${userId}`);
    if (!raw) return [];
    return sanitizeNotifications(JSON.parse(raw) as unknown);
  } catch {
    return [];
  }
}

export function writeLocalNotificationItems(userId: string, items: InAppNotificationV1[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(`${ITEMS_PREFIX}${userId}`, JSON.stringify(items));
  } catch {
    /* quota */
  }
}

export function readLocalNotificationPrefs(userId: string): NotificationPrefsV1 {
  if (typeof window === "undefined") return defaultNotificationPrefs();
  try {
    const raw = window.localStorage.getItem(`${PREFS_PREFIX}${userId}`);
    if (!raw) return defaultNotificationPrefs();
    return sanitizeNotificationPrefs(JSON.parse(raw) as unknown);
  } catch {
    return defaultNotificationPrefs();
  }
}

export function writeLocalNotificationPrefs(userId: string, prefs: NotificationPrefsV1): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(`${PREFS_PREFIX}${userId}`, JSON.stringify(prefs));
  } catch {
    /* quota */
  }
}

export function migrateLocalNotificationsIfNeeded(userId: string): {
  items: InAppNotificationV1[];
  prefs: NotificationPrefsV1;
} {
  const v2Items = readLocalNotificationItems(userId);
  const legacyItems = readLegacyItems(userId);
  const items = mergeNotifications(v2Items, legacyItems);

  const legacyPrefs = readLegacyPrefs(userId);
  const v2Prefs = readLocalNotificationPrefs(userId);
  const prefs = legacyPrefs
    ? sanitizeNotificationPrefs({ ...defaultNotificationPrefs(), ...legacyPrefs, v: 1 as const })
    : v2Prefs;

  writeLocalNotificationItems(userId, items);
  writeLocalNotificationPrefs(userId, prefs);

  return { items, prefs };
}
