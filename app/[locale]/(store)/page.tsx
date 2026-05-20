import { redirectLocalized } from "@/lib/i18n/server-redirect";
import { HomeExperience } from "@/components/home/HomeExperience";
import { getServerSalvyaUser } from "@/lib/auth/get-user-role";
import { canAccessCreatorDashboard } from "@/lib/auth/creator-lifecycle";
import { defaultHomeForRole } from "@/lib/auth/post-login-redirect";
import { getStorefrontArtists } from "@/lib/artists/get-artists";
import { getHomeCatalogCardsAsync, pickHeroBackdrop } from "@/lib/home/home-catalog";

export default async function Home() {
  const session = await getServerSalvyaUser();
  if (!session) {
    await redirectLocalized("/shop");
    return null;
  }

  if (canAccessCreatorDashboard(session.role)) {
    await redirectLocalized("/creator/dashboard");
    return null;
  }

  const hub = defaultHomeForRole(session.role);
  if (hub !== "/") await redirectLocalized(hub);

  const [catalogCards, storefrontArtists] = await Promise.all([
    getHomeCatalogCardsAsync(),
    getStorefrontArtists(),
  ]);
  const heroBackdropSrc = pickHeroBackdrop(catalogCards);

  return (
    <HomeExperience
      catalogCards={catalogCards}
      heroBackdropSrc={heroBackdropSrc}
      storefrontArtists={storefrontArtists}
    />
  );
}
