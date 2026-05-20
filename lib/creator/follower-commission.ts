/** Fixed DH (MAD) commission per qualifying item sold, based on Instagram followers at application. */

export const CREATOR_COMMISSION_CURRENCY = "MAD";

export type FollowerCommissionTier = {
  id: string;
  followerRangeLabel: string;
  minFollowers: number;
  /** Exclusive upper bound; null = no max. */
  maxFollowers: number | null;
  perItemDh: number;
};

export const CREATOR_FOLLOWER_COMMISSION_TIERS: FollowerCommissionTier[] = [
  {
    id: "under-20k",
    followerRangeLabel: "Under 20,000",
    minFollowers: 0,
    maxFollowers: 20_000,
    perItemDh: 7,
  },
  {
    id: "20k-50k",
    followerRangeLabel: "20,000 – 49,999",
    minFollowers: 20_000,
    maxFollowers: 50_000,
    perItemDh: 10,
  },
  {
    id: "50k-100k",
    followerRangeLabel: "50,000 – 99,999",
    minFollowers: 50_000,
    maxFollowers: 100_000,
    perItemDh: 15,
  },
  {
    id: "100k-300k",
    followerRangeLabel: "100,000 – 299,999",
    minFollowers: 100_000,
    maxFollowers: 300_000,
    perItemDh: 20,
  },
  {
    id: "300k-plus",
    followerRangeLabel: "300,000+",
    minFollowers: 300_000,
    maxFollowers: null,
    perItemDh: 25,
  },
];

export function resolveFollowerCommissionTier(followers: number): FollowerCommissionTier {
  const count = Number.isFinite(followers) && followers >= 0 ? Math.floor(followers) : 0;
  for (const tier of CREATOR_FOLLOWER_COMMISSION_TIERS) {
    if (count >= tier.minFollowers && (tier.maxFollowers === null || count < tier.maxFollowers)) {
      return tier;
    }
  }
  return CREATOR_FOLLOWER_COMMISSION_TIERS[0]!;
}

export function perItemCommissionDh(followers: number): number {
  return resolveFollowerCommissionTier(followers).perItemDh;
}

/** Minor units (centimes) for one item at the creator's follower tier. */
export function perItemCommissionMinor(followers: number): number {
  return perItemCommissionDh(followers) * 100;
}

export function commissionMinorForItems(followers: number, itemCount: number): number {
  const items = Math.max(0, Math.floor(itemCount));
  if (items <= 0) return 0;
  return perItemCommissionMinor(followers) * items;
}

export function formatFollowersCount(followers: number): string {
  const n = Number.isFinite(followers) && followers >= 0 ? Math.floor(followers) : 0;
  return new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 }).format(n);
}

export function formatDhAmount(dh: number): string {
  return `${new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 }).format(dh)} DH`;
}

export type CreatorCommissionProfile = {
  followersCount: number;
  perItemDh: number;
  tierLabel: string;
  currency: typeof CREATOR_COMMISSION_CURRENCY;
};

export function buildCreatorCommissionProfile(followersCount: number): CreatorCommissionProfile {
  const tier = resolveFollowerCommissionTier(followersCount);
  return {
    followersCount: Math.max(0, Math.floor(followersCount)),
    perItemDh: tier.perItemDh,
    tierLabel: tier.followerRangeLabel,
    currency: CREATOR_COMMISSION_CURRENCY,
  };
}
