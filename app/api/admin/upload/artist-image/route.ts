import type { NextRequest } from "next/server";
import { isValidArtistSlugFormat } from "@/lib/admin/artist-slug";
import { requireAdminService } from "@/lib/admin/require-admin-service";
import { rbacApiJson } from "@/lib/auth/api-errors";
import { MAX_UPLOAD_BYTES } from "@/lib/media/image-optimization/constants";
import { uploadOptimizedImage } from "@/lib/media/image-optimization/upload";

const BUCKET = "artist-images";

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
  const artistSlugRaw = typeof form.get("artistSlug") === "string" ? form.get("artistSlug") : "";
  const kindRaw = typeof form.get("kind") === "string" ? form.get("kind") : "";
  const artistSlug = String(artistSlugRaw).trim().toLowerCase();
  const kind = kindRaw === "cover" ? "cover" : kindRaw === "profile" ? "profile" : null;

  if (!isValidArtistSlugFormat(artistSlug)) {
    return rbacApiJson({ ok: false, error: "Enter a valid artist slug (2+ letters, numbers, hyphens)." }, { status: 400 });
  }
  if (!kind) {
    return rbacApiJson({ ok: false, error: "Missing image kind (profile or cover)." }, { status: 400 });
  }

  if (!(file instanceof File) || file.size === 0) {
    return rbacApiJson({ ok: false, error: "No image file provided" }, { status: 400 });
  }

  const mime = file.type || "image/jpeg";
  const buf = Buffer.from(await file.arrayBuffer());
  const basePath = `${artistSlug}/${kind}`;

  try {
    const result = await uploadOptimizedImage(admin.service, BUCKET, basePath, buf, mime, {
      maxBytes: MAX_UPLOAD_BYTES,
      upsert: true,
      cacheVersion: String(Date.now()),
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
        ? " Run migration 20250516220000_artist_images_storage.sql in Supabase."
        : "";
    return rbacApiJson({ ok: false, error: `${message}${hint}` }, { status: message.includes("MB") ? 400 : 500 });
  }
}
