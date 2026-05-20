"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { artists } from "@/lib/site-data";
import { labelForRecentPath, readNavRecents } from "@/lib/menu-nav-recents";

type Props = {
  query: string;
  onQueryChange: (q: string) => void;
  onClose: () => void;
  surface?: "light" | "dark";
};

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" className={className} fill="none" aria-hidden>
      <path
        d="M10.5 18a7.5 7.5 0 100-15 7.5 7.5 0 000 15ZM16.5 16.5L21 21"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function MenuDiscoverPanel({ query, onQueryChange, onClose, surface = "light" }: Props) {
  const [recents, setRecents] = useState<string[]>([]);
  const dark = surface === "dark";

  useEffect(() => {
    setRecents(readNavRecents().filter((p) => p !== "/"));
  }, []);

  const spotlight = useMemo(() => artists.filter((a) => a.statusTag !== "COMING SOON").slice(0, 5), []);

  return (
    <div className="m-0 space-y-4 p-0 sm:space-y-5">
      <div className="relative">
        <label htmlFor="menu-quick-find-input" className="sr-only">
          Search menu
        </label>
        <span
          className={`pointer-events-none absolute left-0 top-1/2 -translate-y-1/2 ${dark ? "text-white/35" : "text-neutral-400"}`}
        >
          <SearchIcon />
        </span>
        <input
          id="menu-quick-find-input"
          type="search"
          enterKeyHint="search"
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          placeholder="Search…"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          className={
            dark
              ? "w-full border-0 border-b-2 border-white/[0.12] bg-transparent py-3.5 pl-11 pr-11 text-[1.125rem] font-medium tracking-[-0.02em] text-white/85 outline-none transition-[border-color] placeholder:text-white/32 focus:border-[#2D6BFF]/70 sm:py-4 sm:text-[1.25rem]"
              : "w-full border-0 border-b-2 border-neutral-200/90 bg-transparent py-3.5 pl-11 pr-11 text-[1.125rem] font-normal tracking-[-0.02em] text-neutral-500 outline-none transition-[border-color] placeholder:text-neutral-400 focus:border-blue-400 sm:py-4 sm:text-[1.25rem]"
          }
        />
        {query ? (
          <button
            type="button"
            className={
              dark
                ? "absolute right-0 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full text-white/40 transition-colors hover:bg-white/[0.08] hover:text-white/85"
                : "absolute right-0 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full text-neutral-400 transition-colors hover:bg-neutral-100/80 hover:text-neutral-700"
            }
            aria-label="Clear search"
            onClick={() => onQueryChange("")}
          >
            <span className="text-2xl leading-none">×</span>
          </button>
        ) : null}
      </div>

      {recents.length > 0 ? (
        <div>
          <p
            className={
              dark
                ? "m-0 mb-1 text-[11px] font-semibold uppercase leading-none tracking-wider text-white/38"
                : "m-0 mb-1 text-[13px] font-bold uppercase leading-none tracking-wide text-neutral-500"
            }
          >
            Recent
          </p>
          <div className="-mx-1 flex gap-2 overflow-x-auto pb-1 pt-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {recents.map((path) => (
              <Link
                key={path}
                href={path.split("#")[0] ?? path}
                prefetch={false}
                onClick={onClose}
                className={
                  dark
                    ? "shrink-0 rounded-full border border-white/[0.1] bg-white/[0.05] px-3.5 py-2 text-[13px] font-medium text-white/55 transition-[transform,background-color,color] hover:bg-white/[0.1] hover:text-white/88 active:scale-[0.98]"
                    : "shrink-0 rounded-full border border-neutral-200/80 bg-white px-3.5 py-2 text-[13px] font-normal text-neutral-500 shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-[transform,background-color,color] hover:bg-neutral-50 hover:text-neutral-700 active:scale-[0.98]"
                }
              >
                {labelForRecentPath(path)}
              </Link>
            ))}
          </div>
        </div>
      ) : null}

      {spotlight.length > 0 ? (
        <div>
          <p
            className={
              dark
                ? "m-0 mb-1 text-[11px] font-semibold uppercase leading-none tracking-wider text-white/38"
                : "m-0 mb-1 text-[13px] font-bold uppercase leading-none tracking-wide text-neutral-500"
            }
          >
            Artist shops
          </p>
          <div className="-mx-1 flex gap-3 overflow-x-auto pb-1 pt-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {spotlight.map((a) => (
              <Link
                key={a.slug}
                href={`/artist/${a.slug}`}
                prefetch={false}
                onClick={onClose}
                className="group flex w-[4.5rem] shrink-0 flex-col items-center gap-1.5 text-center"
              >
                <span
                  className={
                    dark
                      ? "relative block h-16 w-16 overflow-hidden rounded-2xl border border-white/[0.1] bg-white/[0.04] shadow-[0_8px_24px_-12px_rgba(0,0,0,0.5)] transition-[transform,box-shadow] group-hover:border-white/[0.16] group-hover:shadow-lg group-active:scale-[0.97]"
                      : "relative block h-16 w-16 overflow-hidden rounded-2xl border border-neutral-100 bg-white shadow-sm transition-[transform,box-shadow] group-hover:shadow-md group-active:scale-[0.97]"
                  }
                >
                  <Image
                    src={a.profileImage}
                    alt=""
                    fill
                    sizes="72px"
                    className="object-cover"
                    unoptimized={a.profileImage.startsWith("/api")}
                  />
                </span>
                <span
                  className={
                    dark
                      ? "line-clamp-2 w-full text-[11px] font-medium leading-tight text-white/45 group-hover:text-white/75"
                      : "line-clamp-2 w-full text-[11px] font-normal leading-tight text-neutral-500 group-hover:text-neutral-700"
                  }
                >
                  {a.name}
                </span>
              </Link>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
