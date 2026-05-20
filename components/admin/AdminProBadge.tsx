"use client";

import { useAdminPreferences } from "@/components/admin/AdminPreferencesProvider";
import { isGodAdmin, roleLabel } from "@/lib/auth/roles";

export function AdminProBadge() {
  const { user } = useAdminPreferences();
  const role = user?.role ?? null;
  const god = role ? isGodAdmin(role) : false;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold shadow-sm ${
        god
          ? "border-violet-300 bg-gradient-to-r from-violet-100 to-[#eef4ff] text-violet-900"
          : "border-[#b4ccf7] bg-gradient-to-r from-[#eef4ff] to-white text-[#2D6BFF]"
      }`}
    >
      <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        {god ? (
          <path d="M12 2l2.2 6.8H21l-5.5 4 2.1 6.8L12 16.5 6.4 19.6l2.1-6.8L3 8.8h6.8L12 2zm0 4.2L10.4 11H6.5l3.1 2.3-1.2 3.6L12 14.8l3.6 2.1-1.2-3.6 3.1-2.3h-3.9L12 6.2z" />
        ) : (
          <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6L12 2z" />
        )}
      </svg>
      {role ? roleLabel(role) : "Pro account"}
    </span>
  );
}
