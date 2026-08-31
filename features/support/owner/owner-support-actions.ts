"use server";

import { revalidatePath } from "next/cache";
import {
  addSupportTicketMessage,
  createSupportTicketRecord,
  updateOwnSupportTicketStatus,
} from "@/features/support/data/support-ticket-mutations";
import { requireOwner } from "@/lib/supabase/auth";
import {
  ownerSupportReplySchema,
  ownerSupportStatusSchema,
  ownerSupportTicketSchema,
  type OwnerSupportReplyInput,
  type OwnerSupportStatusInput,
  type OwnerSupportTicketInput,
} from "./owner-support-validation";

type ActionResult<T = undefined> =
  | { ok: true; data: T; message?: string }
  | { ok: false; message: string };

function fail<T = undefined>(message: string): ActionResult<T> {
  return { message, ok: false };
}

function ok<T>(data: T, message?: string): ActionResult<T> {
  return { data, message, ok: true };
}

function revalidateOwnerSupportPaths(ticketId?: string) {
  revalidatePath("/owner/help-center");

  if (ticketId) {
    revalidatePath(`/owner/help-center/tickets/${ticketId}`);
  }
}

export async function createOwnerSupportTicket(
  input: OwnerSupportTicketInput,
): Promise<ActionResult<{ ticketId: string }>> {
  const parsed = ownerSupportTicketSchema.safeParse(input);

  if (!parsed.success) {
    return fail("Please review your support request and try again.");
  }

  await requireOwner();

  const ticket = await createSupportTicketRecord({
    bookingId: parsed.data.bookingId,
    category: parsed.data.category,
    message: parsed.data.message,
    priority: parsed.data.priority,
    subject: parsed.data.subject,
  });

  if (!ticket?.ticket_id) {
    return fail("We could not create your support ticket right now.");
  }

  revalidateOwnerSupportPaths(ticket.ticket_id);

  return ok(
    { ticketId: ticket.ticket_id },
    "Your support request has been sent to DAR.",
  );
}

export async function replyToOwnerSupportTicket(
  input: OwnerSupportReplyInput,
): Promise<ActionResult<{ ticketId: string }>> {
  const parsed = ownerSupportReplySchema.safeParse(input);

  if (!parsed.success) {
    return fail("Please enter a valid reply.");
  }

  await requireOwner();

  const message = await addSupportTicketMessage(
    parsed.data.ticketId,
    parsed.data.message,
  );

  if (!message) {
    return fail("We could not send your reply right now.");
  }

  revalidateOwnerSupportPaths(parsed.data.ticketId);

  return ok(
    { ticketId: parsed.data.ticketId },
    "Your reply has been sent.",
  );
}

export async function updateOwnerSupportTicketStatus(
  input: OwnerSupportStatusInput,
): Promise<ActionResult<{ status: "closed" | "open"; ticketId: string }>> {
  const parsed = ownerSupportStatusSchema.safeParse(input);

  if (!parsed.success) {
    return fail("Invalid support ticket request.");
  }

  await requireOwner();

  const result = await updateOwnSupportTicketStatus(
    parsed.data.ticketId,
    parsed.data.status,
  );

  if (!result.ok) {
    if (result.reason === "not_found") {
      return fail("Support ticket not found.");
    }

    if (result.reason === "forbidden") {
      return fail("This support ticket cannot be changed right now.");
    }

    return fail("We could not update this support ticket right now.");
  }

  revalidateOwnerSupportPaths(parsed.data.ticketId);

  return ok(
    {
      status: parsed.data.status,
      ticketId: parsed.data.ticketId,
    },
    parsed.data.status === "closed"
      ? "Support ticket closed."
      : "Support ticket reopened.",
  );
}
