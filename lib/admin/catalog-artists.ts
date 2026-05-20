import { artists, type ArtistCard } from "@/lib/site-data";

export type CatalogArtistOption = {
  slug: string;
  name: string;
  statusTag: ArtistCard["statusTag"];
  profileImage: string;
  /** Selectable in product editor (shop is live or limited). */
  selectable: boolean;
};

export function getCatalogArtists(): CatalogArtistOption[] {
  return artists.map((a) => ({
    slug: a.slug,
    name: a.name,
    statusTag: a.statusTag,
    profileImage: a.profileImage,
    selectable: a.statusTag !== "COMING SOON",
  }));
}

export function isKnownArtistSlug(slug: string): boolean {
  const s = slug.trim().toLowerCase();
  return artists.some((a) => a.slug === s);
}
