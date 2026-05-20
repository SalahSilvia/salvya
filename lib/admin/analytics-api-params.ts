export function parseAnalyticsDays(raw: string | null): number {
  const n = Number.parseInt(raw ?? "", 10);
  if (!Number.isFinite(n)) return 30;
  return Math.min(90, Math.max(1, n));
}

export function parseAnalyticsLimit(raw: string | null): number {
  const n = Number.parseInt(raw ?? "", 10);
  if (!Number.isFinite(n)) return 12;
  return Math.min(50, Math.max(1, n));
}
