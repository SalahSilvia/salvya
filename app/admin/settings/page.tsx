import { Suspense } from "react";
import { AdminSettingsPage } from "@/components/admin/settings/AdminSettingsPage";

export default function Page() {
  return (
    <Suspense fallback={<p className="p-8 text-[14px] text-[#6d7175]">Loading settings…</p>}>
      <AdminSettingsPage />
    </Suspense>
  );
}
