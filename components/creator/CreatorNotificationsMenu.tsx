"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useCreatorNotificationsOptional } from "@/components/creator/CreatorNotificationProvider";
import { SalvyaInlineLoader } from "@/components/loading";

const utilBtn =
  "relative flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.1] bg-white/[0.05] text-white/90 transition-colors hover:border-white/[0.16] hover:bg-white/[0.08]";

function BellIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path
        d="M12 22a2 2 0 002-2H10a2 2 0 002 2ZM18 16v-5a6 6 0 10-12 0v5l-2 2v1h16v-1l-2-2Z"
        stroke="currentColor"
        strokeWidth="1.65"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function formatWhen(iso: string): string {
  const d = new Date(iso);
  const diff = Date.now() - d.getTime();
  if (diff < 60_000) return "Just now";
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`;
  return d.toLocaleDateString();
}

export function CreatorNotificationsMenu() {
  const { notifications, unreadCount, loading, markRead } = useCreatorNotificationsOptional();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        className={utilBtn}
        aria-label={unreadCount > 0 ? `Notifications, ${unreadCount} unread` : "Notifications"}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <BellIcon className="h-5 w-5" />
        {unreadCount > 0 ? (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-fuchsia-500 px-1 text-[9px] font-bold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        ) : null}
      </button>

      {open ? (
        <div className="absolute right-0 top-[calc(100%+0.5rem)] z-50 w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-white/10 bg-[#0c0814]/98 shadow-[0_20px_60px_-12px_rgba(0,0,0,0.65)] backdrop-blur-xl">
          <div className="flex items-center justify-between border-b border-white/[0.08] px-4 py-3">
            <p className="text-[13px] font-semibold text-white/90">Notifications</p>
            {unreadCount > 0 ? (
              <button
                type="button"
                onClick={() => void markRead(undefined, true)}
                className="text-[11px] font-semibold text-fuchsia-300/90 hover:text-fuchsia-200"
              >
                Mark all read
              </button>
            ) : null}
          </div>

          <ul className="max-h-80 overflow-y-auto">
            {loading ? (
              <li>
                <SalvyaInlineLoader message="Loading" variant="creator" className="py-6" />
              </li>
            ) : notifications.length === 0 ? (
              <li className="px-4 py-8 text-center text-[13px] text-white/45">No notifications yet.</li>
            ) : (
              notifications.map((n) => {
                const inner = (
                  <>
                    <p className="text-[13px] font-semibold text-white/90">{n.title}</p>
                    {n.body ? <p className="mt-0.5 line-clamp-2 text-[12px] text-white/45">{n.body}</p> : null}
                    <p className="mt-1 text-[10px] text-white/30">{formatWhen(n.createdAt)}</p>
                  </>
                );
                return (
                  <li key={n.id} className="border-b border-white/[0.06] last:border-0">
                    {n.href ? (
                      <Link
                        href={n.href}
                        onClick={() => {
                          if (!n.readAt) void markRead([n.id]);
                          setOpen(false);
                        }}
                        className={`block px-4 py-3 transition-colors hover:bg-white/[0.04] ${n.readAt ? "opacity-70" : ""}`}
                      >
                        {inner}
                      </Link>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          if (!n.readAt) void markRead([n.id]);
                        }}
                        className={`block w-full px-4 py-3 text-left transition-colors hover:bg-white/[0.04] ${n.readAt ? "opacity-70" : ""}`}
                      >
                        {inner}
                      </button>
                    )}
                  </li>
                );
              })
            )}
          </ul>

          <div className="border-t border-white/[0.08] px-4 py-2.5">
            <Link
              href="/creator/notifications"
              onClick={() => setOpen(false)}
              className="text-[12px] font-semibold text-fuchsia-300/90 hover:text-fuchsia-200"
            >
              View all →
            </Link>
          </div>
        </div>
      ) : null}
    </div>
  );
}
