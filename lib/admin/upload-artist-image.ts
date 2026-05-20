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

  const res = await fetch("/api/admin/upload/artist-image", {
    method: "POST",
    credentials: "include",
    body: fd,
  });
  const body = (await res.json()) as { ok?: boolean; url?: string; error?: string };
  if (!res.ok || !body.ok || !body.url) throw new Error(body.error ?? "Upload failed");
  return body.url;
}
