import { Suspense } from "react";
import { SalvyaAuthSkeleton } from "@/components/skeleton";
import UpdatePasswordPageClient from "./UpdatePasswordPageClient";

function UpdatePasswordFallback() {
  return <SalvyaAuthSkeleton variant="password" />;
}

export default function UpdatePasswordPage() {
  return (
    <Suspense fallback={<UpdatePasswordFallback />}>
      <UpdatePasswordPageClient />
    </Suspense>
  );
}
