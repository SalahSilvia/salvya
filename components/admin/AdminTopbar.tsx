"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AdminAccountMenu } from "@/components/admin/AdminAccountMenu";
import { adminPageTitle } from "@/components/admin/nav-config";
import { adminBtnSecondary } from "@/components/admin/admin-theme";

type Props = {
  onOpenSearch: () => void;
  onOpenMenu: () => void;
};

export function AdminTopbar({ onOpenSearch, onOpenMenu }: Props) {
  const pathname = usePathname() ?? "";
  const title = adminPageTitle(pathname);

  return (
    <header className="sticky top-0 z-30 border-b border-[#e3e5e7] bg-white shadow-sm">
      <div className="flex h-14 items-center gap-3 px-4 sm:px-6">
        <button
          type="button"
          className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[#e3e5e7] bg-white text-[#202223] lg:hidden"
          aria-label="Open navigation"
          onClick={onOpenMenu}
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
            <path strokeWidth={1.8} strokeLinecap="round" d="M5 7h14M5 12h14M5 17h10" />
          </svg>
        </button>

        <div className="min-w-0 flex-1">
          <p className="hidden text-[10px] font-semibold uppercase tracking-[0.16em] text-[#6d7175] lg:block">
            Salvya Admin
          </p>
          <h1 className="truncate text-[17px] font-semibold tracking-tight text-[#202223] lg:text-[1.125rem]">{title}</h1>
        </div>

        <button
          type="button"
          onClick={onOpenSearch}
          className="hidden min-w-[12rem] max-w-md flex-1 items-center gap-2 rounded-lg border border-[#e3e5e7] bg-[#f6f6f7] px-3 py-2 text-left text-[13px] text-[#8c9196] transition-colors hover:border-[#c9cccf] hover:bg-white md:flex lg:min-w-[14rem] lg:max-w-sm"
        >
          <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
            <path strokeWidth={2} strokeLinecap="round" d="M21 21l-5.2-5.2M11 18a7 7 0 100-14 7 7 0 000 14z" />
          </svg>
          Search…
          <kbd className="ml-auto hidden rounded border border-[#e3e5e7] bg-white px-1.5 py-0.5 text-[10px] font-semibold text-[#6d7175] lg:inline">
            ⌘K
          </kbd>
        </button>

        <button
          type="button"
          onClick={onOpenSearch}
          className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[#e3e5e7] bg-white text-[#6d7175] md:hidden"
          aria-label="Search admin"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
            <path strokeWidth={2} strokeLinecap="round" d="M21 21l-5.2-5.2M11 18a7 7 0 100-14 7 7 0 000 14z" />
          </svg>
        </button>

        <Link href="/shop" prefetch={false} className={`hidden sm:inline-flex ${adminBtnSecondary}`}>
          View shop
        </Link>

        <div className="hidden lg:block">
          <AdminAccountMenu variant="topbar" />
        </div>
      </div>
    </header>
  );
}
