import { isArtistFolderCatalogSlug } from "@/lib/artist-folder-catalog-slugs";
import type { ArtistCard, ArtistStatusTag } from "@/lib/site-data";
import { artists } from "@/lib/site-data";

/** Taste clusters — boost artists in the same cultural lane as the current shop. */
const AFFINITY_CLUSTERS: readonly (readonly string[])[] = [
  ["elgrandetoto", "babygang", "inkonnu"],
  ["billie-eilish", "drake", "the-weeknd"],
  ["tchubi"],
] as const;

function clusterBoost(currentSlug: string, candidateSlug: string): number {
  for (const cluster of AFFINITY_CLUSTERS) {
    if (
      (cluster as readonly string[]).includes(currentSlug) &&
      (cluster as readonly string[]).includes(candidateSlug)
    ) {
      return 4;
    }
  }
  return 0;
}

function statusBoost(current: ArtistStatusTag, candidate: ArtistStatusTag): number {
  let s = 0;
  if (candidate === "LIMITED DROP") s += 2;
  if (current === candidate) s += 1;
  if (candidate === "AVAILABLE" && current === "AVAILABLE") s += 0.5;
  return s;
}

function catalogBoost(currentSlug: string, candidateSlug: string): number {
  if (isArtistFolderCatalogSlug(currentSlug) && isArtistFolderCatalogSlug(candidateSlug)) return 1;
  return 0;
}

/** Score how relevant `candidate` is when browsing `current`. Higher = show earlier. */
export function scoreSuggestedArtist(current: ArtistCard, candidate: ArtistCard): number {
  return (
    clusterBoost(current.slug, candidate.slug) +
    statusBoost(current.statusTag, candidate.statusTag) +
    catalogBoost(current.slug, candidate.slug)
  );
}

/**
 * All live artists except the current page, ranked by affinity (status, cluster, catalog).
 * Returns every eligible artist — use a horizontal carousel to browse them all.
 */
export function rankSuggestedArtists(excludeSlug: string, pool: readonly ArtistCard[] = artists): ArtistCard[] {
  const current = pool.find((a) => a.slug === excludeSlug);
  const candidates = pool.filter((a) => a.slug !== excludeSlug && a.statusTag !== "COMING SOON");
  if (!current) return [...candidates];

  return [...candidates].sort((a, b) => {
    const diff = scoreSuggestedArtist(current, b) - scoreSuggestedArtist(current, a);
    if (diff !== 0) return diff;
    return a.name.localeCompare(b.name, undefined, { sensitivity: "base" });
  });
}
