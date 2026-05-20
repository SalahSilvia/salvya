import { redirectLocalized } from "@/lib/i18n/server-redirect";
import { CreatorPublicLanding } from "@/components/creator/CreatorPublicLanding";
import { getServerSalvyaUser } from "@/lib/auth/get-user-role";
import { canAccessCreatorDashboard } from "@/lib/auth/creator-lifecycle";
import { loadSessionForUser } from "@/lib/auth/load-session-for-user";
import {
  CREATOR_APPLICATION_STATUS_PATH,
  CREATOR_DASHBOARD_PATH,
} from "@/lib/creator/apply-navigation";

export default async function CreatorHubPage() {
  const session = await getServerSalvyaUser();

  if (session) {
    if (canAccessCreatorDashboard(session.role)) {
      await redirectLocalized(CREATOR_DASHBOARD_PATH);
    }

    const payload = await loadSessionForUser(session);
    if (payload.creatorStatus === "pending") {
      await redirectLocalized(CREATOR_APPLICATION_STATUS_PATH);
    }

    return <CreatorPublicLanding variant="customer" />;
  }

  return <CreatorPublicLanding variant="guest" />;
}
