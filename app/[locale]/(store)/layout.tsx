import { GeoMoroccoHint } from "@/components/geo/GeoMoroccoHint";
import { StoreDomainBoundary } from "@/lib/mfe/StoreDomainBoundary";

/** Store MFE — lightweight shell, SSR-friendly. */
export default function StoreRouteLayout({ children }: { children: React.ReactNode }) {
  return (
    <StoreDomainBoundary>
      <GeoMoroccoHint />
      {children}
    </StoreDomainBoundary>
  );
}
