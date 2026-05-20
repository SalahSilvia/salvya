import { sanitizeNotificationContext } from "@/lib/notifications/context";
import { NOTIFICATIONS_MAX_ITEMS, type InAppNotificationV1, type NotificationPrefsV1 } from "@/lib/notifications/types";
import { defaultNotificationPrefs } from "@/lib/notifications/defaults";
function isRecord(x: unknown): x is Record<string, unknown> {
  return typeof x === "object" && x !== null;
}

export function isInAppNotification(x: unknown): x is InAppNotificationV1 {
  if (!isRecord(x)) return false;
  if (x.v !== 1) return false;
  if (typeof x.id !== "string" || x.id.length === 0) return false;
  if (x.kind !== "order" && x.kind !== "drop" && x.kind !== "account" && x.kind !== "news") return false;
  if (typeof x.title !== "string" || typeof x.body !== "string") return false;
  if (typeof x.createdAt !== "string") return false;
  if (typeof x.read !== "boolean") return false;
  if (x.href !== undefined && typeof x.href !== "string") return false;
  if (x.context !== undefined && !sanitizeNotificationContext(x.context)) return false;
  return true;
}
export function normalizeNotification(raw: InAppNotificationV1): InAppNotificationV1 {
  const context = raw.context ? sanitizeNotificationContext(raw.context) : undefined;
  return {
    v: 1,
    id: raw.id,
    kind: raw.kind,
    title: raw.title.trim(),
    body: raw.body.trim(),
    href: raw.href?.trim() || undefined,
    createdAt: raw.createdAt,
    read: raw.read,
    ...(context ? { context } : {}),
  };
}
export function sanitizeNotifications(parsed: unknown): InAppNotificationV1[] {
  if (!Array.isArray(parsed)) return [];
  return parsed
    .filter(isInAppNotification)
    .map(normalizeNotification)
    .slice(0, NOTIFICATIONS_MAX_ITEMS);
}

export function sanitizeNotificationPrefs(parsed: unknown): NotificationPrefsV1 {
  const d = defaultNotificationPrefs();
  if (!isRecord(parsed) || parsed.v !== 1) return d;
  return {
    v: 1,
    orderUpdates: typeof parsed.orderUpdates === "boolean" ? parsed.orderUpdates : d.orderUpdates,
    dropAlerts: typeof parsed.dropAlerts === "boolean" ? parsed.dropAlerts : d.dropAlerts,
    accountSecurity: typeof parsed.accountSecurity === "boolean" ? parsed.accountSecurity : d.accountSecurity,
    salvyaNews: typeof parsed.salvyaNews === "boolean" ? parsed.salvyaNews : d.salvyaNews,
    browserPushOptIn:
      typeof parsed.browserPushOptIn === "boolean" ? parsed.browserPushOptIn : d.browserPushOptIn,
  };
}

export function prefsAllowKind(prefs: NotificationPrefsV1, kind: InAppNotificationV1["kind"]): boolean {
  switch (kind) {
    case "order":
      return prefs.orderUpdates;
    case "drop":
      return prefs.dropAlerts;
    case "account":
      return prefs.accountSecurity;
    case "news":
      return prefs.salvyaNews;
    default:
      return true;
  }
}

export function unreadCount(items: InAppNotificationV1[], prefs: NotificationPrefsV1): number {
  return items.filter((n) => !n.read && prefsAllowKind(prefs, n.kind)).length;
}
