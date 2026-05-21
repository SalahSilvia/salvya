import { postOptimizedImageUpload } from "@/lib/media/client/upload-with-retry";

export type BlogImageKind = "cover" | "inline";

export async function uploadBlogImage(
  file: File,
  postSlug: string,
  kind: BlogImageKind,
): Promise<string> {
  const slug = postSlug.trim().toLowerCase();
  if (!slug) throw new Error("Set the post title or slug before uploading");

  const fd = new FormData();
  fd.append("file", file);
  fd.append("postSlug", slug);
  fd.append("kind", kind);

  const body = await postOptimizedImageUpload("/api/admin/upload/blog-image", fd);
  if (!body.url) throw new Error("Upload failed");
  return body.url;
}
