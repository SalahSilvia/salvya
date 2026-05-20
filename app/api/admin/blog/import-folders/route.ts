import type { NextRequest } from "next/server";
import {
  ADMIN_FOLDER_IMPORT_DISABLED_MESSAGE,
  isAdminFolderImportAllowed,
} from "@/lib/admin/folder-import-policy";
import { requireAdminService } from "@/lib/admin/require-admin-service";
import { collectBlogFolderImports } from "@/lib/blog/blog-folder-import";
import { syncBlogFoldersToSupabase } from "@/lib/blog/blog-folder-sync";
import { rbacApiJson } from "@/lib/auth/api-errors";

export async function GET(request: NextRequest) {
  const ctx = await requireAdminService(request);
  if (!ctx.ok) return ctx.response;

  const rows = collectBlogFolderImports();
  return rbacApiJson({
    ok: true,
    preview: {
      total: rows.length,
      slugs: rows.map((r) => r.slug),
    },
    sample: rows.slice(0, 4).map((r) => ({
      slug: r.slug,
      title: r.title,
      featured: r.featured,
      readMin: r.readTimeMinutes,
    })),
  });
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
    /* empty body */
  }

  const result = await syncBlogFoldersToSupabase(ctx.service, { dryRun });
  const rows = collectBlogFolderImports();

  return rbacApiJson(
    {
      ok: result.ok,
      result,
      preview: { total: rows.length },
    },
    { status: result.ok ? 200 : 207 },
  );
}
