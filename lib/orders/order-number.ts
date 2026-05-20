/** Human-readable Salvya order reference, e.g. SVY-482910 */
export function generateOrderNumber(): string {
  const n = Math.floor(100000 + Math.random() * 900000);
  return `SVY-${n}`;
}

/** Normalize user input to Salvya order numbers (SVY-######). */
export function normalizeOrderNumberInput(raw: string): string {
  let s = raw.trim().toUpperCase().replace(/^#/, "");
  if (/^SY-/.test(s)) s = `SVY-${s.slice(3)}`;
  if (/^\d{4,8}$/.test(s)) return `SVY-${s}`;
  if (!/^SVY-/.test(s) && s.length > 0 && !s.includes("-")) return `SVY-${s}`;
  return s;
}
