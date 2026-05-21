import { postOptimizedImageUpload } from "@/lib/media/client/upload-with-retry";

export type ArtistImageKind = "profile" | "cover";

export async function uploadArtistImage(
  file: File,
  artistSlug: string,
  kind: ArtistImageKind,
): Promise<string> {
  const slug = artistSlug.trim().toLowerCase();
  if (!slug) throw new Error("Set the artist name or slug before uploading");

  const fd = new FormData();
  fd.append("file", file);
  fd.append("artistSlug", slug);
  fd.append("kind", kind);

  const body = await postOptimizedImageUpload("/api/admin/upload/artist-image", fd);
  if (!body.url) throw new Error("Upload failed");
  return body.url;
}
