"use client";

import dynamic from "next/dynamic";
import type { ReactNode } from "react";
import { DomainLoadingFallback } from "@/lib/mfe/DomainLoadingFallback";

const CreatorDomainShell = dynamic(
  () => import("@/domains/creator").then((m) => m.CreatorDomainShell),
  {
    loading: () => <DomainLoadingFallback domain="creator" />,
    ssr: false,
  },
);

/** Lazy-loads the creator MFE chunk — not bundled with storefront pages. */
export function CreatorDomainBoundary({ children }: { children: ReactNode }) {
  return <CreatorDomainShell>{children}</CreatorDomainShell>;
}
