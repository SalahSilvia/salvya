import type { SalvyaRole } from "@/lib/auth/roles";

/** Trusted DB role after sign-in (retries while session cookies propagate). */
export async function fetchSessionRole(maxAttempts = 4): Promise<SalvyaRole> {
  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    try {
      const res = await fetch("/api/auth/me", { credentials: "include", cache: "no-store" });
      if (res.ok) {
        const body = (await res.json()) as { ok?: boolean; user?: { role?: SalvyaRole } | null };
        if (body.ok && body.user?.role) return body.user.role;
      }
    } catch {
      /* network */
    }
    if (attempt < maxAttempts - 1) {
      await new Promise((r) => setTimeout(r, 60 * (attempt + 1)));
    }
  }
  return "customer";
}
