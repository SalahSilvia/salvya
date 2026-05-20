import { Suspense } from "react";
import { AdminShippingPage } from "@/components/admin/shipping/AdminShippingPage";

export default function AdminShippingRoutePage() {
  return (
    <Suspense fallback={<p className="text-[13px] text-[#6d7175]">Loading shipping…</p>}>
      <AdminShippingPage />
    </Suspense>
  );
}