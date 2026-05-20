"use client";

import { useMemo } from "react";

type LinkItem = { href: string; label: string };

type Props = {
  showHoodie: boolean;
  showTshirt: boolean;
  showSuggestions: boolean;
};

export function ArtistSectionNav({ showHoodie, showTshirt, showSuggestions }: Props) {
  const links = useMemo(() => {
    const out: LinkItem[] = [];
    if (showHoodie) out.push({ href: "#hoodie-heading", label: "Hoodies" });
    if (showTshirt) out.push({ href: "#tshirt-heading", label: "T-shirts" });
    out.push({ href: "#about-section", label: "Story" });
    if (showSuggestions) out.push({ href: "#suggested-artists-heading", label: "Artists" });
    return out;
  }, [showHoodie, showTshirt, showSuggestions]);

  return (
    <nav
      aria-label="On this page"
      className="relative -mx-1 mb-8 flex gap-2 overflow-x-auto pb-1 pt-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      {links.map((l) => (
        <a
          key={l.href}
          href={l.href}
          className="shrink-0 rounded-full border border-white/[0.1] bg-white/[0.04] px-3.5 py-2 text-[12px] font-semibold tracking-wide text-white/78 transition-[background-color,border-color,color] hover:border-white/[0.16] hover:bg-white/[0.08] hover:text-white active:scale-[0.98]"
        >
          {l.label}
        </a>
      ))}
    </nav>
  );
}
