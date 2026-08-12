import "server-only";

import { createClient } from "@/lib/supabase/server";
import type { DbEnum } from "@/lib/supabase/database";

type SupportTicketCategory = DbEnum<"support_ticket_category">;
type SupportTicketPriority = DbEnum<"support_ticket_priority">;
type SupportTicketStatus = DbEnum<"support_ticket_status">;
type CreateSupportTicketInput = {
  bookingId?: string;
  category: SupportTicketCategory;
  message: string;
  priority: SupportTicketPriority;
  subject: string;
};

type SupportMutationResult =
  | { ok: true }
  | { ok: false; reason: "blocked" | "forbidden" | "invalid" | "not_found" };

export async function createSupportTicketRecord(input: CreateSupportTicketInput) {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("create_support_ticket", {
    booking_uuid: input.bookingId,
    category_input: input.category,
    message_input: input.message,
    priority_input: input.priority,
    subject_input: input.subject,
  });

  if (error) {
    return null;
  }

  return (data ?? [])[0] ?? null;
}

export async function addSupportTicketMessage(ticketId: string, message: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("add_support_ticket_message", {
    internal_note: false,
    message_input: message,
    ticket_uuid: ticketId,
  });

  if (error) {
    return null;
  }

  return (data ?? [])[0] ?? null;
}

export async function updateOwnSupportTicketStatus(
  ticketId: string,
  targetStatus: Extract<SupportTicketStatus, "closed" | "open">,
): Promise<SupportMutationResult> {
  const supabase = await createClient();
  const { data: ticket, error: ticketError } = await supabase
    .from("support_tickets")
    .select("id, status, assigned_to_profile_id, resolved_at, closed_at")
    .eq("id", ticketId)
    .maybeSingle();

  if (ticketError) {
    return { ok: false, reason: "blocked" };
  }

  if (!ticket) {
    return { ok: false, reason: "not_found" };
  }

  if (targetStatus === "closed") {
    if (
      ticket.status === "resolved"
      || ticket.status === "escalated"
      || ticket.assigned_to_profile_id
      || ticket.resolved_at
    ) {
      return { ok: false, reason: "forbidden" };
    }

    const { error } = await supabase
      .from("support_tickets")
      .update({
        closed_at: new Date().toISOString(),
        status: "closed",
      })
      .eq("id", ticketId);

    if (error) {
      return { ok: false, reason: "blocked" };
    }

    return { ok: true };
  }

  if (ticket.status !== "closed" || ticket.assigned_to_profile_id || ticket.resolved_at) {
    return { ok: false, reason: "forbidden" };
  }

  const { error } = await supabase
    .from("support_tickets")
    .update({
      closed_at: null,
      status: "open",
    })
    .eq("id", ticketId);

  if (error) {
    return { ok: false, reason: "blocked" };
  }

  return { ok: true };
}
