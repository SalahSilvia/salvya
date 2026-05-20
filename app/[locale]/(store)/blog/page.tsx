import { redirectLocalized } from "@/lib/i18n/server-redirect";

/** Blog index lives at `/blogs`; keep `/blog` for article URLs under `/blog/[slug]`. */
export default async function BlogIndexRedirect() {
  await redirectLocalized("/blogs");
}
