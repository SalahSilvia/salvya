"use client";

import { createContext, useContext, type ReactNode } from "react";
import { useAdminUnreadOrders } from "@/components/admin/useAdminUnreadOrders";

type Ctx = {
  unread: number;
  markSeen: () => Promise<void>;
  refresh: () => Promise<void>;
};

const AdminUnreadOrdersContext = createContext<Ctx | null>(null);

export function AdminUnreadOrdersProvider({ children }: { children: ReactNode }) {
  const value = useAdminUnreadOrders();
  return <AdminUnreadOrdersContext.Provider value={value}>{children}</AdminUnreadOrdersContext.Provider>;
}

export function useAdminUnreadOrdersContext(): Ctx {
  const ctx = useContext(AdminUnreadOrdersContext);
  if (!ctx) {
    return { unread: 0, markSeen: async () => {}, refresh: async () => {} };
  }
  return ctx;
}
