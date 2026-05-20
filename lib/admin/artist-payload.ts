import {
  defaultArtistImages,
  parseArtistStatusTag,
  slugifyArtistName,
  type AdminArtistDTO,
  type SalvyaArtistRow,
} from "@/lib/artists/types";

const STATUS_TAGS = new Set(["AVAILABLE", "LIMITED DROP", "COMING SOON"]);

export function sanitizeArtistSlug(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const s = raw.trim().toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 64);
  return s.length >= 2 ? s : null;
}

export function sanitizeArtistPayload(
  body: Record<string, unknown>,
  opts: { mode: "create" | "update"; existingSlug?: string },
): { ok: true; row: Omit<SalvyaArtistRow, "created_at" | "updated_at"> } | { ok: false; error: string } {
  const name = typeof body.name === "string" ? body.name.trim() : "";
  if (!name) return { ok: false, error: "Name is required." };

  const slug =
    opts.mode === "update" && opts.existingSlug
      ? opts.existingSlug
      : sanitizeArtistSlug(body.slug) ?? slugifyArtistName(name);

  if (opts.mode === "create" && !sanitizeArtistSlug(slug)) {
    return { ok: false, error: "Slug must be at least 2 characters (letters, numbers, hyphens)." };
  }

  const statusTag = parseArtistStatusTag(body.statusTag ?? body.status_tag);
  if (!STATUS_TAGS.has(statusTag)) {
    return { ok: false, error: "Invalid status." };
  }

  const defaults = defaultArtistImages(slug);
  const profileImage =
    typeof body.profileImage === "string" && body.profileImage.trim()
      ? body.profileImage.trim()
      : typeof body.profile_image === "string" && body.profile_image.trim()
        ? body.profile_image.trim()
        : defaults.profileImage;
  const coverImage =
    typeof body.coverImage === "string" && body.coverImage.trim()
      ? body.coverImage.trim()
      : typeof body.cover_image === "string" && body.cover_image.trim()
        ? body.cover_image.trim()
        : defaults.coverImage;

  const gradient =
    typeof body.gradient === "string" && body.gradient.trim()
      ? body.gradient.trim()
      : "from-[#241840] via-[#0c1a45] to-[#05060c]";
  const ambient =
    typeof body.ambient === "string" && body.ambient.trim()
      ? body.ambient.trim()
      : "from-[#2D6BFF]/25 to-transparent";

  const aboutLead =
    typeof body.aboutLead === "string"
      ? body.aboutLead.trim()
      : typeof body.about_lead === "string"
        ? body.about_lead.trim()
        : "";
  const aboutMoreRaw =
    typeof body.aboutMore === "string"
      ? body.aboutMore.trim()
      : typeof body.about_more === "string"
        ? body.about_more.trim()
        : "";
  const aboutMore = aboutMoreRaw || null;

  const archived = body.archived === true;
  const sortOrder =
    typeof body.sortOrder === "number" && Number.isFinite(body.sortOrder)
      ? Math.floor(body.sortOrder)
      : typeof body.sort_order === "number" && Number.isFinite(body.sort_order)
        ? Math.floor(body.sort_order)
        : 0;

  return {
    ok: true,
    row: {
      slug,
      name,
      status_tag: statusTag,
      gradient,
      ambient,
      profile_image: profileImage,
      cover_image: coverImage,
      about_lead: aboutLead,
      about_more: aboutMore,
      archived,
      sort_order: sortOrder,
    },
  };
}

export function adminArtistToCatalogOption(a: AdminArtistDTO) {
  return {
    slug: a.slug,
    name: a.name,
    statusTag: a.statusTag,
    profileImage: a.profileImage,
    selectable: !a.archived && a.statusTag !== "COMING SOON",
  };
}
