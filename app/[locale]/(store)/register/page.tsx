import { Suspense } from "react";
import { SalvyaAuthSkeleton } from "@/components/skeleton";
import RegisterPageClient from "./RegisterPageClient";

function RegisterFallback() {
  return <SalvyaAuthSkeleton variant="sign-up" />;
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<RegisterFallback />}>
      <RegisterPageClient />
    </Suspense>
  );
}
