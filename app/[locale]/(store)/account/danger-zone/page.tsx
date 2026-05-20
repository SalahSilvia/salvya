import { MemberRouteGateServer } from "@/components/member/MemberRouteGateServer";
import { AccountDangerZoneClient } from "@/components/account/AccountDangerZoneClient";

export default function AccountDangerZonePage() {
  return (
    <MemberRouteGateServer>
      <AccountDangerZoneClient />
    </MemberRouteGateServer>
  );
}
