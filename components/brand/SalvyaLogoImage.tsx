"use client";

import { useCallback, useState } from "react";
import { brandLogoBlack, brandLogoLight } from "@/lib/site-data";

type Props = {
  variant: "light" | "dark";
  alt: string;
  /** Applied to the `<img>` when loaded */
  className?: string;
  /** If the file is missing or fails to load */
  fallback: "monogram" | "word";
  /** Classes for fallback span (monogram or word) */
  fallbackClassName?: string;
};

/**
 * Plain `<img>` with onError fallback — works when `/media/*.png` is missing
 * (Next/Image alone does not recover cleanly for local assets).
 */
export function SalvyaLogoImage({ variant, alt, className, fallback, fallbackClassName }: Props) {
  const src = variant === "light" ? brandLogoLight : brandLogoBlack;
  const [failed, setFailed] = useState(false);
  const onError = useCallback(() => setFailed(true), []);

  if (failed) {
    if (fallback === "monogram") {
      return (
        <span
          className={
            fallbackClassName ??
            "inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-white/10 text-sm font-bold text-current"
          }
          aria-hidden={alt === "" ? true : undefined}
        >
          S
        </span>
      );
    }
    return (
      <span
        className={fallbackClassName ?? "font-semibold tracking-tight text-current"}
        {...(alt === "" ? { "aria-hidden": true as const } : {})}
      >
        {alt || "Salvya"}
      </span>
    );
  }

  return <img src={src} alt={alt} className={className} onError={onError} decoding="async" />;
}
