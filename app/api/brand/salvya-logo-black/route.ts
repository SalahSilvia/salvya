import { serveBrandAsset } from "@/lib/brand/serve-asset";

export const dynamic = "force-dynamic";

/** Legacy path — serves committed `public/brand/salvya-mark.svg`. */
export async function GET() {
  return serveBrandAsset("salvya-mark.svg", "image/svg+xml");
}
