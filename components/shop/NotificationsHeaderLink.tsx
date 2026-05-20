"use client";

import Link from "next/link";
import type { CSSProperties } from "react";
import { NotificationBadge } from "@/components/notifications/NotificationBadge";
import { useMemberAlertUnreadCount } from "@/components/member/useMemberAlertUnreadCount";

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

type Props = {
  className: string;
  style?: CSSProperties;
  /** Bell size inside the button */
  iconClassName?: string;
};

export function NotificationsHeaderLink({ className, style, iconClassName = "h-[21px] w-[21px]" }: Props) {
  const unread = useMemberAlertUnreadCount();

  return (
    <Link
      href="/notifications"
      prefetch={false}
      className={`${className} relative`}
      style={style}
      aria-label={unread > 0 ? `Notifications, ${unread > 9 ? "9 plus" : unread} unread` : "Notifications"}
    >
      <span className="flex flex-col items-center justify-center gap-0.5">
        <NotificationBadge count={unread} variant="above" />
        <BellIcon className={`shrink-0 text-current ${iconClassName}`} />
      </span>
    </Link>
  );
}
