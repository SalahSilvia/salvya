/** JS `Date.getTimezoneOffset()` minutes (UTC − local). Morocco is UTC+1 year-round → typically −60. */
export function parseTimezoneOffsetMinutes(raw: string | null | undefined): number | null {
  if (raw == null || raw === "") return null;
  const n = Number.parseInt(String(raw).trim(), 10);
  return Number.isFinite(n) ? n : null;
}

/** Weak hint only — France winter also uses UTC+1 (−60). */
export function isMoroccoTimezoneOffset(offsetMinutes: number | null | undefined): boolean {
  return offsetMinutes === -60;
}
