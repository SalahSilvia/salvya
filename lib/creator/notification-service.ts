import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  CreatorNotificationDto,
  CreatorNotificationRow,
  CreatorNotificationType,
} from "@/lib/creator/notification-types";

function toDto(row: CreatorNotificationRow): CreatorNotificationDto {
  return {
    id: row.id,
    type: row.type,
    title: row.title,
    body: row.body,
    href: row.href,
    metadata: row.metadata ?? {},
    readAt: row.read_at,
    createdAt: row.created_at,
  };
}

export async function listCreatorNotifications(
  service: SupabaseClient,
  creatorId: string,
  limit = 10,
): Promise<{ notifications: CreatorNotificationDto[]; unreadCount: number }> {
  const [{ data: rows, error }, { count, error: countError }] = await Promise.all([
    service
      .from("creator_notifications")
      .select("*")
      .eq("creator_id", creatorId)
      .order("created_at", { ascending: false })
      .limit(limit),
    service
      .from("creator_notifications")
      .select("id", { count: "exact", head: true })
      .eq("creator_id", creatorId)
      .is("read_at", null),
  ]);

  if (error) throw error;
  if (countError) throw countError;

  return {
    notifications: ((rows ?? []) as CreatorNotificationRow[]).map(toDto),
    unreadCount: count ?? 0,
  };
}

export async function markCreatorNotificationsRead(
  service: SupabaseClient,
  creatorId: string,
  opts: { ids?: string[]; all?: boolean },
): Promise<number> {
  const now = new Date().toISOString();
  let query = service
    .from("creator_notifications")
    .update({ read_at: now })
    .eq("creator_id", creatorId)
    .is("read_at", null);

  if (!opts.all && opts.ids?.length) {
    query = query.in("id", opts.ids);
  }

  const { data, error } = await query.select("id");
  if (error) throw error;
  return data?.length ?? 0;
}

export async function createCreatorNotification(
  service: SupabaseClient,
  input: {
    creatorId: string;
    type: CreatorNotificationType;
    title: string;
    body?: string | null;
    href?: string | null;
    metadata?: Record<string, unknown>;
  },
): Promise<CreatorNotificationDto> {
  const { data, error } = await service
    .from("creator_notifications")
    .insert({
      creator_id: input.creatorId,
      type: input.type,
      title: input.title,
      body: input.body ?? null,
      href: input.href ?? null,
      metadata: input.metadata ?? {},
    })
    .select("*")
    .single();

  if (error) throw error;
  return toDto(data as CreatorNotificationRow);
}
