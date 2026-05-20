import type { Metadata } from "next";
import { buildPrivatePageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPrivatePageMetadata({
  title: "Menu",
  description: "Salvya account menu and navigation.",
  path: "/menu",
});

/** Full viewport height so the menu scroll region can flex correctly (guest + signed-in). */
export default function MenuLayout({ children }: { children: React.ReactNode }) {
  return <div className="flex h-dvh max-h-dvh min-h-0 flex-col overflow-hidden">{children}</div>;
}
