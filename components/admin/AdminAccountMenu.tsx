"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { AdminProBadge } from "@/components/admin/AdminProBadge";
import { useAdminPreferences } from "@/components/admin/AdminPreferencesProvider";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

type Props = {
  variant?: "topbar" | "sidebar";
};

function initials(name: string | null | undefined, email: string | null | undefined) {
  const src = (name ?? "").trim() || email || "A";
  const parts = src.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return src.slice(0, 2).toUpperCase();
}

export function AdminAccountMenu({ variant = "topbar" }: Props) {
  const router = useRouter();
  const { user: me } = useAdminPreferences();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const isSidebar = variant === "sidebar";

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  const signOut = useCallback(async () => {
    const sb = getSupabaseBrowserClient();
    await sb?.auth.signOut();
    setOpen(false);
    router.replace("/login");
    router.refresh();
  }, [router]);

  const email = me?.email ?? "Admin";
  const title = me?.displayName?.trim() || email;
  const subtitle = me?.roleLabel ?? "Admin";

  return (
    <div ref={rootRef} className={isSidebar ? "relative w-full" : "relative"}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={
          isSidebar
            ? "flex w-full items-center gap-2.5 rounded-lg border border-[#e3e5e7] bg-[#fafbfb] py-2 pl-2 pr-2.5 text-left transition-colors hover:bg-[#f6f6f7]"
            : "flex items-center gap-2 rounded-lg border border-[#e3e5e7] bg-white py-1 pl-1 pr-2.5 shadow-sm transition-colors hover:bg-[#f6f6f7]"
        }
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-[#2D6BFF] text-[11px] font-bold text-white">
          {initials(me?.displayName, me?.email)}
        </span>
        <span
          className={
            isSidebar
              ? "min-w-0 flex-1 truncate text-[12px] font-semibold text-[#202223]"
              : "hidden max-w-[9rem] truncate text-left text-[12px] font-semibold text-[#202223] sm:block"
          }
        >
          {title}
        </span>
        <svg
          className={`h-4 w-4 shrink-0 text-[#6d7175] ${isSidebar ? "" : "hidden sm:block"}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden
        >
          <path strokeWidth={2} strokeLinecap="round" d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {open ? (
        <div
          role="menu"
          className={
            isSidebar
              ? "absolute bottom-[calc(100%+6px)] left-0 right-0 z-50 rounded-xl border border-[#e3e5e7] bg-white p-2 shadow-lg"
              : "absolute right-0 top-[calc(100%+6px)] z-50 w-[min(18rem,92vw)] rounded-xl border border-[#e3e5e7] bg-white p-2 shadow-lg"
          }
        >
          <div className="border-b border-[#e3e5e7] px-3 py-3">
            <p className="truncate text-[13px] font-semibold text-[#202223]">{title}</p>
            <p className="mt-0.5 truncate text-[11px] text-[#6d7175]">{email}</p>
            <p className="mt-1 text-[11px] text-[#6d7175]">{subtitle} · store operator</p>
            {!isSidebar ? (
              <div className="mt-2">
                <AdminProBadge />
              </div>
            ) : null}
          </div>
          <div className="py-1">
            <Link
              href="/admin/settings?section=account"
              role="menuitem"
              onClick={() => setOpen(false)}
              className="block rounded-lg px-3 py-2 text-[13px] font-medium text-[#202223] hover:bg-[#f6f6f7]"
            >
              Admin account settings
            </Link>
            <Link
              href="/account/profile"
              role="menuitem"
              onClick={() => setOpen(false)}
              className="block rounded-lg px-3 py-2 text-[13px] font-medium text-[#202223] hover:bg-[#f6f6f7]"
            >
              Storefront profile
            </Link>
            {me?.isGodAdmin ? (
              <Link
                href="/admin/god"
                role="menuitem"
                onClick={() => setOpen(false)}
                className="block rounded-lg px-3 py-2 text-[13px] font-medium text-violet-800 hover:bg-violet-50"
              >
                God Admin console
              </Link>
            ) : null}
            <Link
              href="/"
              role="menuitem"
              onClick={() => setOpen(false)}
              className="block rounded-lg px-3 py-2 text-[13px] font-medium text-[#202223] hover:bg-[#f6f6f7]"
            >
              View storefront
            </Link>
          </div>
          <div className="border-t border-[#e3e5e7] pt-1">
            <button
              type="button"
              role="menuitem"
              onClick={() => void signOut()}
              className="w-full rounded-lg px-3 py-2 text-left text-[13px] font-medium text-[#6d7175] hover:bg-[#f6f6f7] hover:text-[#202223]"
            >
              Sign out
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
