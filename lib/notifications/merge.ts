import { normalizeNotification } from "@/lib/notifications/validate";
import type { InAppNotificationV1 } from "@/lib/notifications/types";

/** Merge by id — later sources win; read=true if any source marked read. */
export function mergeNotifications(...sources: InAppNotificationV1[][]): InAppNotificationV1[] {
  const map = new Map<string, InAppNotificationV1>();

  for (const source of sources) {
    for (const raw of source) {
      const row = normalizeNotification(raw);
      const existing = map.get(row.id);
      if (!existing) {
        map.set(row.id, row);
        continue;
      }
      const newerIsRow = new Date(row.createdAt).getTime() >= new Date(existing.createdAt).getTime();
      const base = newerIsRow ? row : existing;
      map.set(row.id, {
        ...base,
        read: existing.read || row.read,
        context: row.context ?? existing.context,
      });
    }
  }

  return [...map.values()].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}
