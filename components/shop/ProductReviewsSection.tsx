"use client";

import { useCallback, useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { useGuestEngagement } from "@/components/auth/GuestEngagementProvider";
import { useSupabaseUser } from "@/components/member/useSupabaseUser";
import { getAnalyticsTracker } from "@/lib/analytics/tracker";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { firstNameFromUser } from "@/lib/member/welcome-copy";
import { makeProductId } from "@/lib/member/likes-storage";
import { requireAuth } from "@/lib/auth/require-auth";
import { fetchProductReviews, upsertProductReview } from "@/lib/reviews/api-client";
import { mergeProductReviews } from "@/lib/reviews/merge";
import { loadLocalProductReviews, saveLocalProductReviews } from "@/lib/reviews/local-reviews";
import { productReviewsStorageKey } from "@/lib/reviews/product-key";
import { REVIEW_BODY_MAX, type StoredProductReview } from "@/lib/reviews/types";

type Props = {
  artistSlug: string;
  itemSlug: string;
  productKind: "hoodie" | "tshirt";
  displayTitle: string;
  layout?: "page" | "embedded";
};

const COMMENT_MAX = REVIEW_BODY_MAX;

function authorInitial(label: string): string {
  const t = label.trim();
  return (t.slice(0, 1) || "?").toUpperCase();
}

function authorFromUser(user: User): string {
  return firstNameFromUser(user);
}

function formatCommentTime(iso: string): string {
  const then = new Date(iso).getTime();
  const diff = Date.now() - then;
  if (!Number.isFinite(diff) || diff < 0) return "now";

  const sec = Math.floor(diff / 1000);
  if (sec < 60) return sec < 8 ? "now" : `${sec}s`;
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h`;
  const day = Math.floor(hr / 24);
  if (day < 7) return `${day}d`;
  const week = Math.floor(day / 7);
  if (week < 5) return `${week}w`;

  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function avatarGradient(seed: string): string {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) | 0;
  const hues = [220, 260, 190, 330, 28, 160];
  const hue = hues[Math.abs(h) % hues.length];
  return `linear-gradient(135deg, hsl(${hue} 72% 52%), hsl(${(hue + 40) % 360} 68% 38%))`;
}

function CommentAvatar({ label, size = "md" }: { label: string; size?: "sm" | "md" }) {
  const dim = size === "sm" ? "h-7 w-7 text-[11px]" : "h-9 w-9 text-[12px]";
  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-full font-semibold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.2)] ${dim}`}
      style={{ background: avatarGradient(label) }}
      aria-hidden
    >
      {authorInitial(label)}
    </div>
  );
}

function StarsInline({ rating }: { rating: number }) {
  const n = Math.round(Math.min(5, Math.max(0, rating)));
  return (
    <span className="inline-flex items-center gap-px text-[10px] text-amber-400/90" aria-label={`${n} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i} className={i <= n ? "opacity-100" : "opacity-25"} aria-hidden>
          ★
        </span>
      ))}
    </span>
  );
}

function StarsPicker({ rating, onPick }: { rating: number; onPick: (n: number) => void }) {
  return (
    <span className="inline-flex items-center gap-0.5" role="radiogroup" aria-label="Rating">
      {[1, 2, 3, 4, 5].map((i) => {
        const filled = i <= rating;
        return (
          <button
            key={i}
            type="button"
            onClick={() => onPick(i)}
            className={`rounded p-0.5 text-[15px] leading-none transition-transform active:scale-90 ${
              filled ? "text-amber-400" : "text-white/22 hover:text-white/40"
            }`}
            aria-label={`${i} star${i === 1 ? "" : "s"}`}
            aria-pressed={i === rating}
          >
            ★
          </button>
        );
      })}
    </span>
  );
}

function HeartIcon({ filled }: { filled: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden>
      {filled ? (
        <path
          fill="currentColor"
          d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
        />
      ) : (
        <path
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
        />
      )}
    </svg>
  );
}

function CommentRow({
  review,
  isYou,
  liked,
  onToggleLike,
}: {
  review: StoredProductReview;
  isYou: boolean;
  liked: boolean;
  onToggleLike: () => void;
}) {
  return (
    <li className="flex gap-2.5 py-2.5">
      <CommentAvatar label={review.authorLabel} />
      <div className="min-w-0 flex-1">
        <p className="text-[13px] leading-snug text-white/92">
          <span className="mr-1.5 font-semibold">{review.authorLabel}</span>
          {isYou ? (
            <span className="mr-1.5 text-[10px] font-medium text-white/35">(you)</span>
          ) : null}
          <span className="font-normal text-white/78">{review.body}</span>
        </p>
        <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1">
          <StarsInline rating={review.rating} />
          <time className="text-[11px] text-white/32" dateTime={review.createdAt}>
            {formatCommentTime(review.createdAt)}
          </time>
        </div>
        <div className="mt-1 flex items-center gap-4">
          <button
            type="button"
            onClick={onToggleLike}
            className={`inline-flex items-center gap-1 text-[11px] font-semibold transition-colors ${
              liked ? "text-rose-400" : "text-white/35 hover:text-white/55"
            }`}
            aria-pressed={liked}
            aria-label={liked ? "Unlike comment" : "Like comment"}
          >
            <HeartIcon filled={liked} />
            {liked ? "Liked" : "Like"}
          </button>
          <button type="button" className="text-[11px] font-semibold text-white/35 hover:text-white/55">
            Reply
          </button>
        </div>
      </div>
    </li>
  );
}

function SectionShell({
  layout,
  children,
}: {
  layout: "page" | "embedded";
  children: ReactNode;
}) {
  if (layout === "embedded") {
    return (
      <section
        className="relative mt-10 mb-2 overflow-hidden rounded-2xl border border-white/[0.12] bg-[#16161e] max-md:scroll-mb-24"
        aria-labelledby="reviews-heading"
      >
        {children}
      </section>
    );
  }

  return (
    <section className="border-t border-white/[0.1] bg-[#12121a]" aria-labelledby="reviews-heading">
      <div className="mx-auto max-w-3xl px-[max(1.25rem,env(safe-area-inset-left))] py-10 pr-[max(1.25rem,env(safe-area-inset-right))] sm:py-12">
        {children}
      </div>
    </section>
  );
}

export function ProductReviewsSection({
  artistSlug,
  itemSlug,
  productKind,
  displayTitle,
  layout = "page",
}: Props) {
  const { user, loading } = useSupabaseUser();
  const { openCommentGate } = useGuestEngagement();
  const pathname = usePathname() ?? "/";
  const storageKey = useMemo(
    () => productReviewsStorageKey(artistSlug, productKind, itemSlug),
    [artistSlug, productKind, itemSlug],
  );

  const [reviews, setReviews] = useState<StoredProductReview[]>([]);
  const [mounted, setMounted] = useState(false);
  const [synced, setSynced] = useState(false);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [posting, setPosting] = useState(false);
  const [rating, setRating] = useState(5);
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [savedFlash, setSavedFlash] = useState(false);
  const [composerFocused, setComposerFocused] = useState(false);
  const [likedIds, setLikedIds] = useState<Set<string>>(() => new Set());

  const productRef = useMemo(
    () => ({ artistSlug, productKind, itemSlug }),
    [artistSlug, productKind, itemSlug],
  );

  useEffect(() => {
    setMounted(true);
    let cancelled = false;

    void (async () => {
      setLoadingReviews(true);
      const local = loadLocalProductReviews(storageKey);
      if (!cancelled) setReviews(local);

      const remote = await fetchProductReviews(productRef);
      if (cancelled) return;

      if (remote) {
        const merged = mergeProductReviews(remote, local);
        setReviews(merged);
        saveLocalProductReviews(storageKey, merged);
        setSynced(true);
      } else {
        setSynced(false);
      }
      setLoadingReviews(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [storageKey, productRef]);

  const average = useMemo(() => {
    if (reviews.length === 0) return 0;
    return reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;
  }, [reviews]);

  const sorted = useMemo(
    () => [...reviews].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [reviews],
  );

  const persist = useCallback(
    (next: StoredProductReview[]) => {
      setReviews(next);
      saveLocalProductReviews(storageKey, next);
    },
    [storageKey],
  );

  const toggleLike = useCallback((id: string) => {
    setLikedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const onCommentRowToggleLike = useCallback(
    (reviewId: string) => {
      if (!requireAuth(user)) {
        openCommentGate();
        return;
      }
      toggleLike(reviewId);
    },
    [user, openCommentGate, toggleLike],
  );

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!getSupabaseBrowserClient()) {
      setError("Sign-in is not available right now.");
      return;
    }
    if (!user) {
      openCommentGate();
      return;
    }
    const trimmed = body.trim();
    if (trimmed.length < 2) {
      setError("Write a comment first.");
      return;
    }
    if (trimmed.length > COMMENT_MAX) {
      setError("Comment is too long.");
      return;
    }

    const authorLabel = authorFromUser(user);
    const now = new Date().toISOString();
    const optimistic: StoredProductReview = {
      id:
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : `r-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      userId: user.id,
      authorLabel,
      rating,
      body: trimmed,
      createdAt: now,
      updatedAt: now,
    };

    const withoutMine = reviews.filter((r) => r.userId !== user.id);
    persist([optimistic, ...withoutMine]);
    setPosting(true);

    const saved = await upsertProductReview({
      ...productRef,
      rating,
      body: trimmed,
      authorLabel,
    });

    setPosting(false);

    if (saved) {
      const merged = mergeProductReviews([saved], withoutMine);
      persist(merged);
      setSynced(true);
      const likedType = productKind === "tshirt" ? "tee" : "hoodie";
      const pid = makeProductId(artistSlug, likedType, itemSlug);
      getAnalyticsTracker().trackComment(pathname, pid, artistSlug, { rating });
    } else {
      setSynced(false);
      setError("Could not sync comment — saved on this device only.");
    }

    setBody("");
    setRating(5);
    setComposerFocused(false);
    setSavedFlash(true);
    window.setTimeout(() => setSavedFlash(false), 2200);
  }

  const canPost = body.trim().length >= 2;

  if (!mounted || loadingReviews) {
    const skeleton = (
      <div className="animate-pulse space-y-3 px-4 py-4">
        <div className="h-5 w-32 rounded bg-white/[0.08]" />
        <div className="flex gap-2">
          <div className="h-8 w-8 rounded-full bg-white/[0.08]" />
          <div className="h-4 flex-1 rounded bg-white/[0.08]" />
        </div>
        <div className="flex gap-2">
          <div className="h-8 w-8 rounded-full bg-white/[0.08]" />
          <div className="h-4 w-2/3 rounded bg-white/[0.08]" />
        </div>
      </div>
    );

    return (
      <SectionShell layout={layout}>
        {skeleton}
      </SectionShell>
    );
  }

  const inner = (
    <>
      <header className="flex items-center justify-between gap-3 border-b border-white/[0.1] bg-white/[0.02] px-4 py-3 sm:px-5">
        <div>
          <h2 id="reviews-heading" className="text-[15px] font-semibold tracking-[-0.02em] text-white">
            Comments
            {reviews.length > 0 ? (
              <span className="ml-1.5 font-normal tabular-nums text-white/45">{reviews.length}</span>
            ) : null}
          </h2>
          <p className="mt-0.5 line-clamp-1 text-[11px] text-white/38">{displayTitle}</p>
        </div>
        {reviews.length > 0 ? (
          <div className="shrink-0 text-right">
            <p className="text-[13px] font-semibold tabular-nums text-white/88">{average.toFixed(1)}</p>
            <StarsInline rating={average} />
          </div>
        ) : null}
      </header>

      <div className="max-h-[min(52vh,420px)] overflow-y-auto overscroll-contain px-4 sm:px-5">
        {sorted.length === 0 ? (
          <p className="py-8 text-center text-[13px] leading-relaxed text-white/50">
            No comments yet.
            <br />
            <span className="text-white/38">Be the first to share how it fits and feels.</span>
          </p>
        ) : (
          <ul className="divide-y divide-white/[0.08]">
            {sorted.map((r) => (
              <CommentRow
                key={r.id}
                review={r}
                isYou={Boolean(user && r.userId === user.id)}
                liked={likedIds.has(r.id)}
                onToggleLike={() => onCommentRowToggleLike(r.id)}
              />
            ))}
          </ul>
        )}
      </div>

      <footer className="border-t border-white/[0.1] bg-[#1a1a24]/90 px-3 py-2.5 sm:px-4">
        {!loading && !user ? (
          <div className="flex items-center gap-3 py-1">
            <CommentAvatar label="?" size="sm" />
            <button
              type="button"
              onClick={() => openCommentGate()}
              className="min-h-[40px] flex-1 rounded-full border border-white/[0.1] bg-white/[0.04] px-4 text-left text-[13px] leading-[40px] text-white/40 transition-colors hover:border-white/[0.14] hover:text-white/55"
            >
              Log in to comment…
            </button>
          </div>
        ) : null}

        {user ? (
          <form onSubmit={onSubmit} className="space-y-2">
            <div className="flex items-end gap-2">
              <CommentAvatar label={authorFromUser(user)} size="sm" />
              <div
                className={`min-w-0 flex-1 rounded-[1.35rem] border transition-[border-color,background-color] ${
                  composerFocused
                    ? "border-white/[0.14] bg-white/[0.08]"
                    : "border-white/[0.08] bg-white/[0.03]"
                }`}
              >
                {(composerFocused || body.length > 0) && (
                  <div className="flex items-center justify-between gap-2 border-b border-white/[0.06] px-3 py-1.5">
                    <StarsPicker rating={rating} onPick={setRating} />
                    <span className="text-[10px] text-white/28">optional</span>
                  </div>
                )}
                <textarea
                  id="review-body"
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  onFocus={() => setComposerFocused(true)}
                  onBlur={() => {
                    if (!body.trim()) setComposerFocused(false);
                  }}
                  rows={composerFocused || body.length > 0 ? 2 : 1}
                  maxLength={COMMENT_MAX}
                  placeholder="Add a comment…"
                  className="max-h-28 w-full resize-none bg-transparent px-3.5 py-2.5 text-[13px] leading-snug text-white/92 outline-none placeholder:text-white/32"
                />
              </div>
              <button
                type="submit"
                disabled={!canPost || posting}
                className={`shrink-0 pb-2 text-[14px] font-semibold transition-opacity ${
                  canPost && !posting ? "text-[#5b8cff] hover:text-[#8fa8e8]" : "text-white/20"
                }`}
              >
                {posting ? "…" : "Post"}
              </button>
            </div>
            {error ? <p className="pl-9 text-[12px] text-rose-300/95">{error}</p> : null}
            {savedFlash ? (
              <p className="pl-9 text-[12px] font-medium text-emerald-400/90">
                {synced ? "Posted — visible to everyone on this piece." : "Posted on this device."}
              </p>
            ) : (
              <p className="pl-9 text-[10px] text-white/25">
                {synced
                  ? "Shared on Salvya · posting again updates your comment"
                  : "Sign in and sync enabled to share comments · posting again replaces yours"}
              </p>
            )}
          </form>
        ) : null}
      </footer>
    </>
  );

  return <SectionShell layout={layout}>{inner}</SectionShell>;
}
