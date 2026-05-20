"use client";

import Link from "next/link";
import { motion } from "framer-motion";

const discoverLinks = [
  { label: "Shop", href: "/shop" },
  { label: "Search", href: "/search" },
  { label: "Blogs", href: "/blogs" },
  { label: "Creators", href: "/creator" },
];

const supportLinks = [
  { label: "Help", href: "/help-center" },
  { label: "Track order", href: "/track-order" },
  { label: "Size guide", href: "/size-guide" },
  { label: "Shipping", href: "/shipping" },
];

const legalLinks = [
  { label: "Terms", href: "/terms" },
  { label: "Returns", href: "/returns" },
  { label: "Privacy", href: "/cookies" },
];

export function AppFooter() {
  return (
    <motion.footer
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
      className="border-t border-white/[0.07] bg-gradient-to-b from-transparent to-black/40 px-4 pb-[max(1.75rem,env(safe-area-inset-bottom))] pt-10"
    >
      <div className="mx-auto flex max-w-md flex-col gap-8">
        <nav className="grid grid-cols-2 gap-6 text-left sm:grid-cols-3" aria-label="Site footer">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/35">Discover</p>
            <ul className="mt-3 space-y-2">
              {discoverLinks.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-[13px] font-medium text-white/50 transition-colors hover:text-[#8eb6ff]">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/35">Support</p>
            <ul className="mt-3 space-y-2">
              {supportLinks.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-[13px] font-medium text-white/50 transition-colors hover:text-[#8eb6ff]">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div className="col-span-2 sm:col-span-1">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/35">Legal</p>
            <ul className="mt-3 space-y-2">
              {legalLinks.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-[13px] font-medium text-white/50 transition-colors hover:text-[#8eb6ff]">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </nav>
        <div className="flex flex-col items-center gap-2 border-t border-white/[0.06] pt-6">
          <p className="text-center text-[11px] font-extralight uppercase tracking-[0.28em] text-white/30">Salvya</p>
          <p className="text-center text-[12px] text-white/35">© {new Date().getFullYear()} Salvya — Official artist merch</p>
        </div>
      </div>
    </motion.footer>
  );
}
