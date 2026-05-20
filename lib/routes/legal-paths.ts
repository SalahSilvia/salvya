/**
 * Policy / legal surfaces where the floating mobile main nav should not appear.
 */
export function isLegalPath(pathname: string): boolean {
  const path = pathname.split("?")[0] || pathname;
  if (path === "/terms" || path.startsWith("/terms/")) return true;
  if (path === "/cookies" || path.startsWith("/cookies/")) return true;
  return false;
}
