import type { ArtistCard } from "@/lib/site-data";
import { isArtistFolderCatalogSlug } from "@/lib/artist-folder-catalog-slugs";

export function creatorExploreLine(
  slug: string,
  hoodieCount: number,
  tshirtCount: number,
  statusTag: ArtistCard["statusTag"],
): string {
  const n = hoodieCount + tshirtCount;
  if (isArtistFolderCatalogSlug(slug) && n > 0) {
    return `${n} pieces in shop`;
  }
  if (slug === "babygang") {
    return statusTag === "LIMITED DROP" ? "Limited capsule on Salvya" : "Explore the storefront";
  }
  if (slug === "tchubi") return "Relaxed silhouettes & tones";
  if (slug === "inkonnu") return "Layered graphics & roomy fits";
  if (slug === "billie-eilish") return "Soft-dark palettes & oversized fits";
  if (slug === "drake") return "OVO-era staples & clean typography";
  if (slug === "the-weeknd") return "Noir reds & after-hours merch";
  return "Enter creator world";
}
