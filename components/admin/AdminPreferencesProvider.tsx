"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { AdminMeUser } from "@/lib/admin/admin-me";
import type { AdminUserPreferences } from "@/lib/admin/admin-preferences";

type AdminPrefsContextValue = {
  user: AdminMeUser | null;
  compactNav: boolean;
  isGodAdmin: boolean;
  preferences: AdminUserPreferences | null;
  sessionExpired: boolean;
  refresh: () => Promise<boolean>;
};

const AdminPrefsContext = createContext<AdminPrefsContextValue | null>(null);

export function AdminPreferencesProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AdminMeUser | null>(null);
  const [preferences, setPreferences] = useState<AdminUserPreferences | null>(null);
  const [sessionExpired, setSessionExpired] = useState(false);

  const refresh = useCallback(async (): Promise<boolean> => {
    try {
      const res = await fetch("/api/admin/me", { credentials: "include", cache: "no-store" });
      if (res.status === 401 || res.status === 403) {
        setSessionExpired(true);
        return false;
      }
      const body = (await res.json()) as {
        ok?: boolean;
        preferences?: AdminUserPreferences;
        user?: AdminMeUser;
      };
      if (!res.ok || !body.ok) return false;
      setSessionExpired(false);
      if (body.user) setUser(body.user);
      if (body.preferences) setPreferences(body.preferences);
      return true;
    } catch {
      return false;
    }
  }, []);

  useEffect(() => {
    void refresh();
    const onPrefs = () => void refresh();
    window.addEventListener("salvya-admin-prefs-changed", onPrefs);
    return () => window.removeEventListener("salvya-admin-prefs-changed", onPrefs);
  }, [refresh]);

  const value = useMemo(
    () => ({
      user,
      compactNav: preferences?.compactNav ?? false,
      isGodAdmin: user?.isGodAdmin ?? false,
      preferences,
      sessionExpired,
      refresh,
    }),
    [user, preferences, sessionExpired, refresh],
  );

  return <AdminPrefsContext.Provider value={value}>{children}</AdminPrefsContext.Provider>;
}

export function useAdminPreferences() {
  const ctx = useContext(AdminPrefsContext);
  if (!ctx) {
    return {
      user: null,
      compactNav: false,
      isGodAdmin: false,
      preferences: null,
      sessionExpired: false,
      refresh: async () => false,
    };
  }
  return ctx;
}
