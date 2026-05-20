import { copyFileSync, existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import {
  getArtistHoodieCarouselItems,
  getArtistTshirtCarouselItems,
} from "@/lib/artist-folder-catalog";
import type { ArtistFolderCatalogSlug } from "@/lib/artist-folder-catalog-slugs";
import { folderNameToProductSlug } from "@/lib/catalog/catalog-import";
import { artistCatalogModelHoodieImageSrc } from "@/lib/elgrandetoto-hoodie-public";
import { artistCatalogModelTshirtImageSrc } from "@/lib/elgrandetoto-tshirt-public";
import { formatOversizeHoodieTitle, formatOversizeTshirtTitle } from "@/lib/shop-data";
import { listArtistFolderModelShotFiles } from "@/lib/artist-folder-model-shots";
import { resolveArtistCatalogModelHoodieFilePath, resolveArtistCatalogModelTshirtFilePath } from "@/lib/artist-folder-model-shots";
import { salvyaBlogsRoot } from "@/lib/salvya-paths";
import { collectBlogFolderImports, listBlogImportFolders, parseBlogSeoFile } from "@/lib/blog/blog-folder-import";

export type ProductModelBlogDraft = {
  folderName: string;
  slug: string;
  title: string;
  productTitle: string;
  productFolder: string;
  artistSlug: ArtistFolderCatalogSlug;
  productSlug: string;
  kind: "hoodie" | "tee";
  coverSourcePath: string;
  modelRelativePath: string;
};

function slugForProductBlog(artistSlug: string, productSlug: string, kind: "hoodie" | "tee"): string {
  const base = `${artistSlug}-${productSlug}-${kind}-on-model-style-guide`;
  return base.slice(0, 80).replace(/-+$/, "");
}

function pickLargestModelPath(
  slug: ArtistFolderCatalogSlug,
  productFolder: string,
  kind: "hoodie" | "tee",
): { abs: string; relative: string } | null {
  const shots = listArtistFolderModelShotFiles(slug, productFolder, kind);
  if (!shots.length) return null;

  let best: { abs: string; relative: string; size: number } | null = null;
  for (const shot of shots) {
    const abs =
      kind === "hoodie"
        ? resolveArtistCatalogModelHoodieFilePath(slug, productFolder, shot.relativePath)
        : resolveArtistCatalogModelTshirtFilePath(slug, productFolder, shot.relativePath);
    if (!abs || !existsSync(abs)) continue;
    try {
      const size = statSync(abs).size;
      if (!best || size > best.size) {
        best = { abs, relative: shot.relativePath, size };
      }
    } catch {
      continue;
    }
  }
  return best ? { abs: best.abs, relative: best.relative } : null;
}

export function collectProductModelBlogDrafts(
  artistSlug: ArtistFolderCatalogSlug = "elgrandetoto",
): ProductModelBlogDraft[] {
  const drafts: ProductModelBlogDraft[] = [];

  const hoodies = getArtistHoodieCarouselItems(artistSlug, 500);
  for (const item of hoodies) {
    const model = pickLargestModelPath(artistSlug, item.folder, "hoodie");
    if (!model) continue;
    const productSlug = folderNameToProductSlug(item.folder, "hoodie");
    const productTitle = formatOversizeHoodieTitle(item.title);
    drafts.push({
      folderName: "",
      slug: slugForProductBlog(artistSlug, productSlug, "hoodie"),
      title: `${productTitle}: On-Model Style & Fit`,
      productTitle,
      productFolder: item.folder,
      artistSlug,
      productSlug,
      kind: "hoodie",
      coverSourcePath: model.abs,
      modelRelativePath: model.relative,
    });
  }

  const tees = getArtistTshirtCarouselItems(artistSlug, 500);
  for (const item of tees) {
    const model = pickLargestModelPath(artistSlug, item.folder, "tee");
    if (!model) continue;
    const productSlug = folderNameToProductSlug(item.folder, "tee");
    const productTitle = formatOversizeTshirtTitle(item.title);
    drafts.push({
      folderName: "",
      slug: slugForProductBlog(artistSlug, productSlug, "tee"),
      title: `${productTitle}: How It Wears On Body`,
      productTitle,
      productFolder: item.folder,
      artistSlug,
      productSlug,
      kind: "tee",
      coverSourcePath: model.abs,
      modelRelativePath: model.relative,
    });
  }

  return drafts;
}

function seoFile(draft: ProductModelBlogDraft): string {
  const kindLabel = draft.kind === "hoodie" ? "Oversized Hoodie" : "Graphic Tee";
  const seoTitle = `${draft.productTitle} ${kindLabel} — On-Model Look | Salvya`;
  const meta = `See how the ${draft.productTitle} fits on body — official ElGrandeToto merch on Salvya with front, back, and model shots. Shop the piece in stock.`;
  return `SEO Title
${seoTitle}

Meta Description
${meta}

Slug
/blog/${draft.slug}
`;
}

function modelShotPublicUrl(draft: ProductModelBlogDraft): string {
  if (draft.kind === "hoodie") {
    return artistCatalogModelHoodieImageSrc(draft.artistSlug, draft.productFolder, draft.modelRelativePath);
  }
  return artistCatalogModelTshirtImageSrc(draft.artistSlug, draft.productFolder, draft.modelRelativePath);
}

function bodyMd(draft: ProductModelBlogDraft): string {
  const shopPath =
    draft.kind === "hoodie"
      ? `/artist/${draft.artistSlug}/item/${encodeURIComponent(draft.productSlug)}`
      : `/artist/${draft.artistSlug}/tshirt/${encodeURIComponent(draft.productSlug)}`;
  const kindWord = draft.kind === "hoodie" ? "hoodie" : "tee";
  const modelUrl = modelShotPublicUrl(draft);

  return `# ${draft.title}

![${draft.productTitle} on model](${modelUrl})

The **${draft.productTitle}** is part of the official ElGrandeToto catalog on Salvya — shot on-model so you see drape, length, and how the print reads in real light, not only on a flat lay.

## Why we shoot every piece on body

Flat front and back photos show artwork clearly. **Model photography** answers the questions fans actually ask:

- How long is the body on a real person?
- Does the shoulder drop look oversized or awkward?
- How does the graphic sit when you move?

This editorial uses the same on-model assets you will see on the product page — so what you read here matches what you buy.

## The silhouette

This ${kindWord} follows Salvya’s oversized streetwear cut: relaxed shoulder, room to layer, and a length that works with denim, cargos, or straight-leg pants. The model shots highlight how the piece holds its shape without feeling stiff — premium fleece for hoodies, mid-weight cotton for tees.

## Styling ideas

- **Minimal night-out:** monochrome base, clean sneakers, let the back print carry the fit.
- **Layered tour look:** under a jacket or open over a plain tee when temperatures drop.
- **Everyday rotation:** one statement piece, neutral bottoms, no logo overload.

Build the rest of the outfit around one strong item — this ${kindWord} is designed to be that item.

## Official merch only

Every Salvya listing ties to an **artist-owned corner**. You get licensed artwork, structured sizing, and EU-friendly checkout — not marketplace guesswork.

[**Shop the ${draft.productTitle}**](${shopPath}) on the official store page.

## What you will see on the product page

- Flat-lay **front and back** for print detail
- **On-model** angles (same family of shots as this article cover)
- Live stock and market pricing at checkout

If your size is available, grab it — limited runs on artist merch do not restock forever.

## More from ElGrandeToto

Explore the full [Salvya shop](/shop) for hoodies, tees, and new drops, or browse [Salvya Stories](/blogs) for more fit guides and streetwear editorials.
`;
}

function nextBlogFolderStartIndex(root: string): number {
  const existing = listBlogImportFolders(root);
  let max = 0;
  for (const name of existing) {
    const m = name.match(/(\d+)/);
    if (m) max = Math.max(max, Number.parseInt(m[1]!, 10));
  }
  return max + 1;
}

function existingBlogSlugs(root: string): Set<string> {
  const slugs = new Set<string>();
  for (const row of collectBlogFolderImports(root)) {
    slugs.add(row.slug);
  }
  for (const folder of listBlogImportFolders(root)) {
    try {
      const raw = readFileSync(join(root, folder, "SEO Meta Data.txt"), "utf8");
      const seo = parseBlogSeoFile(raw);
      if (seo.slug) slugs.add(seo.slug);
    } catch {
      /* ignore */
    }
  }
  return slugs;
}

export type GenerateProductBlogsResult = {
  created: string[];
  skipped: { slug: string; reason: string }[];
};

/** Write \`Blogs/blog N\` folders for catalog items that have model photography. */
export function generateProductModelBlogFolders(
  artistSlug: ArtistFolderCatalogSlug = "elgrandetoto",
  root = salvyaBlogsRoot(),
): GenerateProductBlogsResult {
  const drafts = collectProductModelBlogDrafts(artistSlug);
  const existingSlugs = existingBlogSlugs(root);

  const created: string[] = [];
  const skipped: { slug: string; reason: string }[] = [];
  let folderIndex = nextBlogFolderStartIndex(root);

  for (const draft of drafts) {
    if (existingSlugs.has(draft.slug)) {
      skipped.push({ slug: draft.slug, reason: "slug already exists" });
      continue;
    }

    const folderName = `blog ${folderIndex++}`;
    const dir = join(root, folderName);
    mkdirSync(dir, { recursive: true });

    const ext = draft.coverSourcePath.match(/\.(png|jpe?g|webp)$/i)?.[0] ?? ".png";
    const coverDest = join(dir, `cover${ext}`);
    copyFileSync(draft.coverSourcePath, coverDest);

    writeFileSync(join(dir, "SEO Meta Data.txt"), seoFile(draft), "utf8");
    writeFileSync(join(dir, "blog.txt"), bodyMd(draft), "utf8");

    existingSlugs.add(draft.slug);
    created.push(folderName);
  }

  return { created, skipped };
}
