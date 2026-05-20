"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AdminNavIconGlyph } from "@/components/admin/AdminNavIcon";
import { ADMIN_COMMAND_ACTIONS, ADMIN_NAV } from "@/components/admin/nav-config";

type Props = {
  open: boolean;
  onClose: () => void;
};

type PaletteItem = {
  href: string;
  label: string;
  group: string;
  icon: (typeof ADMIN_NAV)[0]["icon"];
  keywords?: string;
};

export function AdminCommandPalette({ open, onClose }: Props) {
  const router = useRouter();
  const [q, setQ] = useState("");

  const items = useMemo<PaletteItem[]>(
    () => [
      ...ADMIN_NAV.map((n) => ({ href: n.href, label: n.label, group: "Pages", icon: n.icon })),
      ...ADMIN_COMMAND_ACTIONS.map((a) => ({
        href: a.href,
        label: a.label,
        group: "Quick actions",
        icon: a.icon,
        keywords: a.keywords,
      })),
    ],
    [],
  );

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return items;
    return items.filter(
      (item) =>
        item.label.toLowerCase().includes(needle) ||
        item.href.toLowerCase().includes(needle) ||
        item.keywords?.toLowerCase().includes(needle),
    );
  }, [items, q]);

  const go = useCallback(
    (href: string) => {
      onClose();
      setQ("");
      if (href.startsWith("/admin")) router.push(href);
      else window.location.href = href;
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

  const groups = [...new Set(filtered.map((i) => i.group))];

  return (
    <>
      <button type="button" className="fixed inset-0 z-[100] bg-black/30 backdrop-blur-[2px]" aria-label="Close search" onClick={onClose} />
      <div
        role="dialog"
        aria-label="Admin command palette"
        className="fixed left-1/2 top-[12vh] z-[101] w-[min(32rem,calc(100vw-2rem))] -translate-x-1/2 overflow-hidden rounded-xl border border-[#e3e5e7] bg-white shadow-2xl"
      >
        <div className="flex items-center gap-2 border-b border-[#e3e5e7] px-4 py-3">
          <svg className="h-5 w-5 shrink-0 text-[#6d7175]" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
            <path strokeWidth={2} strokeLinecap="round" d="M21 21l-5.2-5.2M11 18a7 7 0 100-14 7 7 0 000 14z" />
          </svg>
          <input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search admin pages and actions…"
            className="min-w-0 flex-1 bg-transparent text-[15px] text-[#202223] placeholder:text-[#8c9196] focus:outline-none"
          />
          <kbd className="hidden rounded border border-[#e3e5e7] bg-[#f6f6f7] px-1.5 py-0.5 text-[10px] font-semibold text-[#6d7175] sm:inline">Esc</kbd>
        </div>
        <ul className="max-h-[min(24rem,50vh)] overflow-y-auto p-2">
          {groups.map((group) => (
            <li key={group}>
              <p className="px-2 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#8c9196]">{group}</p>
              <ul>
                {filtered
                  .filter((i) => i.group === group)
                  .map((item) => (
                    <li key={item.href + item.label}>
                      <button
                        type="button"
                        onClick={() => go(item.href)}
                        className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-[14px] font-medium text-[#202223] hover:bg-[#f6f6f7]"
                      >
                        <AdminNavIconGlyph name={item.icon} className="h-4 w-4 text-[#2D6BFF]" />
                        <span className="min-w-0 flex-1">{item.label}</span>
                        <span className="truncate text-[11px] text-[#8c9196]">{item.href}</span>
                      </button>
                    </li>
                  ))}
              </ul>
            </li>
          ))}
          {!filtered.length ? (
            <li className="px-3 py-8 text-center text-[13px] text-[#6d7175]">No matches for “{q}”.</li>
          ) : null}
        </ul>
        <div className="border-t border-[#e3e5e7] bg-[#fafbfb] px-4 py-2 text-[11px] text-[#8c9196]">
          <span className="font-medium text-[#6d7175]">Pro tip:</span> Press{" "}
          <kbd className="rounded border border-[#e3e5e7] bg-white px-1 font-semibold">Ctrl</kbd>+
          <kbd className="rounded border border-[#e3e5e7] bg-white px-1 font-semibold">K</kbd> anywhere in admin
        </div>
      </div>
    </>
  );
}

/** Registers global ⌘K / Ctrl+K to open the palette. */
export function useAdminCommandPalette() {
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
