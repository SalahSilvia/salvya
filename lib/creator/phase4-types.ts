export type CreatorCampaignStatus = "active" | "paused" | "ended";

export type CreatorCampaign = {
  id: string;
  name: string;
  status: CreatorCampaignStatus;
  budgetOptional: number | null;
  startDate: string | null;
  endDate: string | null;
  createdAt: string;
  linkCount: number;
  totalClicks: number;
  totalOrders: number;
  revenueMinor: number;
  conversionRate: number;
};

export type CreatorCampaignLinkRow = {
  id: string;
  campaignId: string;
  creatorProductLinkId: string;
  trackingCodeVariant: string;
  clicks: number;
  orders: number;
  revenueMinor: number;
  trackingCode?: string;
  productTitle?: string;
};

export type CreatorInsightDaily = {
  insightDate: string;
  clicks: number;
  orders: number;
  conversionRate: number;
  earningsMinor: number;
  topProductId: string | null;
  topProductTitle: string | null;
  anomalyScore: number;
  forecast7dMinor: number;
  forecast30dMinor: number;
  forecastConfidence: number;
  recommendationText: string;
  bestPostHour: number | null;
  viralScore: number;
  weekOverWeekPct: number | null;
};

export type CreatorPayoutRequestRow = {
  id: string;
  amountMinor: number;
  currency: string;
  status: string;
  method: string;
  createdAt: string;
};

export type CampaignAnalyticsPayload = {
  campaign: CreatorCampaign;
  links: CreatorCampaignLinkRow[];
  hourHeatmap: { hour: number; clicks: number; orders: number }[];
  topLink: CreatorCampaignLinkRow | null;
};
