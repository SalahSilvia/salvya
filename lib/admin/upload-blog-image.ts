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

  const res = await fetch("/api/admin/upload/blog-image", {
    method: "POST",
    credentials: "include",
    body: fd,
  });
  const body = (await res.json()) as { ok?: boolean; url?: string; error?: string };
  if (!res.ok || !body.ok || !body.url) throw new Error(body.error ?? "Upload failed");
  return body.url;
}
