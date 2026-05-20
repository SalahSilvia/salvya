"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { clearPostAuthNotice, readPostAuthNotice } from "@/lib/auth/post-auth-notice";

const AUTH_PREFIXES = ["/login", "/register", "/auth"];

function isAuthPath(pathname: string | null) {
  if (!pathname) return true;
  return AUTH_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

export function PostAuthNoticeBar() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (isAuthPath(pathname)) {
      setVisible(false);
      return;
    }
    const n = readPostAuthNotice();
    setVisible(n?.kind === "confirm_email");
  }, [pathname]);

  if (!visible) return null;

  return (
    <div
      role="status"
      className="pointer-events-auto fixed inset-x-0 top-0 z-[200] border-b border-blue-900/40 bg-gradient-to-r from-blue-950 via-blue-900 to-indigo-950 px-[max(1rem,env(safe-area-inset-left))] py-3 pr-[max(1rem,env(safe-area-inset-right))] pt-[calc(0.75rem+env(safe-area-inset-top))] text-[13px] leading-snug text-blue-50 shadow-lg sm:text-[14px] sm:leading-relaxed"
    >
      <div className="mx-auto flex max-w-5xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <p className="min-w-0 flex-1">
          <span className="font-semibold text-white">You are signed in.</span> When our email arrives, open the link to
          confirm your address. That keeps your account secure. Until then you can keep shopping.
        </p>
        <button
          type="button"
          onClick={() => {
            clearPostAuthNotice();
            setVisible(false);
          }}
          className="shrink-0 self-start rounded-full bg-white/15 px-4 py-2 text-[12px] font-semibold text-white ring-1 ring-white/25 transition-colors hover:bg-white/25 sm:self-center"
        >
          Got it
        </button>
      </div>
    </div>
  );
}
