import { DOCS_SEARCH_MANIFEST } from "@/lib/docs/search-manifest";
import type { DocSearchResult } from "@/lib/docs/types";
import { HELP_DEV_ENDPOINTS } from "@/lib/help-center/content";
import { HELP_FAQS, HELP_TOPICS } from "@/lib/help-center/topics";

const INTENT_SYNONYMS: Record<string, string[]> = {
  refund: ["return", "money back", "exchange", "refunds"],
  track: ["tracking", "where is my order", "parcel", "delivery status", "svy"],
  payout: ["paid", "commission", "wallet", "withdraw", "dh", "creators get paid"],
  payment: ["checkout", "card declined", "failed payment", "paypal"],
  login: ["sign in", "password", "account", "session", "disappeared after login"],
  api: ["developer", "webhook", "authentication", "openapi", "integration"],
  creator: ["sell", "apply", "influencer", "affiliate", "promo link"],
  shipping: ["delivery", "carrier", "ship", "international"],
};

function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;
  const row = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 0; i < a.length; i++) {
    let prev = i + 1;
    for (let j = 0; j < b.length; j++) {
      const cur = a[i] === b[j] ? row[j]! : Math.min(row[j]!, row[j + 1]!, prev) + 1;
      row[j] = prev;
      prev = cur;
    }
    row[b.length] = prev;
  }
  return row[b.length]!;
}

function fuzzyIncludes(text: string, token: string): boolean {
  const t = text.toLowerCase();
  const q = token.toLowerCase();
  if (t.includes(q)) return true;
  if (q.length < 4) return false;
  const words = t.split(/\s+/);
  return words.some((w) => levenshtein(w, q) <= Math.floor(q.length * 0.35));
}

function expandQuery(raw: string): string[] {
  const base = raw
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 1);
  const expanded = new Set(base);
  for (const word of base) {
    for (const [key, syns] of Object.entries(INTENT_SYNONYMS)) {
      if (word.includes(key) || syns.some((s) => word.includes(s) || s.includes(word))) {
        expanded.add(key);
        syns.forEach((s) => expanded.add(s));
      }
    }
  }
  // Natural language phrases
  const phrase = raw.toLowerCase();
  if (phrase.includes("disappear") && phrase.includes("login")) expanded.add("bag sync");
  if (phrase.includes("how") && phrase.includes("paid")) expanded.add("payout");
  if (phrase.includes("failed") && phrase.includes("checkout")) expanded.add("payment");
  return [...expanded];
}

function scoreText(
  fields: { text: string; weight: number }[],
  tokens: string[],
): number {
  let score = 0;
  for (const { text, weight } of fields) {
    const lower = text.toLowerCase();
    for (const token of tokens) {
      if (lower === token) score += 40 * weight;
      else if (lower.startsWith(token)) score += 28 * weight;
      else if (lower.includes(token)) score += 18 * weight;
      else if (fuzzyIncludes(lower, token)) score += 10 * weight;
    }
  }
  return score;
}

export function semanticKnowledgeSearch(query: string, limit = 12): DocSearchResult[] {
  const q = query.trim();
  if (!q) return [];
  const tokens = expandQuery(q);
  const results: DocSearchResult[] = [];

  for (const doc of DOCS_SEARCH_MANIFEST) {
    const s = scoreText(
      [
        { text: doc.title, weight: 2 },
        { text: doc.summary, weight: 1.4 },
        { text: doc.aiSummary, weight: 1.3 },
        { text: doc.description, weight: 1.2 },
        { text: doc.tags.join(" "), weight: 1.1 },
      ],
      tokens,
    );
    if (s > 0) {
      results.push({
        kind: "doc",
        id: doc.path,
        title: doc.title,
        snippet: doc.aiSummary,
        href: doc.path,
        score: s,
        citation: doc.path,
      });
    }
  }

  for (const f of HELP_FAQS) {
    const s = scoreText(
      [
        { text: f.question, weight: 2 },
        { text: f.answer, weight: 1.2 },
      ],
      tokens,
    );
    if (s > 0) {
      results.push({
        kind: "faq",
        id: f.id,
        title: f.question,
        snippet: f.answer.slice(0, 160),
        href: `/help-center#faq-${f.id}`,
        score: s * 0.95,
        citation: `/help-center#faq-${f.id}`,
      });
    }
  }

  for (const t of HELP_TOPICS) {
    const s = scoreText(
      [
        { text: t.title, weight: 1.8 },
        { text: t.blurb, weight: 1.2 },
        { text: t.keywords.join(" "), weight: 1.3 },
      ],
      tokens,
    );
    if (s > 0) {
      results.push({
        kind: "help-topic",
        id: t.id,
        title: t.title,
        snippet: t.blurb,
        href: t.href,
        score: s * 0.85,
        citation: t.href,
      });
    }
  }

  for (const ep of HELP_DEV_ENDPOINTS) {
    const s = scoreText(
      [
        { text: `${ep.method} ${ep.path}`, weight: 2 },
        { text: ep.summary, weight: 1.2 },
      ],
      tokens,
    );
    if (s > 0) {
      results.push({
        kind: "api",
        id: ep.id,
        title: `${ep.method} ${ep.path}`,
        snippet: ep.summary,
        href: `/developers#${ep.id}`,
        score: s * 0.8,
        citation: `/developers#${ep.id}`,
      });
    }
  }

  const policyPaths = [
    { href: "/returns", title: "Returns policy", snippet: "Refund windows and conditions." },
    { href: "/shipping", title: "Shipping policy", snippet: "Delivery regions and timelines." },
    { href: "/terms/creator", title: "Creator programme terms", snippet: "DH commissions and payouts." },
    { href: "/cookies", title: "Cookies policy", snippet: "Privacy and consent categories." },
  ];
  for (const p of policyPaths) {
    const s = scoreText([{ text: p.title, weight: 1.5 }, { text: p.snippet, weight: 1 }], tokens);
    if (s > 0) {
      results.push({
        kind: "policy",
        id: p.href,
        title: p.title,
        snippet: p.snippet,
        href: p.href,
        score: s * 0.75,
        citation: p.href,
      });
    }
  }

  return results
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}
