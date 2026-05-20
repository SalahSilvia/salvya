import { SalvyaLoadingMark } from "@/components/loading/SalvyaLoadingMark";
import { LOADING_LABEL, loadingVariantStyles, type SalvyaLoadingVariant } from "@/components/loading/loading-theme";
import type { SalvyaDomain } from "@/lib/mfe/types";

type Props = {
  /** MFE domain shortcut — maps to store / creator / admin variants. */
  domain?: SalvyaDomain;
  variant?: SalvyaLoadingVariant;
  label?: string;
  description?: string;
  /** `screen` fills the viewport; `panel` centers in a route segment. */
  layout?: "screen" | "panel";
  className?: string;
};

function resolveVariant(domain?: SalvyaDomain, variant?: SalvyaLoadingVariant): SalvyaLoadingVariant {
  if (variant) return variant;
  if (domain === "creator") return "creator";
  if (domain === "admin") return "admin";
  return "store";
}

/** Full-page or in-route animated loading state. */
export function SalvyaLoadingScreen({
  domain,
  variant,
  label,
  description,
  layout = "panel",
  className = "",
}: Props) {
  const v = resolveVariant(domain, variant);
  const styles = loadingVariantStyles(v);
  const title = label ?? (domain ? LOADING_LABEL[domain] : "Salvya");
  const minH = layout === "screen" ? "min-h-dvh" : "min-h-[40vh]";

  return (
    <div
      className={`salvya-load-enter relative flex ${minH} flex-col items-center justify-center gap-5 px-6 py-16 text-center ${styles.shell} ${className}`}
      aria-busy="true"
      aria-live="polite"
    >
      <div className={`pointer-events-none absolute inset-0 ${styles.ambient}`} aria-hidden />

      <SalvyaLoadingMark variant={v} size="lg" className="relative z-[1]" />

      <div className="relative z-[1] max-w-sm space-y-2">
        <p className={`text-[15px] font-semibold tracking-tight ${styles.title}`}>
          Loading {title}
          <span className="salvya-load-ellipsis" aria-hidden>
            …
          </span>
        </p>
        {description ? (
          <p className={`text-[13px] leading-relaxed ${styles.label}`}>{description}</p>
        ) : (
          <p className={`text-[13px] ${styles.label}`}>Just a moment while we prepare your view.</p>
        )}
      </div>

      <div className="relative z-[1] flex items-center gap-1.5" aria-hidden>
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className={`salvya-load-dot h-1.5 w-1.5 rounded-full ${styles.dotIdle}`}
            style={{ animationDelay: `${i * 0.16}s` }}
          />
        ))}
      </div>

      <div className="relative z-[1] h-1 w-40 overflow-hidden rounded-full bg-white/[0.06] ring-1 ring-white/[0.05]">
        <div className={`salvya-load-bar h-full w-1/2 rounded-full bg-gradient-to-r ${styles.bar}`} />
      </div>
    </div>
  );
}
