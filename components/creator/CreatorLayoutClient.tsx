"use client";

import { CreatorLayoutShell } from "@/components/creator/CreatorLayoutShell";

export function CreatorLayoutClient({ children }: { children: React.ReactNode }) {
  return <CreatorLayoutShell>{children}</CreatorLayoutShell>;
}
