import type { InAppNotificationV1, NotificationPrefsV1 } from "@/lib/notifications/types";

export const defaultNotificationPrefs = (): NotificationPrefsV1 => ({
  v: 1,
  orderUpdates: true,
  dropAlerts: true,
  accountSecurity: true,
  salvyaNews: true,
  browserPushOptIn: false,
});

export function defaultNotificationSeed(now = new Date()): InAppNotificationV1[] {
  const iso = (d: Date) => d.toISOString();
  return [
    {
      v: 1,
      id: "seed-order-preview",
      kind: "order",
      title: "Order preview · packing soon",
      body: "When Salvya dispatch opens on your account, packing and tracking updates will land here first.",
      href: "/track-order",
      createdAt: iso(new Date(now.getTime() - 86_400_000)),
      read: false,
      context: { type: "order" },
    },
    {
      v: 1,
      id: "seed-drop-elgt",
      kind: "drop",
      title: "Drop radar · ElGrandeToto",
      body: "Limited runs move fast. Turn on drop alerts below so you do not miss the next restock story.",
      href: "/shop",
      createdAt: iso(new Date(now.getTime() - 172_800_000)),
      read: true,
      context: {
        type: "follow_artist",
        artistName: "ElGrandeToto",
        artistSlug: "elgrandetoto",
        avatarUrl: "/api/artist-avatar/elgrandetoto",
      },
    },
    {
      v: 1,
      id: "seed-account-inbox",
      kind: "account",
      title: "Your Salvya inbox",
      body: "Security tips, confirmations, and account changes sync to every device you use.",
      href: "/account/profile",
      createdAt: iso(new Date(now.getTime() - 3_600_000)),
      read: false,
      context: { type: "account" },
    },
  ];
}
