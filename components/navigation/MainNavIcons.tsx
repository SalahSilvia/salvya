import type { MainNavTabId } from "@/lib/navigation/main-nav-config";

type IconProps = { active: boolean; className?: string };

const defaultCls = "h-[1.35rem] w-[1.35rem] shrink-0";

export function MainNavHomeIcon({ active, className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className ?? `${defaultCls} ${active ? "text-white" : "text-white/40"}`} aria-hidden>
      <path
        d="M4 10.5L12 4l8 6.5V20a1 1 0 01-1 1h-5v-6H10v6H5a1 1 0 01-1-1v-9.5z"
        stroke="currentColor"
        strokeWidth={active ? 2 : 1.65}
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function MainNavDashboardIcon({ active, className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className ?? `${defaultCls} ${active ? "text-[#9eb4ff]" : "text-white/40"}`} aria-hidden>
      <path stroke="currentColor" strokeWidth={active ? 2 : 1.65} strokeLinecap="round" d="M4 5h6v6H4V5zm10 0h6v6h-6V5zM4 13h6v6H4v-6zm10 0h6v6h-6v-6z" />
    </svg>
  );
}

export function MainNavShopIcon({ active, className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className ?? `${defaultCls} ${active ? "text-white" : "text-white/40"}`} aria-hidden>
      <path d="M3 9l2-4h14l2 4M5 9v10h14V9M9 13h6" stroke="currentColor" strokeWidth={active ? 2 : 1.65} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function MainNavBagIcon({ active, className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className ?? `${defaultCls} ${active ? "text-white" : "text-white/40"}`} aria-hidden>
      <path d="M6 8h12l1 12H5L6 8zm3-3a3 3 0 016 0V8H9V5z" stroke="currentColor" strokeWidth={active ? 2 : 1.65} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function MainNavSearchIcon({ active, className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className ?? `${defaultCls} ${active ? "text-white" : "text-white/40"}`} aria-hidden>
      <path d="M10.5 17a6.5 6.5 0 100-13 6.5 6.5 0 000 13ZM15.5 15.5L20 20" stroke="currentColor" strokeWidth={active ? 2 : 1.65} strokeLinecap="round" />
    </svg>
  );
}

export function MainNavLikesIcon({ active, className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className ?? `${defaultCls} ${active ? "text-[#fda4cf]" : "text-white/40"}`} aria-hidden>
      <path
        d="M12 21s-7-4.35-9.6-9.35C-.3 8.1 1.6 4.5 5.4 4.5c2.1 0 3.5 1.2 4.6 2.7 1.1-1.5 2.5-2.7 4.6-2.7 3.8 0 5.7 3.6 3 7.15C15 16.65 12 21 12 21z"
        stroke="currentColor"
        strokeWidth={active ? 2 : 1.65}
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function MainNavMenuIcon({ active, className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className ?? `${defaultCls} ${active ? "text-white" : "text-white/40"}`} aria-hidden>
      <path d="M5 7h14M5 12h14M5 17h10" stroke="currentColor" strokeWidth={active ? 2 : 1.65} strokeLinecap="round" />
    </svg>
  );
}

export function MainNavTabIcon({
  id,
  active,
  isAdmin,
}: {
  id: MainNavTabId;
  active: boolean;
  isAdmin: boolean;
}) {
  if (id === "home") {
    return isAdmin ? <MainNavDashboardIcon active={active} /> : <MainNavHomeIcon active={active} />;
  }
  switch (id) {
    case "shop":
      return <MainNavShopIcon active={active} />;
    case "bag":
      return <MainNavBagIcon active={active} />;
    case "search":
      return <MainNavSearchIcon active={active} />;
    case "menu":
      return <MainNavMenuIcon active={active} />;
    default:
      return null;
  }
}
