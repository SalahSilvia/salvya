import type { NextRequest } from "next/server";
import { sanitizeArtistPayload } from "@/lib/admin/artist-payload";
import { rowToAdminArtist, type SalvyaArtistRow } from "@/lib/artists/types";
import { requireAdminService } from "@/lib/admin/require-admin-service";
import { rbacApiJson } from "@/lib/auth/api-errors";

type RouteContext = { params: Promise<{ slug: string }> };

export async function GET(request: NextRequest, context: RouteContext) {
  const admin = await requireAdminService(request);
  if (!admin.ok) return admin.response;

  const { slug } = await context.params;
  const key = slug.trim().toLowerCase();

  const { data, error } = await admin.service.from("salvya_artists").select("*").eq("slug", key).maybeSingle();

  if (error) {
    if (error.code === "42P01" || error.message.includes("does not exist")) {
      return rbacApiJson({ ok: false, error: "Artists table not configured." }, { status: 503 });
    }
    return rbacApiJson({ ok: false, error: error.message }, { status: 500 });
  }

  if (!data) return rbacApiJson({ ok: false, error: "Artist not found." }, { status: 404 });

  return rbacApiJson({ ok: true, artist: rowToAdminArtist(data as SalvyaArtistRow) });
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const admin = await requireAdminService(request);
  if (!admin.ok) return admin.response;

  const { slug } = await context.params;
  const key = slug.trim().toLowerCase();

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return rbacApiJson({ ok: false, error: "Invalid JSON body." }, { status: 400 });
  }

  const { data: existing, error: loadErr } = await admin.service
    .from("salvya_artists")
    .select("*")
    .eq("slug", key)
    .maybeSingle();

  if (loadErr) {
    return rbacApiJson({ ok: false, error: loadErr.message }, { status: 500 });
  }
  if (!existing) return rbacApiJson({ ok: false, error: "Artist not found." }, { status: 404 });

  const parsed = sanitizeArtistPayload(body, { mode: "update", existingSlug: key });
  if (!parsed.ok) return rbacApiJson({ ok: false, error: parsed.error }, { status: 400 });

  const { data, error } = await admin.service
    .from("salvya_artists")
    .update({ ...parsed.row, updated_at: new Date().toISOString() })
    .eq("slug", key)
    .select("*")
    .single();

  if (error) return rbacApiJson({ ok: false, error: error.message }, { status: 500 });

  return rbacApiJson({ ok: true, artist: rowToAdminArtist(data as SalvyaArtistRow) });
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  const admin = await requireAdminService(request);
  if (!admin.ok) return admin.response;

  const { slug } = await context.params;
  const key = slug.trim().toLowerCase();

  const { count } = await admin.service
    .from("salvya_products")
    .select("id", { count: "exact", head: true })
    .eq("artist_slug", key);

  if (typeof count === "number" && count > 0) {
    return rbacApiJson(
      {
        ok: false,
        error: `Cannot delete: ${count} product(s) still reference this artist. Archive instead or reassign products.`,
      },
      { status: 409 },
    );
  }

  const { error } = await admin.service.from("salvya_artists").delete().eq("slug", key);

  if (error) {
    if (error.code === "42P01" || error.message.includes("does not exist")) {
      return rbacApiJson({ ok: false, error: "Artists table not configured." }, { status: 503 });
    }
    return rbacApiJson({ ok: false, error: error.message }, { status: 500 });
  }

  return rbacApiJson({ ok: true });
}
