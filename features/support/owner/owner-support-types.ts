import type { DbEnum } from "@/lib/supabase/database";

export type OwnerSupportTicketCategory = DbEnum<"support_ticket_category">;
export type OwnerSupportTicketPriority = DbEnum<"support_ticket_priority">;
export type OwnerSupportTicketStatus = DbEnum<"support_ticket_status">;
export type OwnerSupportSenderRole = DbEnum<"support_sender_role">;

export type OwnerSupportBookingReference = {
  id: string;
  reference: string;
  propertyId: string;
  propertyTitle: string;
};

export type OwnerSupportTicketListItem = {
  bookingId: string | null;
  category: OwnerSupportTicketCategory;
  closedAt: string | null;
  createdAt: string;
  id: string;
  priority: OwnerSupportTicketPriority;
  propertyId: string | null;
  resolvedAt: string | null;
  status: OwnerSupportTicketStatus;
  subject: string;
  ticketReference: string;
  updatedAt: string;
};

export type OwnerSupportTicketMessage = {
  createdAt: string;
  id: string;
  message: string;
  senderId: string | null;
  senderName: string;
  senderRole: OwnerSupportSenderRole;
};

export type OwnerSupportTicketDetail = OwnerSupportTicketListItem & {
  messages: OwnerSupportTicketMessage[];
};
