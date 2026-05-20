import { MemberRouteGateServer } from "@/components/member/MemberRouteGateServer";
import { AccountSettingsView } from "@/components/account/AccountSettingsView";

export default function AccountSettingsPage() {
  return (
    <MemberRouteGateServer>
      <AccountSettingsView />
    </MemberRouteGateServer>
  );
}
