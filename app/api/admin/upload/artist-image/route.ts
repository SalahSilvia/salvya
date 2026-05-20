import type { NextRequest } from "next/server";
import { isValidArtistSlugFormat } from "@/lib/admin/artist-slug";
import { requireAdminService } from "@/lib/admin/require-admin-service";
import { rbacApiJson } from "@/lib/auth/api-errors";

const BUCKET = "artist-images";
const MAX_BYTES = 8 * 1024 * 1024;
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
  if (file.size > MAX_BYTES) {
    return rbacApiJson({ ok: false, error: "Image must be 8 MB or smaller" }, { status: 400 });
  }

  const mime = file.type || "image/jpeg";
  if (!ALLOWED.has(mime)) {
    return rbacApiJson({ ok: false, error: "Use JPEG, PNG, WebP, or GIF" }, { status: 400 });
  }

  const buf = Buffer.from(await file.arrayBuffer());
  const ext = extForMime(mime);
  const path = `${artistSlug}/${kind}.${ext}`;

  const { error } = await admin.service.storage.from(BUCKET).upload(path, buf, {
    contentType: mime,
    upsert: true,
    cacheControl: "3600",
  });

  if (error) {
    const hint =
      error.message.includes("Bucket not found") || error.message.includes("bucket")
        ? " Run migration 20250516220000_artist_images_storage.sql in Supabase."
        : "";
    return rbacApiJson({ ok: false, error: `${error.message}${hint}` }, { status: 500 });
  }

  const { data: pub } = admin.service.storage.from(BUCKET).getPublicUrl(path);

  return rbacApiJson({ ok: true, url: pub.publicUrl, path, kind });
}
