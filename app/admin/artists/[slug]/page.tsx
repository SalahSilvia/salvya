import { AdminArtistEditor } from "@/components/admin/artists/AdminArtistEditor";

type Props = {
  params: Promise<{ slug: string }>;
};

export default async function Page({ params }: Props) {
  const { slug } = await params;
  return <AdminArtistEditor mode="edit" slug={slug} />;
}
