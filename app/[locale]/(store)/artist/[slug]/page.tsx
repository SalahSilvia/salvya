import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { StorefrontProductCarousel } from "@/components/shop/StorefrontProductCarousel";
import { fetchPublishedProductsByArtist } from "@/lib/catalog/fetch-published-products";
import { toCarouselItem } from "@/lib/catalog/storefront-product";
import { getMarketContext } from "@/lib/market/get-market-context";
import { getStorefrontArtistBySlug, getStorefrontArtists } from "@/lib/artists/get-artists";
import { rankSuggestedArtists } from "@/lib/discovery/artist-suggestions";
import type { ArtistStatusTag } from "@/lib/site-data";
import { ArtistCoverImage } from "@/components/artist/ArtistCoverImage";
import { ArtistPageActions } from "@/components/artist/ArtistPageActions";
import { ArtistProfileFollow } from "@/components/artist/ArtistProfileFollow";
import { ArtistSectionNav } from "@/components/artist/ArtistSectionNav";
import {
  ArtistAboutPreview,
  ArtistDropBanner,
  ArtistExploreSalvyaCta,
} from "@/components/artist/ArtistShelfExtras";
import { SuggestedArtistsCarousel } from "@/components/artist/SuggestedArtistsCarousel";
import { ArtistViewAnalytics } from "@/components/analytics/ArtistViewAnalytics";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { artistProfileJsonLd, breadcrumbJsonLd } from "@/lib/seo/json-ld";

type Props = {
  params: Promise<{ locale: string; slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const artist = await getStorefrontArtistBySlug(slug);
  if (!artist || artist.statusTag === "COMING SOON") {
    return buildPageMetadata({
      title: "Artist shop",
      description: "Official artist merch on Salvya.",
      path: `/artist/${slug}`,
      locale,
    });
  }
  return buildPageMetadata({
    title: `${artist.name} — Official merch & drops`,
    description: artist.aboutLead,
    path: `/artist/${artist.slug}`,
    locale,
    image: artist.coverImage || artist.profileImage,
    imageAlt: `${artist.name} on Salvya`,
    keywords: [`${artist.name} merch`, "official artist shop", "limited drops", "Salvya"],
  });
}

function statusPill(tag: ArtistStatusTag) {
  if (tag === "LIMITED DROP") {
    return {
      label: "Limited drop",
      className:
        "border-[#2D6BFF]/40 bg-[#2D6BFF]/18 text-[#b8c9ff] shadow-[0_0_20px_-8px_rgba(45,107,255,0.45)]",
    };
  }
  if (tag === "COMING SOON") {
    return { label: "Soon", className: "border-white/12 bg-white/[0.07] text-white/50" };
  }
  return {
    label: "In stock",
    className:
      "border-emerald-400/30 bg-emerald-500/12 text-emerald-100/95 shadow-[0_0_16px_-10px_rgba(52,211,153,0.35)]",
  };
}

export default async function ArtistPage({ params }: Props) {
  const { locale, slug } = await params;
  const [artist, allArtists] = await Promise.all([getStorefrontArtistBySlug(slug), getStorefrontArtists()]);

  if (!artist || artist.statusTag === "COMING SOON") {
    notFound();
  }

  const pill = statusPill(artist.statusTag);

  const [published, market] = await Promise.all([
    fetchPublishedProductsByArtist(artist.slug),
    getMarketContext(),
  ]);
  const hoodieCarousel = published
    .filter((p) => p.productKind === "hoodie")
    .map((p) => toCarouselItem(p, market));
  const tshirtCarousel = published
    .filter((p) => p.productKind === "tshirt")
    .map((p) => toCarouselItem(p, market));

  const showHoodieSection = hoodieCarousel.length > 0;
  const showTshirtSection = tshirtCarousel.length > 0;

  const suggestedArtists = rankSuggestedArtists(artist.slug, allArtists);

  return (
    <>
      <JsonLd
        data={[
          artistProfileJsonLd(artist, locale),
          breadcrumbJsonLd(
            [
              { name: "Shop", path: "/shop" },
              { name: artist.name, path: `/artist/${artist.slug}` },
            ],
            locale,
          ),
        ]}
      />
      <div className="min-h-dvh bg-[#050508] text-white">
      <ArtistViewAnalytics slug={artist.slug} />
      <div className="mx-auto w-full max-w-[820px]">
        <div className="relative aspect-[820/360] w-full">
          <div className="absolute inset-0 overflow-hidden rounded-b-[2rem]">
            <ArtistCoverImage
              coverSrc={artist.coverImage}
              fallbackSrc={artist.profileImage}
              alt=""
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div
              className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${artist.gradient} opacity-35 mix-blend-multiply`}
              aria-hidden
            />
            <div
              className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#050508] via-[#050508]/6 to-black/20"
              aria-hidden
            />
            <div className="grain-overlay pointer-events-none absolute inset-0 opacity-[0.055]" aria-hidden />
          </div>

          <div
            className="pointer-events-none absolute inset-x-0 top-0 z-30 flex items-center justify-between gap-3 px-4"
            style={{ paddingTop: "max(0.75rem, env(safe-area-inset-top))" }}
          >
            <div className="pointer-events-auto shrink-0">
              <Link
                href="/"
                className="inline-flex h-10 items-center gap-2 rounded-full border border-white/[0.14] bg-black/40 px-3.5 text-[13px] font-medium text-white/92 shadow-[0_8px_32px_-12px_rgba(0,0,0,0.65)] backdrop-blur-md transition-[transform,colors,background-color] hover:bg-black/55 hover:text-white active:scale-[0.98]"
              >
                <span aria-hidden className="text-[15px] leading-none opacity-90">
                  ←
                </span>
                Home
              </Link>
            </div>
            <div className="pointer-events-auto flex shrink-0 items-center gap-2">
              <span
                className={`rounded-full border px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.14em] backdrop-blur-md sm:px-3 sm:text-[10px] sm:tracking-[0.16em] ${pill.className}`}
              >
                {pill.label}
              </span>
              <ArtistPageActions
                slug={artist.slug}
                artistName={artist.name}
                profileImage={artist.profileImage}
                aboutLead={artist.aboutLead}
                aboutMore={artist.aboutMore}
              />
            </div>
          </div>
        </div>

        <div className="relative z-[2] -mt-14 flex flex-col items-center px-5 pb-8 pt-0 sm:-mt-16 sm:pb-10">
          <div
            className="relative h-[7.5rem] w-[7.5rem] shrink-0 overflow-hidden rounded-full border-[3px] border-[#050508] bg-[#0a0a0c] ring-1 ring-white/[0.12]"
            style={{
              boxShadow:
                "0 20px 50px -16px rgba(0,0,0,0.9), inset 0 0 0 1px rgba(255,255,255,0.06), 0 0 48px -22px rgba(45,107,255,0.28)",
            }}
          >
            <img
              src={artist.profileImage}
              alt=""
              className="h-full w-full object-cover"
              decoding="async"
            />
          </div>
          <h1 className="mt-4 max-w-[18rem] text-center text-[1.85rem] font-semibold leading-[1.08] tracking-[-0.035em] sm:max-w-none sm:text-[2rem]">
            <span className="bg-gradient-to-b from-white via-white to-white/75 bg-clip-text text-transparent">
              {artist.name}
            </span>
          </h1>
          <p className="mt-3 max-w-[21rem] text-center text-[14px] font-light leading-relaxed tracking-[0.01em] text-white/48 sm:text-[15px]">
            Official Salvya shop for this artist — same secure checkout as the rest of the store.
          </p>
          <ArtistProfileFollow
            slug={artist.slug}
            artistName={artist.name}
            profileImage={artist.profileImage}
          />
        </div>
      </div>

      <main className="mx-auto w-full max-w-md px-5 pb-[max(2.5rem,env(safe-area-inset-bottom))] pt-6 sm:pt-8">
        <ArtistDropBanner statusTag={artist.statusTag} artistName={artist.name} />
        <ArtistSectionNav
          showHoodie={showHoodieSection}
          showTshirt={showTshirtSection}
          showSuggestions={suggestedArtists.length > 0}
        />

        {!showHoodieSection && !showTshirtSection ? (
          <section className="mb-10 scroll-mt-24 rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6 text-center">
            <p className="text-[15px] font-semibold text-white">No pieces live yet</p>
            <p className="mt-2 text-[13px] leading-relaxed text-white/45">
              New drops from {artist.name} land here first — check back soon or browse the full Salvya shop.
            </p>
            <Link
              href="/shop"
              className="mt-5 inline-flex rounded-full border border-white/[0.14] bg-white/[0.06] px-5 py-2.5 text-[13px] font-semibold text-white transition-colors hover:bg-white/[0.1]"
            >
              Browse Salvya shop
            </Link>
          </section>
        ) : null}

        {showHoodieSection ? (
          <section aria-labelledby="hoodie-heading" className="relative mb-10 scroll-mt-24">
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-l from-[#2D6BFF]/45 via-white/[0.08] to-transparent" aria-hidden />
            <div className="relative flex items-end justify-between gap-3 pt-1">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/38">Hoodie</p>
                <h2 id="hoodie-heading" className="mt-2 text-xl font-semibold tracking-[-0.02em] text-white">
                  {artist.name} hoodies
                </h2>
              </div>
              {artist.statusTag === "LIMITED DROP" ? (
                <span
                  className={`shrink-0 rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] backdrop-blur-md ${pill.className}`}
                >
                  {pill.label}
                </span>
              ) : null}
            </div>
            <p className="relative mt-3 text-[14px] leading-relaxed text-white/46">
              Every card is a separate drop from {artist.name}&apos;s shop. Swipe to browse, then tap through
              for the full gallery, sizes, and preview checkout. When we have front and back shots, the back
              print leads the carousel.
            </p>
            <div className="relative -mx-5 mt-5">
              {hoodieCarousel.length > 0 ? (
                <StorefrontProductCarousel items={hoodieCarousel} sectionLabel="hoodies" />
              ) : null}
            </div>
          </section>
        ) : null}

        {showTshirtSection ? (
          <section aria-labelledby="tshirt-heading" className="relative mb-10 scroll-mt-24">
            <div
              className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-l from-[#2D6BFF]/45 via-white/[0.08] to-transparent"
              aria-hidden
            />
            <div className="relative flex items-end justify-between gap-3 pt-1">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/38">T-shirt</p>
                <h2 id="tshirt-heading" className="mt-2 text-xl font-semibold tracking-[-0.02em] text-white">
                  {artist.name} T-shirts
                </h2>
              </div>
              {artist.statusTag === "LIMITED DROP" ? (
                <span
                  className={`shrink-0 rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] backdrop-blur-md ${pill.className}`}
                >
                  {pill.label}
                </span>
              ) : null}
            </div>
            <p className="relative mt-3 text-[14px] leading-relaxed text-white/46">
              Tees that pair with the hoodies above — same drop names, same Salvya fit story. Pick a style
              for photos, sizing, and bag preview. Back artwork shows first when both sides are live.
            </p>
            <div className="relative -mx-5 mt-5">
              {tshirtCarousel.length > 0 ? (
                <StorefrontProductCarousel items={tshirtCarousel} sectionLabel="tees" />
              ) : null}
            </div>
          </section>
        ) : null}

        <ArtistAboutPreview aboutLead={artist.aboutLead} hasAboutMore={Boolean(artist.aboutMore)} />

        {suggestedArtists.length > 0 ? (
          <section
            aria-labelledby="suggested-artists-heading"
            className="relative mt-10 scroll-mt-24 border-t border-white/[0.06] pt-8"
          >
            <div
              className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-l from-[#2D6BFF]/35 via-white/[0.06] to-transparent"
              aria-hidden
            />
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/38">Discover</p>
            <h2 id="suggested-artists-heading" className="mt-2 text-xl font-semibold tracking-[-0.02em] text-white">
              Artists you may like
            </h2>
            <p className="mt-2 max-w-[22rem] text-[14px] leading-relaxed text-white/44">
              Jump to another Salvya shop — ranked by style and drop status. Swipe to see everyone.
            </p>
            <div className="mt-6">
              <SuggestedArtistsCarousel artists={suggestedArtists} />
            </div>
          </section>
        ) : null}

        <ArtistExploreSalvyaCta />
      </main>
    </div>
    </>
  );
}
