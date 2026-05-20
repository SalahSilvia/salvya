import { MemberRouteGateServer } from "@/components/member/MemberRouteGateServer";
import { RefundsListView } from "@/components/account/refunds/RefundsListView";

export default function AccountRefundsPage() {
  return (
    <MemberRouteGateServer>
      <RefundsListView />
    </MemberRouteGateServer>
  );
}
