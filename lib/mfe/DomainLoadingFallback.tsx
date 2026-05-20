import type { SalvyaDomain } from "@/lib/mfe/types";
import { SalvyaLoadingScreen } from "@/components/loading/SalvyaLoadingScreen";

export function DomainLoadingFallback({ domain }: { domain: SalvyaDomain }) {
  return <SalvyaLoadingScreen domain={domain} layout="panel" />;
}
