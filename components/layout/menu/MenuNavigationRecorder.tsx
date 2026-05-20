"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { recordNavPath } from "@/lib/menu-nav-recents";

/** Records last visited paths for the menu “Recent” strip (localStorage). */
export function MenuNavigationRecorder() {
  const pathname = usePathname();
  const prev = useRef<string | null>(null);

  useEffect(() => {
    if (!pathname || pathname === prev.current) return;
    prev.current = pathname;
    recordNavPath(pathname);
  }, [pathname]);

  return null;
}
