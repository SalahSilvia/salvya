import type { ReactNode } from "react";
import { getTranslations } from "next-intl/server";
import { MemberRouteGate } from "@/components/member/MemberRouteGate";

/** Server wrapper — resolves copy without `useTranslations` on the client gate. */
export async function MemberRouteGateServer({ children }: { children: ReactNode }) {
  const t = await getTranslations("common");
  return <MemberRouteGate redirectingLabel={t("redirectingSignIn")}>{children}</MemberRouteGate>;
}
