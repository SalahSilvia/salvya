"use client";

import { createContext, useContext, type ReactNode } from "react";
import { useCreatorNotifications } from "@/components/creator/useCreatorNotifications";

type CreatorNotificationContextValue = ReturnType<typeof useCreatorNotifications>;

const CreatorNotificationContext = createContext<CreatorNotificationContextValue | null>(null);

export function CreatorNotificationProvider({ children }: { children: ReactNode }) {
  const value = useCreatorNotifications({ poll: true, limit: 10 });
  return (
    <CreatorNotificationContext.Provider value={value}>{children}</CreatorNotificationContext.Provider>
  );
}

export function useCreatorNotificationContext(): CreatorNotificationContextValue {
  const ctx = useContext(CreatorNotificationContext);
  if (!ctx) {
    throw new Error("useCreatorNotificationContext must be used within CreatorNotificationProvider");
  }
  return ctx;
}

/** Shared poll state in studio; local hook fallback elsewhere. */
export function useCreatorNotificationsOptional(): CreatorNotificationContextValue {
  const ctx = useContext(CreatorNotificationContext);
  return ctx ?? useCreatorNotifications({ poll: true, limit: 10 });
}
