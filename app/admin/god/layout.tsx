import { redirect } from "next/navigation";
import { getServerSalvyaUser } from "@/lib/auth/get-user-role";
import { isGodAdmin } from "@/lib/auth/roles";
import { loginHref } from "@/lib/auth/login-href";

export default async function GodAdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSalvyaUser();
  if (!session) redirect(loginHref("/admin/god"));
  if (!isGodAdmin(session.role)) redirect("/admin/overview");
  return children;
}
