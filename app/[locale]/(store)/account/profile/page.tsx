import { MemberRouteGateServer } from "@/components/member/MemberRouteGateServer";
import { MemberProfileView } from "@/components/member/MemberProfileView";

export default function AccountProfilePage() {
  return (
    <MemberRouteGateServer>
      <MemberProfileView />
    </MemberRouteGateServer>
  );
}
