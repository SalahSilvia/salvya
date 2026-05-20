/** Normalize for search: lowercase, strip diacritics, collapse spaces. */
export function normalizeSearchText(s: string): string {
  return s
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/\s+/g, " ");
}

function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;
  const row = new Array<number>(b.length + 1);
  for (let j = 0; j <= b.length; j++) row[j] = j;
  for (let i = 1; i <= a.length; i++) {
    let prev = i - 1;
    row[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const tmp = row[j];
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      row[j] = Math.min(row[j] + 1, row[j - 1] + 1, prev + cost);
      prev = tmp;
    }
  }
  return row[b.length]!;
}

/** 0–100 text relevance including partial + light fuzzy token match. */
export function textMatchScore(query: string, ...fields: string[]): number {
  const q = normalizeSearchText(query);
  if (!q) return 50;

  let best = 0;
  for (const raw of fields) {
    const f = normalizeSearchText(raw);
    if (!f) continue;
    if (f === q) {
      best = Math.max(best, 100);
      continue;
    }
    if (f.startsWith(q)) {
      best = Math.max(best, 88);
      continue;
    }
    if (f.includes(q)) {
      best = Math.max(best, 72);
      continue;
    }
    const tokens = f.split(" ").filter(Boolean);
    for (const tok of tokens) {
      if (tok.startsWith(q)) best = Math.max(best, 65);
      else if (tok.includes(q)) best = Math.max(best, 55);
      else if (q.length >= 3 && levenshtein(tok.slice(0, Math.min(tok.length, q.length + 2)), q) <= 2) {
        best = Math.max(best, 48);
      }
    }
    if (q.length >= 4 && levenshtein(f.slice(0, Math.min(f.length, q.length + 3)), q) <= 2) {
      best = Math.max(best, 42);
    }
  }
  return best;
}
