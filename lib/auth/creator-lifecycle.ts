import type { SalvyaRole } from "@/lib/auth/roles";
import { roleSatisfies } from "@/lib/auth/roles";

/** Product-facing creator states (one account — not a separate user table). */
export type CreatorLifecycleStatus =
  | "none"
  | "pending"
  | "active"
  | "rejected"
  | "suspended";

export type InfluencerApplicationStatus = "pending" | "approved" | "rejected" | "suspended";

export function resolveCreatorLifecycle(
  role: SalvyaRole,
  applicationStatus: InfluencerApplicationStatus | null | undefined,
): CreatorLifecycleStatus {
  if (role === "influencer" || role === "admin" || role === "god_admin") {
    if (applicationStatus === "suspended") return "suspended";
    return "active";
  }

  if (!applicationStatus) return "none";
  if (applicationStatus === "pending") return "pending";
  if (applicationStatus === "rejected") return "rejected";
  if (applicationStatus === "suspended") return "suspended";
  if (applicationStatus === "approved") return "pending";
  return "none";
}

export function canAccessCreatorDashboard(role: SalvyaRole): boolean {
  return roleSatisfies(role, ["influencer", "admin", "god_admin"]);
}

export function canStartCreatorOnboarding(role: SalvyaRole, lifecycle: CreatorLifecycleStatus): boolean {
  if (role !== "customer") return false;
  return lifecycle === "none" || lifecycle === "rejected";
}

export function creatorLifecycleLabel(status: CreatorLifecycleStatus): string {
  switch (status) {
    case "pending":
      return "Application under review";
    case "active":
      return "Creator active";
    case "rejected":
      return "Application not approved";
    case "suspended":
      return "Creator access paused";
    default:
      return "Not a creator yet";
  }
}
