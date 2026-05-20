import { SalvyaErrorPage } from "@/components/errors/SalvyaErrorPage";

/** Unmatched routes outside `[locale]` — plain links to default locale. */
export default function RootNotFoundPage() {
  return <SalvyaErrorPage variant="notFound" locale="en" plainLinks />;
}
