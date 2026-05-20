"use client";

import { useEffect, useState } from "react";

export function DocsReadingProgress() {
  const [pct, setPct] = useState(0);

  useEffect(() => {
    function onScroll() {
      const el = document.documentElement;
      const max = el.scrollHeight - el.clientHeight;
      setPct(max > 0 ? Math.min(100, (el.scrollTop / max) * 100) : 0);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-50 h-0.5 bg-transparent" aria-hidden>
      <div className="h-full bg-gradient-to-r from-blue-600 to-sky-500 transition-[width] duration-150" style={{ width: `${pct}%` }} />
    </div>
  );
}
