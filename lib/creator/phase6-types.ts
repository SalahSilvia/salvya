export type ViralStage = "cold" | "warming" | "hot" | "viral" | "saturated";

export type ViralityPrediction = {
  expectedPeakTime: string | null;
  expectedRevenueMultiplier: number;
};

export type ViralitySignals = {
  ctrVelocity: number;
  conversionAcceleration: number;
  engagementDensity: number;
  repeatClickClusters: number;
  momentumGrowthRate: number;
};

export type ViralitySnapshot = {
  productId: string | null;
  linkId: string | null;
  productTitle: string | null;
  viralScore: number;
  viralStage: ViralStage;
  prediction: ViralityPrediction;
  signals: ViralitySignals;
  updatedAt: string;
};

export type RankTier = "bronze" | "silver" | "gold" | "diamond";

export type GrowthScoreSnapshot = {
  growthScore: number;
  rankTier: RankTier;
  revenueGrowthPct: number;
  ctrTrendPct: number;
  consistencyDays: number;
  viralityComponent: number;
  weekProgression: { week: string; score: number }[];
  updatedAt: string;
};

export type ContentStrategy = {
  bestPostingHour: number;
  bestPostingWeekday: number;
  recommendedProductId: string | null;
  recommendedProductTitle: string;
  campaignSuggestion: string;
  captionHooks: string[];
  insights: string[];
};

export type BoostOpportunity = {
  productId: string;
  productTitle: string;
  changePct24h: number;
  message: string;
  trackingCode?: string;
};

export type PersonalizedFeedItem = {
  type: "product" | "campaign" | "link";
  id: string;
  title: string;
  href: string;
  score: number;
  reason: string;
};

export type LeaderboardEntry = {
  rank: number;
  creatorId: string;
  displayName: string;
  growthScore: number;
  revenueMinor: number;
  viralScore: number;
  conversionRate: number;
  rankTier: RankTier;
  badges: string[];
};

export type CreatorGrowthIntelligence = {
  virality: {
    overallScore: number;
    stage: ViralStage;
    prediction: ViralityPrediction;
    topProducts: ViralitySnapshot[];
  };
  growth: GrowthScoreSnapshot;
  contentStrategy: ContentStrategy;
  boostOpportunities: BoostOpportunity[];
  personalizedFeed: PersonalizedFeedItem[];
};
