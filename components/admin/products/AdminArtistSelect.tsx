"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { adminInputClass, adminMuted } from "@/components/admin/admin-theme";
import type { CatalogArtistOption } from "@/lib/admin/catalog-artists";

type Props = {
  value: string;
  onChange: (slug: string) => void;
  artists: CatalogArtistOption[];
  disabled?: boolean;
};

export function AdminArtistSelect({ value, onChange, artists, disabled }: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const rootRef = useRef<HTMLDivElement>(null);

  const selected = useMemo(() => artists.find((a) => a.slug === value) ?? null, [artists, value]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return artists;
    return artists.filter((a) => a.name.toLowerCase().includes(q) || a.slug.includes(q));
  }, [artists, query]);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((o) => !o)}
        className={`flex w-full min-h-[44px] items-center gap-3 rounded-lg border border-[#c9cccf] bg-white px-3 py-2 text-left shadow-sm transition-colors hover:border-[#8c9196] focus:border-[#2D6BFF] focus:outline-none focus:ring-2 focus:ring-[#2D6BFF]/25 disabled:opacity-50 ${open ? "border-[#2D6BFF] ring-2 ring-[#2D6BFF]/25" : ""}`}
      >
        {selected ? (
          <>
            <span className="relative size-9 shrink-0 overflow-hidden rounded-full border border-[#e3e5e7] bg-[#f6f6f7]">
              <Image src={selected.profileImage} alt="" fill className="object-cover" sizes="36px" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[14px] font-semibold text-[#202223]">{selected.name}</span>
              <span className={`block truncate text-[12px] ${adminMuted}`}>{selected.slug}</span>
            </span>
          </>
        ) : (
          <span className={`flex-1 text-[14px] ${adminMuted}`}>Select artist…</span>
        )}
        <svg className="size-4 shrink-0 text-[#6d7175]" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
          <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
        </svg>
      </button>

      {open ? (
        <div className="absolute z-50 mt-1.5 w-full overflow-hidden rounded-xl border border-[#e3e5e7] bg-white shadow-lg">
          <div className="border-b border-[#e3e5e7] p-2">
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search artists…"
              className={`w-full ${adminInputClass} min-h-[36px] text-[13px]`}
              autoFocus
            />
          </div>
          <ul className="max-h-[240px] overflow-y-auto py-1" role="listbox">
            {filtered.map((a) => {
              const isSelected = a.slug === value;
              const inactive = !a.selectable;
              return (
                <li key={a.slug}>
                  <button
                    type="button"
                    disabled={inactive}
                    onClick={() => {
                      if (inactive) return;
                      onChange(a.slug);
                      setOpen(false);
                      setQuery("");
                    }}
                    className={`flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors ${
                      inactive
                        ? "cursor-not-allowed opacity-45"
                        : isSelected
                          ? "bg-[#eef4ff]"
                          : "hover:bg-[#f6f6f7]"
                    }`}
                  >
                    <span className="relative size-8 shrink-0 overflow-hidden rounded-full border border-[#e3e5e7] bg-[#f6f6f7]">
                      <Image src={a.profileImage} alt="" fill className="object-cover" sizes="32px" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[13px] font-semibold text-[#202223]">{a.name}</span>
                      <span className={`block truncate text-[11px] ${adminMuted}`}>
                        {a.slug} · {a.statusTag}
                      </span>
                    </span>
                    {isSelected ? (
                      <svg className="size-4 shrink-0 text-[#2D6BFF]" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
                        <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.895 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                      </svg>
                    ) : null}
                  </button>
                </li>
              );
            })}
            {filtered.length === 0 ? (
              <li className={`px-3 py-4 text-center text-[13px] ${adminMuted}`}>No artists match</li>
            ) : null}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
