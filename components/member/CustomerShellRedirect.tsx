"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSupabaseUser } from "@/components/member/useSupabaseUser";
import { SalvyaBusyOverlay } from "@/components/skeleton/SalvyaBusyOverlay";

type Tone = "daylight" | "dark";

/**
 * Redirects signed-in customers away from guest / auth / creator surfaces (they use the customer shell only).
 */
export function CustomerShellRedirect({ to = "/", tone = "daylight" }: { to?: string; tone?: Tone }) {
  const { user, loading } = useSupabaseUser();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) router.replace(to);
  }, [loading, user, router, to]);

  if (!loading && !user) return null;

  return <SalvyaBusyOverlay tone={tone} message={loading ? undefined : "Redirecting…"} />;
}
