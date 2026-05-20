/**
 * Legacy percentage helpers — creator payouts now use fixed DH per item (see follower-commission.ts).
 * commission_rate in the ledger is stored as 0 for the fixed per-item model.
 */
export function getCreatorCommissionRate(): number {
  return 0;
}

export function commissionMinorFromGross(_grossMinor: number, _rate = getCreatorCommissionRate()): number {
  return 0;
}

export {
  buildCreatorCommissionProfile,
  commissionMinorForItems,
  CREATOR_COMMISSION_CURRENCY,
  CREATOR_FOLLOWER_COMMISSION_TIERS,
  formatDhAmount,
  formatFollowersCount,
  perItemCommissionDh,
  perItemCommissionMinor,
  resolveFollowerCommissionTier,
} from "@/lib/creator/follower-commission";
