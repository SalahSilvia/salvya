import { AdminProductEditor } from "@/components/admin/products/AdminProductEditor";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <AdminProductEditor mode="edit" productId={id} />;
}
