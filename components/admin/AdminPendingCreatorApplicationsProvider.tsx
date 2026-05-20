"use client";

import { createContext, useContext, type ReactNode } from "react";
import { useAdminPendingCreatorApplications } from "@/components/admin/useAdminPendingCreatorApplications";

type Ctx = { pending: number; refresh: () => Promise<void> };

const AdminPendingCreatorApplicationsContext = createContext<Ctx | null>(null);

export function AdminPendingCreatorApplicationsProvider({ children }: { children: ReactNode }) {
  const value = useAdminPendingCreatorApplications();
  return (
    <AdminPendingCreatorApplicationsContext.Provider value={value}>
      {children}
    </AdminPendingCreatorApplicationsContext.Provider>
  );
}

export function useAdminPendingCreatorApplicationsContext(): Ctx {
  const ctx = useContext(AdminPendingCreatorApplicationsContext);
  if (!ctx) {
    return { pending: 0, refresh: async () => {} };
  }
  return ctx;
}
