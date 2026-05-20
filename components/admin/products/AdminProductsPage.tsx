"use client";

import Link from "next/link";
import { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import { AdminConfirmDialog } from "@/components/admin/AdminConfirmDialog";
import { AdminPageHeader } from "@/components/admin/admin-ui";
import {
  adminBtnPrimary,
  adminBtnSecondary,
  adminErrorBox,
  adminInputClass,
  adminMuted,
  adminTableWrap,
} from "@/components/admin/admin-theme";
import { AdminProductThumb } from "@/components/admin/products/AdminProductThumb";
import { ProductBarcodeDownloadButton } from "@/components/admin/products/ProductBarcodeDownloadButton";
import type { AdminProductDTO } from "@/lib/admin/types";
import { SkTableRows } from "@/components/skeleton/SalvyaSkeletonBlocks";

type CatalogPreview = {
  total: number;
  byArtist: Record<string, number>;
  withColorways?: number;
  withModelShots?: number;
  withFullMerchandising?: number;
  missingRoots: string[];
};

type FilterChip = "all" | "hoodie" | "tee" | "published" | "draft" | "out" | "black" | "white";

function StatusBadge({ product }: { product: AdminProductDTO }) {
  if (product.soldOut) {
    return (
      <span className="inline-flex rounded-md border border-rose-200 bg-rose-50 px-2 py-0.5 text-[11px] font-semibold text-rose-800">
        Sold out
      </span>
    );
  }
  if (product.publishState === "published") {
    return (
      <span className="inline-flex rounded-md border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-800">
        Live
      </span>
    );
  }
  if (product.publishState === "archived") {
    return (
      <span className="inline-flex rounded-md border border-slate-200 bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600">
        Archived
      </span>
    );
  }
  return (
    <span className="inline-flex rounded-md border border-amber-200 bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-900">
      Draft
    </span>
  );
}

export function AdminProductsPage() {
  const [products, setProducts] = useState<AdminProductDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [debouncedQ, setDebouncedQ] = useState("");
  const [chip, setChip] = useState<FilterChip>("all");
  const [source, setSource] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [importBusy, setImportBusy] = useState(false);
  const [importMsg, setImportMsg] = useState<string | null>(null);
  const [preview, setPreview] = useState<CatalogPreview | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminProductDTO | null>(null);

  useEffect(() => {
    const t = window.setTimeout(() => setDebouncedQ(q.trim()), 280);
    return () => window.clearTimeout(t);
  }, [q]);

  const apiParams = useMemo(() => {
    const params = new URLSearchParams();
    if (debouncedQ) params.set("q", debouncedQ);
    if (chip === "hoodie") params.set("category", "hoodie");
    if (chip === "tee") params.set("category", "tee");
    if (chip === "published") params.set("publishState", "published");
    if (chip === "draft") params.set("publishState", "draft");
    if (chip === "out") params.set("stock", "out");
    if (chip === "black") params.set("color", "black");
    if (chip === "white") params.set("color", "white");
    if (source) params.set("source", source);
    return params;
  }, [debouncedQ, chip, source]);

  const loadPreview = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/products/import-catalog", { credentials: "include", cache: "no-store" });
      const body = (await res.json()) as { ok?: boolean; preview?: CatalogPreview };
      if (body.ok && body.preview) {
        setPreview({
          total: body.preview.total,
          byArtist: body.preview.byArtist,
          missingRoots: body.preview.missingRoots,
        });
      }
    } catch {
      /* optional */
    }
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/products?${apiParams}`, { credentials: "include", cache: "no-store" });
      const body = (await res.json()) as { ok?: boolean; products?: AdminProductDTO[]; error?: string };
      if (!res.ok || !body.ok || !body.products) throw new Error(body.error ?? "Failed");
      setProducts(body.products);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed");
    } finally {
      setLoading(false);
    }
  }, [apiParams]);

  useEffect(() => {
    void loadPreview();
  }, [loadPreview]);

  useEffect(() => {
    void load();
  }, [load]);

  const runImport = async () => {
    setImportBusy(true);
    setImportMsg(null);
    setError(null);
    try {
      const res = await fetch("/api/admin/products/import-catalog", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const body = (await res.json()) as {
        ok?: boolean;
        result?: {
          inserted: number;
          updated: number;
          skipped: number;
          errors: string[];
          withColorways?: number;
          withModelShots?: number;
        };
        preview?: CatalogPreview;
      };
      if (!body.result) throw new Error("Import failed");
      const r = body.result;
      if (body.preview) {
        setPreview({
          total: body.preview.total,
          byArtist: body.preview.byArtist,
          missingRoots: body.preview.missingRoots,
        });
      }
      const stats = body.result;
      setImportMsg(
        `Synced ${r.inserted} new, ${r.updated} updated · ${stats?.withColorways ?? 0} colorways · ${stats?.withModelShots ?? 0} models · merchandising & SEO filled.`,
      );
      if (r.errors?.length) setError(r.errors.slice(0, 2).join(" · "));
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Import failed");
    } finally {
      setImportBusy(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    const id = deleteTarget.id;
    setBusyId(id);
    setError(null);
    try {
      const res = await fetch(`/api/admin/products/${id}`, { method: "DELETE", credentials: "include" });
      const body = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !body.ok) throw new Error(body.error ?? "Delete failed");
      setProducts((p) => p.filter((x) => x.id !== id));
      setDeleteTarget(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Delete failed");
    } finally {
      setBusyId(null);
    }
  };

  const fmt = (cents: number) =>
    new Intl.NumberFormat(undefined, { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(
      cents / 100,
    );

  const chips: { id: FilterChip; label: string }[] = [
    { id: "all", label: "All" },
    { id: "hoodie", label: "Hoodies" },
    { id: "tee", label: "Tees" },
    { id: "published", label: "Live" },
    { id: "draft", label: "Draft" },
    { id: "out", label: "Sold out" },
    { id: "black", label: "Black" },
    { id: "white", label: "White" },
  ];

  let lastArtist = "";

  return (
    <div className="space-y-5">
      <AdminPageHeader
        title="Products"
        description="Catalog SKUs — search, filter, and edit in one place."
        actions={
          <Link href="/admin/products/new" className={adminBtnPrimary}>
            New product
          </Link>
        }
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search name, slug, artist…"
          className={`${adminInputClass} w-full sm:max-w-xs`}
          aria-label="Search products"
        />
        <div className="flex flex-wrap gap-1.5">
          {chips.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setChip(c.id)}
              className={`rounded-full px-3 py-1 text-[12px] font-semibold transition-colors ${
                chip === c.id
                  ? "bg-[#2D6BFF] text-white"
                  : "border border-[#e3e5e7] bg-white text-[#6d7175] hover:border-[#c9cccf] hover:text-[#202223]"
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      <details className="rounded-lg border border-[#e3e5e7] bg-white text-[13px] shadow-sm">
        <summary className="cursor-pointer list-none px-4 py-2.5 font-medium text-[#202223] marker:content-none [&::-webkit-details-marker]:hidden">
          <span className="text-[#6d7175]">More ·</span> import &amp; source filters
          {preview ? (
            <span className={`ml-2 font-normal ${adminMuted}`}>
              ({preview.total} on disk
              {preview.withColorways != null ? ` · ${preview.withColorways} colorways` : ""}
              {preview.withModelShots != null ? ` · ${preview.withModelShots} model sets` : ""}
              {preview.withFullMerchandising != null ? ` · ${preview.withFullMerchandising} full detail` : ""}
              {preview.missingRoots.length ? ", some folders missing" : ""})
            </span>
          ) : null}
        </summary>
        <div className="border-t border-[#e3e5e7] px-4 py-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`text-[12px] ${adminMuted}`}>Source</span>
            {[
              { id: "", label: "Any" },
              { id: "folder", label: "Folder" },
              { id: "legacy", label: "Legacy" },
              { id: "manual", label: "Manual" },
            ].map((s) => (
              <button
                key={s.id || "any"}
                type="button"
                onClick={() => setSource(s.id)}
                className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                  source === s.id ? "bg-[#eef4ff] text-[#2D6BFF]" : "text-[#6d7175] hover:text-[#202223]"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <button type="button" className={adminBtnSecondary} disabled={importBusy} onClick={() => void runImport()}>
              {importBusy ? "Syncing…" : "Sync folders → Supabase"}
            </button>
            <span className={`text-[11px] ${adminMuted}`}>
              Imports hoodie/tshirt flat shots plus ModelsShooting folders into each product&apos;s colorways in Supabase.
            </span>
            {importMsg ? <span className="text-[12px] font-medium text-emerald-700">{importMsg}</span> : null}
          </div>
        </div>
      </details>

      {error ? <div className={adminErrorBox}>{error}</div> : null}

      <div className={adminTableWrap}>
        {loading ? (
          <SkTableRows rows={8} cols={5} />
        ) : (
        <>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse text-left text-[13px]">
            <thead>
              <tr className="border-b border-[#e3e5e7] bg-[#f6f6f7] text-[11px] font-semibold uppercase tracking-wide text-[#6d7175]">
                <th className="px-4 py-2.5 font-semibold">Product</th>
                <th className="hidden px-3 py-2.5 sm:table-cell">Artist</th>
                <th className="px-3 py-2.5">Type</th>
                <th className="px-3 py-2.5">Price</th>
                <th className="hidden px-3 py-2.5 md:table-cell">Stock</th>
                <th className="px-3 py-2.5">Status</th>
                <th className="px-4 py-2.5 text-right"> </th>
              </tr>
            </thead>
            <tbody>
              {products.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center">
                    <p className="font-medium text-[#202223]">No products found</p>
                    <p className={`mt-1 text-[12px] ${adminMuted}`}>Try another filter or sync from folders.</p>
                    <Link href="/admin/products/new" className={`mt-4 inline-flex ${adminBtnPrimary}`}>
                      New product
                    </Link>
                  </td>
                </tr>
              ) : (
                products.map((p) => {
                  const showArtistHeader = p.artistSlug !== lastArtist;
                  if (showArtistHeader) lastArtist = p.artistSlug;
                  return (
                    <Fragment key={p.id}>
                      {showArtistHeader ? (
                        <tr className="bg-[#fafbfb]">
                          <td colSpan={7} className="px-4 py-2 text-[11px] font-semibold uppercase tracking-wide text-[#6d7175]">
                            {p.artistSlug}
                          </td>
                        </tr>
                      ) : null}
                      <tr className="border-b border-[#e3e5e7] last:border-0 hover:bg-[#f6f6f7]/80">
                        <td className="px-4 py-2.5">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 shrink-0 overflow-hidden rounded-md border border-[#e3e5e7] bg-[#f6f6f7]">
                              {p.images[0] ? <AdminProductThumb src={p.images[0]} alt="" /> : null}
                            </div>
                            <div className="min-w-0">
                              <p className="truncate font-medium text-[#202223]">{p.title}</p>
                              <p className={`truncate text-[11px] ${adminMuted}`}>{p.slug}</p>
                              {p.colors?.length ? (
                                <div className="mt-1 flex flex-wrap gap-1">
                                  {p.colors.map((c) => (
                                    <span
                                      key={`${c.id ?? c.name}`}
                                      className="inline-flex items-center gap-1 rounded-full border border-[#e3e5e7] bg-white px-1.5 py-0.5 text-[10px] font-medium text-[#6d7175]"
                                    >
                                      <span
                                        className="size-2.5 rounded-full border border-[#c9cccf]"
                                        style={{ backgroundColor: c.hex ?? "#e3e5e7" }}
                                        aria-hidden
                                      />
                                      {c.name}
                                    </span>
                                  ))}
                                </div>
                              ) : null}
                            </div>
                          </div>
                        </td>
                        <td className={`hidden px-3 py-2.5 sm:table-cell ${adminMuted}`}>{p.artistSlug}</td>
                        <td className={`px-3 py-2.5 capitalize ${adminMuted}`}>{p.category}</td>
                        <td className="px-3 py-2.5 font-medium tabular-nums text-[#202223]">{fmt(p.priceCents)}</td>
                        <td className={`hidden px-3 py-2.5 tabular-nums md:table-cell ${adminMuted}`}>{p.stock}</td>
                        <td className="px-3 py-2.5">
                          <StatusBadge product={p} />
                        </td>
                        <td className="px-4 py-2.5 text-right">
                          <div className="inline-flex items-center gap-1">
                            <ProductBarcodeDownloadButton
                              sku={p.sku}
                              slug={p.slug}
                              title={p.title}
                              artistSlug={p.artistSlug}
                              category={p.category}
                            />
                            <Link
                              href={`/admin/products/${p.id}`}
                              className="rounded-md px-2.5 py-1.5 text-[12px] font-semibold text-[#2D6BFF] hover:bg-[#eef4ff]"
                            >
                              Edit
                            </Link>
                            <button
                              type="button"
                              disabled={busyId === p.id}
                              onClick={() => setDeleteTarget(p)}
                              className="rounded-md p-1.5 text-[#6d7175] transition-colors hover:bg-rose-50 hover:text-rose-700 disabled:opacity-40"
                              aria-label={`Delete ${p.title}`}
                            >
                              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    </Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        {products.length > 0 ? (
          <p className={`border-t border-[#e3e5e7] px-4 py-2 text-[11px] ${adminMuted}`}>
            {products.length} product{products.length === 1 ? "" : "s"}
          </p>
        ) : null}
        </>
        )}
      </div>

      <AdminConfirmDialog
        open={deleteTarget !== null}
        tone="danger"
        title="Delete product?"
        description={
          deleteTarget
            ? `“${deleteTarget.title}” will be removed from the catalog permanently. This cannot be undone.`
            : undefined
        }
        confirmLabel="Delete product"
        cancelLabel="Keep product"
        busy={busyId === deleteTarget?.id}
        onCancel={() => !busyId && setDeleteTarget(null)}
        onConfirm={() => void confirmDelete()}
      />
    </div>
  );
}
