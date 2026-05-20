"use client";

import { useEffect, useState } from "react";

/**
 * `true` / `false` from the OS “reduce motion” setting. `null` until the client has read `matchMedia`
 * (same rough shape as Framer’s hook, without relying on its export surviving the bundler).
 */
export function usePrefersReducedMotion(): boolean | null {
  const [reduced, setReduced] = useState<boolean | null>(null);

  useEffect(() => {
    const mq = globalThis.matchMedia?.("(prefers-reduced-motion: reduce)");
    if (!mq) {
      setReduced(false);
      return;
    }
    setReduced(mq.matches);
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  return reduced;
}
