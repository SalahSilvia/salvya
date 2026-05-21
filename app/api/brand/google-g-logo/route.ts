import { serveBrandAsset } from "@/lib/brand/serve-asset";

export const dynamic = "force-dynamic";

/** Legacy path — serves committed `public/brand/google-g.svg`. */
export async function GET() {
  return serveBrandAsset("google-g.svg", "image/svg+xml");
}
