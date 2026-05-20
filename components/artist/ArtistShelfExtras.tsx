import Link from "next/link";
import type { ArtistStatusTag } from "@/lib/site-data";

export function ArtistDropBanner({
  statusTag,
  artistName,
}: {
  statusTag: ArtistStatusTag;
  artistName: string;
}) {
  if (statusTag === "LIMITED DROP") {
    return (
      <div className="relative mb-8 overflow-hidden rounded-2xl border border-[#2D6BFF]/35 bg-gradient-to-br from-[#2D6BFF]/14 via-white/[0.04] to-transparent px-4 py-4 sm:px-5 sm:py-5">
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-l from-[#2D6BFF]/60 to-transparent"
          aria-hidden
        />
        <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-[#9ab6ff]">Limited drop</p>
        <p className="mt-2 text-[15px] font-semibold leading-snug text-white">
          {artistName} — small runs, no restock guarantees. If you see your size, it is live inventory.
        </p>
      </div>
    );
  }
  if (statusTag === "AVAILABLE") {
    return (
      <p className="mb-8 rounded-xl border border-white/[0.07] bg-white/[0.03] px-4 py-3 text-center text-[13px] leading-relaxed text-white/52">
        <span className="font-semibold text-white/75">In stock</span> — pieces on this page are available while
        listings stay up. Tap <span className="font-semibold text-white/75">Follow</span> on the profile to
        get drops in your feed.
      </p>
    );
  }
  return null;
}

export function ArtistAboutPreview({
  aboutLead,
  hasAboutMore,
}: {
  aboutLead: string;
  hasAboutMore: boolean;
}) {
  return (
    <section
      id="about-section"
      aria-labelledby="about-preview-heading"
      className="relative mb-10 scroll-mt-20 border-t border-white/[0.06] pt-8"
    >
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-l from-[#2D6BFF]/30 via-white/[0.06] to-transparent"
        aria-hidden
      />
      <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/38">Story</p>
      <h2 id="about-preview-heading" className="mt-2 text-xl font-semibold tracking-[-0.02em] text-white">
        About this shop
      </h2>
      <p className="mt-3 line-clamp-4 text-[14px] leading-relaxed text-white/48">{aboutLead}</p>
      <p className="mt-3 text-[12px] leading-relaxed text-white/38">
        {hasAboutMore
          ? "Open the ⋮ menu on the cover for the full write-up, share link, or to unfollow."
          : "Open the ⋮ menu on the cover to share or unfollow."}
      </p>
    </section>
  );
}

export function ArtistExploreSalvyaCta() {
  return (
    <section
      aria-labelledby="explore-heading"
      className="mt-14 scroll-mt-20 rounded-2xl border border-white/[0.08] bg-gradient-to-br from-white/[0.06] to-white/[0.02] px-4 py-5 sm:mt-16 sm:px-6"
    >
      <h2 id="explore-heading" className="text-lg font-semibold tracking-[-0.02em] text-white">
        Explore Salvya
      </h2>
      <p className="mt-2 max-w-[20rem] text-[13px] leading-relaxed text-white/45">
        Browse the home feed, jump between artist shops, and keep one checkout for every capsule.
      </p>
      <div className="mt-4 flex flex-wrap gap-3">
        <Link
          href="/"
          className="inline-flex min-h-[44px] items-center justify-center rounded-xl bg-[#2D6BFF] px-5 text-[13px] font-semibold text-white shadow-[0_12px_36px_-14px_rgba(45,107,255,0.75)] transition-[transform,box-shadow] hover:shadow-[0_14px_40px_-12px_rgba(45,107,255,0.82)] active:scale-[0.98]"
        >
          Back to Salvya home
        </Link>
      </div>
    </section>
  );
}
