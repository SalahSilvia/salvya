import { readFileSync } from "node:fs";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  collectBlogFolderImports,
  coverImageMime,
  coverStoragePath,
  type BlogFolderImportRow,
} from "@/lib/blog/blog-folder-import";

const BUCKET = "blog-images";

export type BlogFolderSyncResult = {
  ok: boolean;
  inserted: number;
  updated: number;
  skipped: number;
  errors: string[];
  total: number;
  withCovers: number;
};

function publishedAtForIndex(index: number, maxIndex = 18): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - (maxIndex - index) * 3);
  d.setUTCHours(10, 0, 0, 0);
  return d.toISOString();
}

async function uploadCover(
  service: SupabaseClient,
  row: BlogFolderImportRow,
): Promise<string> {
  const buf = readFileSync(row.coverImagePath);
  const path = coverStoragePath(row.slug, row.coverImagePath);
  const { error } = await service.storage.from(BUCKET).upload(path, buf, {
    contentType: coverImageMime(row.coverImagePath),
    upsert: true,
    cacheControl: "3600",
  });
  if (error) throw new Error(`cover upload ${row.slug}: ${error.message}`);
  const { data } = service.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

export async function syncBlogFoldersToSupabase(
  service: SupabaseClient,
  opts?: { dryRun?: boolean },
): Promise<BlogFolderSyncResult> {
  const rows = collectBlogFolderImports();
  const result: BlogFolderSyncResult = {
    ok: true,
    inserted: 0,
    updated: 0,
    skipped: 0,
    errors: [],
    total: rows.length,
    withCovers: rows.length,
  };

  if (!rows.length) return result;

  const { data: existing, error: loadErr } = await service
    .from("salvya_blog_posts")
    .select("id, slug")
    .limit(500);

  if (loadErr) {
    result.ok = false;
    result.errors.push(loadErr.message);
    return result;
  }

  const bySlug = new Map((existing ?? []).map((r) => [r.slug as string, r.id as string]));
  const maxFolderIndex = Math.max(...rows.map((r) => r.folderIndex), 1);

  for (const row of rows) {
    try {
      let coverUrl = "";
      if (!opts?.dryRun) {
        coverUrl = await uploadCover(service, row);
      }

      const payload = {
        slug: row.slug,
        title: row.title,
        subtitle: row.subtitle,
        excerpt: row.excerpt,
        body_md: row.bodyMd,
        cover_image: coverUrl,
        author_name: "Salvya",
        author_role: "Editorial",
        tags: row.tags,
        status: "published" as const,
        featured: row.featured,
        read_time_minutes: row.readTimeMinutes,
        seo_title: row.seoTitle,
        seo_description: row.seoDescription,
        published_at: publishedAtForIndex(row.folderIndex, maxFolderIndex),
        updated_at: new Date().toISOString(),
      };

      if (opts?.dryRun) {
        result.updated += 1;
        continue;
      }

      const existingId = bySlug.get(row.slug);
      if (existingId) {
        const { error } = await service.from("salvya_blog_posts").update(payload).eq("id", existingId);
        if (error) throw new Error(error.message);
        result.updated += 1;
      } else {
        const { error } = await service.from("salvya_blog_posts").insert(payload);
        if (error) throw new Error(error.message);
        result.inserted += 1;
      }
    } catch (e) {
      result.errors.push(`${row.slug}: ${e instanceof Error ? e.message : "sync failed"}`);
    }
  }

  result.ok = result.errors.length === 0;
  return result;
}
