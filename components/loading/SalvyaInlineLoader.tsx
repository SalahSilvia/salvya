import { SalvyaLoadingMark } from "@/components/loading/SalvyaLoadingMark";
import { loadingVariantStyles, type SalvyaLoadingVariant } from "@/components/loading/loading-theme";

type Props = {
  message?: string;
  variant?: SalvyaLoadingVariant;
  size?: "sm" | "md";
  className?: string;
};

/** Compact inline loader for panels, lists, and tables. */
export function SalvyaInlineLoader({
  message = "Loading",
  variant = "creator",
  size = "sm",
  className = "",
}: Props) {
  const styles = loadingVariantStyles(variant);
  const isLight = variant === "admin" || variant === "light";

  return (
    <div
      className={`flex flex-col items-center justify-center gap-3 px-4 py-10 text-center ${className}`}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <SalvyaLoadingMark variant={variant} size={size} />
      <p className={`text-[13px] font-medium ${isLight ? "text-slate-500" : styles.label}`}>
        {message}
        <span className="salvya-load-ellipsis" aria-hidden>
          …
        </span>
      </p>
    </div>
  );
}
