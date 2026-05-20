import { MemberRouteGateServer } from "@/components/member/MemberRouteGateServer";
import { MyOrdersPage } from "@/components/orders/MyOrdersPage";

export default function OrdersPage() {
  return (
    <MemberRouteGateServer>
      <MyOrdersPage />
    </MemberRouteGateServer>
  );
}
