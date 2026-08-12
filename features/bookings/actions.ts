"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import type { Database } from "@/lib/supabase/database.types";
import { requireAuthenticatedUser, requireOwner } from "@/lib/supabase/auth";
import { createClient } from "@/lib/supabase/server";

type ActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; message: string };

type CreateTravelerBookingRpcRow =
  Database["public"]["Functions"]["create_traveler_booking"]["Returns"][number];
type OwnerDecisionRpcRow =
  Database["public"]["Functions"]["owner_decide_booking"]["Returns"][number];
type TravelerCancelRpcRow =
  Database["public"]["Functions"]["traveler_cancel_booking"]["Returns"][number];

const createTravelerBookingSchema = z.object({
  checkIn: z.string().trim().min(10),
  checkOut: z.string().trim().min(10),
  guests: z.number().int().positive(),
  paymentMethod: z.string().trim().optional(),
  propertyLookup: z.string().trim().min(1),
  specialRequests: z.string().trim().optional(),
  travelerEmail: z.string().trim().email().optional(),
  travelerFullName: z.string().trim().min(1).optional(),
  travelerPhone: z.string().trim().optional(),
});

const ownerDecisionSchema = z.object({
  bookingId: z.string().uuid(),
  decision: z.enum(["approve", "decline"]),
  message: z.string().trim().max(500).optional(),
});

const travelerCancellationSchema = z.object({
  bookingId: z.string().uuid(),
  reason: z.string().trim().min(10).max(500),
});

function revalidateBookingPaths(bookingId: string, propertyId?: string | null) {
  revalidatePath("/bookings");
  revalidatePath(`/bookings/${bookingId}`);
  revalidatePath("/traveler/bookings");
  revalidatePath(`/traveler/bookings/${bookingId}`);
  revalidatePath("/owner/bookings");
  revalidatePath(`/owner/bookings/request-decision?bookingId=${bookingId}`);

  if (propertyId) {
    revalidatePath(`/properties/${propertyId}`);
  }
}

export async function createTravelerBookingAction(
  input: z.infer<typeof createTravelerBookingSchema>,
): Promise<ActionResult<{
  bookingId: string;
  bookingReference: string;
  checkInDate: string;
  checkOutDate: string;
  cleaningFee: number;
  currencyCode: string;
  discountAmount: number;
  guestsCount: number;
  nightlyAmount: number;
  ownerId: string;
  paymentReference: string | null;
  paymentStatus: string;
  propertyId: string;
  serviceFee: number;
  status: string;
  subtotalAmount: number;
  totalAmount: number;
}>> {
  const parsed = createTravelerBookingSchema.safeParse(input);

  if (!parsed.success) {
    return { message: "Please review your booking details and try again.", ok: false };
  }

  await requireAuthenticatedUser();
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("create_traveler_booking", {
    payment_method_input: parsed.data.paymentMethod,
    property_lookup: parsed.data.propertyLookup,
    requested_check_in: parsed.data.checkIn,
    requested_check_out: parsed.data.checkOut,
    requested_guests: parsed.data.guests,
    special_requests_input: parsed.data.specialRequests,
    traveler_email_input: parsed.data.travelerEmail,
    traveler_full_name_input: parsed.data.travelerFullName,
    traveler_phone_input: parsed.data.travelerPhone,
  });

  if (error) {
    return {
      message: "We could not create this booking right now. Please verify the dates and property details.",
      ok: false,
    };
  }

  const row = ((data ?? []) as CreateTravelerBookingRpcRow[])[0];

  if (!row) {
    return {
      message: "We could not create this booking right now. Please try again.",
      ok: false,
    };
  }

  revalidateBookingPaths(row.id, row.property_id);

  return {
    data: {
      bookingId: row.id,
      bookingReference: row.booking_reference,
      checkInDate: row.check_in_date,
      checkOutDate: row.check_out_date,
      cleaningFee: Math.round(row.cleaning_fee_amount / 100),
      currencyCode: row.currency_code,
      discountAmount: Math.round(row.discount_amount / 100),
      guestsCount: row.guests_count,
      nightlyAmount: Math.round(row.nightly_amount / 100),
      ownerId: row.owner_id,
      paymentReference: row.payment_reference,
      paymentStatus: row.payment_status,
      propertyId: row.property_id,
      serviceFee: Math.round(row.service_fee_amount / 100),
      status: row.status,
      subtotalAmount: Math.round(row.subtotal_amount / 100),
      totalAmount: Math.round(row.total_amount / 100),
    },
    ok: true,
  };
}

export async function decideOwnerBookingAction(
  input: z.infer<typeof ownerDecisionSchema>,
): Promise<ActionResult<{
  bookingId: string;
  confirmedAt: string | null;
  ownerActionedAt: string | null;
  ownerResponseMessage: string | null;
  reference: string;
  status: string;
}>> {
  const parsed = ownerDecisionSchema.safeParse(input);

  if (!parsed.success) {
    return { message: "Please review the booking response and try again.", ok: false };
  }

  await requireOwner();
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("owner_decide_booking", {
    booking_uuid: parsed.data.bookingId,
    owner_decision: parsed.data.decision,
    response_message: parsed.data.message || undefined,
  });

  if (error) {
    return { message: "We could not save that booking decision right now.", ok: false };
  }

  const row = ((data ?? []) as OwnerDecisionRpcRow[])[0];

  if (!row) {
    return { message: "We could not save that booking decision right now.", ok: false };
  }

  revalidateBookingPaths(row.id);

  return {
    data: {
      bookingId: row.id,
      confirmedAt: row.confirmed_at,
      ownerActionedAt: row.owner_actioned_at,
      ownerResponseMessage: row.owner_response_message,
      reference: row.booking_reference,
      status: row.status,
    },
    ok: true,
  };
}

export async function cancelTravelerBookingAction(
  input: z.infer<typeof travelerCancellationSchema>,
): Promise<ActionResult<{
  bookingId: string;
  cancellationReason: string | null;
  cancelledAt: string | null;
  reference: string;
  status: string;
}>> {
  const parsed = travelerCancellationSchema.safeParse(input);

  if (!parsed.success) {
    return { message: "Please add a short cancellation reason before continuing.", ok: false };
  }

  await requireAuthenticatedUser();
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("traveler_cancel_booking", {
    booking_uuid: parsed.data.bookingId,
    cancellation_note: parsed.data.reason,
  });

  if (error) {
    return { message: "We could not cancel this booking right now.", ok: false };
  }

  const row = ((data ?? []) as TravelerCancelRpcRow[])[0];

  if (!row) {
    return { message: "We could not cancel this booking right now.", ok: false };
  }

  revalidateBookingPaths(row.id);

  return {
    data: {
      bookingId: row.id,
      cancellationReason: row.cancellation_reason,
      cancelledAt: row.cancelled_at,
      reference: row.booking_reference,
      status: row.status,
    },
    ok: true,
  };
}
