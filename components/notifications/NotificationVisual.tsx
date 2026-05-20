"use client";

import Image from "next/image";
import type { ReactNode } from "react";
import type { InAppNotifContext } from "@/lib/notifications/context";
import { inferNotificationContext } from "@/lib/notifications/context";
import type { InAppNotificationV1 } from "@/lib/notifications/types";

function BagIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path
        d="M6 8h12l-1 12H7L6 8ZM9 8V6a3 3 0 116 0v2"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function HeartIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path
        d="M12 20.5s-7-4.6-7-9.2a4 4 0 017-2.4 4 4 0 017 2.4c0 4.6-7 9.2-7 9.2Z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function PackageIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path
        d="M3 8.5 12 4l9 4.5-9 4.5-9-4.5ZM12 13v7M3 8.5V16l9 5 9-5V8.5"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function UserIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <circle cx="12" cy="8" r="3.25" stroke="currentColor" strokeWidth="1.75" />
      <path
        d="M5 20c0-3.3 3.1-5.5 7-5.5s7 2.2 7 5.5"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  );
}

function NewsIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path
        d="M5 5h14v14H5V5ZM8 9h8M8 12.5h8M8 16h5"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  );
}

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

export function notificationAccentClass(ctx: InAppNotifContext, unread: boolean): string {
  if (!unread) return "text-white/45";
  switch (ctx.type) {
    case "bag_item":
      return "text-[#2D6BFF]";
    case "like_item":
      return "text-rose-500";
    case "follow_artist":
      return "text-violet-500";
    case "order":
      return "text-emerald-500";
    case "account":
      return "text-sky-500";
    case "news":
      return "text-amber-500";
    default:
      return "text-white/50";
  }
}

function IconTile({
  unread,
  accent,
  children,
}: {
  unread: boolean;
  accent: string;
  children: ReactNode;
}) {
  return (
    <span
      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border ${
        unread
          ? "border-slate-200/90 bg-white shadow-[0_2px_12px_-4px_rgba(15,23,42,0.12)]"
          : "border-white/[0.08] bg-white/[0.05]"
      } ${accent}`}
    >
      {children}
    </span>
  );
}

type VisualProps = {
  notification: InAppNotificationV1;
  unread: boolean;
};

export function NotificationVisual({ notification, unread }: VisualProps) {
  const ctx = inferNotificationContext(notification);
  const accent = notificationAccentClass(ctx, unread);

  if (ctx.type === "follow_artist") {
    return (
      <div className="relative h-12 w-12 shrink-0">
        {unread ? (
          <span
            className="absolute -inset-0.5 rounded-2xl bg-gradient-to-br from-violet-500/50 to-[#2D6BFF]/40"
            aria-hidden
          />
        ) : null}
        <Image
          src={ctx.avatarUrl}
          alt={ctx.artistName}
          width={48}
          height={48}
          className={`relative z-[1] h-12 w-12 rounded-2xl object-cover ${
            unread ? "ring-2 ring-white" : "ring-1 ring-white/20 opacity-85"
          }`}
          unoptimized
        />
      </div>
    );
  }

  const imageUrl =
    ctx.type === "bag_item" ? ctx.imageUrl : ctx.type === "like_item" ? ctx.imageUrl : undefined;

  if (imageUrl) {
    return (
      <Image
        src={imageUrl}
        alt=""
        width={48}
        height={48}
        className={`h-12 w-12 shrink-0 rounded-2xl object-cover ${
          unread ? "ring-2 ring-[#2D6BFF]/20 ring-offset-1 ring-offset-white" : "opacity-75 ring-1 ring-white/15"
        }`}
        unoptimized
      />
    );
  }

  const Icon =
    ctx.type === "bag_item"
      ? BagIcon
      : ctx.type === "like_item"
        ? HeartIcon
        : ctx.type === "order"
          ? PackageIcon
          : ctx.type === "account"
            ? UserIcon
            : ctx.type === "news"
              ? NewsIcon
              : BellIcon;

  return (
    <IconTile unread={unread} accent={accent}>
      <Icon className="h-5 w-5" />
    </IconTile>
  );
}
