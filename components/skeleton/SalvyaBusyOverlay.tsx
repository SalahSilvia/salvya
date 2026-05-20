import { SalvyaLoadingScreen } from "@/components/loading/SalvyaLoadingScreen";
import type { SalvyaLoadingVariant } from "@/components/loading/loading-theme";

type Props = {
  message?: string;
  tone?: "daylight" | "dark";
};

/** Full-screen busy overlay for auth redirects and session gates. */
export function SalvyaBusyOverlay({ message, tone = "daylight" }: Props) {
  const variant: SalvyaLoadingVariant = tone === "dark" ? "dark" : "light";

  return (
    <div className="fixed inset-0 z-[300]" aria-busy="true" aria-live="polite">
      <SalvyaLoadingScreen
        variant={variant}
        description={message ?? "Preparing your session…"}
        layout="screen"
        className="min-h-dvh"
      />
    </div>
  );
}
