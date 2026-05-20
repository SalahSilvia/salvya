import type { Metadata } from "next";
import { getLocale } from "next-intl/server";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { ROBOTS_NOINDEX_FOLLOW } from "@/lib/seo/robots";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  return buildPageMetadata({
    title: "Report a problem",
    description:
      "Tell Salvya what went wrong — bugs, checkout, delivery, or app issues. Help us improve your shopping experience.",
    path: "/report-problem",
    locale,
    robots: ROBOTS_NOINDEX_FOLLOW,
  });
}

export default function ReportProblemLayout({ children }: { children: React.ReactNode }) {
  return children;
}
