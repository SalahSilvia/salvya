"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";

export function AppFooter() {
  const t = useTranslations("footer");

  const discoverLinks = [
    { label: t("shop"), href: "/shop" },
    { label: t("search"), href: "/search" },
    { label: t("blogs"), href: "/blogs" },
    { label: t("creators"), href: "/creator" },
  ];

  const supportLinks = [
    { label: t("help"), href: "/help-center" },
    { label: t("trackOrder"), href: "/track-order" },
    { label: t("sizeGuide"), href: "/size-guide" },
    { label: t("shipping"), href: "/shipping" },
  ];

  const legalLinks = [
    { label: t("terms"), href: "/terms" },
    { label: t("returns"), href: "/returns" },
    { label: t("privacy"), href: "/cookies" },
  ];

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
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/35">{t("discover")}</p>
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
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/35">{t("support")}</p>
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
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/35">{t("legal")}</p>
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
          <p className="text-center text-[12px] text-white/35">{t("copyright", { year: new Date().getFullYear() })}</p>
        </div>
      </div>
    </motion.footer>
  );
}
