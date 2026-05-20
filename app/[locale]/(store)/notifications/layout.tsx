import type { Metadata } from "next";
import { buildPrivatePageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPrivatePageMetadata({
  title: "Notifications",
  description: "Order and drop alerts on Salvya.",
  path: "/notifications",
});

export default function NotificationsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
