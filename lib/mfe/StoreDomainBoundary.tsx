"use client";

import type { ReactNode } from "react";
import { StoreDomainShell } from "@/domains/store";

/**
 * Store domain — static import (SSR/SEO). Chunk is small and isolated via domains/store.
 */
export function StoreDomainBoundary({ children }: { children: ReactNode }) {
  return <StoreDomainShell>{children}</StoreDomainShell>;
}
