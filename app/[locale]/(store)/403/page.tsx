import { SalvyaErrorPage } from "@/components/errors/SalvyaErrorPage";

type Props = {
  params: Promise<{ locale: string }>;
};

export const metadata = {
  title: "Access denied — Salvya",
};

export default async function ForbiddenPage({ params }: Props) {
  const { locale } = await params;
  return <SalvyaErrorPage variant="forbidden" locale={locale} showReportLink={false} />;
}
