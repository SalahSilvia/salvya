import type { NextRequest } from "next/server";
import { randomBytes } from "node:crypto";
import { isKnownArtistSlug } from "@/lib/admin/catalog-artists";
import { requireAdminService } from "@/lib/admin/require-admin-service";
import { rbacApiJson } from "@/lib/auth/api-errors";
import { MAX_UPLOAD_BYTES } from "@/lib/media/image-optimization/constants";
import { uploadOptimizedImage } from "@/lib/media/image-optimization/upload";

const BUCKET = "product-images";

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
  const artistSlug = String(artistSlugRaw)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "");

  if (!artistSlug) {
    return rbacApiJson({ ok: false, error: "Select an artist before uploading" }, { status: 400 });
  }
  if (!isKnownArtistSlug(artistSlug)) {
    return rbacApiJson({ ok: false, error: "Unknown artist — pick from the catalog list" }, { status: 400 });
  }

  if (!(file instanceof File) || file.size === 0) {
    return rbacApiJson({ ok: false, error: "No image file provided" }, { status: 400 });
  }

  const mime = file.type || "image/jpeg";
  const buf = Buffer.from(await file.arrayBuffer());
  const basePath = `${artistSlug}/${Date.now()}-${randomBytes(4).toString("hex")}`;

  try {
    const result = await uploadOptimizedImage(admin.service, BUCKET, basePath, buf, mime, {
      maxBytes: MAX_UPLOAD_BYTES,
      upsert: false,
    });

    return rbacApiJson({
      ok: true,
      url: result.url,
      path: result.basePath,
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
        ? " Run migration 20250516200000_product_images_storage_metadata.sql in Supabase."
        : "";
    return rbacApiJson({ ok: false, error: `${message}${hint}` }, { status: message.includes("MB") ? 400 : 500 });
  }
}
