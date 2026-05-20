import type { NextResponse } from "next/server";

/** Copies `Set-Cookie` headers from a Supabase auth probe response onto the final handler response. */
export function forwardSetCookiesFrom(source: NextResponse, target: NextResponse): void {
  const h = source.headers as Headers & { getSetCookie?: () => string[] };
  const list = typeof h.getSetCookie === "function" ? h.getSetCookie() : [];
  for (const c of list) {
    target.headers.append("Set-Cookie", c);
  }
}
