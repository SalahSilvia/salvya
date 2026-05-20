"use client";

import { CustomerMenuPage } from "@/components/member/CustomerMenuPage";
import { CreatorMenuPage } from "@/components/member/CreatorMenuPage";
import { useSessionRole } from "@/components/member/useSessionRole";

/** Full-page navigation for signed-in members — creator studio menu when approved. */
export function MenuFullPage() {
  const role = useSessionRole();
  const isCreator = role === "influencer" || role === "admin" || role === "god_admin";
  if (isCreator) return <CreatorMenuPage />;
  return <CustomerMenuPage />;
}
