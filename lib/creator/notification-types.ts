export const CREATOR_NOTIFICATION_TYPES = [
  "order_from_link",
  "link_milestone",
  "campaign_alert",
  "payout_status",
  "fraud_warning",
  "ai_insight",
] as const;

export type CreatorNotificationType = (typeof CREATOR_NOTIFICATION_TYPES)[number];

export type CreatorNotificationRow = {
  id: string;
  creator_id: string;
  type: CreatorNotificationType;
  title: string;
  body: string | null;
  href: string | null;
  metadata: Record<string, unknown>;
  read_at: string | null;
  created_at: string;
};

export type CreatorNotificationDto = {
  id: string;
  type: CreatorNotificationType;
  title: string;
  body: string | null;
  href: string | null;
  metadata: Record<string, unknown>;
  readAt: string | null;
  createdAt: string;
};
