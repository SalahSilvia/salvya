"use client";

import { motion, useReducedMotion } from "framer-motion";
import { CreatorMoreHero } from "@/components/creator/more/CreatorMoreHero";
import { CreatorMoreQuickGrid } from "@/components/creator/more/CreatorMoreQuickGrid";
import { CreatorMoreMenuSection, type MoreMenuItem } from "@/components/creator/more/CreatorMoreMenuSection";
import { CreatorMoreSignOut } from "@/components/creator/more/CreatorMoreSignOut";

const GROWTH: MoreMenuItem[] = [
  {
    href: "/creator/analytics",
    icon: "analytics",
    label: "Analytics",
    description: "Clicks, orders, conversion, and link performance",
  },
  {
    href: "/creator/leaderboard",
    icon: "leaderboard",
    label: "Leaderboard",
    description: "Growth score and ranking among creators",
  },
  {
    href: "/creator/notifications",
    icon: "notifications",
    label: "Notifications",
    description: "Orders, payouts, and workspace alerts",
  },
];

const ACCOUNT: MoreMenuItem[] = [
  { href: "/account/profile", icon: "profile", label: "Profile", description: "Name, photo, and public details" },
  { href: "/account/settings", icon: "settings", label: "Settings", description: "Password, email, and preferences" },
  { href: "/creator/wallet", icon: "wallet", label: "Wallet & payouts", description: "Balance, creator pass, and withdrawals" },
];

const DATA: MoreMenuItem[] = [
  {
    href: "/api/creator/export-data",
    icon: "export",
    label: "Export my data (JSON)",
    description: "Download your creator activity archive",
    external: true,
  },
  {
    href: "/api/creator/export-data?format=csv",
    icon: "export",
    label: "Export CSV",
    description: "Spreadsheet-friendly earnings and links export",
    external: true,
  },
];

const SUPPORT: MoreMenuItem[] = [
  {
    href: "/report-problem",
    icon: "report",
    label: "Report a problem",
    description: "Tell us what went wrong so we can fix it",
  },
  {
    href: "/contact",
    icon: "contact",
    label: "Contact us",
    description: "Reach the Salvya support team",
  },
  { href: "/help-center", icon: "help", label: "Help center", description: "FAQs and how-to guides" },
  {
    href: "/terms/creator",
    icon: "terms",
    label: "Creator programme terms",
    description: "Commission rules and programme policies",
  },
];

export function CreatorStudioMorePage() {
  const reduceMotion = useReducedMotion();
  const fade = reduceMotion ? {} : { initial: { opacity: 0 }, animate: { opacity: 1 } };

  return (
    <motion.div className="space-y-8 pb-6" {...fade} transition={{ duration: 0.35 }}>
      <CreatorMoreHero />
      <CreatorMoreQuickGrid />
      <div className="grid gap-8 lg:grid-cols-2">
        <CreatorMoreMenuSection title="Growth" items={GROWTH} index={0} />
        <CreatorMoreMenuSection title="Account" items={ACCOUNT} index={1} />
      </div>
      <CreatorMoreMenuSection title="Data" items={DATA} index={2} />
      <CreatorMoreMenuSection title="Support & contact" items={SUPPORT} index={3} />
      <CreatorMoreSignOut />
    </motion.div>
  );
}
