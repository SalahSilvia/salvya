import type { InAppNotifContext } from "@/lib/notifications/context";
import { shortItemName } from "@/lib/notifications/context";
import type { InAppNotifKind } from "@/lib/notifications/types";

export const CUSTOMER_NOTIFICATION_REQUEST = "salvya-customer-notification-request";

export type CustomerNotificationRequest = {
  id: string;
  kind: InAppNotifKind;
  title: string;
  body: string;
  href?: string;
  context?: InAppNotifContext;
};

export function requestCustomerNotification(payload: CustomerNotificationRequest): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent(CUSTOMER_NOTIFICATION_REQUEST, {
      detail: payload,
    }),
  );
}

export function notifyBagItemAdded(input: {
  displayTitle: string;
  artistName: string;
  artistSlug: string;
  itemSlug: string;
  productKind: "hoodie" | "tshirt";
  colorLabel?: string;
  size?: string;
  imageUrl?: string;
}): void {
  const itemName = shortItemName(input.displayTitle);
  const variant = [input.size, input.colorLabel].filter(Boolean).join(" · ");
  requestCustomerNotification({
    id: `bag-${input.artistSlug}-${input.itemSlug}-${Date.now()}`,
    kind: "drop",
    title: "Added to your bag",
    body: variant ? `${itemName} · ${variant}` : itemName,
    href: "/preview-bag",
    context: {
      type: "bag_item",
      itemName,
      artistName: input.artistName,
      imageUrl: input.imageUrl ?? `/api/artist-avatar/${input.artistSlug}`,
    },
  });
}

export function notifyLikedItem(input: {
  title: string;
  href: string;
  imageSrc?: string;
}): void {
  const itemName = shortItemName(input.title);
  requestCustomerNotification({
    id: `like-${input.href.replace(/\W+/g, "-").slice(0, 56)}`,
    kind: "drop",
    title: "Saved to your likes",
    body: itemName,
    href: "/likes",
    context: {
      type: "like_item",
      itemName,
      imageUrl: input.imageSrc,
    },
  });
}

export function notifyFollowedArtist(artistName: string, slug: string, avatarUrl: string): void {
  requestCustomerNotification({
    id: `follow-${slug}`,
    kind: "drop",
    title: "You're following",
    body: `Drop alerts from ${artistName} land here first.`,
    href: `/artist/${slug}`,
    context: {
      type: "follow_artist",
      artistName,
      artistSlug: slug,
      avatarUrl,
    },
  });
}

export function notifyOrderPlaced(orderNumber: string): void {
  requestCustomerNotification({
    id: `order-${orderNumber}`,
    kind: "order",
    title: "Order confirmed",
    body: `${orderNumber} — we're preparing your pieces.`,
    href: "/track-order",
    context: { type: "order", orderNumber },
  });
}

export function notifyProfileUpdated(): void {
  requestCustomerNotification({
    id: `account-profile-${new Date().toISOString().slice(0, 10)}`,
    kind: "account",
    title: "Profile updated",
    body: "Your Salvya account details were saved.",
    href: "/account/profile",
    context: { type: "account" },
  });
}

export function notifyWelcomeBack(): void {
  requestCustomerNotification({
    id: "account-welcome-back",
    kind: "account",
    title: "Welcome back",
    body: "Your bag, likes, and alerts are synced on this device.",
    href: "/account",
    context: { type: "account" },
  });
}

export function notifyBlogDigest(): void {
  requestCustomerNotification({
    id: `news-blog-${new Date().toISOString().slice(0, 7)}`,
    kind: "news",
    title: "New on the blog",
    body: "Streetwear stories and drop culture from Salvya.",
    href: "/blogs",
    context: { type: "news" },
  });
}
