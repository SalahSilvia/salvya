import { NOTIFICATIONS_MAX_ITEMS, type InAppNotificationV1 } from "@/lib/notifications/types";
import { normalizeNotification, prefsAllowKind } from "@/lib/notifications/validate";
import type { NotificationPrefsV1 } from "@/lib/notifications/types";

export type NewNotificationInput = Omit<InAppNotificationV1, "v" | "read" | "createdAt"> & {
  createdAt?: string;
  read?: boolean;
};

/** Append or replace-by-id; newest first. */
export function appendNotification(
  items: InAppNotificationV1[],
  input: NewNotificationInput,
  prefs: NotificationPrefsV1,
): InAppNotificationV1[] {
  if (!prefsAllowKind(prefs, input.kind)) return items;

  const row = normalizeNotification({
    v: 1,
    id: input.id,
    kind: input.kind,
    title: input.title,
    body: input.body,
    href: input.href,
    createdAt: input.createdAt ?? new Date().toISOString(),
    read: input.read ?? false,
    ...(input.context ? { context: input.context } : {}),
  });

  const without = items.filter((n) => n.id !== row.id);
  return [row, ...without].slice(0, NOTIFICATIONS_MAX_ITEMS);
}
