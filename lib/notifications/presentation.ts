import { inferNotificationContext } from "@/lib/notifications/context";
import type { InAppNotificationV1 } from "@/lib/notifications/types";

export function notificationHeadline(n: InAppNotificationV1): string {
  const ctx = inferNotificationContext(n);
  switch (ctx.type) {
    case "bag_item":
      return "Added to your bag";
    case "like_item":
      return "Saved to likes";
    case "follow_artist":
      return `Following ${ctx.artistName}`;
    case "order":
      return ctx.orderNumber ? `Order ${ctx.orderNumber}` : n.title;
    default:
      return n.title;
  }
}

export function notificationSubtitle(n: InAppNotificationV1): string | null {
  const ctx = inferNotificationContext(n);
  switch (ctx.type) {
    case "bag_item":
      return ctx.itemName;
    case "like_item":
      return ctx.itemName;
    case "follow_artist":
      return "Artist profile · drop alerts on";
    default:
      return null;
  }
}

export function notificationDetail(n: InAppNotificationV1): string {
  const ctx = inferNotificationContext(n);
  if (ctx.type === "follow_artist") {
    return `You will see ${ctx.artistName}'s drops and restocks here first.`;
  }
  if (ctx.type === "bag_item" && ctx.artistName) {
    return n.body.includes("·") ? n.body : `${ctx.artistName} · ${n.body}`;
  }
  return n.body;
}
