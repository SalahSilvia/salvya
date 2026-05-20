import type { InAppNotifContext, InAppNotificationV1 } from "@/lib/notifications/types";

export type { InAppNotifContext } from "@/lib/notifications/types";

function isRecord(x: unknown): x is Record<string, unknown> {
  return typeof x === "object" && x !== null;
}

export function sanitizeNotificationContext(raw: unknown): InAppNotifContext | undefined {
  if (!isRecord(raw) || typeof raw.type !== "string") return undefined;

  switch (raw.type) {
    case "bag_item":
      if (typeof raw.itemName !== "string" || !raw.itemName.trim()) return undefined;
      return {
        type: "bag_item",
        itemName: raw.itemName.trim(),
        artistName: typeof raw.artistName === "string" ? raw.artistName.trim() : undefined,
        imageUrl: typeof raw.imageUrl === "string" ? raw.imageUrl.trim() : undefined,
      };
    case "like_item":
      if (typeof raw.itemName !== "string" || !raw.itemName.trim()) return undefined;
      return {
        type: "like_item",
        itemName: raw.itemName.trim(),
        imageUrl: typeof raw.imageUrl === "string" ? raw.imageUrl.trim() : undefined,
      };
    case "follow_artist":
      if (
        typeof raw.artistName !== "string" ||
        typeof raw.artistSlug !== "string" ||
        typeof raw.avatarUrl !== "string"
      ) {
        return undefined;
      }
      return {
        type: "follow_artist",
        artistName: raw.artistName.trim(),
        artistSlug: raw.artistSlug.trim(),
        avatarUrl: raw.avatarUrl.trim(),
      };
    case "order":
      return {
        type: "order",
        orderNumber: typeof raw.orderNumber === "string" ? raw.orderNumber.trim() : undefined,
      };
    case "account":
      return { type: "account" };
    case "news":
      return { type: "news" };
    case "generic":
      return { type: "generic" };
    default:
      return undefined;
  }
}

/** Resolve rich UI context for legacy rows saved before `context` existed. */
export function inferNotificationContext(n: InAppNotificationV1): InAppNotifContext {
  if (n.context) return n.context;

  if (n.id.startsWith("bag-") || /added to your bag/i.test(n.title)) {
    const itemName = n.body.split("—")[0]?.trim() || n.body.split(" is ")[0]?.trim() || n.title;
    return { type: "bag_item", itemName };
  }
  if (n.id.startsWith("follow-")) {
    const slug = n.id.replace(/^follow-/, "");
    const artistName = n.title.replace(/^Following\s+/i, "").trim() || slug;
    return {
      type: "follow_artist",
      artistName,
      artistSlug: slug,
      avatarUrl: `/api/artist-avatar/${slug}`,
    };
  }
  if (n.id.startsWith("like-") || /saved to likes/i.test(n.title)) {
    return { type: "like_item", itemName: n.body.split("—")[0]?.trim() || n.title };
  }
  if (n.kind === "order") {
    const m = n.title.match(/order\s+([A-Z0-9-]+)/i);
    return { type: "order", orderNumber: m?.[1] };
  }
  if (n.kind === "account") return { type: "account" };
  if (n.kind === "news") return { type: "news" };
  return { type: "generic" };
}

export function shortItemName(name: string, max = 40): string {
  const t = name.trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max - 1).trim()}…`;
}
