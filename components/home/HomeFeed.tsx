"use client";

import { AmbientBackground } from "./AmbientBackground";
import { AppHeader } from "./AppHeader";
import { AppFooter } from "./AppFooter";
import { ArtistsCarouselCinematic } from "./ArtistsCarouselCinematic";
import { HomeActiveOrderTrack } from "./HomeActiveOrderTrack";
import { ImmersiveHero } from "./ImmersiveHero";
import { ScrollProgress } from "./ScrollProgress";
import { artists } from "@/lib/site-data";

export function HomeFeed() {
  return (
    <div className="relative min-h-[100dvh] text-white">
      <AmbientBackground />
      <AppHeader />
      <ScrollProgress />

      <ImmersiveHero />

      <div className="relative z-10 mx-auto w-full max-w-md">
        <main className="pb-2">
          <HomeActiveOrderTrack />
          <ArtistsCarouselCinematic artists={artists} />
        </main>
        <AppFooter />
      </div>
    </div>
  );
}
