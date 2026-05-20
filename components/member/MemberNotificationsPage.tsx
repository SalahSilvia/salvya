"use client";

import Link from "next/link";
import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { SalvyaEmptyState, SkInboxRows } from "@/components/skeleton";
import { SalvyaBellIcon, SalvyaChevronRightIcon, SalvyaSwipeIcon } from "@/components/ui/SalvyaIcons";
import { NotificationSwipeRow } from "@/components/notifications/NotificationSwipeRow";
import { NotificationVisual } from "@/components/notifications/NotificationVisual";
import { useNotifications } from "@/components/notifications/NotificationsProvider";
import { useSupabaseUser } from "@/components/member/useSupabaseUser";
import { formatNotificationWhen } from "@/lib/notifications/format-time";
import {
  notificationDetail,
  notificationHeadline,
  notificationSubtitle,
} from "@/lib/notifications/presentation";
import type { InAppNotificationV1 } from "@/lib/notifications/types";

export function MemberNotificationsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useSupabaseUser();
  const { items, loading: inboxLoading, markRead, markAllRead, dismiss } = useNotifications();
  const [toast, setToast] = useState<string | null>(null);

  const flash = useCallback((msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 3800);
  }, []);

  const onOpenNotif = useCallback(
    (n: InAppNotificationV1) => {
      if (!n.read) markRead(n.id);
      if (n.href) {
        router.push(n.href);
      }
    },
    [markRead, router],
  );

  const onMarkAllRead = useCallback(() => {
    markAllRead();
    flash("All caught up.");
  }, [flash, markAllRead]);

  if (authLoading || inboxLoading || !user) {
    return (
      <div className="relative flex min-h-0 flex-1 flex-col overflow-y-auto bg-[#050508] text-white">
          <header className="border-b border-white/[0.06] px-5 py-5 pt-[max(1.1rem,env(safe-area-inset-top))]">
            <div className="h-6 w-36 rounded-lg bg-white/[0.08] salvya-sk-sheen-dark salvya-sk-breathe-dark" />
            <div className="mt-2 h-3 w-24 rounded-full bg-white/[0.06] salvya-sk-sheen-dark salvya-sk-breathe-dark" />
          </header>
        <SkInboxRows count={7} />
      </div>
    );
  }

  const unreadCount = items.filter((n) => !n.read).length;

  return (
    <div className="relative flex min-h-0 flex-1 flex-col overflow-y-auto bg-[#050508] text-white">
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        <div className="absolute -right-[15%] top-[18%] h-[min(16rem,55vw)] w-[min(16rem,55vw)] rounded-full bg-[#2D6BFF]/12 blur-[72px]" />
      </div>

      <header className="sticky top-0 z-10 border-b border-white/[0.06] bg-[#050508]/90 px-5 py-5 pt-[max(1.1rem,env(safe-area-inset-top))] backdrop-blur-xl sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="m-0 text-[1.35rem] font-semibold tracking-[-0.03em]">Notifications</h1>
            {unreadCount > 0 ? (
              <p className="mt-1 text-[13px] text-white/45">
                {unreadCount} new {unreadCount === 1 ? "update" : "updates"}
              </p>
            ) : (
              <p className="mt-1 text-[13px] text-white/38">You are all caught up</p>
            )}
          </div>
          {unreadCount > 0 ? (
            <button
              type="button"
              onClick={onMarkAllRead}
              className="rounded-full border border-white/[0.12] bg-white/[0.06] px-3.5 py-2 text-[12px] font-semibold text-white/85 transition-colors hover:border-white/[0.2] hover:bg-white/[0.1]"
            >
              Mark all read
            </button>
          ) : null}
        </div>
      </header>

      <main className="relative z-[1] mx-auto w-full max-w-lg flex-1 px-4 py-5 pb-28 sm:px-5 sm:py-7">
        {toast ? (
          <div
            role="status"
            className="mb-5 rounded-xl border border-emerald-500/25 bg-emerald-500/10 px-4 py-3 text-[14px] text-emerald-100/95"
          >
            {toast}
          </div>
        ) : null}

        {items.length > 0 ? (
          <p className="mb-4 flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.12em] text-white/32">
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-md border border-white/[0.1] bg-white/[0.04] text-white/45">
              <SalvyaSwipeIcon />
            </span>
            Swipe right to dismiss
          </p>
        ) : null}

        {items.length === 0 ? (
          <SalvyaEmptyState
            icon={
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/[0.1] bg-white/[0.05] text-white/40">
                <SalvyaBellIcon className="h-7 w-7" />
              </span>
            }
            title="No notifications yet"
            description="Bag updates, likes, follows, and orders will appear here automatically."
            actionLabel="Browse shop"
            actionHref="/shop"
            tone="dark"
          />
        ) : (
          <ul className="m-0 flex list-none flex-col gap-2.5 p-0">
            {items.map((n) => {
              const unread = !n.read;
              const headline = notificationHeadline(n);
              const subtitle = notificationSubtitle(n);
              const detail = notificationDetail(n);

              return (
                <NotificationSwipeRow key={n.id} onDismiss={() => dismiss(n.id)}>
                  <button
                    type="button"
                    onClick={() => onOpenNotif(n)}
                    className={`flex w-full items-start gap-3.5 rounded-2xl px-3.5 py-3.5 text-left transition-[transform,box-shadow] active:scale-[0.995] ${
                      unread
                        ? "border border-[#2D6BFF]/30 bg-gradient-to-br from-white/[0.1] to-white/[0.04] text-white shadow-[0_4px_24px_-8px_rgba(45,107,255,0.25),inset_0_1px_0_rgba(255,255,255,0.08)]"
                        : "border border-white/[0.07] bg-white/[0.04] text-white/75"
                    }`}
                  >
                    <NotificationVisual notification={n} unread={unread} />

                    <span className="min-w-0 flex-1">
                      <span className="flex items-start justify-between gap-2">
                        <span
                          className={`block text-[14px] leading-snug tracking-[-0.02em] ${
                            unread ? "font-semibold text-white" : "font-medium text-white/70"
                          }`}
                        >
                          {headline}
                        </span>
                        {unread ? (
                          <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-[#2D6BFF]" aria-label="Unread" />
                        ) : null}
                      </span>

                      {subtitle ? (
                        <span
                          className={`mt-1 block truncate text-[13px] font-semibold ${
                            unread ? "text-[#9eb6ff]" : "text-white/55"
                          }`}
                        >
                          {subtitle}
                        </span>
                      ) : null}

                      <span
                        className={`mt-1.5 block text-[12px] leading-relaxed ${
                          unread ? "text-white/55" : "text-white/38"
                        }`}
                      >
                        {detail}
                      </span>

                      <span
                        className={`mt-2 block text-[10px] font-medium uppercase tracking-wide ${
                          unread ? "text-white/35" : "text-white/25"
                        }`}
                      >
                        {formatNotificationWhen(n.createdAt)}
                      </span>
                    </span>

                    {n.href ? (
                      <span
                        className={`mt-2 shrink-0 ${unread ? "text-white/35" : "text-white/20"}`}
                        aria-hidden
                      >
                        <SalvyaChevronRightIcon />
                      </span>
                    ) : null}
                  </button>
                </NotificationSwipeRow>
              );
            })}
          </ul>
        )}

        <p className="mt-10 text-center text-[12px] text-white/30">
          Questions?{" "}
          <Link href="/help-center" prefetch={false} className="font-semibold text-[#8fa8e8] hover:text-[#b8c9ff]">
            Help center
          </Link>
        </p>
      </main>
    </div>
  );
}
