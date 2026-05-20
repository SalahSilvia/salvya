export const RECENT_SEARCH_STORAGE_KEY = "salvya-search-recent-v1";

export const SUGGESTED_QUERIES = [
  "Oversized hoodie",
  "BabyGang",
  "ElGrandeToto",
  "Heavyweight tee",
  "Limited drop",
] as const;

export type TrendingEditorialCard = {
  id: string;
  title: string;
  sub: string;
  href: string;
  /** Optional cover — gradient-only tile when null */
  coverSrc: string | null;
};

export const TRENDING_EDITORIAL: TrendingEditorialCard[] = [
  {
    id: "babygang-no-signal",
    title: "BABYGANG — NO SIGNAL",
    sub: "Dark palettes, sharp cuts, capsule energy",
    href: "/artist/babygang",
    coverSrc: "/api/artist-cover/babygang",
  },
  {
    id: "summer-oversized",
    title: "Summer oversized drops",
    sub: "Roomy fits built for heat",
    href: "/shop",
    coverSrc: "/api/artist-cover/elgrandetoto",
  },
  {
    id: "most-liked",
    title: "Most liked hoodies",
    sub: "What fans are saving",
    href: "/likes",
    coverSrc: null,
  },
];

export type DiscoverCategoryTile = {
  id: string;
  label: string;
  href: string;
  gradient: string;
};

export const DISCOVER_CATEGORIES: DiscoverCategoryTile[] = [
  {
    id: "tees",
    label: "Oversized Tees",
    href: "/shop",
    gradient: "from-slate-600/40 via-[#1a2030] to-[#050508]",
  },
  {
    id: "hoodies",
    label: "Heavy Hoodies",
    href: "/shop",
    gradient: "from-[#2D6BFF]/25 via-[#12182a] to-[#050508]",
  },
  {
    id: "drops",
    label: "Limited Drops",
    href: "/artist/babygang",
    gradient: "from-rose-500/20 via-[#1a1018] to-[#050508]",
  },
  {
    id: "accessories",
    label: "Accessories",
    href: "/shop",
    gradient: "from-amber-200/10 via-[#18140c] to-[#050508]",
  },
  {
    id: "streetwear",
    label: "Streetwear Essentials",
    href: "/shop",
    gradient: "from-emerald-500/15 via-[#0c1814] to-[#050508]",
  },
];
