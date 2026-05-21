"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useMemo, useState } from "react";
import { geoProfileForCountry } from "@/lib/geo/country-map";
import { buildGeoMismatchFromSnapshot } from "@/lib/geo/preferences";
import { useRegionalPreferences } from "@/components/geo/RegionalPreferencesProvider";

const DISMISS_KEY = "salvya_geo_mismatch_toast_dismissed";

function dismissKeyFor(pref: string, detected: string) {
  return `${DISMISS_KEY}:${pref}:${detected}`;
}

export function GeoCountryMismatchToast() {
  const t = useTranslations("geo");
  const reduceMotion = useReducedMotion();
  const { snapshot } = useRegionalPreferences();
  const [visible, setVisible] = useState(false);

  const notice = useMemo(() => {
    const pref = snapshot.prefCountry;
    const detected = snapshot.detectedCountry;
    if (!pref || !detected) return null;
    const prefProfile = geoProfileForCountry(pref);
    const detectedProfile = geoProfileForCountry(detected);
    return buildGeoMismatchFromSnapshot(snapshot, {
      selected: prefProfile.countryName,
      detected: detectedProfile.countryName,
    });
  }, [snapshot]);

  useEffect(() => {
    if (!notice) {
      setVisible(false);
      return;
    }
    const key = dismissKeyFor(notice.selectedCountry, notice.detectedCountry);
    if (typeof sessionStorage !== "undefined" && sessionStorage.getItem(key) === "1") {
      setVisible(false);
      return;
    }
    setVisible(true);
  }, [notice]);

  const onDismiss = useCallback(() => {
    if (notice) {
      sessionStorage.setItem(
        dismissKeyFor(notice.selectedCountry, notice.detectedCountry),
        "1",
      );
    }
    setVisible(false);
  }, [notice]);

  if (!notice) return null;

  return (
    <AnimatePresence>
      {visible ? (
        <motion.div
          role="status"
          aria-live="polite"
          initial={reduceMotion ? false : { opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduceMotion ? undefined : { opacity: 0, y: -6 }}
          transition={{ duration: 0.22 }}
          className="pointer-events-none fixed inset-x-0 top-[max(0.75rem,env(safe-area-inset-top))] z-[125] flex justify-center px-4"
        >
          <div className="pointer-events-auto flex max-w-md items-start gap-3 rounded-xl border border-white/[0.12] bg-[#0c0c12]/95 px-4 py-3 shadow-lg backdrop-blur-xl">
            <p className="min-w-0 flex-1 text-[13px] leading-snug text-white/85">
              {t("mismatchToast", {
                detected: notice.detectedName,
                selected: notice.selectedName,
              })}
            </p>
            <button
              type="button"
              onClick={onDismiss}
              className="shrink-0 rounded-lg px-2.5 py-1 text-[12px] font-semibold text-[#9eb6ff] hover:text-white"
            >
              {t("mismatchDismiss")}
            </button>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
