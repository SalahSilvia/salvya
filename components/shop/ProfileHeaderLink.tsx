"use client";

import Link from "next/link";
import type { CSSProperties } from "react";
import { useMemo } from "react";
import { usePathname } from "next/navigation";
import { useSupabaseUser } from "@/components/member/useSupabaseUser";
import { useProfileExtension } from "@/components/member/profile/useProfileExtension";
import { loginHref } from "@/lib/auth/login-href";
import { CUSTOMER_PROFILE_HREF } from "@/lib/member/customer-menu-links";
import type { User } from "@supabase/supabase-js";

/** Served from `web/public/profile-no-profile.jpg` (Salvya default avatar). */
export const PROFILE_PLACEHOLDER_IMAGE = "/profile-no-profile.jpg";

function authAvatarUrl(user: User): string | null {
  const meta = user.user_metadata as Record<string, unknown> | undefined;
  const u = meta?.avatar_url;
  return typeof u === "string" && u.length > 0 ? u : null;
}

type Props = {
  className: string;
  style?: CSSProperties;
};

export function ProfileHeaderLink({ className, style }: Props) {
  const pathname = usePathname() ?? "/";
  const { user, loading } = useSupabaseUser();
  const { extension } = useProfileExtension(user?.id);

  const src = useMemo(() => {
    if (!user) return PROFILE_PLACEHOLDER_IMAGE;
    const ext = extension?.avatarUrl?.trim();
    if (ext) return ext;
    const auth = authAvatarUrl(user);
    if (auth) return auth;
    return PROFILE_PLACEHOLDER_IMAGE;
  }, [user, extension?.avatarUrl]);

  if (!user && !loading) {
    return (
      <Link
        href={loginHref(pathname)}
        prefetch={false}
        className={`inline-flex h-10 shrink-0 items-center justify-center rounded-xl border border-white/[0.12] bg-white/[0.06] px-3.5 text-[13px] font-semibold text-white/90 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] transition-colors hover:border-white/[0.18] hover:bg-white/[0.1] hover:text-white ${className}`}
        style={style}
      >
        Sign in
      </Link>
    );
  }

  const href = user ? CUSTOMER_PROFILE_HREF : loginHref(pathname);
  const label = loading ? "Profile" : user ? "View profile" : "Sign in";

  return (
    <Link
      href={href}
      prefetch={false}
      className={`relative overflow-hidden !rounded-full p-0 ${className}`}
      style={style}
      aria-label={label}
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- data URLs + arbitrary Supabase URLs */}
      <img src={src} alt="" className="absolute inset-0 size-full object-cover" draggable={false} />
    </Link>
  );
}
