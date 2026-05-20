"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AdminCreatorNavBadge } from "@/components/admin/AdminCreatorNavBadge";
import { AdminNavBadge } from "@/components/admin/AdminNavBadge";
import { AdminNavIconGlyph } from "@/components/admin/AdminNavIcon";
import { useAdminPendingCreatorApplicationsContext } from "@/components/admin/AdminPendingCreatorApplicationsProvider";
import { useAdminUnreadOrdersContext } from "@/components/admin/AdminUnreadOrdersProvider";
import {
  ADMIN_NAV_GROUPS,
  ADMIN_QUICK_ACTIONS,
  isAdminNavActive,
  type AdminNavItem,
} from "@/components/admin/nav-config";

type Props = {
  onNavigate?: () => void;
  compact?: boolean;
  showQuickActions?: boolean;
};

export function AdminSidebarNav({ onNavigate, compact = false, showQuickActions = true }: Props) {
  const pathname = usePathname() ?? "";
  const { unread } = useAdminUnreadOrdersContext();
  const { pending: pendingCreators } = useAdminPendingCreatorApplicationsContext();

  return (
    <nav className="flex flex-col gap-1" aria-label="Admin sections">
      {ADMIN_NAV_GROUPS.map((group) => (
        <div key={group.id} className="pb-2">
          {compact ? null : (
            <p className="px-2.5 pb-1.5 pt-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#8c9196]">
              {group.label}
            </p>
          )}
          <div className="space-y-0.5">
            {group.items.map((item) => (
              <NavRow
                key={item.href}
                item={item}
                active={isAdminNavActive(pathname, item.href)}
                compact={compact}
                orderUnread={item.href === "/admin/orders" ? unread : 0}
                creatorPending={item.href === "/admin/creator-applications" ? pendingCreators : 0}
                onNavigate={onNavigate}
              />
            ))}
          </div>
        </div>
      ))}

      {showQuickActions && !compact ? (
        <div className="mt-1 border-t border-[#e3e5e7] pt-3">
          <p className="px-2.5 pb-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#8c9196]">
            Quick actions
          </p>
          <div className="space-y-0.5">
            {ADMIN_QUICK_ACTIONS.map((action) => (
              <Link
                key={action.href}
                href={action.href}
                prefetch={false}
                onClick={onNavigate}
                className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] font-medium text-[#202223] transition-colors hover:bg-[#f6f6f7]"
              >
                <AdminNavIconGlyph name={action.icon} className="h-4 w-4 text-[#2D6BFF]" />
                {action.label}
              </Link>
            ))}
          </div>
        </div>
      ) : null}
    </nav>
  );
}

function NavRow({
  item,
  active,
  compact,
  orderUnread,
  creatorPending,
  onNavigate,
}: {
  item: AdminNavItem;
  active: boolean;
  compact: boolean;
  orderUnread: number;
  creatorPending: number;
  onNavigate?: () => void;
}) {
  return (
    <Link
      href={item.href}
      prefetch={false}
      onClick={onNavigate}
      title={compact ? item.label : undefined}
      className={`flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] font-medium transition-colors ${
        active ? "bg-[#2D6BFF]/10 text-[#1a5ae8]" : "text-[#202223] hover:bg-[#f6f6f7]"
      } ${compact ? "justify-center px-2" : ""}`}
      aria-current={active ? "page" : undefined}
    >
      <AdminNavIconGlyph
        name={item.icon}
        className={`h-4 w-4 shrink-0 ${active ? "text-[#2D6BFF]" : "text-[#6d7175]"}`}
      />
      {compact ? null : <span className="min-w-0 flex-1">{item.label}</span>}
      {!compact && orderUnread > 0 ? <AdminNavBadge count={orderUnread} /> : null}
      {!compact && creatorPending > 0 ? <AdminCreatorNavBadge count={creatorPending} /> : null}
    </Link>
  );
}
