import type { Metadata } from "next";
import { redirectLocalized } from "@/lib/i18n/server-redirect";
import { getServerSalvyaUser } from "@/lib/auth/get-user-role";
import { isAdminCapable } from "@/lib/auth/roles";
import { loginHref } from "@/lib/auth/login-href";

export const metadata: Metadata = {
  title: "Sentry test",
  robots: { index: false, follow: false },
};

/** Admin-only Sentry verification page (not linked in storefront nav). */
export default async function SentryExampleLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSalvyaUser();

  if (!session) {
    return redirectLocalized(loginHref("/sentry-example-page"));
  }

  if (!isAdminCapable(session.role)) {
    return redirectLocalized("/403");
  }

  return children;
}
