import type { ArtistCard, ArtistStatusTag } from "@/lib/site-data";

export type SalvyaArtistRow = {
  slug: string;
  name: string;
  status_tag: string;
  gradient: string;
  ambient: string;
  profile_image: string;
  cover_image: string;
  about_lead: string;
  about_more: string | null;
  archived: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type AdminArtistDTO = {
  slug: string;
  name: string;
  statusTag: ArtistStatusTag;
  gradient: string;
  ambient: string;
  profileImage: string;
  coverImage: string;
  aboutLead: string;
  aboutMore: string | null;
  archived: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
};

export function parseArtistStatusTag(v: unknown): ArtistStatusTag {
  if (v === "AVAILABLE" || v === "LIMITED DROP" || v === "COMING SOON") return v;
  return "AVAILABLE";
}

export function rowToArtistCard(row: SalvyaArtistRow): ArtistCard {
  return {
    slug: row.slug,
    name: row.name,
    statusTag: parseArtistStatusTag(row.status_tag),
    gradient: row.gradient,
    ambient: row.ambient,
    profileImage: row.profile_image,
    coverImage: row.cover_image,
    aboutLead: row.about_lead,
    aboutMore: row.about_more ?? undefined,
  };
}

export function rowToAdminArtist(row: SalvyaArtistRow): AdminArtistDTO {
  return {
    slug: row.slug,
    name: row.name,
    statusTag: parseArtistStatusTag(row.status_tag),
    gradient: row.gradient,
    ambient: row.ambient,
    profileImage: row.profile_image,
    coverImage: row.cover_image,
    aboutLead: row.about_lead,
    aboutMore: row.about_more,
    archived: row.archived,
    sortOrder: row.sort_order,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function slugifyArtistName(name: string): string {
  const base = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64);
  return base || "artist";
}

export function defaultArtistImages(slug: string): { profileImage: string; coverImage: string } {
  return {
    profileImage: `/api/artist-avatar/${slug}`,
    coverImage: `/api/artist-cover/${slug}`,
  };
}
