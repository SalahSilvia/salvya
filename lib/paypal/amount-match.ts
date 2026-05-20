/** Compare PayPal decimal amount strings (2 dp). */
export function paypalAmountsMatch(expected: string, actual: string): boolean {
  const a = Number.parseFloat(expected);
  const b = Number.parseFloat(actual);
  if (!Number.isFinite(a) || !Number.isFinite(b)) return false;
  return Math.round(a * 100) === Math.round(b * 100);
}

export function normalizePayPalCurrency(code: string): string {
  return code.trim().toUpperCase().replace(/[^A-Z]/g, "").slice(0, 3);
}
