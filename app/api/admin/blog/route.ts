import type { NextRequest } from "next/server";
import { sanitizeBlogPayload } from "@/lib/blog/payload";
import { rowToBlogPost, type SalvyaBlogRow } from "@/lib/blog/types";
import { guardAdminMutation } from "@/lib/admin/admin-request-guard";
import { requireAdminService } from "@/lib/admin/require-admin-service";
import { rbacApiJson } from "@/lib/auth/api-errors";

export async function GET(request: NextRequest) {
  const admin = await requireAdminService(request);
  if (!admin.ok) return admin.response;

  const url = new URL(request.url);
  const status = url.searchParams.get("status");
  const includeArchived = url.searchParams.get("all") === "1";

  let q = admin.service.from("salvya_blog_posts").select("*").order("updated_at", { ascending: false });

  if (status === "draft" || status === "published" || status === "archived") {
    q = q.eq("status", status);
  } else if (!includeArchived) {
    q = q.neq("status", "archived");
  }

  const { data, error } = await q;

  if (error) {
    if (error.code === "42P01" || error.message.includes("does not exist")) {
      return rbacApiJson({ ok: true, posts: [] });
    }
    return rbacApiJson({ ok: false, error: error.message }, { status: 500 });
  }

  const posts = (data as SalvyaBlogRow[]).map(rowToBlogPost);
  return rbacApiJson({ ok: true, posts });
}

export async function POST(request: NextRequest) {
  const blocked = guardAdminMutation(request);
  if (blocked) return blocked;

  const admin = await requireAdminService(request);
  if (!admin.ok) return admin.response;

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return rbacApiJson({ ok: false, error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = sanitizeBlogPayload(body, { mode: "create" });
  if (!parsed.ok) return rbacApiJson({ ok: false, error: parsed.error }, { status: 400 });

  const { data: existing } = await admin.service
    .from("salvya_blog_posts")
    .select("slug")
    .eq("slug", parsed.row.slug)
    .maybeSingle();

  if (existing) {
    return rbacApiJson({ ok: false, error: "A post with this slug already exists." }, { status: 409 });
  }

  const now = new Date().toISOString();
  const { data, error } = await admin.service
    .from("salvya_blog_posts")
    .insert({ ...parsed.row, created_at: now, updated_at: now })
    .select("*")
    .single();

  if (error) {
    return rbacApiJson({ ok: false, error: error.message }, { status: 500 });
  }

  return rbacApiJson({ ok: true, post: rowToBlogPost(data as SalvyaBlogRow) }, { status: 201 });
}
