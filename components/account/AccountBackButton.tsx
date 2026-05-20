"use client";

import { useRouter } from "next/navigation";
import { useCallback } from "react";

const defaultClassName =
  "inline-flex min-h-10 shrink-0 items-center gap-1.5 rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 text-[13px] font-medium text-white/80 transition-colors hover:border-white/[0.14] hover:bg-white/[0.07] hover:text-white";

type Props = {
  /** Shown next to the arrow. Defaults to “Back”. */
  label?: string;
  /** Used when there is no prior history entry (direct link / new tab). */
  fallbackHref?: string;
  className?: string;
};

export function AccountBackButton({ label = "Back", fallbackHref = "/", className }: Props) {
  const router = useRouter();

  const onBack = useCallback(() => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
      return;
    }
    router.push(fallbackHref);
  }, [router, fallbackHref]);

  return (
    <button type="button" onClick={onBack} className={className ?? defaultClassName}>
      <span className="text-[15px] leading-none opacity-80" aria-hidden>
        ←
      </span>
      {label}
    </button>
  );
}
