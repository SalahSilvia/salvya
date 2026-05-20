"use client";

import { useNotificationsUnreadCount } from "@/components/notifications/NotificationsProvider";

/** Unread in-app alerts for the signed-in member (synced when cloud inbox is available). */
export function useMemberAlertUnreadCount() {
  return useNotificationsUnreadCount();
}
