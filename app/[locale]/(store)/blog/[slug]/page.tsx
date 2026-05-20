import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BlogArticleExperience } from "@/components/blog/BlogArticleExperience";
import { JsonLd } from "@/components/seo/JsonLd";
import { getPublishedBlogPostBySlug, getRelatedBlogPosts } from "@/lib/blog/get-posts";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { articleJsonLd, breadcrumbJsonLd } from "@/lib/seo/json-ld";

type Props = { params: Promise<{ locale: string; slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const post = await getPublishedBlogPostBySlug(slug);
  if (!post) {
    return buildPageMetadata({
      title: "Article not found",
      description: "This story may have moved or been unpublished.",
      path: `/blog/${slug}`,
      locale,
    });
  }
  return buildPageMetadata({
    title: post.seoTitle || post.title,
    description: post.seoDescription || post.excerpt,
    path: `/blog/${post.slug}`,
    locale,
    image: post.coverImage,
    imageAlt: post.title,
    type: "article",
    publishedTime: post.publishedAt ?? post.createdAt,
    modifiedTime: post.updatedAt,
    authors: [post.authorName],
    tags: post.tags,
    keywords: post.tags.length ? post.tags : undefined,
  });
}

export default async function BlogArticlePage({ params }: Props) {
  const { locale, slug } = await params;
  const post = await getPublishedBlogPostBySlug(slug);
  if (!post) notFound();
  const related = await getRelatedBlogPosts(slug, 2);
  return (
    <>
      <JsonLd
        data={[
          articleJsonLd(post, locale),
          breadcrumbJsonLd(
            [
              { name: "Blogs", path: "/blogs" },
              { name: post.title, path: `/blog/${post.slug}` },
            ],
            locale,
          ),
        ]}
      />
      <BlogArticleExperience post={post} related={related} locale={locale} />
    </>
  );
}
