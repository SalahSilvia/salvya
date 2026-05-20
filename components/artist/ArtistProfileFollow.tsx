"use client";

import { ArtistFollowButton } from "@/components/artist/ArtistFollowButton";
import { useArtistFollows } from "@/components/artist/ArtistFollowsProvider";
import { useEffect, useState } from "react";

type Props = {
  slug: string;
  artistName: string;
  profileImage: string;
};

export function ArtistProfileFollow({ slug, artistName, profileImage }: Props) {
  const { followCount, isFollowing } = useArtistFollows();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const following = mounted && isFollowing(slug);

  return (
    <div className="mt-5 w-full max-w-[17rem] px-1">
      <ArtistFollowButton
        slug={slug}
        artistName={artistName}
        profileImage={profileImage}
        variant="profile"
      />
      {mounted && followCount > 0 ? (
        <p className="mt-3 text-center text-[11px] tabular-nums text-white/35">
          {followCount} artist{followCount === 1 ? "" : "s"} you follow
          {following ? <span className="text-white/50"> · includes {artistName}</span> : null}
        </p>
      ) : null}
    </div>
  );
}
