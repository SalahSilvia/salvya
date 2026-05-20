import { createClient } from "@supabase/supabase-js";
import { describe, expect, it } from "vitest";
import { collectBlogFolderImports } from "@/lib/blog/blog-folder-import";
import { syncBlogFoldersToSupabase } from "@/lib/blog/blog-folder-sync";

const RUN = process.env.RUN_BLOG_SYNC === "1";

describe("run-blog-sync", () => {
  it.skipIf(!RUN)(
    "pushes Blogs folder articles to Supabase with cover images",
    async () => {
    const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) {
      throw new Error("Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (salvya.local.env)");
    }

    const rows = collectBlogFolderImports();
    expect(rows.length).toBe(12);

    const service = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
    const result = await syncBlogFoldersToSupabase(service);

    // eslint-disable-next-line no-console
    console.log(
      JSON.stringify(
        {
          result,
          posts: rows.map((r) => ({
            slug: r.slug,
            title: r.title,
            featured: r.featured,
            readMin: r.readTimeMinutes,
            cover: r.coverImagePath.split(/[/\\]/).pop(),
          })),
        },
        null,
        2,
      ),
    );

    expect(result.inserted + result.updated).toBe(12);
    expect(result.errors).toEqual([]);
  },
    120_000,
  );
});
