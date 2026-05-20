import { redirectLocalized } from "@/lib/i18n/server-redirect";
import { CreatorLayoutClient } from "@/components/creator/CreatorLayoutClient";
import { getServerSalvyaUser } from "@/lib/auth/get-user-role";
import { canAccessCreatorDashboard } from "@/lib/auth/creator-lifecycle";
import { loadSessionForUser } from "@/lib/auth/load-session-for-user";
import { loginHref } from "@/lib/auth/login-href";
import { CREATOR_APPLY_PATH, CREATOR_DASHBOARD_PATH } from "@/lib/creator/apply-navigation";

export default async function CreatorApplicationStatusLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSalvyaUser();
  if (!session) {
    await redirectLocalized(loginHref("/creator/application-status"));
  }

  if (canAccessCreatorDashboard(session!.role)) {
    await redirectLocalized(CREATOR_DASHBOARD_PATH);
  }

  const payload = await loadSessionForUser(session!);
  if (payload.creatorStatus === "none") {
    await redirectLocalized(CREATOR_APPLY_PATH);
  }

  return <CreatorLayoutClient>{children}</CreatorLayoutClient>;
}
