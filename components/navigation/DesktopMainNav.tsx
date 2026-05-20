"use client";

import Link from "next/link";
import { SalvyaLogoImage } from "@/components/brand/SalvyaLogoImage";
import { DesktopMainNavContent } from "@/components/navigation/DesktopMainNavContent";
import { useSessionRole } from "@/components/member/useSessionRole";
import { storefrontLogoHref } from "@/lib/navigation/storefront-logo";

/** Desktop / laptop — storefront navigation bar. */
export function DesktopMainNav() {
  const role = useSessionRole();
  const isAdmin = role === "admin";
  const isGuest = role === null;
  const logoHref = storefrontLogoHref(role);

  return (
    <header
      className="fixed top-0 right-0 left-0 z-[120] hidden border-b border-white/[0.08] bg-[#050508]/88 pt-[env(safe-area-inset-top)] backdrop-blur-xl backdrop-saturate-150 md:block"
      aria-label="Main navigation (desktop)"
    >
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-6 px-6 lg:px-8">
        <Link
          href={logoHref}
          prefetch={false}
          className="flex shrink-0 items-center outline-none transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-[#2D6BFF]/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[#050508]"
          aria-label={isAdmin ? "Salvya admin" : isGuest ? "Salvya shop" : "Salvya home"}
        >
          <SalvyaLogoImage
            variant="light"
            alt="Salvya"
            fallback="word"
            className="h-[30px] w-auto max-w-[min(200px,28vw)] object-contain object-left"
            fallbackClassName="text-lg font-semibold tracking-tight text-white"
          />
        </Link>
        <DesktopMainNavContent />
      </div>
    </header>
  );
}
