"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { DEV_AUTH_BYPASS_USER, isDevAuthBypassEnabled } from "@/lib/auth/devAuthBypass";
import { cancelTravelerBookingAction } from "@/features/bookings/actions";
import {
  addSupportTicketMessage,
  createSupportTicketRecord,
  updateOwnSupportTicketStatus,
} from "@/features/support/data/support-ticket-mutations";
import { getSupabaseConfig } from "@/lib/supabase/config";
import type { DbEnum } from "@/lib/supabase/database";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";
import type { ActionResult } from "./types";
import {
  cancelBookingSchema,
  conversationReadSchema,
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

const supportTicketCategoryMap: Record<string, SupportTicketCategory> = {
  "Account": "account_issue",
  "Booking help": "booking_issue",
  "Check-in / access": "property_issue",
  "Other": "other",
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

function getReviewActionErrorMessage() {
  return "We could not update that review right now. Please try again.";
}

async function getPropertySlugForReviewRevalidation(propertyId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("properties")
    .select("public_slug")
    .eq("id", propertyId)
    .maybeSingle();

  return data?.public_slug ?? null;
}

function revalidateReviewPropertyRoutes(propertySlug: string | null) {
  if (!propertySlug) {
    return;
  }

  revalidatePath(`/stays/${propertySlug}`);
  revalidatePath(`/properties/${propertySlug}`);
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
    const result = await cancelTravelerBookingAction({
      bookingId: parsed.data.bookingId,
      reason: parsed.data.reason,
    });

    if (!result.ok) {
      return fail(result.message);
    }
  }

  revalidatePath("/bookings");
  revalidatePath("/traveler/bookings");
  revalidatePath(`/traveler/bookings/${parsed.data.bookingId}`);
  revalidatePath("/owner/bookings");
  revalidatePath(`/owner/bookings/request-decision?bookingId=${parsed.data.bookingId}`);
  return ok("Booking cancelled successfully.");
}

const deleteMessageSchema = z.object({
  messageId: z.string().uuid(),
});

function getNotificationActionErrorMessage() {
  return "We could not update that notification right now. Please try again.";
}

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
    const { error } = await supabase.rpc("send_conversation_message", {
      body_input: parsed.data.message,
      conversation_uuid: parsed.data.conversationId,
      reply_to_message_uuid: parsed.data.replyToMessageId,
    });

    if (error) return fail("We could not send that message right now.");
  }

  revalidatePath("/traveler/messages");
  revalidatePath("/owner/messages");
  return ok("Message sent.");
}

export async function markConversationRead(input: unknown): Promise<ActionResult> {
  const parsed = conversationReadSchema.safeParse(input);

  if (!parsed.success) {
    return fail("Missing conversation.");
  }

  const { supabase, user } = await getAuthedClient();

  if (!user) {
    return fail("Please sign in.");
  }

  if (supabase) {
    const { error } = await supabase.rpc("mark_conversation_read", {
      conversation_uuid: parsed.data.conversationId,
      last_read_message_uuid: parsed.data.lastReadMessageId,
    });

    if (error) return fail("We could not update the read state right now.");
  } else {
    // MUTATE the in-memory dev store so read state survives navigation/refresh
    devMarkConversationRead(parsed.data.conversationId);
  }

  revalidatePath("/traveler/messages");
  revalidatePath("/owner/messages");
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
    const { data, error } = await supabase.rpc("delete_own_conversation_message", {
      message_uuid: parsed.data.messageId,
    });

    if (error || !(data ?? []).length) {
      return fail("We could not delete that message.");
    }
  }

  revalidatePath("/traveler/messages");
  revalidatePath("/owner/messages");
  return ok("Message deleted.");
}

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
    const readAt = new Date().toISOString();
    const { error } = await supabase
      .from("notifications")
      .update({ is_read: true, read_at: readAt })
      .eq("id", parsed.data.notificationId)
      .eq("user_id", user.id)
      .is("deleted_at", null);

    if (error) return fail(getNotificationActionErrorMessage());
  } else {
    // MUTATE the in-memory dev store so read state survives navigation/refresh
    devMarkNotificationRead(parsed.data.notificationId);
  }

  revalidatePath("/traveler/notifications");
  revalidatePath("/traveler/dashboard");
  return ok("Notification marked as read.");
}

export async function markNotificationUnread(input: unknown): Promise<ActionResult> {
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
      .update({ is_read: false, read_at: null })
      .eq("id", parsed.data.notificationId)
      .eq("user_id", user.id)
      .is("deleted_at", null);

    if (error) return fail(getNotificationActionErrorMessage());
  } else {
    // MUTATE the in-memory dev store so read state survives navigation/refresh
    devMarkNotificationUnread(parsed.data.notificationId);
  }

  revalidatePath("/traveler/notifications");
  revalidatePath("/traveler/dashboard");
  return ok("Notification marked as unread.");
}

export async function markAllNotificationsRead(): Promise<ActionResult> {
  const { supabase, user } = await getAuthedClient();

  if (!user) {
    return fail("Please sign in to manage notifications.");
  }

  if (supabase) {
    const readAt = new Date().toISOString();
    const { error } = await supabase
      .from("notifications")
      .update({ is_read: true, read_at: readAt })
      .eq("user_id", user.id)
      .eq("is_read", false)
      .is("deleted_at", null);

    if (error) return fail(getNotificationActionErrorMessage());
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
    const deletedAt = new Date().toISOString();
    const { error } = await supabase
      .from("notifications")
      .update({ deleted_at: deletedAt })
      .eq("id", parsed.data.notificationId)
      .eq("user_id", user.id)
      .is("deleted_at", null);

    if (error) return fail("We could not dismiss that notification right now. Please try again.");
  } else {
    // MUTATE the in-memory dev store
    devDeleteNotification(parsed.data.notificationId);
  }

  revalidatePath("/traveler/notifications");
  revalidatePath("/traveler/dashboard");
  return ok("Notification dismissed.");
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
    const { data: existingReview } = await supabase
      .from("reviews")
      .select("id")
      .eq("booking_id", parsed.data.bookingId)
      .eq("traveler_id", user.id)
      .is("removed_at", null)
      .maybeSingle();

    if (existingReview) {
      return fail("You have already submitted a review for this stay.");
    }

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

    const propertySlug = await getPropertySlugForReviewRevalidation(booking.property_id);

    const { error } = await supabase.from("reviews").insert(
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
        submitted_at: new Date().toISOString(),
        traveler_id: user.id,
        value_rating: parsed.data.valueRating,
      },
    );

    if (error) {
      return fail(error.code === "23505" ? "You have already submitted a review for this stay." : getReviewActionErrorMessage());
    }

    revalidateReviewPropertyRoutes(propertySlug);
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
    const { data: existingReview } = await supabase
      .from("reviews")
      .select("property_id")
      .eq("id", parsed.data.reviewId)
      .eq("traveler_id", user.id)
      .is("removed_at", null)
      .is("hidden_at", null)
      .maybeSingle();

    if (!existingReview) {
      return fail("We could not find that review.");
    }

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
      .eq("traveler_id", user.id)
      .is("removed_at", null)
      .is("hidden_at", null);

    if (error) return fail(getReviewActionErrorMessage());

    const propertySlug = await getPropertySlugForReviewRevalidation(existingReview.property_id);
    revalidateReviewPropertyRoutes(propertySlug);
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
    const { data: existingReview } = await supabase
      .from("reviews")
      .select("property_id")
      .eq("id", parsed.data.reviewId)
      .eq("traveler_id", user.id)
      .is("removed_at", null)
      .maybeSingle();

    if (!existingReview) {
      return fail("We could not find that review.");
    }

    const { data, error } = await supabase.rpc("remove_own_review", {
      review_uuid: parsed.data.reviewId,
    });

    if (error || !(data ?? []).length) return fail(getReviewActionErrorMessage());

    const propertySlug = await getPropertySlugForReviewRevalidation(existingReview.property_id);
    revalidateReviewPropertyRoutes(propertySlug);
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
    const ticket = await createSupportTicketRecord({
      ...parsed.data,
      category: mappedCategory,
    });

    if (!ticket) {
      return fail("We could not create that support ticket right now.");
    }
  } else {
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
    const message = await addSupportTicketMessage(parsed.data.ticketId, parsed.data.message);

    if (!message) {
      return fail("We could not send that support reply right now.");
    }
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
    const result = await updateOwnSupportTicketStatus(ticketId, status);

    if (!result.ok) {
      return fail(
        result.reason === "forbidden"
          ? "DAR support controls this ticket status right now."
          : result.reason === "not_found"
            ? "We could not find that ticket."
            : "We could not update that ticket right now.",
      );
    }
  } else {
    devUpdateTicketStatus(ticketId, status);
  }

  revalidatePath("/traveler/support");
  revalidatePath(`/traveler/support/tickets/${ticketId}`);
  return ok(status === "closed" ? "Ticket closed." : "Ticket reopened.");
}
