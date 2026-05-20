import { NextResponse, type NextRequest } from "next/server";
import { REVIEW_BODY_MAX, REVIEWS_MAX_PER_PRODUCT } from "@/lib/reviews/types";
import { normalizeProductReview, sanitizeProductReviews } from "@/lib/reviews/validate";
import { createServerSupabase, getSsrEnv } from "@/lib/supabase/server-ssr";

function jsonResponse(body: unknown, init?: ResponseInit) {
  const res = NextResponse.json(body, init);
  res.headers.set("Cache-Control", "private, no-store");
  return res;
}

function parseProductQuery(request: NextRequest): {
  artistSlug: string;
  productKind: "hoodie" | "tshirt";
  itemSlug: string;
} | null {
  const artistSlug = request.nextUrl.searchParams.get("artistSlug")?.trim() ?? "";
  const productKind = request.nextUrl.searchParams.get("productKind")?.trim() ?? "";
  const itemSlug = request.nextUrl.searchParams.get("itemSlug")?.trim() ?? "";
  if (!artistSlug || !itemSlug) return null;
  if (productKind !== "hoodie" && productKind !== "tshirt") return null;
  return { artistSlug, productKind, itemSlug };
}

function rowToReview(row: {
  id: string;
  user_id: string;
  author_label: string;
  rating: number;
  body: string;
  created_at: string;
  updated_at: string;
}) {
  return normalizeProductReview({
    id: row.id,
    userId: row.user_id,
    authorLabel: row.author_label,
    rating: row.rating,
    body: row.body,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  });
}

export async function GET(request: NextRequest) {
  const ref = parseProductQuery(request);
  if (!ref) {
    return jsonResponse({ error: "Missing or invalid product parameters" }, { status: 400 });
  }

  const env = getSsrEnv();
  if (!env) {
    return jsonResponse({ reviews: [], synced: false });
  }

  try {
    const res = jsonResponse({ reviews: [], synced: true });
    const supabase = createServerSupabase(request, res);
    const { data, error } = await supabase
      .from("product_reviews")
      .select("id, user_id, author_label, rating, body, created_at, updated_at")
      .eq("artist_slug", ref.artistSlug)
      .eq("product_kind", ref.productKind)
      .eq("item_slug", ref.itemSlug)
      .order("created_at", { ascending: false })
      .limit(REVIEWS_MAX_PER_PRODUCT);

    if (error) {
      return jsonResponse({ error: error.message }, { status: 500 });
    }

    const reviews = (data ?? []).map(rowToReview);
    return jsonResponse({ reviews, synced: true });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Reviews unavailable";
    return jsonResponse({ error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const env = getSsrEnv();
  if (!env) {
    return jsonResponse({ error: "Reviews not configured" }, { status: 503 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonResponse({ error: "Invalid JSON" }, { status: 400 });
  }

  const b = body as Record<string, unknown>;
  const artistSlug = typeof b.artistSlug === "string" ? b.artistSlug.trim() : "";
  const productKind = b.productKind;
  const itemSlug = typeof b.itemSlug === "string" ? b.itemSlug.trim() : "";
  const authorLabel = typeof b.authorLabel === "string" ? b.authorLabel.trim() : "";
  const rating = typeof b.rating === "number" ? Math.round(b.rating) : 0;
  const text = typeof b.body === "string" ? b.body.trim() : "";

  if (!artistSlug || !itemSlug) {
    return jsonResponse({ error: "Invalid product" }, { status: 400 });
  }
  if (productKind !== "hoodie" && productKind !== "tshirt") {
    return jsonResponse({ error: "Invalid product kind" }, { status: 400 });
  }
  if (text.length < 2 || text.length > REVIEW_BODY_MAX) {
    return jsonResponse({ error: "Invalid comment length" }, { status: 400 });
  }
  if (rating < 1 || rating > 5) {
    return jsonResponse({ error: "Invalid rating" }, { status: 400 });
  }

  const res = jsonResponse({ review: null, synced: true });

  try {
    const supabase = createServerSupabase(request, res);
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return jsonResponse({ error: "Unauthorized" }, { status: 401 });
    }

    const updatedAt = new Date().toISOString();
    const { data, error } = await supabase
      .from("product_reviews")
      .upsert(
        {
          user_id: user.id,
          artist_slug: artistSlug,
          product_kind: productKind,
          item_slug: itemSlug,
          author_label: authorLabel || "Member",
          rating,
          body: text,
          updated_at: updatedAt,
        },
        { onConflict: "user_id,artist_slug,product_kind,item_slug" },
      )
      .select("id, user_id, author_label, rating, body, created_at, updated_at")
      .single();

    if (error) {
      return jsonResponse({ error: error.message }, { status: 500 });
    }

    return jsonResponse({ review: rowToReview(data), synced: true });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Review save failed";
    return jsonResponse({ error: message }, { status: 500 });
  }
}
