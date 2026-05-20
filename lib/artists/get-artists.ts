import { artists as staticArtists, type ArtistCard } from "@/lib/site-data";
import { rowToArtistCard, type SalvyaArtistRow } from "@/lib/artists/types";
import { getSupabasePublicServerClient } from "@/lib/supabase/server";

function sortArtists(list: ArtistCard[]): ArtistCard[] {
  return [...list].sort((a, b) => a.name.localeCompare(b.name));
}

export async function getStorefrontArtists(): Promise<ArtistCard[]> {
  const client = getSupabasePublicServerClient();
  if (!client) return staticArtists;

  const { data, error } = await client
    .from("salvya_artists")
    .select("*")
    .eq("archived", false)
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });

  if (error) {
    if (error.code === "42P01" || error.message.includes("does not exist")) return staticArtists;
    return staticArtists;
  }

  if (!data?.length) return staticArtists;

  const dbCards = (data as SalvyaArtistRow[]).map(rowToArtistCard);
  const dbSlugs = new Set(dbCards.map((a) => a.slug));
  const staticOnly = staticArtists.filter((a) => !dbSlugs.has(a.slug));
  return sortArtists([...dbCards, ...staticOnly]);
}

export async function getStorefrontArtistBySlug(slug: string): Promise<ArtistCard | null> {
  const normalized = slug.trim().toLowerCase();
  const list = await getStorefrontArtists();
  return list.find((a) => a.slug === normalized) ?? null;
}
