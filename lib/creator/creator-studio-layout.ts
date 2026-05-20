import { redirectLocalized } from "@/lib/i18n/server-redirect";
import { getServerSalvyaUser } from "@/lib/auth/get-user-role";
import { canAccessCreatorDashboard } from "@/lib/auth/creator-lifecycle";
import { loginHref } from "@/lib/auth/login-href";
import { CREATOR_APPLY_PATH } from "@/lib/creator/apply-navigation";

/** Shared server guard for creator studio pages (products, links, dashboard). */
export async function ensureCreatorStudioAccess(returnPath: string): Promise<void> {
  const session = await getServerSalvyaUser();
  if (!session) {
    await redirectLocalized(loginHref(returnPath));
  }
  if (!canAccessCreatorDashboard(session!.role)) {
    await redirectLocalized(CREATOR_APPLY_PATH);
  }
}
