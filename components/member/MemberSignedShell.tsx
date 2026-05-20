"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";

/**
 * Layout wrapper for signed-in member flows. Bottom tab navigation is provided globally by
 * `GlobalMobileMainNav` in the root layout (hidden on legal/policy routes).
 */
export function MemberSignedShell({ children }: { children: ReactNode }) {
  const pathname = usePathname() ?? "";
  const isMenuPage = /\/menu(?:\/|$)/.test(pathname);

  return (
    <div
      className={
        isMenuPage
          ? "flex h-dvh max-h-dvh flex-col overflow-hidden"
          : "flex min-h-dvh flex-col"
      }
    >
      <div className={isMenuPage ? "flex h-full min-h-0 flex-1 flex-col overflow-hidden" : "flex min-h-0 flex-1 flex-col"}>
        {children}
      </div>
    </div>
  );
}
