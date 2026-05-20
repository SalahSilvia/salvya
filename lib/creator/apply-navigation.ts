import { loginHref, registerHref } from "@/lib/auth/login-href";
import type { CreatorLifecycleStatus } from "@/lib/auth/creator-lifecycle";
import type { SalvyaRole } from "@/lib/auth/roles";
import { canAccessCreatorDashboard } from "@/lib/auth/creator-lifecycle";

/** Where signed-in customers submit a creator application (Phase 1). */
export const CREATOR_APPLY_PATH = "/creator/apply";

export const CREATOR_APPLICATION_STATUS_PATH = "/creator/application-status";

export const CREATOR_DASHBOARD_PATH = "/creator/dashboard";

/** Legacy path — redirected to apply in next.config. */
export const CREATOR_ONBOARDING_LEGACY_PATH = "/creator/onboarding";

/** After registration, land on Menu to find Apply in the creator programme card. */
export const CREATOR_APPLY_MENU_PATH = "/menu";

export function creatorApplyHref(isSignedIn: boolean): string {
  return isSignedIn ? CREATOR_APPLY_PATH : registerHref(CREATOR_APPLY_MENU_PATH);
}

export function creatorApplyCtaLabel(isSignedIn: boolean): string {
  return isSignedIn ? "Apply as creator" : "Create account to apply";
}

export function creatorApplyGuestHint(): string {
  return "Create a free Salvya customer account first, then open Menu → Creator programme → Apply.";
}

export function creatorLoginForApplyHref(): string {
  return loginHref(CREATOR_APPLY_PATH);
}

/**
 * Smart redirect for “Become a Creator” CTAs.
 * - Approved creator (influencer role) → dashboard
 * - Pending application → application status
 * - Otherwise → apply form
 */
export function resolveCreatorEntryPath(
  role: SalvyaRole,
  creatorStatus: CreatorLifecycleStatus,
): string {
  if (canAccessCreatorDashboard(role)) return CREATOR_DASHBOARD_PATH;
  if (creatorStatus === "pending") return CREATOR_APPLICATION_STATUS_PATH;
  return CREATOR_APPLY_PATH;
}
