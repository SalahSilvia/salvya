"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { trackViewContent } from "@/lib/analytics/meta-pixel";
import { getAnalyticsTracker } from "@/lib/analytics/tracker";
import { makeProductId } from "@/lib/member/likes-storage";
import { parsePaypalPurchaseUnit } from "@/lib/paypal-amount";

type Props = {
  artistSlug: string;
  itemSlug: string;
  productKind: "hoodie" | "tshirt";
  displayTitle: string;
  priceLabel: string;
};

/**
 * Fires Meta `ViewContent` once per distinct product mount (SPA-safe).
 */
export function ProductMetaViewContent({ artistSlug, itemSlug, productKind, displayTitle, priceLabel }: Props) {
  const pathname = usePathname() ?? "/";
  const lastKey = useRef<string | null>(null);

  useEffect(() => {
    const likedType = productKind === "tshirt" ? "tee" : "hoodie";
    const contentId = makeProductId(artistSlug, likedType, itemSlug);
    if (lastKey.current === contentId) return;
    lastKey.current = contentId;

    const { currency_code, value } = parsePaypalPurchaseUnit(priceLabel);
    const unit = Number.parseFloat(value);
    const numeric = Number.isFinite(unit) ? Math.round(unit * 100) / 100 : 0;

    void trackViewContent({
      contentId,
      contentName: displayTitle,
      contentCategory: productKind,
      currency: currency_code,
      value: numeric,
    });

    getAnalyticsTracker().trackProductView(pathname, contentId, artistSlug, {
      display_title: displayTitle,
      price_label: priceLabel,
      product_kind: productKind,
    });
  }, [artistSlug, itemSlug, productKind, displayTitle, priceLabel, pathname]);

  return null;
}
