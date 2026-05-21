import { NextResponse, type NextRequest } from "next/server";

function normalizeRedirectUrl(destination: string | URL, request: NextRequest): URL {
  if (typeof destination === "string") {
    if (destination.startsWith("http://") || destination.startsWith("https://")) {
      return new URL(destination);
    }
    return new URL(destination, request.url);
  }
  return new URL(destination.toString());
}

/** True when redirect target matches the incoming request (prevents redirect loops). */
export function isSameRedirectTarget(request: NextRequest, destination: string | URL): boolean {
  const target = normalizeRedirectUrl(destination, request);
  const current = request.nextUrl;
  return (
    target.protocol === current.protocol &&
    target.host === current.host &&
    target.pathname === current.pathname &&
    target.search === current.search
  );
}

/**
 * Redirect only when the destination differs from the current URL.
 * Returns `NextResponse.next()` when they match (loop guard).
 */
export function safeRedirect(
  request: NextRequest,
  destination: string | URL,
  init?: number | ResponseInit,
): NextResponse {
  if (isSameRedirectTarget(request, destination)) {
    return NextResponse.next({ request });
  }
  const target = normalizeRedirectUrl(destination, request);
  return NextResponse.redirect(target, init);
}
