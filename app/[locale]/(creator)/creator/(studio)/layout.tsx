import { CreatorDomainBoundary } from "@/lib/mfe/CreatorDomainBoundary";
import { ensureCreatorStudioAccess } from "@/lib/creator/creator-studio-layout";

/** Creator MFE — lazy-loaded SaaS shell. */
export default async function CreatorStudioRouteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await ensureCreatorStudioAccess("/creator/dashboard");
  return <CreatorDomainBoundary>{children}</CreatorDomainBoundary>;
}
