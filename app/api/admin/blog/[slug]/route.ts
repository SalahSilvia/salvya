import type { NextRequest } from "next/server";
import { sanitizeBlogPayload } from "@/lib/blog/payload";
import { rowToBlogPost, type SalvyaBlogRow } from "@/lib/blog/types";
import { requireAdminService } from "@/lib/admin/require-admin-service";
import { rbacApiJson } from "@/lib/auth/api-errors";

export async function GET(request: NextRequest, ctx: { params: Promise<{ slug: string }> }) {
  const admin = await requireAdminService(request);
  if (!admin.ok) return admin.response;

  const { slug } = await ctx.params;
  const { data, error } = await admin.service.from("salvya_blog_posts").select("*").eq("slug", slug).maybeSingle();

  if (error) return rbacApiJson({ ok: false, error: error.message }, { status: 500 });
  if (!data) return rbacApiJson({ ok: false, error: "Not found" }, { status: 404 });

  return rbacApiJson({ ok: true, post: rowToBlogPost(data as SalvyaBlogRow) });
}

export async function PATCH(request: NextRequest, ctx: { params: Promise<{ slug: string }> }) {
  const admin = await requireAdminService(request);
  if (!admin.ok) return admin.response;

  const { slug } = await ctx.params;

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return rbacApiJson({ ok: false, error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = sanitizeBlogPayload(body, { mode: "update", existingSlug: slug });
  if (!parsed.ok) return rbacApiJson({ ok: false, error: parsed.error }, { status: 400 });

  const now = new Date().toISOString();
  const { data, error } = await admin.service
    .from("salvya_blog_posts")
    .update({ ...parsed.row, updated_at: now })
    .eq("slug", slug)
    .select("*")
    .maybeSingle();

  if (error) return rbacApiJson({ ok: false, error: error.message }, { status: 500 });
  if (!data) return rbacApiJson({ ok: false, error: "Not found" }, { status: 404 });

  return rbacApiJson({ ok: true, post: rowToBlogPost(data as SalvyaBlogRow) });
}

export async function DELETE(request: NextRequest, ctx: { params: Promise<{ slug: string }> }) {
  const admin = await requireAdminService(request);
  if (!admin.ok) return admin.response;

  const { slug } = await ctx.params;
  const { error } = await admin.service.from("salvya_blog_posts").delete().eq("slug", slug);

  if (error) return rbacApiJson({ ok: false, error: error.message }, { status: 500 });
  return rbacApiJson({ ok: true });
}
