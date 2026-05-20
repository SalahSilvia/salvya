import { MemberRouteGateServer } from "@/components/member/MemberRouteGateServer";
import { MemberNotificationsPage } from "@/components/member/MemberNotificationsPage";

export default function NotificationsPage() {
  return (
    <MemberRouteGateServer>
      <MemberNotificationsPage />
    </MemberRouteGateServer>
  );
}
