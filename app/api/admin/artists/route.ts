import type { NextRequest } from "next/server";
import { adminArtistToCatalogOption } from "@/lib/admin/artist-payload";
import { sanitizeArtistPayload } from "@/lib/admin/artist-payload";
import { getCatalogArtists } from "@/lib/admin/catalog-artists";
import { rowToAdminArtist, type SalvyaArtistRow } from "@/lib/artists/types";
import { requireAdminService } from "@/lib/admin/require-admin-service";
import { rbacApiJson } from "@/lib/auth/api-errors";

export async function GET(request: NextRequest) {
  const admin = await requireAdminService(request);
  if (!admin.ok) return admin.response;

  const url = new URL(request.url);
  const includeArchived = url.searchParams.get("archived") === "1" || url.searchParams.get("all") === "1";
  const catalogOnly = url.searchParams.get("catalog") === "1";

  let sq = admin.service.from("salvya_artists").select("*").order("sort_order", { ascending: true }).order("name", {
    ascending: true,
  });

  if (!includeArchived) {
    sq = sq.eq("archived", false);
  }

  const { data, error } = await sq;

  if (error) {
    if (error.code === "42P01" || error.message.includes("does not exist")) {
      if (catalogOnly) {
        return rbacApiJson({ ok: true, artists: getCatalogArtists() });
      }
      return rbacApiJson({ ok: true, artists: [] });
    }
    return rbacApiJson({ ok: false, error: error.message }, { status: 500 });
  }

  const artists = (data as SalvyaArtistRow[]).map(rowToAdminArtist);

  if (catalogOnly) {
    return rbacApiJson({
      ok: true,
      artists: artists.filter((a) => !a.archived).map(adminArtistToCatalogOption),
    });
  }

  return rbacApiJson({ ok: true, artists });
}

export async function POST(request: NextRequest) {
  const admin = await requireAdminService(request);
  if (!admin.ok) return admin.response;

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return rbacApiJson({ ok: false, error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = sanitizeArtistPayload(body, { mode: "create" });
  if (!parsed.ok) return rbacApiJson({ ok: false, error: parsed.error }, { status: 400 });

  const { data: existing } = await admin.service
    .from("salvya_artists")
    .select("slug")
    .eq("slug", parsed.row.slug)
    .maybeSingle();

  if (existing) {
    return rbacApiJson({ ok: false, error: "An artist with this slug already exists." }, { status: 409 });
  }

  const now = new Date().toISOString();
  const { data, error } = await admin.service
    .from("salvya_artists")
    .insert({ ...parsed.row, created_at: now, updated_at: now })
    .select("*")
    .single();

  if (error) {
    if (error.code === "42P01" || error.message.includes("does not exist")) {
      return rbacApiJson(
        { ok: false, error: "salvya_artists table missing — run the artists migration in Supabase." },
        { status: 503 },
      );
    }
    return rbacApiJson({ ok: false, error: error.message }, { status: 500 });
  }

  return rbacApiJson({ ok: true, artist: rowToAdminArtist(data as SalvyaArtistRow) }, { status: 201 });
}
