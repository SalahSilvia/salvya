import { MemberRouteGateServer } from "@/components/member/MemberRouteGateServer";
import { RefundDetailView } from "@/components/account/refunds/RefundDetailView";

type Props = { params: Promise<{ orderId: string }> };

export default async function AccountRefundDetailPage({ params }: Props) {
  const { orderId } = await params;
  return (
    <MemberRouteGateServer>
      <RefundDetailView orderId={orderId} />
    </MemberRouteGateServer>
  );
}
