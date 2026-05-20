"use client";

import type { ArtistStatusTag } from "@/lib/site-data";

type Props = {
  name: string;
  statusTag: ArtistStatusTag;
  profileImage: string;
  coverImage: string;
  gradient: string;
  ambient: string;
  aboutLead: string;
};

export function AdminArtistProfilePreview({
  name,
  statusTag,
  profileImage,
  coverImage,
  gradient,
  ambient,
  aboutLead,
}: Props) {
  const displayName = name.trim() || "Artist name";
  const profileSrc = profileImage.trim() || null;
  const coverSrc = coverImage.trim() || profileSrc;

  return (
    <div className="overflow-hidden rounded-xl border border-[#e3e5e7] bg-[#050508] text-white shadow-sm">
      <div className="relative aspect-[2.2/1] w-full overflow-hidden bg-[#0a0a0f]">
        {coverSrc ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={coverSrc} alt="" className="absolute inset-0 h-full w-full object-cover opacity-90" />
        ) : null}
        <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-40 mix-blend-multiply`} aria-hidden />
        <div className={`absolute inset-0 bg-gradient-to-br ${ambient} opacity-60`} aria-hidden />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050508] via-transparent to-black/30" aria-hidden />
        <span className="absolute right-3 top-3 rounded-full border border-white/15 bg-black/45 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-white/85 backdrop-blur-sm">
          {statusTag}
        </span>
      </div>
      <div className="relative -mt-10 flex flex-col items-center px-4 pb-5 pt-0">
        <div className="h-[5.5rem] w-[5.5rem] overflow-hidden rounded-full border-[3px] border-[#050508] bg-[#0a0a0c] ring-1 ring-white/15">
          {profileSrc ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={profileSrc} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-[#1a1a22] text-[11px] text-white/40">
              Profile
            </div>
          )}
        </div>
        <p className="mt-3 text-center text-[17px] font-semibold tracking-tight">{displayName}</p>
        {aboutLead.trim() ? (
          <p className="mt-2 line-clamp-3 max-w-[18rem] text-center text-[12px] leading-relaxed text-white/48">
            {aboutLead.trim()}
          </p>
        ) : (
          <p className="mt-2 text-center text-[12px] text-white/35">About text appears on the artist shop page.</p>
        )}
      </div>
    </div>
  );
}
