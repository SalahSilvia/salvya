import type { SalvyaDomain } from "@/lib/mfe/types";

/** Resolve MFE domain from a pathname (locale prefix optional). */
export function resolveDomainFromPath(pathname: string): SalvyaDomain {
  const path = pathname.replace(/^\/(en|fr|es|it|nl|ar)(?=\/|$)/, "") || "/";

  if (path === "/admin" || path.startsWith("/admin/")) {
    return "admin";
  }

  if (path === "/creator" || path.startsWith("/creator/")) {
    return "creator";
  }

  return "store";
}
