import "server-only";

import { unstable_noStore as noStore } from "next/cache";
import { getTravelerBookings as getTravelerBookingsFromSupabase } from "@/features/bookings/data/booking-queries";
import type { TravelerBooking, SupportTicket, SupportTicketMessage } from "@/features/traveler/types";
import { DAR_LOGO_ASSETS } from "@/features/traveler/brand";
import type {
  DbEnum,
  SupportTicketMessageRow,
  SupportTicketRow,
} from "@/lib/supabase/database";
import { requireRole } from "@/lib/supabase/auth";
import { createClient } from "@/lib/supabase/server";

type SupportTicketCategory = DbEnum<"support_ticket_category">;
type SupportTicketStatus = DbEnum<"support_ticket_status">;

type TicketRow = Pick<
  SupportTicketRow,
  | "assigned_to_profile_id"
  | "booking_id"
  | "category"
  | "closed_at"
  | "created_at"
  | "id"
  | "priority"
  | "resolved_at"
  | "status"
  | "subject"
  | "ticket_reference"
  | "updated_at"
>;

type MessageRow = Pick<
  SupportTicketMessageRow,
  | "created_at"
  | "id"
  | "is_internal"
  | "message"
  | "sender_id"
  | "sender_role"
  | "ticket_id"
>;

type ProfileLookupRow = {
  avatar_url: string | null;
  display_name: string | null;
  full_name: string;
  id: string;
};

type SupportTicketContext = {
  booking: TravelerBooking | null;
};

const SUPPORT_AGENT_FALLBACK_AVATAR = DAR_LOGO_ASSETS.purple;

const categoryLabels: Record<SupportTicketCategory, string> = {
  account_issue: "Account",
  booking_issue: "Booking help",
  other: "Other",
  payment_issue: "Payments",
  property_issue: "Property issue",
  refund_request: "Refunds",
  technical_issue: "Technical issue",
  verification_issue: "Account",
};

const statusLabels: Record<SupportTicketStatus, SupportTicket["status"]> = {
  awaiting_customer: "awaiting_you",
  awaiting_support: "awaiting_dar",
  closed: "closed",
  escalated: "escalated",
  in_progress: "in_progress",
  open: "open",
  resolved: "resolved",
};

function normalizeImageUrl(value: string | null | undefined, fallback: string) {
  if (!value) {
    return fallback;
  }

  if (value.startsWith("/") || value.startsWith("http://") || value.startsWith("https://")) {
    return value;
  }

  return fallback;
}

function buildExpectedReplyAt(ticket: TicketRow) {
  const baseTimestamp = ticket.resolved_at ?? ticket.closed_at ?? ticket.updated_at ?? ticket.created_at;
  const base = new Date(baseTimestamp);

  if (ticket.status === "resolved" || ticket.status === "closed") {
    return base.toISOString();
  }

  return new Date(base.getTime() + 8 * 60 * 60 * 1000).toISOString();
}

async function getProfileLookup(profileIds: string[]) {
  if (!profileIds.length) {
    return new Map<string, ProfileLookupRow>();
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name, display_name, avatar_url")
    .in("id", profileIds);

  if (error) {
    throw new Error("Unable to load support ticket profiles.");
  }

  return new Map((data ?? []).map((row) => [row.id, row as ProfileLookupRow]));
}

async function getTicketRows(ticketId?: string) {
  await requireRole("guest");
  const supabase = await createClient();

  let query = supabase
    .from("support_tickets")
    .select("id, ticket_reference, subject, category, priority, status, booking_id, assigned_to_profile_id, created_at, updated_at, resolved_at, closed_at")
    .order("updated_at", { ascending: false })
    .order("created_at", { ascending: false });

  if (ticketId) {
    query = query.eq("id", ticketId);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error("Unable to load support tickets.");
  }

  return (data ?? []) as TicketRow[];
}

export async function getSupportTicketMessages(ticketId: string) {
  noStore();
  await requireRole("guest");
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("support_ticket_messages")
    .select("id, ticket_id, sender_id, sender_role, message, is_internal, created_at")
    .eq("ticket_id", ticketId)
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error("Unable to load support ticket messages.");
  }

  const rows = (data ?? []) as MessageRow[];
  const senderIds = rows
    .map((row) => row.sender_id)
    .filter((value): value is string => Boolean(value));
  const profilesById = await getProfileLookup(Array.from(new Set(senderIds)));

  return rows.map<SupportTicketMessage>((row) => {
    const senderProfile = row.sender_id ? profilesById.get(row.sender_id) ?? null : null;
    const isSupportSender = row.sender_role === "support_staff" || row.sender_role === "system";

    return {
      attachments: [],
      createdAt: row.created_at,
      id: row.id,
      message: row.message,
      senderAvatarUrl: normalizeImageUrl(
        senderProfile?.avatar_url,
        isSupportSender ? SUPPORT_AGENT_FALLBACK_AVATAR : SUPPORT_AGENT_FALLBACK_AVATAR,
      ),
      senderId: row.sender_id ?? `system-${row.id}`,
      senderName: senderProfile?.display_name ?? senderProfile?.full_name ?? (isSupportSender ? "DAR Support" : "You"),
      senderRole: isSupportSender ? "support" : "traveler",
    };
  });
}

function getTicketContext(ticket: TicketRow, bookingsById: Map<string, TravelerBooking>): SupportTicketContext {
  const booking = ticket.booking_id ? bookingsById.get(ticket.booking_id) ?? null : null;

  return {
    booking,
  };
}

async function mapTicketRows(ticketRows: TicketRow[], bookingsById: Map<string, TravelerBooking>, includeMessages: boolean) {
  const assignedProfileIds = ticketRows
    .map((ticket) => ticket.assigned_to_profile_id)
    .filter((value): value is string => Boolean(value));
  const assignedProfilesById = await getProfileLookup(Array.from(new Set(assignedProfileIds)));

  let messagesByTicketId = new Map<string, SupportTicketMessage[]>();

  if (includeMessages) {
    messagesByTicketId = new Map(
      await Promise.all(
        ticketRows.map(async (ticket) => [ticket.id, await getSupportTicketMessages(ticket.id)] as const),
      ),
    );
  }

  return ticketRows.map<SupportTicket>((ticket) => {
    const assignedProfile = ticket.assigned_to_profile_id
      ? assignedProfilesById.get(ticket.assigned_to_profile_id) ?? null
      : null;
    const context = getTicketContext(ticket, bookingsById);

    return {
      assignedAgent: assignedProfile
        ? {
            avatarUrl: normalizeImageUrl(assignedProfile.avatar_url, SUPPORT_AGENT_FALLBACK_AVATAR),
            id: assignedProfile.id,
            name: assignedProfile.display_name ?? assignedProfile.full_name,
            title: "DAR Support",
          }
        : undefined,
      booking: context.booking ?? undefined,
      category: categoryLabels[ticket.category] ?? "Other",
      createdAt: ticket.created_at,
      expectedReplyAt: buildExpectedReplyAt(ticket),
      id: ticket.id,
      messages: messagesByTicketId.get(ticket.id) ?? [],
      priority: ticket.priority as SupportTicket["priority"],
      reference: ticket.ticket_reference,
      status: statusLabels[ticket.status] ?? "open",
      subject: ticket.subject,
      updatedAt: ticket.updated_at,
    };
  });
}

function createBookingMap(bookings: TravelerBooking[]) {
  return new Map(bookings.map((booking) => [booking.id, booking]));
}

async function getBookingMap(bookings?: TravelerBooking[]) {
  if (bookings) {
    return createBookingMap(bookings);
  }

  return createBookingMap(await getTravelerBookingsFromSupabase());
}

export async function getMySupportTickets(bookings?: TravelerBooking[]) {
  noStore();
  const ticketRows = await getTicketRows();
  const bookingMap = await getBookingMap(bookings);
  return mapTicketRows(ticketRows, bookingMap, false);
}

export async function getSupportTicketById(ticketId: string, bookings?: TravelerBooking[]) {
  noStore();
  const ticketRows = await getTicketRows(ticketId);

  if (!ticketRows.length) {
    return null;
  }

  const bookingMap = await getBookingMap(bookings);
  return (await mapTicketRows(ticketRows.slice(0, 1), bookingMap, true))[0] ?? null;
}

export async function getSupportTicketContext(ticketId: string, bookings?: TravelerBooking[]) {
  noStore();
  const ticket = await getSupportTicketById(ticketId, bookings);

  if (!ticket) {
    return null;
  }

  return {
    assignedAgent: ticket.assignedAgent ?? null,
    booking: ticket.booking ?? null,
    category: ticket.category,
    id: ticket.id,
    priority: ticket.priority,
    reference: ticket.reference,
    status: ticket.status,
    subject: ticket.subject,
  };
}
