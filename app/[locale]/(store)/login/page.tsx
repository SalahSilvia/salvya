import { Suspense } from "react";
import { SalvyaAuthSkeleton } from "@/components/skeleton";
import LoginPageClient from "./LoginPageClient";

function LoginFallback() {
  return <SalvyaAuthSkeleton variant="sign-in" />;
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginFallback />}>
      <LoginPageClient />
    </Suspense>
  );
}
