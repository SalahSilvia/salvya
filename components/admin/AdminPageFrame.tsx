import type { ReactNode } from "react";
import { AdminBreadcrumbs } from "@/components/admin/AdminBreadcrumbs";

type Props = {
  children: ReactNode;
  /** Hide breadcrumbs on pages that ship their own hero (e.g. overview). */
  hideBreadcrumbs?: boolean;
};

export function AdminPageFrame({ children, hideBreadcrumbs }: Props) {
  return (
    <>
      {hideBreadcrumbs ? null : <AdminBreadcrumbs />}
      {children}
    </>
  );
}
