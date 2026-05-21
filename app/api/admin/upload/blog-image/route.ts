import type { NextRequest } from "next/server";
import { isValidBlogSlug } from "@/lib/blog/slug";
import { requireAdminService } from "@/lib/admin/require-admin-service";
import { rbacApiJson } from "@/lib/auth/api-errors";
import { MAX_BLOG_UPLOAD_BYTES } from "@/lib/media/image-optimization/constants";
import { uploadOptimizedImage } from "@/lib/media/image-optimization/upload";

const BUCKET = "blog-images";

export async function POST(request: NextRequest) {
  const admin = await requireAdminService(request);
  if (!admin.ok) return admin.response;

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return rbacApiJson({ ok: false, error: "Invalid form data" }, { status: 400 });
  }

  const file = form.get("file");
  const postSlug = String(form.get("postSlug") ?? "")
    .trim()
    .toLowerCase();
  const kindRaw = String(form.get("kind") ?? "");
  const kind = kindRaw === "inline" ? "inline" : kindRaw === "cover" ? "cover" : null;

  if (!isValidBlogSlug(postSlug)) {
    return rbacApiJson({ ok: false, error: "Enter a valid post slug before uploading." }, { status: 400 });
  }
  if (!kind) {
    return rbacApiJson({ ok: false, error: "Missing image kind (cover or inline)." }, { status: 400 });
  }

  if (!(file instanceof File) || file.size === 0) {
    return rbacApiJson({ ok: false, error: "No image file provided" }, { status: 400 });
  }

  const mime = file.type || "image/jpeg";
  const buf = Buffer.from(await file.arrayBuffer());
  const basePath =
    kind === "cover"
      ? `${postSlug}/cover`
      : `${postSlug}/inline/${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  try {
    const result = await uploadOptimizedImage(admin.service, BUCKET, basePath, buf, mime, {
      maxBytes: MAX_BLOG_UPLOAD_BYTES,
      upsert: kind === "cover",
      cacheVersion: kind === "cover" ? String(Date.now()) : undefined,
    });

    return rbacApiJson({
      ok: true,
      url: result.url,
      path: result.basePath,
      kind,
      variants: result.variants,
      blurDataUrl: result.blurDataUrl,
      width: result.width,
      height: result.height,
      bytesSaved: result.bytesSaved,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Image processing failed";
    const hint =
      message.includes("Bucket not found") || message.includes("bucket")
        ? " Run migration 20250516230100_blog_images_storage.sql in Supabase."
        : "";
    return rbacApiJson({ ok: false, error: `${message}${hint}` }, { status: message.includes("MB") ? 400 : 500 });
  }
}
