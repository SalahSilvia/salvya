import type { NextRequest } from "next/server";
import { requireAdminService } from "@/lib/admin/require-admin-service";
import { rbacApiJson } from "@/lib/auth/api-errors";
import { isValidBlogSlug } from "@/lib/blog/slug";

/** GET ?slug=my-post&exclude=old-slug — whether slug is free for create/rename. */
export async function GET(request: NextRequest) {
  const admin = await requireAdminService(request);
  if (!admin.ok) return admin.response;

  const url = new URL(request.url);
  const slug = url.searchParams.get("slug")?.trim().toLowerCase() ?? "";
  const exclude = url.searchParams.get("exclude")?.trim().toLowerCase() ?? "";

  if (!isValidBlogSlug(slug)) {
    return rbacApiJson({ ok: true, available: false, reason: "invalid_slug" });
  }

  if (exclude && slug === exclude) {
    return rbacApiJson({ ok: true, available: true });
  }

  const { data, error } = await admin.service
    .from("salvya_blog_posts")
    .select("slug")
    .eq("slug", slug)
    .maybeSingle();

  if (error) {
    if (error.code === "42P01" || error.message.includes("does not exist")) {
      return rbacApiJson({ ok: true, available: true, tableMissing: true });
    }
    return rbacApiJson({ ok: false, error: error.message }, { status: 500 });
  }

  return rbacApiJson({ ok: true, available: !data });
}
