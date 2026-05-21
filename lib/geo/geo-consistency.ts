import type { NextResponse } from "next/server";
import {
  COOKIE_DISPLAY_CURRENCY,
  COOKIE_GEO_LOCKED,
  COOKIE_GEO_MANUAL,
  COOKIE_GEO_RESOLVED,
  COOKIE_GEO_WEAK,
  COOKIE_PREF_COUNTRY,
  GEO_COOKIE_MAX_AGE,
} from "@/lib/geo/constants";
import type { GeoCookieState } from "@/lib/geo/cookie-state";
import { geoLogServer, isGeoDebugEnabled } from "@/lib/geo/debug";
import {
  isMoroccoManualLock,
  isMoroccoPreference,
  MOROCCO_COUNTRY,
  MOROCCO_CURRENCY,
} from "@/lib/geo/morocco-stability";

export type GeoConsistencyRepair = {
  state: GeoCookieState;
  repairs: string[];
  needsCookieWrite: boolean;
};

const cookieBase = { path: "/", sameSite: "lax" as const, maxAge: GEO_COOKIE_MAX_AGE };

function cloneState(state: GeoCookieState): GeoCookieState {
  return { ...state };
}

/**
 * Align cookies across middleware, SSR, API, and client hydration.
 * Repairs invalid combinations (e.g. manual MA with EUR, geo_weak + saved MA).
 */
export function repairGeoCookieState(state: GeoCookieState): GeoConsistencyRepair {
  const next = cloneState(state);
  const repairs: string[] = [];

  if (next.geoLocked) {
    next.pref = MOROCCO_COUNTRY;
    next.displayCurrency = MOROCCO_CURRENCY;
    next.geoManual = true;
    next.geoWeak = false;
    next.geoResolved = true;
    repairs.push("geo_locked → force MA + MAD");
  }

  if (isMoroccoManualLock(next) || (next.geoManual && next.pref === MOROCCO_COUNTRY)) {
    if (next.displayCurrency !== MOROCCO_CURRENCY) {
      next.displayCurrency = MOROCCO_CURRENCY;
      repairs.push("manual Morocco lock → force MAD display currency");
    }
    if (next.geoWeak) {
      next.geoWeak = false;
      repairs.push("manual Morocco lock → clear geo_weak");
    }
    if (!next.geoResolved) {
      next.geoResolved = true;
      repairs.push("manual Morocco lock → set geo_resolved");
    }
    if (!next.pref) {
      next.pref = MOROCCO_COUNTRY;
      repairs.push("manual Morocco lock → restore pref MA");
    }
  } else if (isMoroccoPreference(next) && next.displayCurrency && next.displayCurrency !== MOROCCO_CURRENCY) {
    next.displayCurrency = MOROCCO_CURRENCY;
    repairs.push("saved Morocco pref → align display currency to MAD");
  }

  if (next.pref === MOROCCO_COUNTRY && next.geoWeak) {
    next.geoWeak = false;
    repairs.push("saved MA pref → clear erroneous geo_weak");
  }

  if (next.geoManual && !next.pref && next.detected) {
    next.pref = next.detected;
    repairs.push("geo_manual without pref → copy detected to pref");
  }

  if (next.pref && !next.geoResolved && !next.geoWeak) {
    next.geoResolved = true;
    repairs.push("strong pref without geo_resolved → set resolved");
  }

  return {
    state: next,
    repairs,
    needsCookieWrite: repairs.length > 0,
  };
}

export function applyGeoConsistencyRepairToResponse(
  res: NextResponse,
  repair: GeoConsistencyRepair,
): void {
  if (!repair.needsCookieWrite) return;
  const { state } = repair;

  if (state.pref) {
    res.cookies.set(COOKIE_PREF_COUNTRY, state.pref, cookieBase);
  }
  if (state.displayCurrency) {
    res.cookies.set(COOKIE_DISPLAY_CURRENCY, state.displayCurrency, cookieBase);
  }
  if (state.geoResolved) {
    res.cookies.set(COOKIE_GEO_RESOLVED, "1", cookieBase);
  }
  if (state.geoManual) {
    res.cookies.set(COOKIE_GEO_MANUAL, "1", cookieBase);
  }
  if (state.geoLocked) {
    res.cookies.set(COOKIE_GEO_LOCKED, "1", cookieBase);
  }
  res.cookies.set(COOKIE_GEO_WEAK, "", { ...cookieBase, maxAge: 0 });

  if (isGeoDebugEnabled()) {
    geoLogServer("[GEO] cookie repair applied", { repairs: repair.repairs, state });
  }
}

export function persistGeoConsistencyRepairClient(repair: GeoConsistencyRepair): void {
  if (typeof document === "undefined" || !repair.needsCookieWrite) return;
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  const write = (name: string, value: string) => {
    document.cookie = `${name}=${encodeURIComponent(value)}; Path=/; Max-Age=${GEO_COOKIE_MAX_AGE}; SameSite=Lax${secure}`;
  };
  const clear = (name: string) => {
    document.cookie = `${name}=; Path=/; Max-Age=0; SameSite=Lax`;
  };

  const { state } = repair;
  if (state.pref) write(COOKIE_PREF_COUNTRY, state.pref);
  if (state.displayCurrency) write(COOKIE_DISPLAY_CURRENCY, state.displayCurrency);
  if (state.geoResolved) write(COOKIE_GEO_RESOLVED, "1");
  if (state.geoManual) write(COOKIE_GEO_MANUAL, "1");
  if (state.geoLocked) write(COOKIE_GEO_LOCKED, "1");
  clear(COOKIE_GEO_WEAK);

  if (isGeoDebugEnabled()) {
    console.info("[GEO] client cookie repair", repair.repairs);
  }
}

export type GeoMismatchNotice = {
  selectedCountry: string;
  detectedCountry: string;
  selectedName: string;
  detectedName: string;
};

export function buildGeoMismatchNotice(
  state: GeoCookieState,
  names: { selected: string; detected: string },
): GeoMismatchNotice | null {
  if (!state.geoManual || !state.pref || !state.detected) return null;
  if (state.pref === state.detected) return null;
  return {
    selectedCountry: state.pref,
    detectedCountry: state.detected,
    selectedName: names.selected,
    detectedName: names.detected,
  };
}
