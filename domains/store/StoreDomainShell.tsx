"use client";

import type { ReactNode } from "react";
import { DesktopMainNav } from "@/domains/store/nav/DesktopMainNav";
import { MobileMainNav } from "@/domains/store/nav/MobileMainNav";
import { usePathname } from "next/navigation";

const mobilePad = "max-md:pb-[calc(6.25rem+env(safe-area-inset-bottom))]";
const desktopPad = "md:pt-[calc(3.5rem+env(safe-area-inset-top))]";

/**
 * Storefront domain shell — lightweight, SSR-friendly.
 * No creator charts, wallet, or AI modules.
 */
export function StoreDomainShell({ children }: { children: ReactNode }) {
  const pathname = usePathname() ?? "/";
  const isFullViewportMenu = /\/menu(?:\/|$)/.test(pathname);
  const hideChrome =
    /\/terms(?:\/|$)/.test(pathname) ||
    /\/cookies(?:\/|$)/.test(pathname) ||
    /\/checkout/.test(pathname) ||
    /\/account\/refunds\//.test(pathname);

  const pad = hideChrome || isFullViewportMenu ? undefined : `${mobilePad} ${desktopPad}`;

  return (
    <>
      <div className={pad}>{children}</div>
      {hideChrome ? null : (
        <>
          <MobileMainNav />
          <DesktopMainNav />
        </>
      )}
    </>
  );
}
