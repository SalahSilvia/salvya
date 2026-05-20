"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { AccountBackButton } from "@/components/account/AccountBackButton";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { useCallback, useMemo, useState } from "react";
import { useLikes } from "@/components/likes/LikesProvider";
import { EditProfileSheet } from "@/components/member/profile/EditProfileSheet";
import { useProfileExtension } from "@/components/member/profile/useProfileExtension";
import { useSupabaseUser } from "@/components/member/useSupabaseUser";
import { MemberOrdersSection } from "@/components/member/MemberOrdersSection";
import { SalvyaAccountSkeleton } from "@/components/skeleton";
import { tastePillsFromLikes } from "@/lib/member/profile-taste";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { firstNameFromUser } from "@/lib/member/welcome-copy";
import type { LikedItemRecord } from "@/lib/member/likes-storage";
import type { User } from "@supabase/supabase-js";

function authAvatarUrl(user: User): string | null {
  const meta = user.user_metadata as Record<string, unknown> | undefined;
  const u = meta?.avatar_url;
  return typeof u === "string" && u.length > 0 ? u : null;
}

function memberSinceYear(user: User, createdAtIso: string | undefined): string {
  if (createdAtIso) {
    const y = new Date(createdAtIso).getFullYear();
    if (!Number.isNaN(y)) return String(y);
  }
  if (user.created_at) {
    const y = new Date(user.created_at).getFullYear();
    if (!Number.isNaN(y)) return String(y);
  }
  return String(new Date().getFullYear());
}

function relativeTime(ts: number): string {
  const s = Math.max(1, Math.floor((Date.now() - ts) / 1000));
  if (s < 60) return "Just now";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 48) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 14) return `${d}d ago`;
  return new Date(ts).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

const easeOut = [0.22, 1, 0.36, 1] as const;

export function MemberProfileView() {
  const router = useRouter();
  const reduceMotion = useReducedMotion();
  const { user } = useSupabaseUser();
  const { items: likedItems } = useLikes();
  const { extension, reload } = useProfileExtension(user?.id);
  const [editOpen, setEditOpen] = useState(false);

  const { scrollY } = useScroll();
  const coverY = useTransform(scrollY, [0, 320], [0, reduceMotion ? 0 : 56]);

  const authPhoto = user ? authAvatarUrl(user) : null;
  const displayName = useMemo(() => {
    if (!user) return "";
    const extName = extension?.displayName?.trim();
    return extName || firstNameFromUser(user);
  }, [user, extension?.displayName]);

  const handle = extension?.username?.trim();
  const avatarSrc = extension?.avatarUrl ?? authPhoto;
  const coverSrc = extension?.coverUrl ?? null;
  const bio = extension?.bio?.trim() ?? "";
  const initial = (displayName.slice(0, 1) || user?.email?.slice(0, 1) || "?").toUpperCase();

  const tastePills = useMemo(() => tastePillsFromLikes(likedItems, 12), [likedItems]);
  const likedPreview = useMemo(() => likedItems.slice(0, 4), [likedItems]);

  const activityRows = useMemo(() => {
    const fromLikes: { key: string; title: string; sub: string; icon: "heart" | "eye" | "box" }[] = likedItems
      .slice(0, 4)
      .map((it: LikedItemRecord) => ({
        key: `like-${it.productId}`,
        title: `Saved ${it.title}`,
        sub: relativeTime(it.timestamp),
        icon: "heart" as const,
      }));
    const tail = [
      {
        key: "orders",
        title: "Your orders",
        sub: "Track status, invoices, and cancellations",
        icon: "box" as const,
      },
    ];
    return [...fromLikes, ...tail];
  }, [likedItems]);

  const signOut = useCallback(async () => {
    const sb = getSupabaseBrowserClient();
    await sb?.auth.signOut();
    router.push("/");
    router.refresh();
  }, [router]);

  if (!user) {
    return <SalvyaAccountSkeleton />;
  }

  const memberLabel = memberSinceYear(user, extension?.createdAtIso);

  return (
    <div className="relative min-h-0 flex-1 overflow-x-hidden bg-[#050508] text-white">
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        <div className="absolute -left-[18%] top-[8%] h-[min(20rem,80vw)] w-[min(20rem,80vw)] rounded-full bg-[#2D6BFF]/10 blur-[88px]" />
        <div className="absolute -right-[12%] bottom-[18%] h-[min(16rem,65vw)] w-[min(16rem,65vw)] rounded-full bg-violet-600/10 blur-[72px]" />
      </div>

      <header className="sticky top-0 z-30 border-b border-white/[0.06] bg-[#050508]/72 pt-[env(safe-area-inset-top)] backdrop-blur-xl backdrop-saturate-150">
        <div className="mx-auto flex h-14 max-w-xl items-center justify-between gap-3 px-[max(1rem,env(safe-area-inset-left))] pr-[max(1rem,env(safe-area-inset-right))]">
          <AccountBackButton fallbackHref="/menu" />
          <span className="rounded-full border border-white/[0.1] bg-white/[0.05] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-white/50">
            Identity
          </span>
        </div>
      </header>

      <EditProfileSheet
        open={editOpen}
        onClose={() => setEditOpen(false)}
        userId={user.id}
        email={user.email ?? ""}
        authDisplayName={firstNameFromUser(user)}
        authAvatarUrl={authPhoto}
        authCreatedAt={user.created_at ?? null}
        onSaved={() => reload()}
      />

      {/* Cinematic hero — full bleed */}
      <div className="relative left-1/2 z-[1] w-screen max-w-[100vw] -translate-x-1/2 overflow-hidden">
        <div className="relative min-h-[min(52vw,14.5rem)] sm:min-h-[16.5rem]">
          <motion.div className="absolute inset-0 scale-[1.12]" style={{ y: coverY }}>
            {coverSrc ? (
              // eslint-disable-next-line @next/next/no-img-element -- data URL or remote user cover
              <img src={coverSrc} alt="" className="h-full w-full object-cover opacity-[0.55] blur-2xl" />
            ) : null}
            <div
              className="absolute inset-0 bg-gradient-to-br from-[#1a2744]/95 via-[#0c0e14]/90 to-[#121018]/95"
              aria-hidden
            />
            <div
              className="absolute inset-0 bg-[radial-gradient(ellipse_90%_70%_at_50%_0%,rgba(45,107,255,0.35),transparent_55%)]"
              aria-hidden
            />
            <div
              className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_100%_80%,rgba(200,180,255,0.12),transparent_50%)]"
              aria-hidden
            />
          </motion.div>
          <div className="grain-overlay absolute inset-0 opacity-[0.07]" aria-hidden />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#050508] via-[#050508]/55 to-transparent" />
        </div>
      </div>

      <main className="relative z-[2] mx-auto max-w-xl px-[max(1rem,env(safe-area-inset-left))] pb-[max(6rem,env(safe-area-inset-bottom))] pr-[max(1rem,env(safe-area-inset-right))]">
        <div className="-mt-[4.25rem] flex flex-col items-center text-center sm:-mt-[4.75rem] sm:items-start sm:text-left">
          <motion.button
            type="button"
            onClick={() => setEditOpen(true)}
            className="group relative shrink-0 outline-none"
            whileHover={reduceMotion ? undefined : { scale: 1.03 }}
            whileTap={reduceMotion ? undefined : { scale: 0.98 }}
            transition={{ type: "spring", stiffness: 420, damping: 28 }}
            aria-label="Edit profile photo"
          >
            <span
              className="absolute -inset-1 rounded-full bg-gradient-to-br from-[#2D6BFF]/45 via-transparent to-violet-400/25 opacity-80 blur-md transition-opacity group-hover:opacity-100"
              aria-hidden
            />
            <span className="relative block h-[6.25rem] w-[6.25rem] overflow-hidden rounded-full ring-[3px] ring-white/[0.14] ring-offset-4 ring-offset-[#050508] sm:h-[6.75rem] sm:w-[6.75rem]">
              {avatarSrc ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={avatarSrc} alt="" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.06]" />
              ) : (
                <span className="flex h-full w-full items-center justify-center bg-gradient-to-br from-white/[0.12] to-white/[0.04] text-[2.1rem] font-semibold tracking-tight text-white/95">
                  {initial}
                </span>
              )}
              <span className="pointer-events-none absolute inset-0 flex items-center justify-center rounded-full bg-black/0 transition-colors duration-300 group-hover:bg-black/40">
                <span className="flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-black/55 text-white opacity-0 shadow-lg backdrop-blur-sm transition-all duration-300 group-hover:opacity-100">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
                    <path
                      d="M4 7h3l1.5-2h7L17 7h3a2 2 0 012 2v9a2 2 0 01-2 2H4a2 2 0 01-2-2V9a2 2 0 012-2z"
                      stroke="currentColor"
                      strokeWidth="1.4"
                      strokeLinejoin="round"
                    />
                    <circle cx="12" cy="13.5" r="3.25" stroke="currentColor" strokeWidth="1.4" />
                  </svg>
                </span>
              </span>
            </span>
          </motion.button>

          <div className="mt-5 w-full min-w-0 sm:pl-1">
            <motion.div
              initial={reduceMotion ? false : { opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, ease: easeOut }}
            >
              <h1 className="text-[clamp(1.75rem,6vw,2.35rem)] font-semibold leading-[1.05] tracking-[-0.045em] text-white">
                {displayName}
              </h1>
              {handle ? (
                <p className="mt-1.5 text-[15px] font-medium tracking-tight text-[#9eb6ff]/95">@{handle}</p>
              ) : null}
              {user.email ? (
                <p className="mt-2 break-all text-[14px] text-white/46">{user.email}</p>
              ) : null}
              <p className="mt-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/38">Member since {memberLabel}</p>
              {bio ? (
                <p className="mx-auto mt-4 max-w-md text-[14px] leading-relaxed text-white/52 sm:mx-0">{bio}</p>
              ) : null}
            </motion.div>

            <motion.div
              className="mt-6 flex w-full flex-col items-stretch gap-3 sm:flex-row sm:items-center"
              initial={reduceMotion ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: reduceMotion ? 0 : 0.06, ease: easeOut }}
            >
              <button
                type="button"
                onClick={() => setEditOpen(true)}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-white/[0.14] bg-white/[0.08] px-5 text-[14px] font-semibold text-white/95 shadow-[0_0_0_1px_rgba(45,107,255,0.12),0_12px_40px_-18px_rgba(45,107,255,0.45)] backdrop-blur-xl transition-[transform,box-shadow,background-color] hover:border-[#2D6BFF]/35 hover:bg-white/[0.11] hover:shadow-[0_0_0_1px_rgba(45,107,255,0.22),0_16px_48px_-14px_rgba(45,107,255,0.55)] active:scale-[0.99]"
              >
                <span aria-hidden>✏️</span>
                Edit profile
              </button>
              <Link
                href="/likes"
                className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-white/[0.1] bg-white/[0.04] px-5 text-[14px] font-semibold text-white/82 transition-colors hover:border-white/[0.16] hover:bg-white/[0.08] hover:text-white"
              >
                {likedItems.length} saved piece{likedItems.length === 1 ? "" : "s"}
              </Link>
            </motion.div>
          </div>
        </div>

        {/* Likes preview strip */}
        <motion.section
          className="mt-12"
          initial={reduceMotion ? false : { opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.5, ease: easeOut }}
        >
          <div className="flex items-end justify-between gap-3">
            <div>
              <h2 className="m-0 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/40">Your likes</h2>
              <p className="mt-1 text-[15px] font-medium tracking-tight text-white/88">Pieces you keep close</p>
            </div>
            <Link href="/likes" className="shrink-0 text-[13px] font-semibold text-[#9eb6ff] transition-colors hover:text-[#c9d6ff]">
              Open archive →
            </Link>
          </div>
          {likedPreview.length ? (
            <div className="mt-4 grid grid-cols-4 gap-2 sm:gap-3">
              {likedPreview.map((it) => (
                <Link
                  key={it.productId}
                  href={it.href}
                  className="group relative aspect-square overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.04] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] transition-[transform,border-color] hover:-translate-y-0.5 hover:border-white/[0.14]"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={it.imageSrc} alt="" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  <span className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-70" />
                </Link>
              ))}
            </div>
          ) : (
            <p className="mt-4 rounded-2xl border border-white/[0.08] bg-white/[0.03] px-4 py-6 text-center text-[14px] text-white/45">
              Hearts you tap on drops land here — start exploring the feed.
            </p>
          )}
        </motion.section>

        {/* Taste */}
        <motion.section
          className="mt-12"
          initial={reduceMotion ? false : { opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.5, delay: reduceMotion ? 0 : 0.05, ease: easeOut }}
        >
          <h2 className="m-0 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/40">Your taste</h2>
          <p className="mt-1 text-[15px] font-medium tracking-tight text-white/88">Salvya reads what you love</p>
          {tastePills.length ? (
            <div className="mt-4 flex flex-wrap gap-2">
              {tastePills.map((pill, i) => (
                <motion.span
                  key={`${pill}-${i}`}
                  initial={reduceMotion ? false : { opacity: 0, scale: 0.92 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: reduceMotion ? 0 : 0.03 * i, duration: 0.35, ease: easeOut }}
                  className="rounded-full border border-white/[0.1] bg-white/[0.06] px-3.5 py-1.5 text-[13px] font-medium tracking-tight text-white/88 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
                >
                  {pill}
                </motion.span>
              ))}
            </div>
          ) : (
            <p className="mt-4 text-[14px] leading-relaxed text-white/45">
              Like a few pieces — we will surface artists and categories that match your rotation.
            </p>
          )}
        </motion.section>

        {/* Activity */}
        <motion.section
          className="mt-12"
          initial={reduceMotion ? false : { opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.5, delay: reduceMotion ? 0 : 0.08, ease: easeOut }}
        >
          <h2 className="m-0 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/40">Recent activity</h2>
          <p className="mt-1 text-[15px] font-medium tracking-tight text-white/88">A quiet timeline</p>
          <ul className="mt-5 space-y-3">
            {activityRows.map((row, idx) => (
              <motion.li
                key={row.key}
                initial={reduceMotion ? false : { opacity: 0, x: -8 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: reduceMotion ? 0 : 0.04 * idx, duration: 0.4, ease: easeOut }}
                className="flex gap-3 rounded-2xl border border-white/[0.08] bg-white/[0.03] px-4 py-3.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]"
              >
                <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.05] text-[15px] text-white/55">
                  {row.icon === "heart" ? "♥" : row.icon === "eye" ? "◎" : "▢"}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="m-0 text-[14px] font-medium leading-snug text-white/90">{row.title}</p>
                  <p className="mt-1 text-[12px] text-white/40">{row.sub}</p>
                </div>
              </motion.li>
            ))}
          </ul>
        </motion.section>

        {/* Orders */}
        <motion.section
          className="mt-12"
          initial={reduceMotion ? false : { opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.5, delay: reduceMotion ? 0 : 0.1, ease: easeOut }}
        >
          <div className="flex items-end justify-between gap-3">
            <div>
              <h2 className="m-0 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/40">Your orders</h2>
              <p className="mt-1 text-[15px] font-medium tracking-tight text-white/88">Latest movement</p>
            </div>
            <div className="flex shrink-0 gap-3">
              <Link href="/account/refunds" className="text-[13px] font-semibold text-[#9eb6ff] transition-colors hover:text-[#c9d6ff]">
                Refunds →
              </Link>
              <Link href="/track-order" className="text-[13px] font-semibold text-[#9eb6ff] transition-colors hover:text-[#c9d6ff]">
                Track →
              </Link>
            </div>
          </div>
          <MemberOrdersSection variant="profile" limit={5} />
        </motion.section>

        {/* Quick settings */}
        <motion.section
          className="mt-12"
          initial={reduceMotion ? false : { opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.5, delay: reduceMotion ? 0 : 0.12, ease: easeOut }}
        >
          <h2 className="m-0 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/40">Quick essentials</h2>
          <p className="mt-1 text-[15px] font-medium tracking-tight text-white/88">Lightweight controls</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <Link
              href="/account/settings"
              className="rounded-2xl border border-white/[0.08] bg-white/[0.03] px-4 py-4 transition-colors hover:border-white/[0.14] hover:bg-white/[0.06]"
            >
              <p className="m-0 text-[13px] font-semibold text-white/90">Addresses</p>
              <p className="mt-1 text-[12px] leading-relaxed text-white/40">Shipping spots</p>
            </Link>
            <Link
              href="/terms/account"
              className="rounded-2xl border border-white/[0.08] bg-white/[0.03] px-4 py-4 transition-colors hover:border-white/[0.14] hover:bg-white/[0.06]"
            >
              <p className="m-0 text-[13px] font-semibold text-white/90">Security</p>
              <p className="mt-1 text-[12px] leading-relaxed text-white/40">Account &amp; data</p>
            </Link>
            <button
              type="button"
              onClick={() => void signOut()}
              className="rounded-2xl border border-rose-500/20 bg-rose-500/[0.07] px-4 py-4 text-left transition-colors hover:border-rose-400/35 hover:bg-rose-500/10"
            >
              <p className="m-0 text-[13px] font-semibold text-rose-100/95">Log out</p>
              <p className="mt-1 text-[12px] leading-relaxed text-rose-100/50">Leave on this device</p>
            </button>
          </div>
        </motion.section>

        <motion.div
          className="mt-10 flex justify-center gap-6 pb-2"
          initial={reduceMotion ? false : { opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <Link
            href="/account/settings"
            className="text-[13px] font-medium text-white/38 transition-colors hover:text-white/55"
          >
            Account settings
          </Link>
        </motion.div>
      </main>
    </div>
  );
}
