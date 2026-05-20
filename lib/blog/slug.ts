/** URL-safe blog slug (2–80 chars). */
export function isValidBlogSlug(slug: string): boolean {
  const s = slug.trim().toLowerCase();
  if (s.length < 2 || s.length > 80) return false;
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(s);
}

export function slugifyBlogTitle(title: string): string {
  const base = title
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
  return base || "post";
}
