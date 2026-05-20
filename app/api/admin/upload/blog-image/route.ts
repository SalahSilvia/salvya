import type { NextRequest } from "next/server";
import { isValidBlogSlug } from "@/lib/blog/slug";
import { requireAdminService } from "@/lib/admin/require-admin-service";
import { rbacApiJson } from "@/lib/auth/api-errors";

const BUCKET = "blog-images";
const MAX_BYTES = 10 * 1024 * 1024;
const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

function extForMime(mime: string): string {
  if (mime === "image/png") return "png";
  if (mime === "image/webp") return "webp";
  if (mime === "image/gif") return "gif";
  return "jpg";
}

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
  if (file.size > MAX_BYTES) {
    return rbacApiJson({ ok: false, error: "Image must be 10 MB or smaller" }, { status: 400 });
  }

  const mime = file.type || "image/jpeg";
  if (!ALLOWED.has(mime)) {
    return rbacApiJson({ ok: false, error: "Use JPEG, PNG, WebP, or GIF" }, { status: 400 });
  }

  const buf = Buffer.from(await file.arrayBuffer());
  const ext = extForMime(mime);
  const path =
    kind === "cover"
      ? `${postSlug}/cover.${ext}`
      : `${postSlug}/inline/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

  const { error } = await admin.service.storage.from(BUCKET).upload(path, buf, {
    contentType: mime,
    upsert: kind === "cover",
    cacheControl: "3600",
  });

  if (error) {
    const hint =
      error.message.includes("Bucket not found") || error.message.includes("bucket")
        ? " Run migration 20250516230100_blog_images_storage.sql in Supabase."
        : "";
    return rbacApiJson({ ok: false, error: `${error.message}${hint}` }, { status: 500 });
  }

  const { data: pub } = admin.service.storage.from(BUCKET).getPublicUrl(path);
  return rbacApiJson({ ok: true, url: pub.publicUrl, path, kind });
}
