"use client";

import Link from "next/link";
import { useCreatorNotifications } from "@/components/creator/useCreatorNotifications";
import { creatorCardSurface } from "@/lib/theme/creator-accent";
import { SalvyaInlineLoader } from "@/components/loading";

function formatWhen(iso: string): string {
  return new Date(iso).toLocaleString();
}

export function CreatorNotificationsPage() {
  const { notifications, unreadCount, loading, markRead, refresh } = useCreatorNotifications({
    poll: true,
    limit: 50,
  });

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-[1.75rem] font-semibold tracking-tight">Notifications</h1>
          <p className="mt-2 text-[14px] text-white/45">
            Orders, milestones, payouts, campaigns, and studio alerts.
          </p>
        </div>
        {unreadCount > 0 ? (
          <button
            type="button"
            onClick={() => void markRead(undefined, true)}
            className="rounded-xl border border-fuchsia-500/30 bg-fuchsia-500/10 px-4 py-2 text-[13px] font-semibold text-fuchsia-100/90 hover:bg-fuchsia-500/15"
          >
            Mark all read ({unreadCount})
          </button>
        ) : null}
      </header>

      <ul className={`divide-y divide-white/[0.08] overflow-hidden rounded-2xl ${creatorCardSurface}`}>
        {loading ? (
          <li>
            <SalvyaInlineLoader message="Loading notifications" variant="creator" className="py-8" />
          </li>
        ) : notifications.length === 0 ? (
          <li className="px-4 py-10 text-center text-[13px] text-white/45">
            No notifications yet. New orders and payout updates will appear here.
          </li>
        ) : (
          notifications.map((n) => (
            <li key={n.id} className={n.readAt ? "opacity-75" : ""}>
              {n.href ? (
                <Link
                  href={n.href}
                  onClick={() => {
                    if (!n.readAt) void markRead([n.id]);
                  }}
                  className="block px-4 py-4 transition-colors hover:bg-white/[0.04]"
                >
                  <p className="text-[14px] font-semibold text-white/90">{n.title}</p>
                  {n.body ? <p className="mt-1 text-[13px] text-white/45">{n.body}</p> : null}
                  <p className="mt-2 text-[11px] text-white/30">{formatWhen(n.createdAt)}</p>
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    if (!n.readAt) void markRead([n.id]);
                  }}
                  className="block w-full px-4 py-4 text-left transition-colors hover:bg-white/[0.04]"
                >
                  <p className="text-[14px] font-semibold text-white/90">{n.title}</p>
                  {n.body ? <p className="mt-1 text-[13px] text-white/45">{n.body}</p> : null}
                  <p className="mt-2 text-[11px] text-white/30">{formatWhen(n.createdAt)}</p>
                </button>
              )}
            </li>
          ))
        )}
      </ul>

      <button
        type="button"
        onClick={() => void refresh()}
        className="text-[13px] font-semibold text-white/45 hover:text-white/70"
      >
        Refresh
      </button>
    </div>
  );
}
