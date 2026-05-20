import { createClient } from "@supabase/supabase-js";
import { describe, expect, it } from "vitest";
import { collectCatalogImportRows, previewCatalogImport } from "@/lib/catalog/catalog-import";
import { syncCatalogToSupabase } from "@/lib/catalog/catalog-sync";

const RUN = process.env.RUN_CATALOG_SYNC === "1";

describe("run-catalog-sync", () => {
  it.skipIf(!RUN)("pushes full smart catalog to Supabase", async () => {
    const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) {
      throw new Error("Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (salvya.local.env)");
    }

    const preview = previewCatalogImport();
    const rows = collectCatalogImportRows();
    expect(rows.length).toBeGreaterThan(0);

    const service = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
    const result = await syncCatalogToSupabase(service);

    // eslint-disable-next-line no-console
    console.log(
      JSON.stringify(
        {
          preview,
          result,
          sample: rows.slice(0, 5).map((r) => ({
            title: r.title,
            artist: r.artistSlug,
            category: r.category,
            images: r.images.length,
            colors: (r.metadata as { colors?: unknown[] }).colors?.length ?? 0,
          })),
        },
        null,
        2,
      ),
    );

    if (result.errors.length) {
      // eslint-disable-next-line no-console
      console.warn("Sync completed with errors:", result.errors.slice(0, 5));
    }
    expect(result.inserted + result.updated).toBeGreaterThan(0);
    expect(result.skipped).toBe(0);
  });
});
