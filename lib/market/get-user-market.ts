import { getMarketContext } from "@/lib/market/get-market-context";
import type { UserMarket } from "@/lib/market/types";

/**
 * Shopper market for regional list prices.
 * @see getMarketContext for full locale + display currency context.
 */
export async function getUserMarket(userId?: string | null): Promise<UserMarket> {
  const ctx = await getMarketContext({ userId });
  return {
    marketCode: ctx.marketCode,
    currency: ctx.currency,
    countryCode: ctx.countryCode,
    source: ctx.source,
  };
}
