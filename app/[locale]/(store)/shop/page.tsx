import { ShopWithMemberNav } from "@/components/shop/ShopWithMemberNav";
import { getPublishedProductModelBlogPosts } from "@/lib/blog/get-posts";
import { sortShopJournalPosts } from "@/lib/blog/sort-shop-journal-posts";
import { fetchPublishedProductsByArtist } from "@/lib/catalog/fetch-published-products";
import { getMarketContext } from "@/lib/market/get-market-context";
import { buildShopSections } from "@/lib/shop/build-shop-sections";

type PageProps = { params: Promise<{ locale: string }> };

/** Guest shop — published catalog for featured artists (Supabase only). */
export default async function ShopPage({ params }: PageProps) {
  const { locale } = await params;
  const [published, market, rawBlogPosts] = await Promise.all([
    fetchPublishedProductsByArtist("elgrandetoto"),
    getMarketContext(),
    getPublishedProductModelBlogPosts(10),
  ]);
  const shop = buildShopSections(published, market);
  const deprioritizeInSlug = shop.spotlight?.slug ? [shop.spotlight.slug] : undefined;
  const blogPosts = sortShopJournalPosts(rawBlogPosts, { deprioritizeInSlug });

  return <ShopWithMemberNav shop={shop} blogPosts={blogPosts} locale={locale} />;
}
