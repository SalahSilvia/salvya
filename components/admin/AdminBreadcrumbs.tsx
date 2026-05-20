"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { adminBreadcrumbs } from "@/components/admin/nav-config";

export function AdminBreadcrumbs() {
  const pathname = usePathname() ?? "";
  const crumbs = adminBreadcrumbs(pathname);

  if (!crumbs.length) return null;

  return (
    <nav aria-label="Breadcrumb" className="mb-5 flex flex-wrap items-center gap-1.5 text-[13px]">
      <Link href="/admin/overview" className="font-medium text-[#6d7175] transition-colors hover:text-[#2D6BFF]">
        Admin
      </Link>
      {crumbs.map((crumb, i) => {
        const isLast = i === crumbs.length - 1;
        return (
          <span key={`${crumb.label}-${i}`} className="flex items-center gap-1.5">
            <span className="text-[#c9cccf]" aria-hidden>
              /
            </span>
            {crumb.href && !isLast ? (
              <Link href={crumb.href} className="font-medium text-[#6d7175] transition-colors hover:text-[#2D6BFF]">
                {crumb.label}
              </Link>
            ) : (
              <span className={isLast ? "font-semibold text-[#202223]" : "font-medium text-[#6d7175]"}>{crumb.label}</span>
            )}
          </span>
        );
      })}
    </nav>
  );
}
