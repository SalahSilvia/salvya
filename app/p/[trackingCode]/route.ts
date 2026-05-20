import { NextResponse } from "next/server";

import {

  loadCreatorLinkByTrackingCode,

  productPdpPathFromParts,

} from "@/lib/creator/product-link-service";

import { trackCreatorPromoClick } from "@/lib/creator/trusted-events";

import { clientIpFromRequest } from "@/lib/security/api-rate-limit";

import { createServiceSupabase } from "@/lib/supabase/service";

import { DEFAULT_LOCALE } from "@/lib/seo/site";

import { localePath } from "@/lib/seo/site";



type RouteCtx = { params: Promise<{ trackingCode: string }> };



/** Public promo redirect — trusted click event then 302 to product PDP. */

export async function GET(request: Request, ctx: RouteCtx) {

  const { trackingCode } = await ctx.params;

  const code = decodeURIComponent(trackingCode ?? "").trim();

  if (!code) {

    return NextResponse.redirect(new URL("/", request.url), 302);

  }



  const service = createServiceSupabase();

  if (!service) {

    return NextResponse.redirect(new URL("/", request.url), 302);

  }



  const link = await loadCreatorLinkByTrackingCode(service, code);

  if (!link) {

    return NextResponse.redirect(new URL("/", request.url), 302);

  }



  const ip = clientIpFromRequest(request);

  const userAgent = request.headers.get("user-agent") ?? "";



  void trackCreatorPromoClick(

    service,

    {

      id: link.id,

      creator_id: link.creator_id,

      product_id: link.product_id,

      tracking_code: link.tracking_code,

    },

    { ip, userAgent },

  );



  const pdp = productPdpPathFromParts(link.artist_slug, link.product_slug, link.category);

  const dest = localePath(pdp, DEFAULT_LOCALE);

  const url = new URL(dest, request.url);

  url.searchParams.set("ref", link.tracking_code);

  url.searchParams.set("creator", link.creator_code);



  return NextResponse.redirect(url, 302);

}

