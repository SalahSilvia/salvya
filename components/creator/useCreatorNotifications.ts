"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { CreatorNotificationDto } from "@/lib/creator/notification-types";

const POLL_MS = 45_000;

type State = {
  notifications: CreatorNotificationDto[];
  unreadCount: number;
  loading: boolean;
};

export function useCreatorNotifications(opts?: {
  enabled?: boolean;
  poll?: boolean;
  limit?: number;
}) {
  const enabled = opts?.enabled !== false;
  const poll = opts?.poll !== false;
  const limit = opts?.limit ?? 10;
  const [state, setState] = useState<State>({
    notifications: [],
    unreadCount: 0,
    loading: true,
  });
  const prevUnreadRef = useRef(0);
  const prevOrderIdsRef = useRef<Set<string>>(new Set());

  const refresh = useCallback(async () => {
    if (!enabled) return;
    try {
      const res = await fetch(`/api/creator/notifications?limit=${limit}`, {
        credentials: "include",
        cache: "no-store",
      });
      const body = (await res.json()) as {
        ok?: boolean;
        notifications?: CreatorNotificationDto[];
        unreadCount?: number;
      };
      if (!body.ok) return;

      const notifications = body.notifications ?? [];
      const unreadCount = body.unreadCount ?? 0;

      const orderIds = new Set(
        notifications.filter((n) => n.type === "order_from_link").map((n) => n.id),
      );
      const hadOrders = prevOrderIdsRef.current.size > 0;
      const newOrder = [...orderIds].some((id) => !prevOrderIdsRef.current.has(id));
      if (hadOrders && newOrder && unreadCount > prevUnreadRef.current) {
        const latest = notifications.find((n) => n.type === "order_from_link");
        if (latest) {
          window.dispatchEvent(
            new CustomEvent("salvya:creator-toast", {
              detail: { title: latest.title, body: latest.body },
            }),
          );
        }
      }

      prevOrderIdsRef.current = orderIds;
      prevUnreadRef.current = unreadCount;
      setState({ notifications, unreadCount, loading: false });
    } catch {
      setState((s) => ({ ...s, loading: false }));
    }
  }, [enabled, limit]);

  const markRead = useCallback(
    async (ids?: string[], all?: boolean) => {
      const targetIds = ids ?? [];
      setState((s) => ({
        ...s,
        notifications: s.notifications.map((n) =>
          all || targetIds.includes(n.id) ? { ...n, readAt: n.readAt ?? new Date().toISOString() } : n,
        ),
        unreadCount: all
          ? 0
          : Math.max(0, s.unreadCount - targetIds.filter((id) => s.notifications.some((n) => n.id === id && !n.readAt)).length),
      }));

      try {
        await fetch("/api/creator/notifications/read", {
          method: "PUT",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ids: targetIds.length ? targetIds : undefined, all }),
        });
      } catch {
        /* keep optimistic state */
      }
      void refresh();
    },
    [refresh],
  );

  useEffect(() => {
    if (!enabled) return;
    void refresh();
  }, [enabled, refresh]);

  useEffect(() => {
    if (!enabled || !poll) return;
    const id = window.setInterval(() => void refresh(), POLL_MS);
    return () => window.clearInterval(id);
  }, [enabled, poll, refresh]);

  return { ...state, refresh, markRead };
}
