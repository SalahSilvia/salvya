"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useGuestEngagement } from "@/components/auth/GuestEngagementProvider";
import { useArtistFollows } from "@/components/artist/ArtistFollowsProvider";
import { getAnalyticsTracker } from "@/lib/analytics/tracker";

type Props = {
  slug: string;
  artistName: string;
  profileImage: string;
  /** Profile hero: full-width pill. Inline: compact for toolbars. */
  variant?: "profile" | "compact";
  className?: string;
};

export function ArtistFollowButton({
  slug,
  artistName,
  profileImage,
  variant = "profile",
  className = "",
}: Props) {
  const { isFollowing, toggleFollow, isSignedIn } = useArtistFollows();
  const { openFollowGate } = useGuestEngagement();
  const pathname = usePathname() ?? "/";
  const [mounted, setMounted] = useState(false);
  const [flash, setFlash] = useState<"followed" | "unfollowed" | null>(null);

  useEffect(() => setMounted(true), []);

  const following = mounted && isFollowing(slug);

  const onClick = useCallback(() => {
    if (!mounted) return;
    if (!isSignedIn) {
      if (isFollowing(slug)) {
        toggleFollow(slug, { name: artistName, profileImage });
        setFlash("unfollowed");
        window.setTimeout(() => setFlash(null), 1800);
        return;
      }
      openFollowGate(slug, { name: artistName, profileImage });
      return;
    }
    const nowFollowing = toggleFollow(slug, { name: artistName, profileImage });
    if (nowFollowing) {
      getAnalyticsTracker().trackFollowArtist(pathname, slug, { artist_name: artistName });
    }
    setFlash(nowFollowing ? "followed" : "unfollowed");
    window.setTimeout(() => setFlash(null), 1800);
  }, [artistName, profileImage, slug, toggleFollow, mounted, isSignedIn, isFollowing, openFollowGate, pathname]);

  const profileClass = following
    ? "border-white/[0.22] bg-white/[0.08] text-white hover:bg-white/[0.11]"
    : "border-[#2D6BFF]/50 bg-[#2D6BFF] text-white shadow-[0_12px_32px_-14px_rgba(45,107,255,0.55)] hover:brightness-110";

  const compactClass = following
    ? "border-white/[0.18] bg-white/[0.06] px-3.5 text-[12px] text-white/88"
    : "border-[#2D6BFF]/45 bg-[#2D6BFF]/90 px-4 text-[12px] text-white";

  return (
    <div className={className}>
      <button
        type="button"
        onClick={onClick}
        aria-pressed={following}
        aria-label={following ? `Unfollow ${artistName}` : `Follow ${artistName}`}
        className={`inline-flex min-h-[42px] items-center justify-center rounded-full border font-semibold transition-[transform,background-color,border-color,box-shadow] active:scale-[0.98] ${
          variant === "profile"
            ? `w-full min-w-[9.5rem] px-6 text-[14px] tracking-[-0.01em] ${profileClass}`
            : `min-h-[34px] ${compactClass}`
        }`}
      >
        {following ? "Following" : "Follow"}
      </button>
      {flash ? (
        <p className="mt-2 text-center text-[11px] font-medium text-white/45" role="status">
          {flash === "followed"
            ? `You follow ${artistName} — their drops surface on your home feed.`
            : `Unfollowed ${artistName}.`}
        </p>
      ) : null}
    </div>
  );
}
