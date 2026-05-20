import { getServerSalvyaUser } from "@/lib/auth/get-user-role";
import { MemberRouteGateServer } from "@/components/member/MemberRouteGateServer";
import { MenuFullPage } from "@/components/layout/menu/MenuFullPage";
import { GuestMenuPage } from "@/components/layout/menu/GuestMenuPage";

export default async function MenuPage() {
  const session = await getServerSalvyaUser();
  if (!session) return <GuestMenuPage />;

  return (
    <MemberRouteGateServer>
      <MenuFullPage />
    </MemberRouteGateServer>
  );
}
