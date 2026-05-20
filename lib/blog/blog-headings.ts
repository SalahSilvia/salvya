export type BlogHeading = { id: string; text: string; level: 2 | 3 };

export function slugifyHeading(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64);
}

export function extractBlogHeadings(markdown: string): BlogHeading[] {
  const headings: BlogHeading[] = [];
  const seen = new Map<string, number>();
  for (const line of markdown.replace(/\r\n/g, "\n").split("\n")) {
    const h2 = line.match(/^##\s+(.+)$/);
    const h3 = line.match(/^###\s+(.+)$/);
    const text = (h2?.[1] ?? h3?.[1])?.trim();
    if (!text) continue;
    const level = h2 ? 2 : 3;
    const base = slugifyHeading(text) || "section";
    const n = (seen.get(base) ?? 0) + 1;
    seen.set(base, n);
    const id = n > 1 ? `${base}-${n}` : base;
    headings.push({ id, text, level });
  }
  return headings;
}
