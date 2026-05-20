"use client";

import type { ReactNode } from "react";
import { AdminShell } from "@/components/admin/AdminShell";

/** Admin domain shell — moderation, payouts, applications (separate chunk). */
export function AdminDomainShell({ children }: { children: ReactNode }) {
  return (
    <div className="admin-area min-h-screen">
      <AdminShell>{children}</AdminShell>
    </div>
  );
}
