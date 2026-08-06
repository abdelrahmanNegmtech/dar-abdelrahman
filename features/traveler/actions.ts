"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { DEV_AUTH_BYPASS_USER, isDevAuthBypassEnabled } from "@/lib/auth/devAuthBypass";
import { getSupabaseConfig } from "@/lib/supabase/config";
import type { DbEnum } from "@/lib/supabase/database";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";
import type { ActionResult } from "./types";
import {
  cancelBookingSchema,
  deleteReviewSchema,
  editReviewSchema,
  messageSchema,
  notificationSchema,
  paymentMethodSchema,
  profileSchema,
  reviewSchema,
  supportReplySchema,
  supportTicketSchema,
} from "./validation";
import { devTravelerData } from "./data/devData";
import {
  devCreateSupportTicket,
  devDeleteNotification,
  devDeleteReview,
  devMarkAllNotificationsRead,
  devMarkConversationRead,
  devMarkNotificationRead,
  devMarkNotificationUnread,
  devReplyToSupportTicket,
  devSubmitReview,
  devUpdateReview,
  devUpdateTicketStatus,
} from "./data/devStore";

type ActionUser = {
  id: string;
  usingFallback: boolean;
};

type SupportTicketCategory = DbEnum<"support_ticket_category">;
type SupportSenderRole = DbEnum<"support_sender_role">;

const supportTicketCategoryMap: Record<string, SupportTicketCategory> = {
  "Account": "account_issue",
  "Booking help": "booking_issue",
  "Check-in / access": "property_issue",
  "Payments": "payment_issue",
  "Property issue": "property_issue",
  "Refunds": "refund_request",
  "Safety or security": "other",
  "Technical issue": "technical_issue",
};

function mapSupportTicketCategory(category: string): SupportTicketCategory | null {
  return supportTicketCategoryMap[category] ?? null;
}

function ok(message: string): ActionResult {
  return { message, ok: true };
}

function fail(message: string): ActionResult {
  return { message, ok: false };
}

function getProfileUpdateErrorMessage() {
  return "We could not save your profile changes right now. Please try again.";
}

async function getActionUser(): Promise<ActionUser | null> {
  if (isDevAuthBypassEnabled()) {
    return {
      id: DEV_AUTH_BYPASS_USER.id,
      usingFallback: true,
    };
  }

  if (!getSupabaseConfig()) {
    return null;
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user ? { id: user.id, usingFallback: false } : null;
}

async function getAuthedClient() {
  const user = await getActionUser();

  if (!user) {
    return { supabase: null, user: null };
  }

  if (user.usingFallback) {
    return { supabase: null, user };
  }

  return { supabase: await createClient(), user };
}

export async function logoutTraveler() {
  if (getSupabaseConfig()) {
    const supabase = await createClient();
    await supabase.auth.signOut();
  }

  redirect("/login");
}

export async function toggleSavedProperty(propertyId: string): Promise<ActionResult> {
  if (!propertyId) {
    return fail("Missing property.");
  }

  const { supabase, user } = await getAuthedClient();

  if (!user) {
    return fail("Please sign in to manage saved properties.");
  }

  if (supabase) {
    const { data: existing } = await supabase
      .from("saved_properties")
      .select("property_id")
      .eq("traveler_id", user.id)
      .eq("property_id", propertyId)
      .maybeSingle();

    if (existing) {
      const { error } = await supabase
        .from("saved_properties")
        .delete()
        .eq("traveler_id", user.id)
        .eq("property_id", propertyId);

      if (error) return fail(error.message);
    } else {
      const { error } = await supabase.from("saved_properties").insert({
        property_id: propertyId,
        traveler_id: user.id,
      });

      if (error) return fail(error.message);
    }
  }

  revalidatePath("/traveler/saved");
  revalidatePath("/traveler/dashboard");
  return ok("Saved properties updated.");
}

export async function cancelBooking(input: unknown): Promise<ActionResult> {
  const parsed = cancelBookingSchema.safeParse(input);

  if (!parsed.success) {
    return fail(parsed.error.issues[0]?.message ?? "Please check the cancellation details.");
  }

  const { supabase, user } = await getAuthedClient();

  if (!user) {
    return fail("Please sign in to cancel this booking.");
  }

  if (supabase) {
    const { error } = await supabase
      .from("bookings")
      .update({
        cancellation_reason: parsed.data.reason,
        status: "cancelled",
      })
      .eq("id", parsed.data.bookingId)
      .eq("traveler_id", user.id);

    if (error) return fail(error.message);
  }

  revalidatePath("/traveler/bookings");
  revalidatePath(`/traveler/bookings/${parsed.data.bookingId}`);
  return ok("Booking cancelled successfully.");
}

const deleteMessageSchema = z.object({
  messageId: z.string().min(1),
});

const markReadSchema = z.object({
  conversationId: z.string().min(1),
});

export async function sendConversationMessage(input: unknown): Promise<ActionResult> {
  const parsed = messageSchema.safeParse(input);

  if (!parsed.success) {
    return fail(parsed.error.issues[0]?.message ?? "Please check your message.");
  }

  const { supabase, user } = await getAuthedClient();

  if (!user) {
    return fail("Please sign in to send messages.");
  }

  if (supabase) {
    const { data: member } = await supabase
      .from("conversation_members")
      .select("conversation_id")
      .eq("conversation_id", parsed.data.conversationId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (!member) {
      return fail("You do not have access to this conversation.");
    }

    const { error } = await supabase.from("messages").insert({
      body: parsed.data.message,
      conversation_id: parsed.data.conversationId,
      message_type: "text",
      sender_id: user.id,
    });

    if (error) return fail(error.message);
  }

  revalidatePath("/traveler/messages");
  return ok("Message sent.");
}

export async function markConversationRead(input: unknown): Promise<ActionResult> {
  const parsed = markReadSchema.safeParse(input);

  if (!parsed.success) {
    return fail("Missing conversation.");
  }

  const { supabase, user } = await getAuthedClient();

  if (!user) {
    return fail("Please sign in.");
  }

  if (supabase) {
    const { error } = await supabase
      .from("conversation_members")
      .update({ last_read_at: new Date().toISOString() })
      .eq("conversation_id", parsed.data.conversationId)
      .eq("user_id", user.id);

    if (error) return fail(error.message);
  } else {
    // MUTATE the in-memory dev store so read state survives navigation/refresh
    devMarkConversationRead(parsed.data.conversationId);
  }

  revalidatePath("/traveler/messages");
  return ok("Conversation marked as read.");
}

export async function deleteConversationMessage(input: unknown): Promise<ActionResult> {
  const parsed = deleteMessageSchema.safeParse(input);

  if (!parsed.success) {
    return fail("Missing message.");
  }

  const { supabase, user } = await getAuthedClient();

  if (!user) {
    return fail("Please sign in.");
  }

  if (supabase) {
    const { error } = await supabase
      .from("messages")
      .update({ body: null, message_type: "system" })
      .eq("id", parsed.data.messageId)
      .eq("sender_id", user.id);

    if (error) return fail(error.message);
  }

  revalidatePath("/traveler/messages");
  return ok("Message deleted.");
}

const toggleNotificationReadSchema = z.object({
  notificationId: z.string().min(1),
  isRead: z.boolean(),
});

export async function markNotificationRead(input: unknown): Promise<ActionResult> {
  const parsed = notificationSchema.safeParse(input);

  if (!parsed.success) {
    return fail("Missing notification.");
  }

  const { supabase, user } = await getAuthedClient();

  if (!user) {
    return fail("Please sign in to manage notifications.");
  }

  if (supabase) {
    const { error } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("id", parsed.data.notificationId)
      .eq("user_id", user.id);

    if (error) return fail(error.message);
  } else {
    // MUTATE the in-memory dev store so read state survives navigation/refresh
    devMarkNotificationRead(parsed.data.notificationId);
  }

  revalidatePath("/traveler/notifications");
  return ok("Notification marked as read.");
}

export async function markNotificationUnread(input: unknown): Promise<ActionResult> {
  const parsed = toggleNotificationReadSchema.safeParse(input);

  if (!parsed.success) {
    return fail("Missing notification.");
  }

  const { supabase, user } = await getAuthedClient();

  if (!user) {
    return fail("Please sign in to manage notifications.");
  }

  if (supabase) {
    const { error } = await supabase
      .from("notifications")
      .update({ is_read: parsed.data.isRead })
      .eq("id", parsed.data.notificationId)
      .eq("user_id", user.id);

    if (error) return fail(error.message);
  } else {
    // MUTATE the in-memory dev store so read state survives navigation/refresh
    if (parsed.data.isRead) {
      devMarkNotificationRead(parsed.data.notificationId);
    } else {
      devMarkNotificationUnread(parsed.data.notificationId);
    }
  }

  revalidatePath("/traveler/notifications");
  return ok(parsed.data.isRead ? "Notification marked as read." : "Notification marked as unread.");
}

export async function markAllNotificationsRead(): Promise<ActionResult> {
  const { supabase, user } = await getAuthedClient();

  if (!user) {
    return fail("Please sign in to manage notifications.");
  }

  if (supabase) {
    const { error } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("user_id", user.id);

    if (error) return fail(error.message);
  } else {
    // MUTATE the in-memory dev store
    devMarkAllNotificationsRead();
  }

  revalidatePath("/traveler/notifications");
  revalidatePath("/traveler/dashboard");
  return ok("All notifications marked as read.");
}

export async function deleteNotification(input: unknown): Promise<ActionResult> {
  const parsed = notificationSchema.safeParse(input);

  if (!parsed.success) {
    return fail("Missing notification.");
  }

  const { supabase, user } = await getAuthedClient();

  if (!user) {
    return fail("Please sign in to manage notifications.");
  }

  if (supabase) {
    const { error } = await supabase
      .from("notifications")
      .delete()
      .eq("id", parsed.data.notificationId)
      .eq("user_id", user.id);

    if (error) return fail(error.message);
  } else {
    // MUTATE the in-memory dev store
    devDeleteNotification(parsed.data.notificationId);
  }

  revalidatePath("/traveler/notifications");
  return ok("Notification deleted.");
}

export async function submitReview(input: unknown): Promise<ActionResult> {
  const parsed = reviewSchema.safeParse(input);

  if (!parsed.success) {
    return fail(parsed.error.issues[0]?.message ?? "Please check your review.");
  }

  const { supabase, user } = await getAuthedClient();

  if (!user) {
    return fail("Please sign in to submit a review.");
  }

  if (supabase) {
    const { data: booking } = await supabase
      .from("bookings")
      .select("id, property_id, owner_id, status")
      .eq("id", parsed.data.bookingId)
      .eq("traveler_id", user.id)
      .eq("status", "completed")
      .maybeSingle();

    if (!booking) {
      return fail("Only completed bookings can be reviewed.");
    }

    const { error } = await supabase.from("reviews").upsert(
      {
        accuracy_rating: parsed.data.accuracyRating,
        booking_id: booking.id,
        cleanliness_rating: parsed.data.cleanlinessRating,
        comment: parsed.data.comment,
        communication_rating: parsed.data.communicationRating,
        location_rating: parsed.data.locationRating,
        owner_id: booking.owner_id,
        property_id: booking.property_id,
        rating: parsed.data.rating,
        status: "submitted",
        traveler_id: user.id,
        value_rating: parsed.data.valueRating,
      },
      { onConflict: "booking_id,traveler_id" },
    );

    if (error) return fail(error.message);
  } else {
    // MUTATE the dev store so new reviews persist in dev preview mode
    // The else branch only runs in dev-fallback mode (Supabase not configured),
    // so the bypass user is always available.
    const profile = {
      avatarUrl: DEV_AUTH_BYPASS_USER.avatarUrl,
      fullName: DEV_AUTH_BYPASS_USER.fullName,
      id: user.id,
    };
    devSubmitReview(parsed.data.bookingId, profile, parsed.data);
  }

  revalidatePath("/traveler/reviews");
  return ok("Review submitted.");
}

export async function updateReview(input: unknown): Promise<ActionResult> {
  const parsed = editReviewSchema.safeParse(input);

  if (!parsed.success) {
    return fail(parsed.error.issues[0]?.message ?? "Please check your review.");
  }

  const { supabase, user } = await getAuthedClient();

  if (!user) {
    return fail("Please sign in to update a review.");
  }

  if (supabase) {
    const { error } = await supabase
      .from("reviews")
      .update({
        accuracy_rating: parsed.data.accuracyRating,
        cleanliness_rating: parsed.data.cleanlinessRating,
        comment: parsed.data.comment,
        communication_rating: parsed.data.communicationRating,
        location_rating: parsed.data.locationRating,
        rating: parsed.data.rating,
        status: "submitted",
        value_rating: parsed.data.valueRating,
      })
      .eq("id", parsed.data.reviewId)
      .eq("traveler_id", user.id);

    if (error) return fail(error.message);
  } else {
    devUpdateReview(parsed.data.reviewId, parsed.data);
  }

  revalidatePath("/traveler/reviews");
  return ok("Review updated.");
}

export async function deleteReview(input: unknown): Promise<ActionResult> {
  const parsed = deleteReviewSchema.safeParse(input);

  if (!parsed.success) {
    return fail("Missing review.");
  }

  const { supabase, user } = await getAuthedClient();

  if (!user) {
    return fail("Please sign in to delete a review.");
  }

  if (supabase) {
    const { error } = await supabase
      .from("reviews")
      .delete()
      .eq("id", parsed.data.reviewId)
      .eq("traveler_id", user.id);

    if (error) return fail(error.message);
  } else {
    devDeleteReview(parsed.data.reviewId);
  }

  revalidatePath("/traveler/reviews");
  return ok("Review deleted.");
}

export async function updateTravelerProfile(input: unknown): Promise<ActionResult> {
  const parsed = profileSchema.safeParse(input);

  if (!parsed.success) {
    return fail(parsed.error.issues[0]?.message ?? "Please check your profile details.");
  }

  const { supabase, user } = await getAuthedClient();

  if (!user) {
    return fail("Please sign in to update your profile.");
  }

  if (supabase) {
    const { error } = await supabase
      .from("profiles")
      .update({
        address: parsed.data.address ?? null,
        city: parsed.data.city,
        country: parsed.data.country,
        date_of_birth: parsed.data.dateOfBirth,
        display_name: parsed.data.displayName ?? null,
        emergency_contact_name: parsed.data.emergencyContactName ?? null,
        emergency_contact_phone: parsed.data.emergencyContactPhone ?? null,
        full_name: parsed.data.fullName,
        nationality: parsed.data.nationality,
        phone: parsed.data.phone,
        preferred_currency: parsed.data.preferredCurrency,
        preferred_language: parsed.data.preferredLanguage,
      })
      .eq("id", user.id);

    if (error) return fail(getProfileUpdateErrorMessage());
  }

  revalidatePath("/traveler/profile");
  return ok("Profile updated.");
}

export async function addPaymentMethod(input: unknown): Promise<ActionResult> {
  const parsed = paymentMethodSchema.safeParse(input);

  if (!parsed.success) {
    return fail(parsed.error.issues[0]?.message ?? "Please check the payment method.");
  }

  const { supabase, user } = await getAuthedClient();

  if (!user) {
    return fail("Please sign in to manage payment methods.");
  }

  if (supabase) {
    const { error } = await supabase.from("payment_methods").insert({
      brand: parsed.data.brand,
      is_default: false,
      last_four: parsed.data.lastFour,
      method_type: parsed.data.provider === "instapay" || parsed.data.provider === "vodafone_cash" ? "wallet" : "card",
      provider: parsed.data.provider,
      user_id: user.id,
    });

    if (error) return fail(error.message);
  }

  revalidatePath("/traveler/payments");
  return ok("Payment method added.");
}

export async function setDefaultPaymentMethod(methodId: string): Promise<ActionResult> {
  const { supabase, user } = await getAuthedClient();

  if (!user || !methodId) {
    return fail("Please sign in to manage payment methods.");
  }

  if (supabase) {
    const clear = await supabase.from("payment_methods").update({ is_default: false }).eq("user_id", user.id);
    if (clear.error) return fail(clear.error.message);

    const setDefault = await supabase
      .from("payment_methods")
      .update({ is_default: true })
      .eq("id", methodId)
      .eq("user_id", user.id);
    if (setDefault.error) return fail(setDefault.error.message);
  }

  revalidatePath("/traveler/payments");
  return ok("Default payment method updated.");
}

export async function removePaymentMethod(methodId: string): Promise<ActionResult> {
  const { supabase, user } = await getAuthedClient();

  if (!user || !methodId) {
    return fail("Please sign in to manage payment methods.");
  }

  if (supabase) {
    const { error } = await supabase.from("payment_methods").delete().eq("id", methodId).eq("user_id", user.id);
    if (error) return fail(error.message);
  }

  revalidatePath("/traveler/payments");
  return ok("Payment method removed.");
}

export async function createSupportTicket(input: unknown): Promise<ActionResult> {
  const parsed = supportTicketSchema.safeParse(input);

  if (!parsed.success) {
    return fail(parsed.error.issues[0]?.message ?? "Please check the ticket details.");
  }

  const { supabase, user } = await getAuthedClient();

  if (!user) {
    return fail("Please sign in to create a support ticket.");
  }

  const mappedCategory = mapSupportTicketCategory(parsed.data.category);

  if (!mappedCategory) {
    return fail("Please select a valid support category.");
  }

  if (supabase) {
    const reference = `TKT-${Math.floor(1000 + Math.random() * 9000)}`;
    const { data: ticket, error } = await supabase
      .from("support_tickets")
      .insert({
        booking_id: parsed.data.bookingId || null,
        category: mappedCategory,
        priority: parsed.data.priority,
        status: "open",
        subject: parsed.data.subject,
        ticket_reference: reference,
        user_id: user.id,
      })
      .select("id")
      .single();

    if (error) return fail(error.message);

    const message = await supabase.from("support_ticket_messages").insert({
      is_internal: false,
      message: parsed.data.message,
      sender_id: user.id,
      sender_role: "traveler" as SupportSenderRole,
      ticket_id: ticket.id,
    });

    if (message.error) return fail(message.error.message);    } else {
      const booking = parsed.data.bookingId
        ? devTravelerData.bookings.find((b) => b.id === parsed.data.bookingId)
        : undefined;
    devCreateSupportTicket({
      booking,
      category: parsed.data.category,
      id: `ticket-${Date.now()}`,
      message: parsed.data.message,
      priority: parsed.data.priority,
      reference: `TKT-${Math.floor(1000 + Math.random() * 9000)}`,
      subject: parsed.data.subject,
    });
  }

  revalidatePath("/traveler/support");
  return ok("Support ticket created.");
}

export async function replyToSupportTicket(input: unknown): Promise<ActionResult> {
  const parsed = supportReplySchema.safeParse(input);

  if (!parsed.success) {
    return fail(parsed.error.issues[0]?.message ?? "Please check your reply.");
  }

  const { supabase, user } = await getAuthedClient();

  if (!user) {
    return fail("Please sign in to reply.");
  }

  if (supabase) {
    const { data: ticket } = await supabase
      .from("support_tickets")
      .select("id")
      .eq("id", parsed.data.ticketId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (!ticket) {
      return fail("You do not have access to this ticket.");
    }

    const { error } = await supabase.from("support_ticket_messages").insert({
      is_internal: false,
      message: parsed.data.message,
      sender_id: user.id,
      sender_role: "traveler" as SupportSenderRole,
      ticket_id: ticket.id,
    });

    if (error) return fail(error.message);
  } else {
    devReplyToSupportTicket(parsed.data.ticketId, parsed.data.message);
  }

  revalidatePath("/traveler/support");
  revalidatePath(`/traveler/support/tickets/${parsed.data.ticketId}`);
  return ok("Reply sent.");
}

export async function updateSupportTicketStatus(ticketId: string, status: "closed" | "open"): Promise<ActionResult> {
  const { supabase, user } = await getAuthedClient();

  if (!user || !ticketId) {
    return fail("Please sign in to update this ticket.");
  }

  if (supabase) {
    const { error } = await supabase
      .from("support_tickets")
      .update(status === "closed" ? { closed_at: new Date().toISOString(), status } : { closed_at: null, status })
      .eq("id", ticketId)
      .eq("user_id", user.id);

    if (error) return fail(error.message);
  } else {
    devUpdateTicketStatus(ticketId, status);
  }

  revalidatePath("/traveler/support");
  revalidatePath(`/traveler/support/tickets/${ticketId}`);
  return ok(status === "closed" ? "Ticket closed." : "Ticket reopened.");
}
