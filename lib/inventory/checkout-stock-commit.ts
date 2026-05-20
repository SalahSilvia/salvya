import type { SupabaseClient } from "@supabase/supabase-js";
import { commitVariantStockForCheckout } from "@/lib/inventory/stock-reservation";
import { restoreVariantStockQty } from "@/lib/inventory/restore-stock";

export type StockCommitTarget = { variantId: string; qty: number; productId?: string };

export type CommittedStockLine = { variantId: string; qty: number };

/**
 * Commit stock for all checkout lines. Rolls back all prior commits on any failure.
 */
export async function commitAllVariantStockForCheckout(
  service: SupabaseClient,
  targets: StockCommitTarget[],
  checkoutSessionId: string,
): Promise<
  | { ok: true; committed: CommittedStockLine[]; lastRemainingStock: number | null }
  | { ok: false; message: string; code: string }
> {
  const committed: CommittedStockLine[] = [];

  for (const target of targets) {
    const stockDec = await commitVariantStockForCheckout(
      service,
      target.variantId,
      target.qty,
      checkoutSessionId,
    );
    if (!stockDec.ok) {
      for (const line of committed) {
        await restoreVariantStockQty(service, line.variantId, line.qty);
      }
      const code =
        stockDec.message === "insufficient_stock" || stockDec.message === "out_of_stock"
          ? "out_of_stock"
          : "stock_commit_failed";
      return { ok: false, message: stockDec.message, code };
    }
    committed.push({ variantId: target.variantId, qty: target.qty });
  }

  const last = committed.length > 0 ? committed[committed.length - 1]! : null;
  let lastRemaining: number | null = null;
  if (last) {
    const { data } = await service
      .from("product_variants")
      .select("stock")
      .eq("id", last.variantId)
      .maybeSingle();
    lastRemaining = typeof data?.stock === "number" ? data.stock : null;
  }

  return { ok: true, committed, lastRemainingStock: lastRemaining };
}

/** Roll back committed variant stock after a failed order insert. */
export async function rollbackCommittedVariantStock(
  service: SupabaseClient,
  committed: CommittedStockLine[],
): Promise<void> {
  for (const line of committed) {
    try {
      await restoreVariantStockQty(service, line.variantId, line.qty);
    } catch {
      /* best-effort */
    }
  }
}
