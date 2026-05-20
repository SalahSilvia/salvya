import type { LikedItemRecord } from "@/lib/member/likes-storage";

const TITLE_KEYWORDS = [
  { re: /\bhoodie\b/i, label: "Hoodies" },
  { re: /\btee|t-shirt|tshirt\b/i, label: "Tees" },
  { re: /oversize/i, label: "Oversized" },
  { re: /\blimited|drop\b/i, label: "Limited drops" },
];

/** Pills for “Your taste” from likes — artists + inferred categories. */
export function tastePillsFromLikes(items: LikedItemRecord[], max = 10): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  const push = (s: string) => {
    const t = s.trim();
    if (!t || seen.has(t.toLowerCase())) return;
    seen.add(t.toLowerCase());
    out.push(t);
  };
  for (const item of items) {
    push(item.artistLabel);
    for (const { re, label } of TITLE_KEYWORDS) {
      if (re.test(item.title)) push(label);
    }
    if (out.length >= max) break;
  }
  return out.slice(0, max);
}
