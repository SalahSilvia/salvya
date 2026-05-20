/** Best-effort client IP from reverse-proxy headers (Vercel, nginx, Cloudflare). */
export function getClientIpFromHeaders(headers: Headers): string | null {
  const xff = headers.get("x-forwarded-for");
  if (xff) {
    const first = xff.split(",")[0]?.trim();
    if (first && !isLoopback(first)) return first;
  }
  const realIp = headers.get("x-real-ip")?.trim();
  if (realIp && !isLoopback(realIp)) return realIp;
  const cf = headers.get("cf-connecting-ip")?.trim();
  if (cf && !isLoopback(cf)) return cf;
  return null;
}

function isLoopback(ip: string): boolean {
  return ip === "127.0.0.1" || ip === "::1" || ip.startsWith("127.") || ip === "localhost";
}
