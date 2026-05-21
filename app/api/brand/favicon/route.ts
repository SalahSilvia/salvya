import { NextResponse, type NextRequest } from "next/server";
import { getSiteFaviconUrl } from "@/lib/brand/site-branding";

export const dynamic = "force-dynamic";

/** Resolves favicon from DB (Supabase URL) or static fallback. */
export async function GET(request: NextRequest) {
  const url = await getSiteFaviconUrl();
  const target = url.startsWith("http://") || url.startsWith("https://") ? url : new URL(url, request.url);
  return NextResponse.redirect(target, 307);
}
