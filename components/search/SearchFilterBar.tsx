"use client";

import type { ReactNode } from "react";
import type { SearchFilters } from "@/lib/search/types";
import { DEFAULT_SEARCH_FILTERS } from "@/lib/search/types";

function Chip({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`shrink-0 rounded-full border px-3.5 py-2 text-[11px] font-semibold uppercase tracking-wide transition-colors ${
        active
          ? "border-[#2D6BFF]/45 bg-[#2D6BFF]/15 text-white"
          : "border-white/[0.1] bg-white/[0.04] text-white/65 hover:border-white/[0.18] hover:bg-white/[0.07]"
      }`}
    >
      {children}
    </button>
  );
}

export function SearchFilterBar({
  filters,
  onChange,
}: {
  filters: SearchFilters;
  onChange: (next: SearchFilters) => void;
}) {
  const setCat = (category: SearchFilters["category"]) =>
    onChange({ ...filters, category });

  const toggleLimited = () =>
    onChange({
      ...filters,
      availability: filters.availability === "limited" ? "all" : "limited",
    });

  const toggleTrending = () =>
    onChange({
      ...filters,
      popularity: filters.popularity === "trending" ? "all" : "trending",
    });

  const reset = () => onChange({ ...DEFAULT_SEARCH_FILTERS });

  return (
    <div className="mt-4 space-y-2.5">
      <div className="flex gap-2 overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <Chip active={filters.category === "all"} onClick={() => setCat("all")}>
          All
        </Chip>
        <Chip active={filters.category === "artists"} onClick={() => setCat("artists")}>
          Artists
        </Chip>
        <Chip active={filters.category === "products"} onClick={() => setCat("products")}>
          Products
        </Chip>
        <Chip active={filters.category === "drops"} onClick={() => setCat("drops")}>
          Drops
        </Chip>
      </div>
      <div className="flex flex-wrap gap-2">
        <Chip active={filters.availability === "limited"} onClick={toggleLimited}>
          Limited
        </Chip>
        <Chip active={filters.popularity === "trending"} onClick={toggleTrending}>
          Boost saves
        </Chip>
        {(filters.category !== "all" ||
          filters.availability !== "all" ||
          filters.popularity !== "all") && (
          <button
            type="button"
            onClick={reset}
            className="rounded-full border border-transparent px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-white/40 hover:text-white/65"
          >
            Reset
          </button>
        )}
      </div>
    </div>
  );
}
