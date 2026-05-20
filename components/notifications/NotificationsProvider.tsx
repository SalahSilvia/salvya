"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  type ReactNode,
} from "react";
import { subscribeNotifications } from "@/lib/notifications/events";
import {
  notificationsSyncConfig,
  type NotificationSnapshot,
} from "@/lib/notifications/notifications-sync-config";
import { appendNotification, type NewNotificationInput } from "@/lib/notifications/append";
import type { CustomerNotificationRequest } from "@/lib/notifications/automation";
import type { InAppNotificationV1, NotificationPrefsV1 } from "@/lib/notifications/types";
import { unreadCount } from "@/lib/notifications/validate";
import { useAccountSyncedResource } from "@/lib/sync/useAccountSyncedResource";
import { CustomerNotificationAutomation } from "@/components/notifications/CustomerNotificationAutomation";

export type NotificationsContextValue = {
  items: InAppNotificationV1[];
  prefs: NotificationPrefsV1;
  unreadCount: number;
  loading: boolean;
  synced: boolean;
  isSignedIn: boolean;
  updatePrefs: (next: NotificationPrefsV1) => void;
  markRead: (id: string) => void;
  markAllRead: () => void;
  dismiss: (id: string) => void;
  pushNotification: (payload: CustomerNotificationRequest) => void;
  refresh: () => void;
};

const NotificationsContext = createContext<NotificationsContextValue | null>(null);

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const sync = useAccountSyncedResource(notificationsSyncConfig);

  useEffect(() => {
    return subscribeNotifications(sync.reloadFromLocal);
  }, [sync.reloadFromLocal]);

  const persistChange = useCallback(
    (nextItems: InAppNotificationV1[], nextPrefs: NotificationPrefsV1, pushImmediately = false) => {
      if (!sync.userId) return;
      const snap: NotificationSnapshot = { items: nextItems, prefs: nextPrefs };
      sync.replaceData(snap);
      if (pushImmediately) sync.pushNow();
    },
    [sync.pushNow, sync.replaceData, sync.userId],
  );

  const updatePrefs = useCallback(
    (next: NotificationPrefsV1) => {
      persistChange(sync.data.items, next);
    },
    [persistChange, sync.data.items],
  );

  const markRead = useCallback(
    (id: string) => {
      const next = sync.data.items.map((n) => (n.id === id ? { ...n, read: true } : n));
      persistChange(next, sync.data.prefs, true);
    },
    [persistChange, sync.data.items, sync.data.prefs],
  );

  const markAllRead = useCallback(() => {
    const next = sync.data.items.map((n) => ({ ...n, read: true }));
    persistChange(next, sync.data.prefs, true);
  }, [persistChange, sync.data.items, sync.data.prefs]);

  const dismiss = useCallback(
    (id: string) => {
      persistChange(
        sync.data.items.filter((n) => n.id !== id),
        sync.data.prefs,
        true,
      );
    },
    [persistChange, sync.data.items, sync.data.prefs],
  );

  const pushNotification = useCallback(
    (payload: CustomerNotificationRequest) => {
      if (!sync.userId) return;
      const next = appendNotification(sync.data.items, payload as NewNotificationInput, sync.data.prefs);
      persistChange(next, sync.data.prefs);
    },
    [persistChange, sync.data.items, sync.data.prefs, sync.userId],
  );

  const count = useMemo(
    () => unreadCount(sync.data.items, sync.data.prefs),
    [sync.data.items, sync.data.prefs],
  );

  const value = useMemo<NotificationsContextValue>(
    () => ({
      items: sync.data.items,
      prefs: sync.data.prefs,
      unreadCount: count,
      loading: sync.loading,
      synced: sync.synced,
      isSignedIn: sync.isSignedIn,
      updatePrefs,
      markRead,
      markAllRead,
      dismiss,
      pushNotification,
      refresh: sync.refresh,
    }),
    [
      sync.data.items,
      sync.data.prefs,
      count,
      sync.loading,
      sync.synced,
      sync.isSignedIn,
      sync.refresh,
      updatePrefs,
      markRead,
      markAllRead,
      dismiss,
      pushNotification,
    ],
  );

  return (
    <NotificationsContext.Provider value={value}>
      <CustomerNotificationAutomation />
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotifications(): NotificationsContextValue {
  const ctx = useContext(NotificationsContext);
  if (!ctx) throw new Error("useNotifications must be used within NotificationsProvider");
  return ctx;
}

/** Safe when provider may be absent — returns 0 unread. */
export function useNotificationsUnreadCount(): number {
  const ctx = useContext(NotificationsContext);
  return ctx?.unreadCount ?? 0;
}
