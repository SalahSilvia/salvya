import { fetchAllPublishedProducts } from "@/lib/catalog/fetch-published-products";
import { resolveCreatorCardImageUrl } from "@/lib/catalog/creator-card-image";
import { CreatorProductsExperience } from "@/components/creator/CreatorProductsExperience";
import { createServiceSupabase } from "@/lib/supabase/service";
import { getServerSalvyaUser } from "@/lib/auth/get-user-role";

export const metadata = {
  title: "Promote products — Salvya Creators",
  description: "Select catalog products and generate trackable promo links.",
};

export default async function CreatorProductsPage() {
  const [products, session] = await Promise.all([fetchAllPublishedProducts(120), getServerSalvyaUser()]);
  const service = createServiceSupabase();
  let promotedProductIds: string[] = [];

  if (service && session) {
    const { data } = await service
      .from("creator_product_links")
      .select("product_id")
      .eq("creator_id", session.id);
    promotedProductIds = (data ?? []).map((r) => r.product_id as string);
  }

  const productsWithImages = products.map((p) => ({
    ...p,
    cardImageUrl: resolveCreatorCardImageUrl(p),
  }));

  return (
    <CreatorProductsExperience products={productsWithImages} promotedProductIds={promotedProductIds} />
  );
}
