/**
 * Hero + brand assets live under `public/media/`.
 * Avatars: `GET /api/artist-avatar/[slug]`. Covers: `GET /api/artist-cover/[slug]`
 * (e.g. `artists/Elgrandetoto/cover-elgrandetoto-picture.png`, `artists/BabyGang/babygang cover image.jpg`).
 */
export type ArtistStatusTag = "AVAILABLE" | "LIMITED DROP" | "COMING SOON";

export type ArtistCard = {
  slug: string;
  name: string;
  statusTag: ArtistStatusTag;
  gradient: string;
  ambient: string;
  /** Avatar URL */
  profileImage: string;
  /** Cover banner — `GET /api/artist-cover/[slug]` (see `artist-cover` route for filenames per folder) */
  coverImage: string;
  /** Short “about” blurb (always visible) */
  aboutLead: string;
  /** Extra copy revealed with “Read more” (omit or empty to hide control) */
  aboutMore?: string;
};

export const artists: ArtistCard[] = [
  {
    slug: "elgrandetoto",
    name: "ElGrandeToto",
    statusTag: "AVAILABLE",
    gradient: "from-[#241840] via-[#0c1a45] to-[#05060c]",
    ambient: "from-[#2D6BFF]/25 to-transparent",
    profileImage: "/api/artist-avatar/elgrandetoto",
    coverImage: "/api/artist-cover/elgrandetoto",
    aboutLead:
      "Rap from Casablanca with a worldwide audience — ElGrandeToto’s Salvya shop mirrors the energy of his stage sets in fabric and print.",
    aboutMore:
      "Expect heavyweight hoodies, clean typography, and graphics that reference the culture around his music. Stock is intentionally limited: when a run sells out, the next design may take a different direction. Check back after singles and tours for new waves.",
  },
  {
    slug: "babygang",
    name: "BabyGang",
    statusTag: "LIMITED DROP",
    gradient: "from-[#301018] via-[#120a14] to-[#050508]",
    ambient: "from-[#ff4d6d]/12 to-transparent",
    profileImage: "/api/artist-avatar/babygang",
    coverImage: "/api/artist-cover/babygang",
    aboutLead:
      "Italian street rap with melody and bite — BabyGang’s line on Salvya leans dark palettes, sharp cuts, and graphics that read from a distance.",
    aboutMore:
      "Capsules are produced in small quantities so quality stays consistent. Limited tags mean the piece may not be restocked in the same color or print. If you see something you want, grab your size while it is still listed.",
  },
  {
    slug: "tchubi",
    name: "Tchubi",
    statusTag: "AVAILABLE",
    gradient: "from-[#0a2230] via-[#081018] to-[#040608]",
    ambient: "from-white/5 to-transparent",
    profileImage: "/api/artist-avatar/tchubi",
    coverImage: "/api/artist-cover/tchubi",
    aboutLead:
      "Tchubi keeps silhouettes relaxed and colors restrained — pieces that work on tour, at home, or layered under a coat.",
    aboutMore:
      "Fabrics are chosen for hand-feel and longevity rather than seasonal gimmicks. Graphics stay minimal so the fit stays the focus. New items appear in quiet drops; bookmark this shop if you like a calmer wardrobe with a music edge.",
  },
  {
    slug: "inkonnu",
    name: "Inkonnu",
    statusTag: "AVAILABLE",
    gradient: "from-[#1a1025] via-[#0d1520] to-[#050508]",
    ambient: "from-violet-400/15 to-transparent",
    profileImage: "/api/artist-avatar/inkonnu",
    coverImage: "/api/artist-cover/inkonnu",
    aboutLead:
      "Inkonnu sits between shadow and spotlight — Salvya pieces follow that mood with layered graphics and roomy fits.",
    aboutMore:
      "Look for washed blacks, off-whites, and occasional color hits tied to release artwork. Runs are modest in size so logistics stay tight. When a listing disappears, it is usually gone for good rather than held back for a restock.",
  },
  {
    slug: "billie-eilish",
    name: "Billie Eilish",
    statusTag: "LIMITED DROP",
    gradient: "from-[#0c1814] via-[#081210] to-[#050508]",
    ambient: "from-emerald-400/12 to-transparent",
    profileImage: "/media/artists/billie-eilish/profile.webp",
    coverImage: "/media/artists/billie-eilish/cover.webp",
    aboutLead:
      "Billie’s Salvya lane mirrors her world — soft-dark palettes, oversized silhouettes, and graphics that feel personal rather than loud.",
    aboutMore:
      "Capsules land in small waves. When a colorway or print leaves the shop, the next drop may take a different visual direction. Follow the feed for tour-adjacent releases and limited collabs.",
  },
  {
    slug: "drake",
    name: "Drake",
    statusTag: "AVAILABLE",
    gradient: "from-[#1a1408] via-[#0f0c06] to-[#050508]",
    ambient: "from-amber-200/10 to-transparent",
    profileImage: "/media/artists/drake/profile.webp",
    coverImage: "/media/artists/drake/cover.webp",
    aboutLead:
      "OVO energy on fabric — clean typography, premium blanks, and pieces that read as well courtside as they do on night drives.",
    aboutMore:
      "Expect restrained color stories with occasional gold hits and iconography that nods to Toronto and the broader OVO universe. Limited runs keep quality consistent; grab your size while it is listed.",
  },
  {
    slug: "the-weeknd",
    name: "The Weeknd",
    statusTag: "AVAILABLE",
    gradient: "from-[#220814] via-[#10060c] to-[#050508]",
    ambient: "from-red-500/14 to-transparent",
    profileImage: "/media/artists/the-weeknd/profile.webp",
    coverImage: "/media/artists/the-weeknd/cover.webp",
    aboutLead:
      "After-hours aesthetics — deep reds, noir blacks, and merch that feels like a sequel to the show you just left.",
    aboutMore:
      "Graphics pull from era-specific artwork; fits stay roomy for layering. When a design cycles out, it may not return in the same form — bookmark this shop around tours and surprise releases.",
  },
];

/** Other artists with a live shop, ranked by affinity (see `rankSuggestedArtists`). */
export { rankSuggestedArtists as artistShopSuggestions } from "@/lib/discovery/artist-suggestions";

/** Full-bleed hero background */
export const heroBackgroundImage = "/media/hero.png";

/** Header mark (Vol 1 — white logo asset) */
export const brandLogoLight = "/media/SalvyaLogo-white.png";

/**
 * Dark mark on light backgrounds — resolves via API so dev works when the file
 * lives at repo root `SALVYA-LOGO-BLACK-VERSION.png` or under `web/public/media/`.
 */
export const brandLogoBlack = "/api/brand/salvya-logo-black";
