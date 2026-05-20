import { DocsIndexClient } from "@/components/docs/DocsIndexClient";
import { DocsShell } from "@/components/docs/DocsShell";
import { DOC_CATEGORIES } from "@/lib/docs/categories";
import { getAllDocs } from "@/lib/docs/loader";

export default function DocsIndexPage() {
  const articles = getAllDocs();
  return (
    <DocsShell breadcrumbs={[{ label: "Docs" }]}>
      <DocsIndexClient categories={DOC_CATEGORIES} articles={articles} />
    </DocsShell>
  );
}
