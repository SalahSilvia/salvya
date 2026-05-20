import type { SalvyaRole } from "@/lib/auth/roles";

/** Logo link in main chrome — guests land on shop; signed-in customers on home feed. */
export function storefrontLogoHref(role: SalvyaRole | null): string {
  if (role === "god_admin") return "/admin/god";
  if (role === "admin") return "/admin/overview";
  if (role) return "/";
  return "/shop";
}
