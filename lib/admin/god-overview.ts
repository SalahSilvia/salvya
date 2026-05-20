import { loadStoreSettings } from "@/lib/admin/store-settings";
import { roleLabel, type SalvyaRole } from "@/lib/auth/roles";
import type { SupabaseClient } from "@supabase/supabase-js";

export type GodUserRow = {
  id: string;
  email: string;
  role: SalvyaRole;
  roleLabel: string;
  createdAt: string | null;
  lastSignInAt: string | null;
  emailConfirmed: boolean;
};

export type GodAdminSnapshot = {
  generatedAt: string;
  counts: {
    customers: number;
    influencers: number;
    admins: number;
    godAdmins: number;
    orders: number;
    products: number;
    pendingCreatorApplications: number;
  };
  env: {
    serviceRole: boolean;
    resend: boolean;
    supabaseUrl: boolean;
    paypal: boolean;
  };
  store: {
    maintenanceMode: boolean;
    storeName: string;
  };
  users: GodUserRow[];
  audit: {
    id: string;
    action: string;
    actorId: string;
    targetType: string | null;
    targetId: string | null;
    createdAt: string;
  }[];
};

const ASSIGNABLE_ROLES: SalvyaRole[] = ["customer", "influencer", "admin", "god_admin"];

export function godAssignableRoles(): SalvyaRole[] {
  return [...ASSIGNABLE_ROLES];
}

export async function buildGodAdminSnapshot(service: SupabaseClient): Promise<GodAdminSnapshot> {
  const settings = await loadStoreSettings(service);

  const profileRes = await service.from("user_profiles").select("user_id, role, created_at");
  const profileMap = new Map(
    (profileRes.data ?? []).map((p) => [p.user_id, { role: p.role as SalvyaRole, createdAt: p.created_at }]),
  );

  const users: GodUserRow[] = [];
  let page = 1;
  const perPage = 200;
  for (;;) {
    const { data, error } = await service.auth.admin.listUsers({ page, perPage });
    if (error) break;
    const batch = data.users ?? [];
    for (const u of batch) {
      const prof = profileMap.get(u.id);
      const role = (prof?.role ?? "customer") as SalvyaRole;
      users.push({
        id: u.id,
        email: u.email ?? "",
        role,
        roleLabel: roleLabel(role),
        createdAt: prof?.createdAt ?? u.created_at ?? null,
        lastSignInAt: u.last_sign_in_at ?? null,
        emailConfirmed: Boolean(u.email_confirmed_at),
      });
    }
    if (batch.length < perPage) break;
    page += 1;
    if (page > 50) break;
  }

  users.sort((a, b) => a.email.localeCompare(b.email));

  const roleCounts = { customers: 0, influencers: 0, admins: 0, godAdmins: 0 };
  for (const u of users) {
    if (u.role === "god_admin") roleCounts.godAdmins += 1;
    else if (u.role === "admin") roleCounts.admins += 1;
    else if (u.role === "influencer") roleCounts.influencers += 1;
    else roleCounts.customers += 1;
  }

  const [ordersRes, productsRes, inflRes, auditRes] = await Promise.all([
    service.from("customer_orders").select("id", { count: "exact", head: true }),
    service.from("salvya_products").select("id", { count: "exact", head: true }),
    service.from("creator_applications").select("id", { count: "exact", head: true }).eq("status", "pending"),
    service
      .from("admin_audit_log")
      .select("id, actor_id, action, target_type, target_id, created_at")
      .order("created_at", { ascending: false })
      .limit(100),
  ]);

  return {
    generatedAt: new Date().toISOString(),
    counts: {
      ...roleCounts,
      orders: ordersRes.count ?? 0,
      products: productsRes.error ? 0 : productsRes.count ?? 0,
      pendingCreatorApplications: inflRes.error ? 0 : inflRes.count ?? 0,
    },
    env: {
      serviceRole: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()),
      resend: Boolean(process.env.RESEND_API_KEY?.trim()),
      supabaseUrl: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()),
      paypal: Boolean(process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID?.trim() || process.env.PAYPAL_CLIENT_ID?.trim()),
    },
    store: {
      maintenanceMode: settings.platform.maintenanceMode,
      storeName: settings.platform.storeName,
    },
    users,
    audit: (auditRes.data ?? []).map((r) => ({
      id: r.id,
      action: r.action,
      actorId: r.actor_id,
      targetType: r.target_type,
      targetId: r.target_id,
      createdAt: r.created_at,
    })),
  };
}
