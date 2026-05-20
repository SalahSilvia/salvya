import { redirect } from "next/navigation";
import { RoleMismatchGuard } from "@/components/auth/RoleMismatchGuard";
import { AdminDomainBoundary } from "@/lib/mfe/AdminDomainBoundary";
import { getServerSalvyaUser } from "@/lib/auth/get-user-role";
import { isAdminCapable } from "@/lib/auth/roles";
import { loginHref } from "@/lib/auth/login-href";

export const metadata = {
  title: "Admin — Salvya",
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSalvyaUser();

  if (!session) {
    redirect(loginHref("/admin"));
  }

  if (!isAdminCapable(session.role)) {
    redirect("/");
  }

  return (
    <>
      <RoleMismatchGuard allowedRoles={["admin", "god_admin"]} redirectTo="/login?next=%2Fadmin" />
      <AdminDomainBoundary>{children}</AdminDomainBoundary>
    </>
  );
}
