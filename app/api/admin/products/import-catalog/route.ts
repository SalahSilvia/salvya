import type { NextRequest } from "next/server";
import {
  ADMIN_FOLDER_IMPORT_DISABLED_MESSAGE,
  isAdminFolderImportAllowed,
} from "@/lib/admin/folder-import-policy";
import { requireAdminService } from "@/lib/admin/require-admin-service";
import { previewCatalogImport, collectCatalogImportRows } from "@/lib/catalog/catalog-import";
import { syncCatalogToSupabase } from "@/lib/catalog/catalog-sync";
import { rbacApiJson } from "@/lib/auth/api-errors";

export async function GET(request: NextRequest) {
  const ctx = await requireAdminService(request);
  if (!ctx.ok) return ctx.response;

  const preview = previewCatalogImport();
  const sample = collectCatalogImportRows().slice(0, 8).map((r) => {
    const colors = (r.metadata as { colors?: { name: string; models?: string[] }[] }).colors;
    return {
      artistSlug: r.artistSlug,
      slug: r.slug,
      category: r.category,
      title: r.title,
      imageCount: r.images.length,
      colorways: colors?.map((c) => c.name) ?? [],
      modelShots: colors?.reduce((n, c) => n + (c.models?.length ?? 0), 0) ?? 0,
      source: r.source,
    };
  });

  return rbacApiJson({ ok: true, preview, sample });
}

export async function POST(request: NextRequest) {
  const ctx = await requireAdminService(request);
  if (!ctx.ok) return ctx.response;

  if (!isAdminFolderImportAllowed()) {
    return rbacApiJson({ ok: false, error: ADMIN_FOLDER_IMPORT_DISABLED_MESSAGE }, { status: 403 });
  }

  let dryRun = false;
  try {
    const body = await request.json();
    if (typeof body === "object" && body !== null && body.dryRun === true) dryRun = true;
  } catch {
    /* empty body is fine */
  }

  const result = await syncCatalogToSupabase(ctx.service, { dryRun });
  const preview = previewCatalogImport();

  return rbacApiJson(
    { ok: result.ok, result, preview },
    { status: result.ok ? 200 : 207 },
  );
}
