import { createClient } from "@/lib/supabase/server";
import { summarizeNotifications } from "@/features/traveler/utils";
import type { DbEnum, NotificationRow } from "@/lib/supabase/database";
import type { TravelerNotification, TravelerNotificationType } from "@/features/traveler/types";

type NotificationViewer = "owner" | "traveler";
type NotificationFilter = TravelerNotificationType | "all" | "unread";

type NotificationStats = ReturnType<typeof summarizeNotifications>;

const notificationTypeMap: Record<DbEnum<"notification_type">, TravelerNotificationType> = {
  approval: "approval",
  booking: "booking",
  message: "message",
  payment: "payment",
  payout: "system",
  review: "system",
  support: "support",
  system: "system",
};

const notificationEntityLabels: Record<NonNullable<NotificationRow["entity_type"]>, string> = {
  booking: "Booking update",
  conversation: "Conversation",
  message: "Message thread",
  payout: "Payout update",
  property: "Property update",
  review: "Review activity",
  support_ticket: "Support ticket",
  verification: "Verification update",
};

const filterToDbTypes: Record<Exclude<NotificationFilter, "all" | "unread">, DbEnum<"notification_type">[]> = {
  approval: ["approval"],
  booking: ["booking"],
  message: ["message"],
  payment: ["payment"],
  support: ["support"],
  system: ["system", "review", "payout"],
};

function getFallbackHref(viewer: NotificationViewer) {
  return viewer === "owner" ? "/owner" : "/traveler/notifications";
}

function getEntityLabel(row: Pick<NotificationRow, "entity_type">) {
  if (!row.entity_type) {
    return "General notification";
  }

  return notificationEntityLabels[row.entity_type];
}

function getNotificationHref(
  row: Pick<NotificationRow, "entity_id" | "entity_type">,
  viewer: NotificationViewer,
) {
  const fallbackHref = getFallbackHref(viewer);

  switch (row.entity_type) {
    case "booking":
      return row.entity_id
        ? viewer === "owner"
          ? `/owner/bookings/request-decision?bookingId=${row.entity_id}`
          : `/traveler/bookings/${row.entity_id}`
        : fallbackHref;
    case "conversation":
      return row.entity_id
        ? viewer === "owner"
          ? `/owner/messages?conversation=${row.entity_id}`
          : `/traveler/messages?conversation=${row.entity_id}`
        : viewer === "owner"
          ? "/owner/messages"
          : "/traveler/messages";
    case "message":
      return viewer === "owner" ? "/owner/messages" : "/traveler/messages";
    case "property":
      if (viewer === "owner" && row.entity_id) {
        return `/owner/properties/${row.entity_id}`;
      }
      return fallbackHref;
    case "review":
      return viewer === "owner" ? "/owner/reviews" : "/traveler/reviews";
    case "support_ticket":
      return viewer === "owner"
        ? "/owner/help-center"
        : row.entity_id
          ? `/traveler/support/tickets/${row.entity_id}`
          : "/traveler/support";
    case "payout":
      return viewer === "owner" ? "/owner/payouts" : fallbackHref;
    case "verification":
      return viewer === "owner" ? "/owner/verification" : fallbackHref;
    case null:
      return fallbackHref;
    default:
      return fallbackHref;
  }
}

function mapNotificationRow(
  row: Pick<
    NotificationRow,
    "body" | "created_at" | "entity_id" | "entity_type" | "id" | "is_read" | "title" | "type"
  >,
  viewer: NotificationViewer,
): TravelerNotification {
  return {
    body: row.body ?? "No additional details are available for this notification.",
    createdAt: row.created_at,
    entityLabel: getEntityLabel(row),
    href: getNotificationHref(row, viewer),
    id: row.id,
    isRead: row.is_read,
    title: row.title,
    type: notificationTypeMap[row.type],
  };
}

async function getAuthenticatedNotificationUserId() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return {
    supabase,
    userId: user?.id ?? null,
  };
}

async function queryNotificationRows(
  filter: NotificationFilter,
) {
  const { supabase, userId } = await getAuthenticatedNotificationUserId();

  if (!userId) {
    return { rows: [] as NotificationRow[], supabase, userId: null };
  }

  let query = supabase
    .from("notifications")
    .select("id, type, title, body, entity_type, entity_id, is_read, created_at, deleted_at, read_at, user_id")
    .eq("user_id", userId)
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  if (filter === "unread") {
    query = query.eq("is_read", false);
  } else if (filter !== "all") {
    query = query.in("type", filterToDbTypes[filter]);
  }

  const { data, error } = await query;

  if (error) {
    console.error("[notifications] failed to query notifications", {
      code: error.code,
      userId,
    });
    return { rows: [] as NotificationRow[], supabase, userId };
  }

  return {
    rows: (data ?? []) as NotificationRow[],
    supabase,
    userId,
  };
}

export async function getMyNotifications(
  viewer: NotificationViewer,
  filter: NotificationFilter = "all",
) {
  const { rows } = await queryNotificationRows(filter);
  return rows.map((row) => mapNotificationRow(row, viewer));
}

export async function getTravelerNotificationsPageData(
  filter: NotificationFilter = "all",
): Promise<{
  notifications: TravelerNotification[];
  stats: NotificationStats;
}> {
  const [notifications, allNotifications] = await Promise.all([
    getMyNotifications("traveler", filter),
    getMyNotifications("traveler", "all"),
  ]);

  return {
    notifications,
    stats: summarizeNotifications(allNotifications),
  };
}

export async function getNotificationById(
  id: string,
  viewer: NotificationViewer,
) {
  const { supabase, userId } = await getAuthenticatedNotificationUserId();

  if (!userId) {
    return null;
  }

  const { data, error } = await supabase
    .from("notifications")
    .select("id, type, title, body, entity_type, entity_id, is_read, created_at")
    .eq("id", id)
    .eq("user_id", userId)
    .is("deleted_at", null)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return mapNotificationRow(data as NotificationRow, viewer);
}

export async function getUnreadNotificationCount() {
  const { supabase, userId } = await getAuthenticatedNotificationUserId();

  if (!userId) {
    return 0;
  }

  const { count, error } = await supabase
    .from("notifications")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("is_read", false)
    .is("deleted_at", null);

  if (error) {
    console.error("[notifications] failed to query unread notification count", {
      code: error.code,
      userId,
    });
    return 0;
  }

  return count ?? 0;
}
