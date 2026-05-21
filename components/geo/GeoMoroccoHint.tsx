"use client";

import { useTranslations } from "next-intl";
import { useRegionalPreferences } from "@/components/geo/RegionalPreferencesProvider";

/** Subtle Morocco storefront indicator — no popup. */
export function GeoMoroccoHint() {
  const t = useTranslations("geo");
  const { marketCode, snapshot } = useRegionalPreferences();

  if (marketCode !== "MA" && !snapshot.moroccoLikely) return null;

  return (
    <p
      className="border-b border-emerald-500/15 bg-emerald-950/30 px-4 py-2 text-center text-[12px] leading-snug text-emerald-100/85"
      role="status"
    >
      <span className="me-1.5" aria-hidden>
        🇲🇦
      </span>
      {t("moroccoStorefrontHint")}
    </p>
  );
}
