"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  type ReactNode,
} from "react";
import { usePathname } from "next/navigation";
import { clearBagCheckoutLines } from "@/lib/cart/bag-checkout-lines-session";
import { bagSyncConfig } from "@/lib/cart/bag-sync-config";
import { clearLegacyPreviewBag } from "@/lib/cart/local-cart";
import { subscribeCart } from "@/lib/cart/events";
import {
  addLineToCart,
  cartTotalQty,
  removeLineFromCart,
  updateLineQtyInCart,
} from "@/lib/cart/operations";
import type { AddCartLineInput, CartLine } from "@/lib/cart/types";
import { getAnalyticsTracker } from "@/lib/analytics/tracker";
import { notifyBagItemAdded } from "@/lib/notifications/automation";
import { makeProductId } from "@/lib/member/likes-storage";
import { useAccountSyncedResource } from "@/lib/sync/useAccountSyncedResource";

export type BagContextValue = {
  lines: CartLine[];
  totalQty: number;
  loading: boolean;
  synced: boolean;
  isSignedIn: boolean;
  addLine: (input: AddCartLineInput) => number;
  removeLine: (lineId: string) => void;
  updateLineQty: (lineId: string, qty: number) => void;
  clearBag: () => void;
  refresh: () => void;
};

const BagContext = createContext<BagContextValue | null>(null);

export function BagProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname() ?? "/";
  const sync = useAccountSyncedResource(bagSyncConfig);

  useEffect(() => {
    return subscribeCart(sync.reloadFromLocal);
  }, [sync.reloadFromLocal]);

  const addLine = useCallback(
    (input: AddCartLineInput) => {
      let nextTotal = 0;
      let added = false;
      sync.updateData((prev) => {
        const next = addLineToCart(prev, input);
        nextTotal = cartTotalQty(next);
        added = next.length > prev.length;
        return next;
      });
      if (added && sync.isSignedIn) {
        notifyBagItemAdded({
          displayTitle: input.displayTitle,
          artistName: input.artistName,
          artistSlug: input.artistSlug,
          itemSlug: input.itemSlug,
          productKind: input.productKind,
          colorLabel: input.colorLabel,
          size: input.size,
        });
      }
      return nextTotal;
    },
    [sync.isSignedIn, sync.updateData],
  );

  const removeLine = useCallback(
    (lineId: string) => {
      sync.updateData((prev) => {
        const line = prev.find((l) => l.lineId === lineId);
        if (line) {
          const productId = makeProductId(
            line.artistSlug,
            line.productKind === "tshirt" ? "tee" : "hoodie",
            line.itemSlug,
          );
          getAnalyticsTracker().trackRemoveFromCart(pathname, productId, line.artistSlug, {
            qty: line.qty,
            product_kind: line.productKind,
          });
        }
        return removeLineFromCart(prev, lineId);
      });
      if (sync.isSignedIn) sync.pushNow();
    },
    [sync.updateData, sync.isSignedIn, sync.pushNow, pathname],
  );

  const updateLineQty = useCallback(
    (lineId: string, qty: number) => {
      sync.updateData((prev) => updateLineQtyInCart(prev, lineId, qty));
    },
    [sync.updateData],
  );

  const clearBag = useCallback(() => {
    sync.clearAll();
    clearBagCheckoutLines();
    clearLegacyPreviewBag();
  }, [sync.clearAll]);

  const totalQty = useMemo(() => cartTotalQty(sync.data), [sync.data]);

  const value = useMemo<BagContextValue>(
    () => ({
      lines: sync.data,
      totalQty,
      loading: sync.loading,
      synced: sync.synced,
      isSignedIn: sync.isSignedIn,
      addLine,
      removeLine,
      updateLineQty,
      clearBag,
      refresh: sync.refresh,
    }),
    [
      sync.data,
      sync.loading,
      sync.synced,
      sync.isSignedIn,
      sync.refresh,
      totalQty,
      addLine,
      removeLine,
      updateLineQty,
      clearBag,
    ],
  );

  return <BagContext.Provider value={value}>{children}</BagContext.Provider>;
}

export function useBag(): BagContextValue {
  const ctx = useContext(BagContext);
  if (!ctx) throw new Error("useBag must be used within BagProvider");
  return ctx;
}
