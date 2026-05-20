"use client";

import type { ReactNode } from "react";
import { CreatorCommandPalette, useCreatorCommandPalette } from "@/components/creator/CreatorCommandPalette";
import { CreatorNotificationProvider } from "@/components/creator/CreatorNotificationProvider";
import { CreatorStudioShell } from "@/components/creator/CreatorStudioShell";

/**
 * Creator SaaS domain shell — loaded as a separate async chunk from storefront.
 */
export function CreatorDomainShell({ children }: { children: ReactNode }) {
  const palette = useCreatorCommandPalette();

  return (
    <CreatorNotificationProvider>
      <CreatorStudioShell onOpenCommand={() => palette.setOpen(true)}>{children}</CreatorStudioShell>
      <CreatorCommandPalette open={palette.open} onClose={palette.close} />
    </CreatorNotificationProvider>
  );
}
