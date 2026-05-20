import type { InAppNotificationV1, NotificationPrefsV1 } from "@/lib/notifications/types";
import { sanitizeNotificationPrefs, sanitizeNotifications } from "@/lib/notifications/validate";
import { syncRemoteRequest } from "@/lib/sync/remote-request";

export type RemoteNotificationsResponse = {
  items: InAppNotificationV1[];
  prefs: NotificationPrefsV1;
  updatedAt: string | null;
};

function toPayload(result: {
  items?: unknown;
  prefs?: unknown;
  updatedAt?: string | null;
}): RemoteNotificationsResponse {
  return {
    items: sanitizeNotifications(result.items),
    prefs: sanitizeNotificationPrefs(result.prefs),
    updatedAt: typeof result.updatedAt === "string" ? result.updatedAt : null,
  };
}

export async function fetchRemoteNotifications(): Promise<RemoteNotificationsResponse | null> {
  const result = await syncRemoteRequest<{
    items?: unknown;
    prefs?: unknown;
    updatedAt?: string | null;
  }>({
    method: "GET",
    path: "/api/notifications",
  });
  if (!result.ok) return null;
  return toPayload(result.data);
}

export async function pushRemoteNotifications(
  items: InAppNotificationV1[],
  prefs: NotificationPrefsV1,
): Promise<RemoteNotificationsResponse | null> {
  const result = await syncRemoteRequest<{
    items?: unknown;
    prefs?: unknown;
    updatedAt?: string | null;
  }>({
    method: "PUT",
    path: "/api/notifications",
    body: { items, prefs },
  });
  if (!result.ok) return null;
  return toPayload(result.data);
}
