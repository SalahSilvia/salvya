"use client";

import { useEffect, useRef } from "react";
import { makeProductId } from "@/lib/member/likes-storage";

type Props = {
  artistSlug: string;
  itemSlug: string;
  productKind: "hoodie" | "tshirt";
};

/** Persist recently viewed for signed-in users (10 min dedupe server-side). */
export function RecordProductView({ artistSlug, itemSlug, productKind }: Props) {
  const sent = useRef(false);

  useEffect(() => {
    if (sent.current) return;
    sent.current = true;
    const likedType = productKind === "tshirt" ? "tee" : "hoodie";
    const productId = makeProductId(artistSlug, likedType, itemSlug);
    void fetch("/api/me/recent-views", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId }),
      credentials: "same-origin",
    }).catch(() => {});
  }, [artistSlug, itemSlug, productKind]);

  return null;
}
