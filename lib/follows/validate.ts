import type { ArtistFollowRecord } from "@/lib/member/artist-follows-storage";

function isRecord(x: unknown): x is Record<string, unknown> {
  return typeof x === "object" && x !== null;
}

export function isArtistFollowRecord(x: unknown): x is ArtistFollowRecord {
  if (!isRecord(x)) return false;
  return (
    typeof x.slug === "string" &&
    x.slug.length > 0 &&
    typeof x.name === "string" &&
    typeof x.profileImage === "string" &&
    typeof x.followedAt === "number" &&
    Number.isFinite(x.followedAt)
  );
}

export function normalizeArtistFollow(raw: ArtistFollowRecord): ArtistFollowRecord {
  return {
    slug: raw.slug,
    name: raw.name,
    profileImage: raw.profileImage,
    followedAt: Math.round(raw.followedAt),
  };
}

export function sanitizeArtistFollows(parsed: unknown): ArtistFollowRecord[] {
  if (!Array.isArray(parsed)) return [];
  return parsed
    .filter(isArtistFollowRecord)
    .map(normalizeArtistFollow)
    .sort((a, b) => b.followedAt - a.followedAt);
}
