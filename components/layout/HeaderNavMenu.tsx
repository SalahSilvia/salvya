"use client";

import { MenuOverlay } from "@/components/layout/menu/MenuOverlay";

type Props = {
  triggerClassName: string;
};

export function HeaderNavMenu({ triggerClassName }: Props) {
  return <MenuOverlay triggerClassName={triggerClassName} />;
}
