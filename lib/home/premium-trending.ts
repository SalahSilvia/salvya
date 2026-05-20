import { artists } from "@/lib/site-data";
import type { ElgrandetotoFolderHoodieItem } from "@/lib/elgrandetoto-hoodie-fs";
import { elgrandetotoHoodieImageSrc } from "@/lib/elgrandetoto-hoodie-public";
import type { ElgrandetotoFolderTshirtItem } from "@/lib/elgrandetoto-tshirt-fs";
import { elgrandetotoTshirtImageSrc } from "@/lib/elgrandetoto-tshirt-public";
import { formatOversizeHoodieTitle, HOODIE_PRICE_LABEL, TSHIRT_PRICE_LABEL } from "@/lib/shop-data";

const ARTIST = "ElGrandeToto";
const ARTIST_SLUG = "elgrandetoto";

export type PremiumTrendingCard = {
  id: string;
  kind: "hoodie" | "tshirt";
  artistSlug: string;
  href: string;
  imageSrc: string;
  title: string;
  priceLabel: string;
  artistLabel: string;
  /** Shelf badge for home rails */
  badge?: "new" | "limited";
};

export function buildPremiumTrendingCards(
  tshirtItems: ElgrandetotoFolderTshirtItem[],
  hoodieItems: ElgrandetotoFolderHoodieItem[],
  max = 8,
): PremiumTrendingCard[] {
  const out: PremiumTrendingCard[] = [];
  for (const item of hoodieItems) {
    const thumb = item.orderedFiles[0];
    if (!thumb) continue;
    out.push({
      id: `h-${item.folder}`,
      kind: "hoodie",
      artistSlug: ARTIST_SLUG,
      href: `/artist/${ARTIST_SLUG}/item/${encodeURIComponent(item.folder)}`,
      imageSrc: elgrandetotoHoodieImageSrc(item.folder, thumb),
      title: formatOversizeHoodieTitle(item.title),
      priceLabel: HOODIE_PRICE_LABEL,
      artistLabel: ARTIST,
    });
    if (out.length >= max) return out;
  }
  for (const item of tshirtItems) {
    const thumb = item.orderedFiles[0];
    if (!thumb) continue;
    out.push({
      id: `t-${item.folder}`,
      kind: "tshirt",
      artistSlug: ARTIST_SLUG,
      href: `/artist/${ARTIST_SLUG}/tshirt/${encodeURIComponent(item.folder)}`,
      imageSrc: elgrandetotoTshirtImageSrc(item.folder, thumb),
      title: formatOversizeHoodieTitle(item.title),
      priceLabel: TSHIRT_PRICE_LABEL,
      artistLabel: ARTIST,
    });
    if (out.length >= max) return out;
  }
  return out;
}

export function heroHoodieBackdropSrc(hoodieItems: ElgrandetotoFolderHoodieItem[]): string | null {
  const first = hoodieItems[0];
  const file = first?.orderedFiles[0];
  if (!first || !file) return null;
  return elgrandetotoHoodieImageSrc(first.folder, file);
}

const HOME_FEATURED_SLUGS = ["babygang", "elgrandetoto", "inkonnu"] as const;

export type FeaturedDropCard = {
  label: string;
  title: string;
  sub: string;
  href: string;
  cta: string;
  coverSrc: string;
};

/** Artist storefronts with live folder catalogs — copy from `site-data`. */
export const FEATURED_DROPS: FeaturedDropCard[] = HOME_FEATURED_SLUGS.flatMap((slug) => {
  const artist = artists.find((a) => a.slug === slug);
  if (!artist) return [];
  return [
    {
      label: artist.statusTag,
      title: artist.name,
      sub: artist.aboutLead,
      href: `/artist/${slug}`,
      cta: artist.statusTag === "LIMITED DROP" ? "Shop the drop" : "Shop",
      coverSrc: artist.coverImage,
    },
  ];
});

export const FEATURED_DROP = FEATURED_DROPS[0];

const spotlightArtist = artists.find((a) => a.slug === "elgrandetoto");

export const FEATURED_CREATOR = {
  slug: spotlightArtist?.slug ?? "elgrandetoto",
  name: spotlightArtist?.name ?? "ElGrandeToto",
  line: spotlightArtist?.aboutLead ?? "",
  coverSrc: spotlightArtist?.coverImage ?? "/api/artist-cover/elgrandetoto",
  exploreHref: `/artist/${spotlightArtist?.slug ?? "elgrandetoto"}`,
};
