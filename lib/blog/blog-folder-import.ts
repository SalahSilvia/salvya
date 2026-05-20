import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { extname, join } from "node:path";
import { estimateReadTimeMinutes } from "@/lib/blog/read-time";
import { isValidBlogSlug } from "@/lib/blog/slug";
import { salvyaBlogsRoot } from "@/lib/salvya-paths";

const IMAGE_EXT = /\.(png|jpe?g|webp|gif)$/i;
const BLOG_BODY_NAMES = ["blog.txt", "Blog.txt"];
const SEO_NAMES = ["SEO Meta Data.txt", "SEO MetaData.txt", "SEO.txt"];

export type BlogFolderImportRow = {
  folderName: string;
  folderIndex: number;
  slug: string;
  title: string;
  subtitle: string;
  excerpt: string;
  bodyMd: string;
  coverImagePath: string;
  seoTitle: string;
  seoDescription: string;
  tags: string[];
  featured: boolean;
  readTimeMinutes: number;
};

function blogFolderIndex(name: string): number {
  const m = name.match(/(\d+)/);
  return m ? Number.parseInt(m[1]!, 10) : 999;
}

function readFirstExisting(dir: string, names: string[]): string | null {
  for (const name of names) {
    const p = join(dir, name);
    if (existsSync(p)) return readFileSync(p, "utf8");
  }
  return null;
}

export function parseBlogSeoFile(text: string): {
  seoTitle: string;
  metaDescription: string;
  slug: string;
} {
  const slugLine = text.match(/Slug\s*\r?\n\s*\/?blog\/([a-z0-9-]+)/i);
  const slug = slugLine?.[1]?.trim().toLowerCase() ?? "";

  const seoTitleLine = text.match(/SEO Title\s*\r?\n([^\r\n]+)/i);
  let seoTitle = seoTitleLine?.[1]?.trim() ?? "";
  seoTitle = seoTitle.replace(/\s*\|\s*Salvya\s*$/i, "").trim();

  const metaBlock = text.match(/Meta Description\s*\r?\n([\s\S]*?)(?:\r?\nSlug\b|$)/i);
  const metaDescription = metaBlock?.[1]?.replace(/\s+/g, " ").trim() ?? "";

  return { seoTitle, metaDescription, slug };
}

function stripTitleFromBody(body: string, title: string): string {
  const lines = body.split(/\r?\n/);
  if (!lines.length) return body;
  const first = lines[0]!.replace(/^#\s*/, "").trim();
  if (first.toLowerCase() === title.toLowerCase()) {
    return lines.slice(1).join("\n").replace(/^\s+/, "");
  }
  return body;
}

function extractExcerpt(bodyMd: string, metaDescription: string): string {
  if (metaDescription.trim()) return metaDescription.trim().slice(0, 320);
  const plain = bodyMd
    .replace(/^#+\s+.+$/gm, "")
    .replace(/\*\*/g, "")
    .trim();
  const para = plain.split(/\n\n+/).find((p) => p.trim().length > 40);
  return (para ?? plain).replace(/\s+/g, " ").trim().slice(0, 320);
}

function normalizeBodyMarkdown(raw: string, title: string): string {
  let body = raw.replace(/\r\n/g, "\n").replace(/\(\s*\)/g, "").trim();
  body = stripTitleFromBody(body, title);
  if (!body.startsWith("#")) {
    body = `## Introduction\n\n${body}`;
  }
  return body.trim();
}

function tagsForSlug(slug: string): string[] {
  const map: Record<string, string[]> = {
    "why-oversized-hoodies-became-the-face-of-gen-z-fashion": ["streetwear", "hoodies", "gen-z"],
    "best-streetwear-brands-2026": ["streetwear", "minimalism", "brands"],
    "how-to-style-oversized-clothes": ["styling", "oversized", "guides"],
    "moroccan-streetwear-rise": ["morocco", "streetwear", "culture"],
    "why-black-hoodies-never-go-out-of-style": ["hoodies", "essentials", "minimalism"],
    "luxury-streetwear-vs-fast-fashion": ["luxury", "streetwear", "quality"],
    "music-underground-fashion-trends": ["music", "culture", "trends"],
    "minimalist-streetwear-wardrobe-guide": ["minimalism", "wardrobe", "guides"],
    "gen-z-oversized-streetwear-vs-luxury-fashion": ["gen-z", "streetwear", "culture"],
    "psychology-behind-oversized-fashion": ["psychology", "oversized", "culture"],
    "salvya-first-moroccan-streetwear-brand": ["salvya", "morocco", "brand"],
    "salvya-moroccan-global-streetwear-vision": ["salvya", "morocco", "vision"],
    "how-to-spot-official-artist-merch-vs-bootlegs": ["merch", "guides", "authenticity"],
    "eu-streetwear-shipping-guide-hoodies-tees": ["shipping", "europe", "guides"],
    "oversized-hoodie-size-guide-streetwear-fit": ["hoodies", "sizing", "guides"],
    "limited-drop-streetwear-how-to-shop-capsules": ["drops", "limited", "guides"],
    "moroccan-streetwear-online-shopping-guide": ["morocco", "shopping", "streetwear"],
    "graphic-tees-streetwear-styling-guide-2026": ["tees", "styling", "guides"],
  };
  if (slug.includes("-on-model-style-guide")) {
    const tags = ["elgrandetoto", "on-model", "product"];
    if (slug.includes("-hoodie-")) tags.push("hoodies");
    if (slug.includes("-tee-")) tags.push("tees");
    return tags;
  }
  return map[slug] ?? ["streetwear", "salvya"];
}

export function findBlogCoverImagePath(dir: string): string | null {
  let entries: import("node:fs").Dirent[];
  try {
    entries = readdirSync(dir, { withFileTypes: true });
  } catch {
    return null;
  }

  const images = entries
    .filter((e) => e.isFile() && IMAGE_EXT.test(e.name))
    .map((e) => join(dir, e.name))
    .filter((p) => {
      try {
        return statSync(p).isFile();
      } catch {
        return false;
      }
    });

  if (!images.length) return null;
  images.sort((a, b) => statSync(b).size - statSync(a).size);
  return images[0]!;
}

export function listBlogImportFolders(root = salvyaBlogsRoot()): string[] {
  if (!existsSync(root)) return [];
  try {
    return readdirSync(root, { withFileTypes: true })
      .filter((e) => e.isDirectory() && /blog\s*\d+/i.test(e.name))
      .map((e) => e.name)
      .sort((a, b) => blogFolderIndex(a) - blogFolderIndex(b));
  } catch {
    return [];
  }
}

function fallbackCoverPath(slug: string, root: string): string | null {
  const salvyaFolders = ["blog 11", "Blog 11", "Blog 4", "blog 4", "Blog 1"];
  const genericFolders = ["Blog 1", "blog 5"];
  const tryFolders = slug.includes("salvya") ? salvyaFolders : genericFolders;
  for (const folder of tryFolders) {
    const p = findBlogCoverImagePath(join(root, folder));
    if (p) return p;
  }
  return null;
}

export function importBlogFolder(folderName: string, root = salvyaBlogsRoot()): BlogFolderImportRow | null {
  const dir = join(root, folderName);
  if (!existsSync(dir)) return null;

  const seoRaw = readFirstExisting(dir, SEO_NAMES);
  const bodyRaw = readFirstExisting(dir, BLOG_BODY_NAMES);
  if (!seoRaw || !bodyRaw) return null;

  const seo = parseBlogSeoFile(seoRaw);
  if (!seo.slug || !isValidBlogSlug(seo.slug)) return null;

  const coverImagePath = findBlogCoverImagePath(dir) ?? fallbackCoverPath(seo.slug, root);
  if (!coverImagePath) return null;

  const title =
    seo.seoTitle ||
    bodyRaw
      .split(/\r?\n/)[0]!
      .replace(/^#\s*/, "")
      .trim();
  const bodyMd = normalizeBodyMarkdown(bodyRaw, title);
  const folderIndex = blogFolderIndex(folderName);
  const featured = folderIndex <= 3 || seo.slug.includes("salvya") || seo.slug.includes("moroccan");

  return {
    folderName,
    folderIndex,
    slug: seo.slug,
    title,
    subtitle: "",
    excerpt: extractExcerpt(bodyMd, seo.metaDescription),
    bodyMd,
    coverImagePath,
    seoTitle: seo.seoTitle || title,
    seoDescription: seo.metaDescription,
    tags: tagsForSlug(seo.slug),
    featured,
    readTimeMinutes: estimateReadTimeMinutes(bodyMd),
  };
}

export function collectBlogFolderImports(root = salvyaBlogsRoot()): BlogFolderImportRow[] {
  const out: BlogFolderImportRow[] = [];
  for (const folder of listBlogImportFolders(root)) {
    const row = importBlogFolder(folder, root);
    if (row) out.push(row);
  }
  return out;
}

export function coverImageMime(filePath: string): string {
  const ext = extname(filePath).toLowerCase();
  if (ext === ".png") return "image/png";
  if (ext === ".webp") return "image/webp";
  if (ext === ".gif") return "image/gif";
  return "image/jpeg";
}

export function coverStoragePath(slug: string, filePath: string): string {
  const ext = extname(filePath).toLowerCase().replace(".", "") || "png";
  return `${slug}/cover.${ext}`;
}
