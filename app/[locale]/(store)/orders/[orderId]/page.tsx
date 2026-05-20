import { MemberRouteGateServer } from "@/components/member/MemberRouteGateServer";
import { OrderDetailPage } from "@/components/orders/OrderDetailPage";

type Props = { params: Promise<{ orderId: string }> };

export default async function OrderDetailRoute({ params }: Props) {
  const { orderId } = await params;
  return (
    <MemberRouteGateServer>
      <OrderDetailPage orderId={orderId} />
    </MemberRouteGateServer>
  );
}
