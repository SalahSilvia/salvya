import type { Metadata } from "next";
import { Suspense } from "react";
import { getLocale } from "next-intl/server";
import { BlogIndexExperience } from "@/components/blog/BlogIndexExperience";
import { SalvyaBlogIndexSkeleton } from "@/components/skeleton";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { getPublishedBlogPosts } from "@/lib/blog/get-posts";
import { collectionPageJsonLd } from "@/lib/seo/json-ld";
import { JsonLd } from "@/components/seo/JsonLd";
import { resolveSalvyaLocale } from "@/lib/seo/site";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  return buildPageMetadata({
    title: "Stories, drops & streetwear culture",
    description:
      "Read Salvya editorials on artist merch, limited drops, on-model fit guides, creator culture, and premium streetwear.",
    path: "/blogs",
    locale,
    keywords: [
      "artist merch blog",
      "streetwear editorials",
      "on-model fit guide",
      "limited drops",
      "Salvya journal",
    ],
  });
}

function BlogsIndexFallback() {
  return <SalvyaBlogIndexSkeleton />;
}

type PageProps = { params: Promise<{ locale: string }> };

export default async function BlogsIndexPage({ params }: PageProps) {
  const { locale: localeParam } = await params;
  const locale = resolveSalvyaLocale(localeParam);
  const posts = await getPublishedBlogPosts(48);
  return (
    <>
      <JsonLd
        data={collectionPageJsonLd({
          name: "Salvya Journal",
          description: "Editorials and on-model fit guides for official artist merch.",
          path: "/blogs",
          locale,
        })}
      />
      <Suspense fallback={<BlogsIndexFallback />}>
        <BlogIndexExperience posts={posts} locale={localeParam} />
      </Suspense>
    </>
  );
}
