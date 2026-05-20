/** Compare ISO timestamps; null sorts oldest. */
export function compareUpdatedAt(a: string | null, b: string | null): number {
  if (a === b) return 0;
  if (!a) return -1;
  if (!b) return 1;
  const ta = Date.parse(a);
  const tb = Date.parse(b);
  if (Number.isNaN(ta) && Number.isNaN(tb)) return 0;
  if (Number.isNaN(ta)) return -1;
  if (Number.isNaN(tb)) return 1;
  if (ta < tb) return -1;
  if (ta > tb) return 1;
  return 0;
}

/** True when `candidate` is strictly older than the last known remote snapshot. */
export function isStaleRemoteUpdatedAt(
  candidate: string | null,
  known: string | null,
): boolean {
  if (!candidate || !known) return false;
  return compareUpdatedAt(candidate, known) < 0;
}
