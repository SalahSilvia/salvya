export const NOTIFICATIONS_MAX_ITEMS = 120;

export type InAppNotifKind = "order" | "drop" | "account" | "news";

export type InAppNotifContext =
  | {
      type: "bag_item";
      itemName: string;
      artistName?: string;
      imageUrl?: string;
    }
  | {
      type: "like_item";
      itemName: string;
      imageUrl?: string;
    }
  | {
      type: "follow_artist";
      artistName: string;
      artistSlug: string;
      avatarUrl: string;
    }
  | {
      type: "order";
      orderNumber?: string;
    }
  | { type: "account" }
  | { type: "news" }
  | { type: "generic" };

export type InAppNotificationV1 = {
  v: 1;
  id: string;
  kind: InAppNotifKind;
  title: string;
  body: string;
  href?: string;
  createdAt: string;
  read: boolean;
  /** Rich inbox row — bag item, artist follow, etc. */
  context?: InAppNotifContext;
};
export type NotificationPrefsV1 = {
  v: 1;
  orderUpdates: boolean;
  dropAlerts: boolean;
  accountSecurity: boolean;
  salvyaNews: boolean;
  browserPushOptIn: boolean;
};

export type NotificationSnapshot = {
  items: InAppNotificationV1[];
  prefs: NotificationPrefsV1;
};
