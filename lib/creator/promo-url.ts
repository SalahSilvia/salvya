import { getSiteUrl } from "@/lib/seo/site";

/** Public promo redirect — salvya.com/p/{trackingCode} */
export function buildPromoRedirectUrl(trackingCode: string): string {
  const base = getSiteUrl();
  return `${base}/p/${encodeURIComponent(trackingCode)}`;
}
