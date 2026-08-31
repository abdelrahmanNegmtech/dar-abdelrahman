import "server-only";

import { unstable_noStore as noStore } from "next/cache";
import { getOwnerBookings } from "@/features/bookings/data/booking-queries";
import type {
  SupportTicketMessageRow,
  SupportTicketRow,
} from "@/lib/supabase/database";
import { requireOwner } from "@/lib/supabase/auth";
import { createClient } from "@/lib/supabase/server";
import type {
  OwnerSupportBookingReference,
  OwnerSupportTicketDetail,
  OwnerSupportTicketListItem,
  OwnerSupportTicketMessage,
} from "./owner-support-types";

type TicketRow = Pick<
  SupportTicketRow,
  | "booking_id"
  | "category"
  | "closed_at"
  | "created_at"
  | "id"
  | "priority"
  | "property_id"
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
  display_name: string | null;
  full_name: string;
  id: string;
};

async function getOwnerScopedSupabase() {
  const { user } = await requireOwner();

  return {
    supabase: await createClient(),
    user,
  };
}

async function getProfileLookup(profileIds: string[]) {
  if (!profileIds.length) {
    return new Map<string, ProfileLookupRow>();
  }

  const { supabase } = await getOwnerScopedSupabase();
  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name, display_name")
    .in("id", profileIds);

  if (error) {
    throw new Error("Unable to load support ticket profiles.");
  }

  return new Map(
    (data ?? []).map((profile) => [
      profile.id,
      profile as ProfileLookupRow,
    ]),
  );
}

function mapTicketRow(ticket: TicketRow): OwnerSupportTicketListItem {
  return {
    bookingId: ticket.booking_id,
    category: ticket.category,
    closedAt: ticket.closed_at,
    createdAt: ticket.created_at,
    id: ticket.id,
    priority: ticket.priority,
    propertyId: ticket.property_id,
    resolvedAt: ticket.resolved_at,
    status: ticket.status,
    subject: ticket.subject,
    ticketReference: ticket.ticket_reference,
    updatedAt: ticket.updated_at,
  };
}

export async function getOwnerSupportTickets(): Promise<
  OwnerSupportTicketListItem[]
> {
  noStore();

  const { supabase, user } = await getOwnerScopedSupabase();

  const { data, error } = await supabase
    .from("support_tickets")
    .select(
      "id, ticket_reference, subject, category, priority, status, booking_id, property_id, created_at, updated_at, resolved_at, closed_at",
    )
    .eq("user_id", user.id)
    .is("deleted_at", null)
    .order("updated_at", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error("Unable to load owner support tickets.");
  }

  return ((data ?? []) as TicketRow[]).map(mapTicketRow);
}

export async function getOwnerSupportTicketMessages(
  ticketId: string,
): Promise<OwnerSupportTicketMessage[]> {
  noStore();

  const { supabase, user } = await getOwnerScopedSupabase();

  const { data: ticket, error: ticketError } = await supabase
    .from("support_tickets")
    .select("id")
    .eq("id", ticketId)
    .eq("user_id", user.id)
    .is("deleted_at", null)
    .maybeSingle();

  if (ticketError) {
    throw new Error("Unable to verify owner support ticket.");
  }

  if (!ticket) {
    return [];
  }

  const { data, error } = await supabase
    .from("support_ticket_messages")
    .select(
      "id, ticket_id, sender_id, sender_role, message, is_internal, created_at",
    )
    .eq("ticket_id", ticketId)
    .eq("is_internal", false)
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error("Unable to load owner support ticket messages.");
  }

  const rows = (data ?? []) as MessageRow[];

  const senderIds = Array.from(
    new Set(
      rows
        .map((row) => row.sender_id)
        .filter((value): value is string => Boolean(value)),
    ),
  );

  const profilesById = await getProfileLookup(senderIds);

  return rows.map((row): OwnerSupportTicketMessage => {
    const profile = row.sender_id
      ? profilesById.get(row.sender_id) ?? null
      : null;

    const isSupportSender =
      row.sender_role === "support_staff" || row.sender_role === "system";

    return {
      createdAt: row.created_at,
      id: row.id,
      message: row.message,
      senderId: row.sender_id,
      senderName:
        profile?.display_name ??
        profile?.full_name ??
        (isSupportSender ? "DAR Support" : "You"),
      senderRole: row.sender_role,
    };
  });
}

export async function getOwnerSupportTicketById(
  ticketId: string,
): Promise<OwnerSupportTicketDetail | null> {
  noStore();

  const { supabase, user } = await getOwnerScopedSupabase();

  const { data, error } = await supabase
    .from("support_tickets")
    .select(
      "id, ticket_reference, subject, category, priority, status, booking_id, property_id, created_at, updated_at, resolved_at, closed_at",
    )
    .eq("id", ticketId)
    .eq("user_id", user.id)
    .is("deleted_at", null)
    .maybeSingle();

  if (error) {
    throw new Error("Unable to load owner support ticket.");
  }

  if (!data) {
    return null;
  }

  const ticket = mapTicketRow(data as TicketRow);
  const messages = await getOwnerSupportTicketMessages(ticket.id);

  return {
    ...ticket,
    messages,
  };
}

export async function getOwnerSupportBookingReferences(): Promise<
  OwnerSupportBookingReference[]
> {
  noStore();

  const bookings = await getOwnerBookings();

  return bookings.map((booking) => ({
    id: booking.id,
    propertyId: booking.propertyId,
    propertyTitle: booking.propertyTitle,
    reference: booking.reference,
  }));
}
