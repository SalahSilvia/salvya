"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { CreatorProductLinkWithProduct } from "@/lib/creator/product-link-types";
import { CREATOR_STUDIO_NAV } from "@/lib/creator/studio-nav";

type Props = {
  open: boolean;
  onClose: () => void;
};

type PaletteRow =
  | { type: "nav"; href: string; label: string; hint: string }
  | { type: "link"; href: string; label: string; hint: string }
  | { type: "action"; id: string; label: string; hint: string; run: () => void };

export function CreatorCommandPalette({ open, onClose }: Props) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [links, setLinks] = useState<CreatorProductLinkWithProduct[]>([]);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch("/api/creator/product-links", { credentials: "include", cache: "no-store" });
        const body = (await res.json()) as { ok?: boolean; links?: CreatorProductLinkWithProduct[] };
        if (!cancelled && body.ok && body.links) setLinks(body.links);
      } catch {
        if (!cancelled) setLinks([]);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [open]);

  const rows = useMemo<PaletteRow[]>(() => {
    const navRows: PaletteRow[] = CREATOR_STUDIO_NAV.map((n) => ({
      type: "nav",
      href: n.href,
      label: n.label,
      hint: n.href,
    }));
    const linkRows: PaletteRow[] = links.map((l) => ({
      type: "link",
      href: "/creator/links",
      label: l.product?.title ?? l.tracking_code,
      hint: `${l.tracking_code} · ${l.clicks_count} clicks`,
    }));
    const actions: PaletteRow[] = [
      {
        type: "action",
        id: "promote",
        label: "Promote a product",
        hint: "/creator/products",
        run: () => router.push("/creator/products"),
      },
      {
        type: "action",
        id: "shop",
        label: "Browse shop (personal)",
        hint: "/shop",
        run: () => router.push("/shop"),
      },
    ];
    return [...actions, ...navRows, ...linkRows];
  }, [links, router]);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return rows;
    return rows.filter(
      (r) => r.label.toLowerCase().includes(needle) || r.hint.toLowerCase().includes(needle),
    );
  }, [q, rows]);

  const run = useCallback(
    (row: PaletteRow) => {
      onClose();
      setQ("");
      if (row.type === "action") {
        row.run();
        return;
      }
      router.push(row.href);
    },
    [onClose, router],
  );

  useEffect(() => {
    if (!open) setQ("");
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <>
      <button
        type="button"
        className="fixed inset-0 z-[120] bg-black/50 backdrop-blur-sm"
        aria-label="Close command palette"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-label="Creator command palette"
        className="fixed left-1/2 top-[10vh] z-[121] w-[min(36rem,calc(100vw-1.5rem))] -translate-x-1/2 overflow-hidden rounded-2xl border border-white/10 bg-[#0c0814]/95 shadow-[0_24px_80px_-20px_rgba(168,85,247,0.45)] backdrop-blur-xl"
      >
        <div className="flex items-center gap-2 border-b border-white/[0.08] px-4 py-3">
          <svg className="h-5 w-5 shrink-0 text-fuchsia-300/70" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
            <path strokeWidth={2} strokeLinecap="round" d="M21 21l-5.2-5.2M11 18a7 7 0 100-14 7 7 0 000 14z" />
          </svg>
          <input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search studio, links, products…"
            className="min-w-0 flex-1 bg-transparent text-[15px] text-white placeholder:text-white/35 focus:outline-none"
          />
          <kbd className="hidden rounded border border-white/10 bg-white/[0.06] px-1.5 py-0.5 text-[10px] font-semibold text-white/45 sm:inline">
            Esc
          </kbd>
        </div>
        <ul className="max-h-[min(28rem,55vh)] overflow-y-auto p-2">
          {filtered.map((row) => (
            <li key={`${row.type}-${row.type === "action" ? row.id : row.label + row.hint}`}>
              <button
                type="button"
                onClick={() => run(row)}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-white/[0.06]"
              >
                <span className="min-w-0 flex-1">
                  <span className="block text-[14px] font-semibold text-white/90">{row.label}</span>
                  <span className="block truncate text-[11px] text-white/40">{row.hint}</span>
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wide text-fuchsia-300/50">
                  {row.type === "nav" ? "Go" : row.type === "link" ? "Link" : "Action"}
                </span>
              </button>
            </li>
          ))}
          {!filtered.length ? (
            <li className="px-3 py-10 text-center text-[13px] text-white/45">No matches.</li>
          ) : null}
        </ul>
        <div className="border-t border-white/[0.06] px-4 py-2 text-[11px] text-white/40">
          <span className="font-medium text-white/55">⌘K</span> anywhere in Creator Workspace · jump to wallet, links, or products
        </div>
      </div>
    </>
  );
}

/** Registers global ⌘K / Ctrl+K inside Creator Studio. */
export function useCreatorCommandPalette() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return { open, setOpen, close: () => setOpen(false) };
}
