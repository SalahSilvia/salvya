export type CreatorEarningsSummary = {
  totalMinor: number;
  pendingMinor: number;
  availableMinor: number;
  paidMinor: number;
  voidMinor: number;
  currency: string;
};

export type CreatorTodayMetrics = {
  clicks: number;
  orders: number;
  revenueMinor: number;
};

export type CreatorDashboardStats = {
  promotedCount: number;
  activeLinks: number;
  totalClicks: number;
  totalOrders: number;
  totalViews: number;
  conversionRate: number;
  today: CreatorTodayMetrics;
  earnings: CreatorEarningsSummary;
  topProduct: {
    title: string;
    clicks: number;
    trackingCode: string;
    productId: string;
  } | null;
  recentActivity: CreatorRecentActivityItem[];
};

export type CreatorRecentActivityItem = {
  id: string;
  eventType: "click" | "order";
  trackingCode: string;
  productTitle: string;
  productId: string | null;
  orderId: string | null;
  createdAt: string;
};

export type CreatorLinkPerformanceRow = {
  linkId: string;
  trackingCode: string;
  productId: string;
  productTitle: string;
  clicks: number;
  orders: number;
  conversionRate: number;
  revenueMinor: number;
};

export type CreatorAnalyticsPayload = {
  totalClicks: number;
  totalOrders: number;
  conversionRate: number;
  totalRevenueMinor: number;
  currency: string;
  today: CreatorTodayMetrics;
  links: CreatorLinkPerformanceRow[];
  hourHeatmap?: { hour: number; clicks: number; orders: number }[];
  campaigns?: { id: string; name: string; status: string; totalClicks: number; totalOrders: number; revenueMinor: number }[];
  selectedCampaignId?: string | null;
};

export type CreatorWalletCommissionProfile = {
  followersCount: number;
  perItemDh: number;
  tierLabel: string;
  currency: "MAD";
};

export type CreatorWalletPayload = {
  balances: CreatorEarningsSummary & {
    clearancePendingMinor?: number;
    pendingLockMinor?: number;
    lifetimeEarningsMinor?: number;
  };
  walletSource?: "cache" | "computed";
  walletUpdatedAt?: string | null;
  minPayoutMinor?: number;
  scheduledPayoutDate?: string;
  payoutRequests?: {
    id: string;
    amountMinor: number;
    currency: string;
    status: string;
    method: string;
    createdAt: string;
  }[];
  payouts: {
    id: string;
    amountMinor: number;
    currency: string;
    status: string;
    method: string;
    reference: string | null;
    createdAt: string;
  }[];
  commissionProfile?: CreatorWalletCommissionProfile;
};
