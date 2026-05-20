import { AdminBlogEditor } from "@/components/admin/blog/AdminBlogEditor";

type Props = { params: Promise<{ slug: string }> };

export default async function AdminBlogEditPage({ params }: Props) {
  const { slug } = await params;
  return <AdminBlogEditor mode="edit" slug={slug} />;
}
