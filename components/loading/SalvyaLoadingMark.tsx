import { loadingVariantStyles, type SalvyaLoadingVariant } from "@/components/loading/loading-theme";

type Props = {
  variant?: SalvyaLoadingVariant;
  size?: "sm" | "md" | "lg";
  className?: string;
};

const sizeMap = {
  sm: "h-8 w-8",
  md: "h-12 w-12",
  lg: "h-16 w-16",
} as const;

const insetMap = {
  sm: "inset-1.5",
  md: "inset-2",
  lg: "inset-2.5",
} as const;

const dotInsetMap = {
  sm: "inset-[11px]",
  md: "inset-[15px]",
  lg: "inset-[21px]",
} as const;

/** Branded animated loader mark — CSS-only (safe for RSC). */
export function SalvyaLoadingMark({ variant = "store", size = "md", className = "" }: Props) {
  const styles = loadingVariantStyles(variant);

  return (
    <div
      className={`salvya-load-mark relative ${sizeMap[size]} ${className}`}
      role="status"
      aria-label="Loading"
    >
      <span
        className={`salvya-load-ring absolute inset-0 rounded-full border-2 ${styles.ring}`}
        aria-hidden
      />
      <span
        className={`salvya-load-orbit absolute ${insetMap[size]} rounded-full ${styles.core}`}
        aria-hidden
      />
      <span
        className={`salvya-load-pulse absolute ${dotInsetMap[size]} rounded-full ${styles.dot}`}
        aria-hidden
      />
    </div>
  );
}
