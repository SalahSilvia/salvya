import { Suspense } from "react";
import { SalvyaAuthSkeleton } from "@/components/skeleton";
import ForgotPasswordPageClient from "./ForgotPasswordPageClient";

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={<SalvyaAuthSkeleton variant="sign-in" />}>
      <ForgotPasswordPageClient />
    </Suspense>
  );
}
