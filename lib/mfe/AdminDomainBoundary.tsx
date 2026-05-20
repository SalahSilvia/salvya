"use client";

import dynamic from "next/dynamic";
import type { ReactNode } from "react";
import { DomainLoadingFallback } from "@/lib/mfe/DomainLoadingFallback";

const AdminDomainShell = dynamic(
  () => import("@/domains/admin").then((m) => m.AdminDomainShell),
  {
    loading: () => <DomainLoadingFallback domain="admin" />,
    ssr: false,
  },
);

export function AdminDomainBoundary({ children }: { children: ReactNode }) {
  return <AdminDomainShell>{children}</AdminDomainShell>;
}
