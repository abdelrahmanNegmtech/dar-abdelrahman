import type { Database } from "./database.types";

type PublicSchema = Database["public"];

export type DbTableName = keyof PublicSchema["Tables"];
export type DbEnumName = keyof PublicSchema["Enums"];

export type TableRow<T extends DbTableName> = PublicSchema["Tables"][T]["Row"];
export type TableInsert<T extends DbTableName> = PublicSchema["Tables"][T]["Insert"];
export type TableUpdate<T extends DbTableName> = PublicSchema["Tables"][T]["Update"];
export type DbEnum<T extends DbEnumName> = PublicSchema["Enums"][T];

export type AccountType = DbEnum<"account_type">;
export type UserAccountType = Extract<AccountType, "guest" | "owner">;

export type ProfileRow = TableRow<"profiles">;
export type ProfileInsert = TableInsert<"profiles">;
export type ProfileUpdate = TableUpdate<"profiles">;

export type PropertyRow = TableRow<"properties">;
export type PropertyInsert = TableInsert<"properties">;
export type PropertyUpdate = TableUpdate<"properties">;

export type BookingRow = TableRow<"bookings">;
export type BookingInsert = TableInsert<"bookings">;
export type BookingUpdate = TableUpdate<"bookings">;

export type ConversationRow = TableRow<"conversations">;
export type ConversationInsert = TableInsert<"conversations">;
export type ConversationUpdate = TableUpdate<"conversations">;

export type MessageRow = TableRow<"messages">;
export type MessageInsert = TableInsert<"messages">;
export type MessageUpdate = TableUpdate<"messages">;

export type NotificationRow = TableRow<"notifications">;
export type NotificationInsert = TableInsert<"notifications">;
export type NotificationUpdate = TableUpdate<"notifications">;

export type ReviewRow = TableRow<"reviews">;
export type ReviewInsert = TableInsert<"reviews">;
export type ReviewUpdate = TableUpdate<"reviews">;

export type PayoutRow = TableRow<"payouts">;
export type PayoutInsert = TableInsert<"payouts">;
export type PayoutUpdate = TableUpdate<"payouts">;

export type SupportTicketRow = TableRow<"support_tickets">;
export type SupportTicketInsert = TableInsert<"support_tickets">;
export type SupportTicketUpdate = TableUpdate<"support_tickets">;

export type SupportTicketMessageRow = TableRow<"support_ticket_messages">;
export type SupportTicketMessageInsert = TableInsert<"support_ticket_messages">;
export type SupportTicketMessageUpdate = TableUpdate<"support_ticket_messages">;
