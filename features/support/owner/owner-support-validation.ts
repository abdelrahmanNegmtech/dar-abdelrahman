import { z } from "zod";

export const ownerSupportTicketSchema = z.object({
  bookingId: z.string().uuid().optional(),
  category: z.enum([
    "payment_issue",
    "booking_issue",
    "refund_request",
    "property_issue",
    "account_issue",
    "verification_issue",
    "technical_issue",
    "other",
  ]),
  message: z.string().trim().min(20).max(2000),
  priority: z.enum(["low", "medium", "high", "urgent"]),
  subject: z.string().trim().min(6).max(120),
});

export const ownerSupportReplySchema = z.object({
  message: z.string().trim().min(2).max(1200),
  ticketId: z.string().uuid(),
});

export const ownerSupportStatusSchema = z.object({
  status: z.enum(["closed", "open"]),
  ticketId: z.string().uuid(),
});

export type OwnerSupportTicketInput = z.infer<
  typeof ownerSupportTicketSchema
>;

export type OwnerSupportReplyInput = z.infer<
  typeof ownerSupportReplySchema
>;

export type OwnerSupportStatusInput = z.infer<
  typeof ownerSupportStatusSchema
>;
