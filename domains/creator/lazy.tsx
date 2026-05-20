"use client";

import dynamic from "next/dynamic";
import { DomainLoadingFallback } from "@/lib/mfe/DomainLoadingFallback";

function CreatorLoading() {
  return <DomainLoadingFallback domain="creator" />;
}

/** Heavy dashboard — charts, AI growth, analytics panels. */
export const LazyCreatorDashboard = dynamic(
  () => import("@/components/creator/CreatorDashboardMvp").then((m) => m.CreatorDashboardMvp),
  { loading: CreatorLoading, ssr: false },
);

export const LazyCreatorAnalytics = dynamic(
  () =>
    import("@/components/creator/CreatorAnalyticsExperience").then((m) => m.CreatorAnalyticsExperience),
  { loading: CreatorLoading, ssr: false },
);

export const LazyCreatorWallet = dynamic(
  () => import("@/components/creator/CreatorWalletExperience").then((m) => m.CreatorWalletExperience),
  { loading: CreatorLoading, ssr: false },
);

export const LazyCreatorGrowthPanels = dynamic(
  () => import("@/components/creator/CreatorGrowthPanels").then((m) => m.CreatorGrowthPanels),
  { loading: () => null, ssr: false },
);

export const LazyCreatorPhase6Panels = dynamic(
  () => import("@/components/creator/CreatorPhase6Panels").then((m) => m.CreatorPhase6Panels),
  { loading: () => null, ssr: false },
);

export const LazyCreatorLeaderboard = dynamic(
  () =>
    import("@/components/creator/CreatorLeaderboardExperience").then((m) => m.CreatorLeaderboardExperience),
  { loading: CreatorLoading, ssr: false },
);
