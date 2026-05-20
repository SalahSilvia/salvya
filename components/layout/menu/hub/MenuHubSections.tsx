"use client";

import Link from "next/link";
import { useCallback, useId, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { SalvyaLogoImage } from "@/components/brand/SalvyaLogoImage";
import { CustomerMenuSoftIcon } from "@/components/member/CustomerMenuSoftIcon";
import { loginHref, registerHref } from "@/lib/auth/login-href";
import type { MenuHubLink } from "@/lib/menu/menu-hub-links";
import { MENU_POLICY_GROUPS } from "@/lib/menu/menu-hub-links";
import {
  CREATOR_APPLICATION_STATUS_PATH,
  CREATOR_DASHBOARD_PATH,
  creatorApplyCtaLabel,
  creatorApplyGuestHint,
  creatorApplyHref,
} from "@/lib/creator/apply-navigation";
import { creatorCardSurface } from "@/lib/theme/creator-accent";
import { usePathname } from "next/navigation";

const ease = [0.22, 1, 0.36, 1] as const;
const card =
  "overflow-hidden rounded-3xl border border-white/[0.09] bg-white/[0.04] shadow-[0_20px_60px_-36px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.07)] backdrop-blur-xl";

function SectionLabel({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-3 px-0.5">
      <h2 className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/55">{title}</h2>
      {subtitle ? <p className="mt-1.5 text-[13px] leading-relaxed text-white/38">{subtitle}</p> : null}
    </div>
  );
}

export function MenuGuestHero() {
  const pathname = usePathname() ?? "/menu";
  const reduceMotion = useReducedMotion();

  return (
    <motion.section
      className="relative mt-1 overflow-hidden rounded-[1.75rem] border border-white/[0.1] bg-[#0a0a12]/90 p-6 shadow-[0_32px_80px_-40px_rgba(45,107,255,0.35),inset_0_1px_0_rgba(255,255,255,0.08)] sm:p-8"
      initial={reduceMotion ? false : { opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease }}
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[1.75rem]" aria-hidden>
        <motion.div
          className="absolute -right-1/3 -top-1/3 h-[70%] w-[70%] rounded-full bg-[radial-gradient(circle,rgba(45,107,255,0.35),transparent_65%)] blur-2xl"
          animate={reduceMotion ? undefined : { scale: [1, 1.08, 1], opacity: [0.5, 0.75, 0.5] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute -bottom-1/4 -left-1/4 h-[55%] w-[55%] rounded-full bg-[radial-gradient(circle,rgba(139,92,246,0.14),transparent_70%)] blur-2xl"
          animate={reduceMotion ? undefined : { x: [0, 12, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />
        <div className="grain-overlay absolute inset-0 opacity-[0.08]" />
      </div>

      <div className="relative z-[1]">
        <SalvyaLogoImage
          variant="light"
          alt="Salvya"
          fallback="word"
          className="h-9 w-auto object-contain object-left"
          fallbackClassName="text-xl font-semibold tracking-tight text-white"
        />
        <p className="mt-5 text-[10px] font-semibold uppercase tracking-[0.24em] text-violet-300/80">Creator commerce</p>
        <h1 className="mt-3 max-w-[16ch] text-[clamp(1.65rem,6vw,2.1rem)] font-semibold leading-[1.08] tracking-[-0.04em] text-white">
          Join the Salvya community
        </h1>
        <p className="mt-3 max-w-sm text-[15px] leading-relaxed text-white/48">
          Discover limited drops, follow creators, and shop premium merch — all in one place.
        </p>
        <div className="mt-7 flex flex-col gap-2.5 sm:flex-row sm:gap-3">
          <Link
            href={loginHref(pathname)}
            prefetch={false}
            className="inline-flex min-h-[48px] flex-1 items-center justify-center rounded-2xl bg-gradient-to-b from-white to-neutral-200 px-5 text-[15px] font-semibold text-neutral-950 shadow-[0_12px_40px_-12px_rgba(255,255,255,0.35)] transition-transform active:scale-[0.99]"
          >
            Sign in
          </Link>
          <Link
            href={registerHref(pathname)}
            prefetch={false}
            className="inline-flex min-h-[48px] flex-1 items-center justify-center rounded-2xl border border-white/[0.16] bg-white/[0.06] px-5 text-[15px] font-semibold text-white/92 backdrop-blur-md transition-[background-color,transform] hover:bg-white/[0.1] active:scale-[0.99]"
          >
            Create account
          </Link>
        </div>
      </div>
    </motion.section>
  );
}

export function MenuMemberHero({
  headline,
  email,
  profileHref,
  settingsHref,
}: {
  headline: { line: string; name: string };
  email?: string | null;
  profileHref: string;
  settingsHref: string;
}) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.section
      className="relative mt-1 min-h-[26vh] overflow-hidden rounded-[1.75rem] border border-white/[0.1] bg-[#0a0a10]/85 shadow-[0_28px_80px_-44px_rgba(0,0,0,0.9),inset_0_1px_0_rgba(255,255,255,0.07)]"
      initial={reduceMotion ? false : { opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease }}
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[1.75rem]" aria-hidden>
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-[#2D6BFF]/22 via-transparent to-[#1a1020]/95"
          animate={reduceMotion ? undefined : { opacity: [0.85, 1, 0.85] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute -right-1/4 bottom-0 h-2/3 w-full bg-gradient-to-t from-[#050508] via-[#050508]/75 to-transparent"
          aria-hidden
        />
        <div className="grain-overlay absolute inset-0 opacity-[0.07]" />
      </div>
      <div className="relative z-[1] flex flex-col justify-end px-5 pb-7 pt-10 sm:px-7 sm:pb-9 sm:pt-12">
        <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/38">Your space</p>
        <h1 className="mt-2 text-[clamp(1.75rem,6.5vw,2.35rem)] font-semibold leading-[1.05] tracking-[-0.045em] text-white">
          {headline.line}
          {headline.name ? (
            <>
              , <span className="text-white">{headline.name}</span>
            </>
          ) : null}
        </h1>
        {email ? (
          <p className="mt-2.5 truncate text-[14px] text-white/42" title={email}>
            {email}
          </p>
        ) : null}
        <div className="mt-6 flex flex-wrap gap-2.5">
          <Link
            href={profileHref}
            prefetch={false}
            className="inline-flex min-h-[44px] items-center gap-2 rounded-full border border-white/[0.16] bg-white/[0.08] px-4 py-2.5 text-[14px] font-semibold text-white/95 transition-[background-color,transform] hover:bg-white/[0.12] active:scale-[0.99]"
          >
            <CustomerMenuSoftIcon linkId="profile" size="sm" className="!h-8 !w-8 !rounded-xl" />
            Profile
          </Link>
          <Link
            href={settingsHref}
            prefetch={false}
            className="inline-flex min-h-[44px] items-center rounded-full border border-white/[0.12] bg-white/[0.05] px-4 py-2.5 text-[14px] font-semibold text-white/80 transition-colors hover:bg-white/[0.08]"
          >
            Settings
          </Link>
        </div>
      </div>
    </motion.section>
  );
}

export function MenuDiscoverGrid({
  links,
  delay = 0.06,
}: {
  links: MenuHubLink[];
  delay?: number;
}) {
  const reduceMotion = useReducedMotion();
  const pathname = usePathname() ?? "";

  return (
    <motion.section
      className="mt-8"
      initial={reduceMotion ? false : { opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease, delay }}
    >
      <SectionLabel title="Discover" subtitle="Blogs, search, and your saved pieces." />
      <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
        {links.map((item, i) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <motion.div
              key={item.id}
              initial={reduceMotion ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease, delay: delay + i * 0.04 }}
            >
              <Link
                href={item.href}
                prefetch={false}
                className={`group relative flex min-h-[5.25rem] flex-col justify-between rounded-2xl border p-4 transition-[border-color,background-color,transform] active:scale-[0.99] ${
                  active
                    ? "border-[#2D6BFF]/40 bg-[#2D6BFF]/12 shadow-[0_0_32px_-8px_rgba(45,107,255,0.45)]"
                    : "border-white/[0.08] bg-white/[0.04] hover:border-white/[0.14] hover:bg-white/[0.07]"
                }`}
              >
                <CustomerMenuSoftIcon linkId={item.id} size="sm" />
                <span className="mt-3 block">
                  <span className="text-[15px] font-semibold tracking-[-0.02em] text-white/92">{item.label}</span>
                  {item.hint ? <span className="mt-0.5 block text-[12px] text-white/38">{item.hint}</span> : null}
                </span>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </motion.section>
  );
}

export type CreatorMenuMode = "guest" | "customer" | "pending" | "approved";

const CREATOR_STUDIO_LINKS = [
  { href: CREATOR_DASHBOARD_PATH, label: "Dashboard" },
  { href: "/creator/products", label: "Products" },
  { href: "/creator/links", label: "My Links" },
  { href: "/creator/wallet", label: "Wallet" },
] as const;

export function MenuCreatorProgrammeCard({ mode, delay = 0.12 }: { mode: CreatorMenuMode; delay?: number }) {
  const reduceMotion = useReducedMotion();
  const isGuest = mode === "guest";
  const isApproved = mode === "approved";
  const isPending = mode === "pending";

  return (
    <motion.section
      className={`relative mt-8 overflow-hidden rounded-2xl border p-4 ${creatorCardSurface}`}
      initial={reduceMotion ? false : { opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease, delay }}
    >
      <p className="relative text-[10px] font-bold uppercase tracking-[0.18em] text-violet-200/80">
        {isApproved ? "Creator Workspace" : "Creator programme"}
      </p>
      <h2 className="relative mt-1.5 text-[15px] font-semibold leading-snug tracking-[-0.02em] text-white/92">
        {isApproved ? "Salvya Creator" : isPending ? "Application under review" : "Become a Salvya Creator"}
      </h2>
      <p className="relative mt-1.5 text-[13px] leading-relaxed text-white/45">
        {isApproved
          ? "Promote catalog products and track link performance."
          : isPending
            ? "We will notify you when your application is approved."
            : "Partner with Salvya to promote official drops."}
      </p>

      {isGuest ? (
        <p className="relative mt-3 text-[13px] leading-relaxed text-violet-200/55">{creatorApplyGuestHint()}</p>
      ) : null}

      {isApproved ? (
        <>
          <Link
            href={CREATOR_DASHBOARD_PATH}
            prefetch={false}
            className="relative mt-3.5 flex min-h-[44px] w-full items-center justify-center rounded-xl bg-gradient-to-r from-violet-500/35 to-fuchsia-500/30 text-[14px] font-semibold text-white ring-1 ring-fuchsia-400/25 transition hover:from-violet-500/45 hover:to-fuchsia-500/38"
          >
            Open Creator Workspace →
          </Link>
          <ul className="relative mt-3 space-y-1.5">
            {CREATOR_STUDIO_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  prefetch={false}
                  className="flex min-h-[40px] items-center justify-between rounded-xl border border-white/[0.08] bg-white/[0.04] px-3.5 text-[13px] font-semibold text-white/90 transition-colors hover:bg-white/[0.07]"
                >
                  {link.label}
                  <span className="text-white/35" aria-hidden>
                    →
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </>
      ) : isPending ? (
        <Link
          href={CREATOR_APPLICATION_STATUS_PATH}
          prefetch={false}
          className="relative mt-3.5 flex min-h-[42px] w-full items-center justify-center rounded-xl border border-amber-400/30 bg-amber-500/10 text-[14px] font-semibold text-amber-100/95 transition-colors hover:bg-amber-500/15"
        >
          View application status
        </Link>
      ) : (
        <Link
          href={creatorApplyHref(!isGuest)}
          prefetch={false}
          className="relative mt-3.5 flex min-h-[42px] w-full items-center justify-center rounded-xl bg-white text-[14px] font-semibold text-slate-900 shadow-sm transition-[transform,background-color] hover:bg-white/95 active:scale-[0.99]"
        >
          {isGuest ? "Become a creator" : creatorApplyCtaLabel(true)}
        </Link>
      )}
    </motion.section>
  );
}

export function MenuShoppingCard({
  links,
  delay = 0.14,
}: {
  links: MenuHubLink[];
  delay?: number;
}) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.section className={`mt-8 ${card}`} initial={reduceMotion ? false : { opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.48, ease, delay }}>
      <div className="border-b border-white/[0.06] px-4 py-4 sm:px-5 sm:py-5">
        <h2 className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/55">Shopping</h2>
        <p className="mt-1.5 text-[13px] text-white/38">Drops, bag, sizing, and order tracking.</p>
      </div>
      <ul className="m-0 divide-y divide-white/[0.06] p-1.5 sm:p-2">
        {links.map((item, index) => (
          <motion.li
            key={item.id}
            initial={reduceMotion ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.38, ease, delay: delay + index * 0.03 }}
          >
            <Link
              href={item.href}
              prefetch={false}
              className="group flex min-h-[52px] items-center gap-3 rounded-2xl px-3 py-3 transition-colors hover:bg-white/[0.05] sm:px-4"
            >
              <CustomerMenuSoftIcon linkId={item.id} />
              <span className="min-w-0 flex-1">
                <span className="block text-[15px] font-medium tracking-[-0.02em] text-white/90">{item.label}</span>
                {item.hint ? <span className="mt-0.5 block text-[13px] text-white/38">{item.hint}</span> : null}
              </span>
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/[0.1] bg-white/[0.05] text-white/35 group-hover:border-[#2D6BFF]/35 group-hover:text-white/80" aria-hidden>
                →
              </span>
            </Link>
          </motion.li>
        ))}
      </ul>
    </motion.section>
  );
}

const POLICY_GROUP_ICON: Record<string, string> = {
  orders: "help",
  shopping: "shop",
  legal: "policies",
};

function MenuPolicyDropdown({
  group,
  open,
  onToggle,
  reduceMotion,
}: {
  group: (typeof MENU_POLICY_GROUPS)[number];
  open: boolean;
  onToggle: () => void;
  reduceMotion: boolean | null;
}) {
  const panelId = useId();
  const headerId = useId();
  const groupIcon = POLICY_GROUP_ICON[group.id] ?? "policies";

  return (
    <motion.div className={card}>
      <button
        type="button"
        id={headerId}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={onToggle}
        className="group flex w-full min-h-[56px] items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-white/[0.04] sm:px-5"
      >
        <CustomerMenuSoftIcon linkId={groupIcon} size="sm" className="!text-white/75 group-hover:!text-[#c5d4ff]" />
        <span className="min-w-0 flex-1 text-[15px] font-bold tracking-[-0.02em] text-white sm:text-[16px]">
          {group.title}
        </span>
        <motion.span
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/[0.1] bg-white/[0.04] text-white/50 transition-colors group-hover:border-white/[0.18] group-hover:text-white/80"
          animate={reduceMotion ? undefined : { rotate: open ? 180 : 0 }}
          transition={{ duration: 0.28, ease }}
          aria-hidden
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {open ? (
          <motion.div
            id={panelId}
            role="region"
            aria-labelledby={headerId}
            initial={reduceMotion ? false : { height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={reduceMotion ? undefined : { height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease }}
            className="overflow-hidden"
          >
            <ul className="m-0 border-t border-white/[0.06] p-1 sm:p-1.5">
              {group.links.map((item, index) => (
                <motion.li
                  key={item.id}
                  initial={reduceMotion ? false : { opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.22, ease, delay: index * 0.03 }}
                >
                  <Link
                    href={item.href}
                    prefetch={false}
                    className="group flex min-h-[48px] items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-white/[0.06] sm:px-4"
                  >
                    <CustomerMenuSoftIcon linkId={item.id} size="sm" />
                    <span className="flex-1 text-[14px] font-medium text-white/62 group-hover:text-white/90">
                      {item.label}
                    </span>
                    <span
                      className="text-white/28 transition-[transform,color] group-hover:translate-x-0.5 group-hover:text-white/55"
                      aria-hidden
                    >
                      →
                    </span>
                  </Link>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </motion.div>
  );
}

export function MenuPoliciesHub({ delay = 0.16 }: { delay?: number }) {
  const reduceMotion = useReducedMotion();
  const [openIds, setOpenIds] = useState<Set<string>>(() => new Set());

  const toggleGroup = useCallback((id: string) => {
    setOpenIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  return (
    <motion.section className="mt-8" initial={reduceMotion ? false : { opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.48, ease, delay }}>
      <SectionLabel title="Help & policies" subtitle="Tap a section to expand shipping, returns, terms, and support." />
      <motion.div
        initial={reduceMotion ? false : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease, delay }}
        className="mb-2.5"
      >
        <Link
          href="/report-problem"
          prefetch={false}
          className="group flex min-h-[48px] items-center gap-3 rounded-2xl border border-rose-500/30 bg-rose-500/[0.1] px-4 py-3 transition-[border-color,transform] hover:border-rose-400/45 hover:bg-rose-500/[0.14] active:scale-[0.99]"
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-rose-400/30 bg-rose-500/15 text-rose-300">
            <CustomerMenuSoftIcon linkId="report-problem" className="!border-rose-400/25 !bg-rose-500/10 !text-rose-300" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[14px] font-semibold tracking-[-0.02em] text-rose-100">Report a problem</span>
            <span className="mt-0.5 block text-[12px] text-rose-200/45">Help us improve your experience</span>
          </span>
          <span className="text-rose-300/50 group-hover:text-rose-200" aria-hidden>
            →
          </span>
        </Link>
      </motion.div>
      <motion.div className="flex flex-col gap-2.5">
        {MENU_POLICY_GROUPS.map((group, index) => (
          <motion.div
            key={group.id}
            initial={reduceMotion ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease, delay: delay + index * 0.04 }}
          >
            <MenuPolicyDropdown
              group={group}
              open={openIds.has(group.id)}
              onToggle={() => toggleGroup(group.id)}
              reduceMotion={reduceMotion}
            />
          </motion.div>
        ))}
      </motion.div>
    </motion.section>
  );
}

export function MenuAboutCard({ href, delay = 0.18 }: { href: string; delay?: number }) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.section
      className={`mt-8 rounded-[1.75rem] border border-white/[0.08] bg-gradient-to-br from-white/[0.07] to-transparent p-5 sm:p-6`}
      initial={reduceMotion ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease, delay }}
    >
      <div className="flex items-start gap-3">
        <CustomerMenuSoftIcon linkId="about" size="sm" />
        <div>
          <h2 className="text-[1.1rem] font-semibold tracking-[-0.03em] text-white/95">Why Salvya</h2>
          <p className="mt-2 text-[14px] leading-relaxed text-white/45">
            Fashion-tech for creators — limited drops, premium merch, and a community that moves culture forward.
          </p>
        </div>
      </div>
      <Link href={href} prefetch={false} className="mt-5 inline-flex items-center gap-2 text-[14px] font-semibold text-[#9eb6ff] hover:text-[#c8d6ff]">
        Read our story
        <span aria-hidden>→</span>
      </Link>
    </motion.section>
  );
}

export function MenuSignOutButton({ onSignOut }: { onSignOut: () => void }) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div className="mt-8 pb-2" initial={reduceMotion ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4, ease, delay: 0.22 }}>
      <button
        type="button"
        onClick={onSignOut}
        className="flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl border border-red-500/35 bg-red-600/[0.15] text-[14px] font-semibold text-red-400 transition-[background-color,transform] hover:bg-red-600/[0.22] active:scale-[0.99]"
      >
        <CustomerMenuSoftIcon linkId="sign-out" size="sm" className="!border-red-400/30 !bg-red-500/10 !text-red-400" />
        Sign out
      </button>
    </motion.div>
  );
}
