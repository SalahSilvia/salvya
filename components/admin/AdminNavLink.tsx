"use client";

import Link from "next/link";
import { AdminCreatorNavBadge } from "@/components/admin/AdminCreatorNavBadge";
import { AdminNavBadge } from "@/components/admin/AdminNavBadge";
import { AdminNavIconGlyph } from "@/components/admin/AdminNavIcon";
import { useAdminPendingCreatorApplicationsContext } from "@/components/admin/AdminPendingCreatorApplicationsProvider";
import { useAdminUnreadOrdersContext } from "@/components/admin/AdminUnreadOrdersProvider";
import type { AdminNavItem } from "@/components/admin/nav-config";
import { isAdminNavActive } from "@/components/admin/nav-config";

type Variant = "top" | "dock" | "sheet" | "sidebar";

type Props = {
  item: AdminNavItem;
  pathname: string;
  variant: Variant;
  onNavigate?: () => void;
};

export function AdminNavLink({ item, pathname, variant, onNavigate }: Props) {
  const active = isAdminNavActive(pathname, item.href);
  const { unread } = useAdminUnreadOrdersContext();
  const { pending: pendingCreators } = useAdminPendingCreatorApplicationsContext();
  const showOrderBadge = item.href === "/admin/orders" && unread > 0;
  const showCreatorBadge = item.href === "/admin/creator-applications" && pendingCreators > 0;

  if (variant === "top") {
    return (
      <Link
        href={item.href}
        prefetch={false}
        onClick={onNavigate}
        className={`inline-flex shrink-0 items-center gap-2 rounded-lg px-3.5 py-2 text-[13px] font-semibold transition-colors ${
          active
            ? "bg-[#2D6BFF] text-white shadow-sm"
            : "text-[#6d7175] hover:bg-[#ebecee] hover:text-[#202223]"
        }`}
      >
        <AdminNavIconGlyph name={item.icon} className="h-4 w-4" />
        <span className="hidden xl:inline">{item.label}</span>
        <span className="xl:hidden">{item.shortLabel}</span>
        {showOrderBadge ? <AdminNavBadge count={unread} className="ml-0.5" /> : null}
        {showCreatorBadge ? <AdminCreatorNavBadge count={pendingCreators} className="ml-0.5" /> : null}
      </Link>
    );
  }

  if (variant === "sidebar") {
    return (
      <Link
        href={item.href}
        prefetch={false}
        onClick={onNavigate}
        className={`flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] font-medium transition-colors ${
          active
            ? "bg-[#eef4ff] text-[#2D6BFF] shadow-[inset_0_0_0_1px_rgba(45,107,255,0.2)]"
            : "text-[#202223] hover:bg-[#f6f6f7]"
        }`}
      >
        <AdminNavIconGlyph name={item.icon} className={`h-4 w-4 ${active ? "text-[#2D6BFF]" : "text-[#6d7175]"}`} />
        <span className="min-w-0 flex-1">{item.label}</span>
        {showOrderBadge ? <AdminNavBadge count={unread} /> : null}
        {showCreatorBadge ? <AdminCreatorNavBadge count={pendingCreators} /> : null}
      </Link>
    );
  }

  if (variant === "dock") {
    return (
      <Link
        href={item.href}
        prefetch={false}
        onClick={onNavigate}
        className={`flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-xl px-1 py-1.5 text-[10px] font-semibold transition-colors ${
          active ? "text-[#2D6BFF]" : "text-[#6d7175]"
        }`}
      >
        <span
          className={`relative flex h-9 w-9 items-center justify-center rounded-xl ${
            active ? "bg-[#eef4ff] text-[#2D6BFF]" : "text-[#8c9196]"
          }`}
        >
          <AdminNavIconGlyph name={item.icon} className="h-5 w-5" />
          {showOrderBadge ? (
            <AdminNavBadge count={unread} className="absolute -right-0.5 -top-0.5 min-h-[14px] min-w-[14px] text-[9px] shadow-[0_0_0_1.5px_#fff]" />
          ) : null}
          {showCreatorBadge ? (
            <AdminCreatorNavBadge
              count={pendingCreators}
              className="absolute -right-0.5 -top-0.5 min-h-[14px] min-w-[14px] text-[9px] shadow-[0_0_0_1.5px_#fff]"
            />
          ) : null}
        </span>
        <span className="max-w-full truncate">{item.shortLabel}</span>
      </Link>
    );
  }

  return (
    <Link
      href={item.href}
      prefetch={false}
      onClick={onNavigate}
      className={`flex items-center gap-3 rounded-lg px-3 py-3 text-[14px] font-medium transition-colors ${
        active ? "bg-[#eef4ff] text-[#2D6BFF]" : "text-[#202223] hover:bg-[#f6f6f7]"
      }`}
    >
      <AdminNavIconGlyph name={item.icon} className={active ? "text-[#2D6BFF]" : "text-[#6d7175]"} />
      {item.label}
    </Link>
  );
}
