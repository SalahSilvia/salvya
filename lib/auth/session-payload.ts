import type { CreatorLifecycleStatus } from "@/lib/auth/creator-lifecycle";
import {
  canAccessCreatorDashboard,
  canStartCreatorOnboarding,
  creatorLifecycleLabel,
  resolveCreatorLifecycle,
  type InfluencerApplicationStatus,
} from "@/lib/auth/creator-lifecycle";
import type { AuthenticatedSalvyaUser, SalvyaRole } from "@/lib/auth/roles";
import { isAdminCapable, isGodAdmin, roleLabel, salvyaRoleToClient } from "@/lib/auth/roles";
import { defaultHomeForRole } from "@/lib/auth/post-login-redirect";
import type { SalvyaProfileDetails } from "@/lib/profile/types";

export type SalvyaSessionPayload = {
  id: string;
  email: string | null;
  role: SalvyaRole;
  rolePublic: ReturnType<typeof salvyaRoleToClient>;
  roleLabel: string;
  isAdminCapable: boolean;
  isGodAdmin: boolean;
  homePath: string;
  displayName: string;
  profile: SalvyaProfileDetails;
  /** Same account — creator program state from application + role. */
  creatorStatus: CreatorLifecycleStatus;
  creatorStatusLabel: string;
  isCreatorActive: boolean;
  canAccessCreatorDashboard: boolean;
  canApplyAsCreator: boolean;
};

export function buildSessionPayload(
  user: AuthenticatedSalvyaUser,
  email: string | null,
  displayName: string,
  profile: SalvyaProfileDetails,
  applicationStatus?: InfluencerApplicationStatus | null,
): SalvyaSessionPayload {
  const creatorStatus = resolveCreatorLifecycle(user.role, applicationStatus ?? null);

  return {
    id: user.id,
    email,
    role: user.role,
    rolePublic: salvyaRoleToClient(user.role),
    roleLabel: roleLabel(user.role),
    isAdminCapable: isAdminCapable(user.role),
    isGodAdmin: isGodAdmin(user.role),
    homePath: defaultHomeForRole(user.role),
    displayName,
    profile,
    creatorStatus,
    creatorStatusLabel: creatorLifecycleLabel(creatorStatus),
    isCreatorActive: creatorStatus === "active",
    canAccessCreatorDashboard: canAccessCreatorDashboard(user.role),
    canApplyAsCreator: canStartCreatorOnboarding(user.role, creatorStatus),
  };
}
