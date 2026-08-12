import "server-only";

import { unstable_noStore as noStore } from "next/cache";
import type { Database } from "@/lib/supabase/database.types";
import { requireAdmin } from "@/lib/supabase/auth";
import { createClient } from "@/lib/supabase/server";
import type { BookingDetail, BookingRecord, BookingsPageData } from "@/features/bookings/types";
import { getAdminSidebarGroups } from "@/features/users/data/users-management.data";
import {
  diffNights,
  formatCurrencyMinor,
  formatDateRangeLabel,
  formatLongDateTime,
  formatNumber,
  paymentMethodLabel,
} from "./utils";

type BookingRow = Database["public"]["Tables"]["bookings"]["Row"];
type PropertyRow = Database["public"]["Tables"]["properties"]["Row"];
type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];
type PayoutRow = Database["public"]["Tables"]["payouts"]["Row"];
type ReviewRow = Database["public"]["Tables"]["reviews"]["Row"];

function mapBookingStatus(row: Pick<BookingRow, "status" | "payment_status">): BookingRecord["bookingStatus"] {
  if (row.payment_status === "under_review" || row.status === "pending_payment_verification") return "payment-review";
  if (row.status === "pending_owner_approval") return "pending-approval";
  if (row.status === "confirmed") return "confirmed";
  if (row.status === "completed") return "completed";
  return "disputed";
}

function mapStatusCategory(status: BookingRecord["bookingStatus"]): BookingRecord["statusCategory"] {
  switch (status) {
    case "payment-review":
      return "payment-review";
    case "pending-approval":
      return "pending-approval";
    case "confirmed":
      return "confirmed";
    case "disputed":
      return "disputes";
    default:
      return "all";
  }
}

export async function getAdminBookingsPageData(): Promise<BookingsPageData> {
  noStore();
  await requireAdmin();
  const supabase = await createClient();

  const [bookingsResult, propertiesResult, profilesResult, payoutsResult, reviewsResult] = await Promise.all([
    supabase.from("bookings").select("*").order("created_at", { ascending: false }),
    supabase.from("properties").select("id, title, city, area, property_type, owner_profile_id"),
    supabase.from("profiles").select("id, full_name, display_name, email, phone, email_verified, phone_verified"),
    supabase.from("payouts").select("booking_id, status, paid_at, scheduled_for"),
    supabase.from("reviews").select("property_id, rating"),
  ]);

  if (bookingsResult.error || propertiesResult.error || profilesResult.error || payoutsResult.error || reviewsResult.error) {
    throw new Error("Unable to load admin booking data.");
  }

  const bookings = (bookingsResult.data ?? []) as BookingRow[];
  const properties = (propertiesResult.data ?? []) as Array<Pick<PropertyRow, "id" | "title" | "city" | "area" | "property_type" | "owner_profile_id">>;
  const profiles = (profilesResult.data ?? []) as Array<Pick<ProfileRow, "id" | "full_name" | "display_name" | "email" | "phone" | "email_verified" | "phone_verified">>;
  const payouts = (payoutsResult.data ?? []) as Array<Pick<PayoutRow, "booking_id" | "status" | "paid_at" | "scheduled_for">>;
  const reviews = (reviewsResult.data ?? []) as Array<Pick<ReviewRow, "property_id" | "rating">>;

  const propertyById = new Map(properties.map((property) => [property.id, property]));
  const profileById = new Map(profiles.map((profile) => [profile.id, profile]));
  const payoutByBookingId = new Map(payouts.filter((payout) => payout.booking_id).map((payout) => [payout.booking_id as string, payout]));
  const reviewAggregateByPropertyId = new Map<string, { count: number; sum: number }>();
  for (const review of reviews) {
    const current = reviewAggregateByPropertyId.get(review.property_id) ?? { count: 0, sum: 0 };
    reviewAggregateByPropertyId.set(review.property_id, { count: current.count + 1, sum: current.sum + review.rating });
  }

  const bookingRecords: BookingRecord[] = bookings.map((booking) => {
    const property = propertyById.get(booking.property_id);
    const owner = profileById.get(booking.owner_id);
    const status = mapBookingStatus(booking);

    return {
      actionLabel: status === "payment-review" || status === "pending-approval" ? "Review" : "View",
      bookingStatus: status,
      city: property?.city.toLowerCase().replace(/\s+/g, "-") ?? "all",
      dateRange: formatDateRangeLabel(booking.check_in_date, booking.check_out_date),
      guestName: booking.traveler_full_name ?? "Traveler",
      guestPhone: booking.traveler_phone ?? "Not provided",
      id: booking.booking_reference,
      nights: `${diffNights(booking.check_in_date, booking.check_out_date)} nights`,
      ownerName: owner?.full_name || owner?.display_name || owner?.email || "Owner",
      paymentLabel: paymentMethodLabel(booking.payment_reference),
      paymentMeta: booking.payment_status.replaceAll("_", " "),
      paymentStatus: booking.payment_status,
      propertyArea: property?.area ?? property?.city ?? "Egypt",
      propertyName: property?.title ?? "Property",
      propertyType: property?.property_type ?? "apartment",
      risk:
        booking.payment_status === "failed" || booking.status === "cancelled"
          ? "high"
          : booking.payment_status === "under_review" || booking.status === "pending_owner_approval"
            ? "medium"
            : "low",
      statusCategory: mapStatusCategory(status),
      total: formatCurrencyMinor(booking.total_amount, booking.currency_code),
    };
  });

  const details = Object.fromEntries(
    bookings.map((booking) => {
      const property = propertyById.get(booking.property_id);
      const owner = profileById.get(booking.owner_id);
      const payout = payoutByBookingId.get(booking.id);
      const reviewAggregate = reviewAggregateByPropertyId.get(booking.property_id) ?? { count: 0, sum: 0 };
      const status = mapBookingStatus(booking);

      const detail: BookingDetail = {
        bookingId: booking.booking_reference,
        checklist: [
          { id: "payment", label: "Payment review", state: booking.payment_status === "paid" || booking.payment_status === "authorized" ? "verified" : "pending" },
          { id: "owner", label: "Owner response", state: booking.status === "pending_owner_approval" ? "pending" : "verified" },
          { id: "availability", label: "Availability locked", state: "verified" },
          { id: "payout", label: "Payout linkage", state: payout ? "verified" : "pending" },
        ],
        communication: [
          {
            body: booking.special_requests || "No special requests were added for this booking.",
            id: `${booking.id}-guest`,
            role: "Guest",
            sender: booking.traveler_full_name ?? "Traveler",
            time: formatLongDateTime(booking.created_at),
          },
          {
            body: booking.owner_response_message || "No owner response has been recorded yet.",
            id: `${booking.id}-owner`,
            role: "Owner",
            sender: owner?.full_name || owner?.display_name || owner?.email || "Owner",
            time: formatLongDateTime(booking.owner_actioned_at ?? booking.updated_at),
          },
        ],
        guest: {
          badges: [
            { label: booking.traveler_email ? "Email captured" : "Email unavailable", tone: booking.traveler_email ? "success" : "warning" },
            { label: booking.traveler_phone ? "Phone captured" : "Phone unavailable", tone: booking.traveler_phone ? "success" : "warning" },
          ],
          email: booking.traveler_email ?? "Not provided",
          name: booking.traveler_full_name ?? "Traveler",
          phone: booking.traveler_phone ?? "Not provided",
        },
        keyFacts: [
          { label: "Booking ID", value: booking.booking_reference },
          { label: "Check-in / Check-out", value: `${formatDateRangeLabel(booking.check_in_date, booking.check_out_date)} (${diffNights(booking.check_in_date, booking.check_out_date)} nights)` },
          { label: "Guests", value: `${booking.guests_count} guests` },
          { label: "Payment method", value: paymentMethodLabel(booking.payment_reference) },
          { label: "Payment status", value: booking.payment_status.replaceAll("_", " ") },
          { label: "Amount", value: formatCurrencyMinor(booking.total_amount, booking.currency_code) },
          { label: "Transaction ID", value: booking.payment_reference ?? "Manual review" },
          { label: "Booking source", value: "DAR application" },
        ],
        noteUpdatedAt: `Last updated ${formatLongDateTime(booking.updated_at)}`,
        owner: {
          badges: [{ label: booking.status.replaceAll("_", " "), tone: booking.status === "confirmed" || booking.status === "completed" ? "success" : "warning" }],
          email: owner?.email ?? "Not provided",
          name: owner?.full_name || owner?.display_name || owner?.email || "Owner",
          phone: owner?.phone ?? "Not provided",
        },
        paymentBreakdown: [
          { label: "Nightly subtotal", value: formatCurrencyMinor(booking.subtotal_amount, booking.currency_code) },
          { label: "Cleaning fee", value: formatCurrencyMinor(booking.cleaning_fee_amount, booking.currency_code) },
          { label: "DAR service fee", value: formatCurrencyMinor(booking.service_fee_amount, booking.currency_code) },
          { label: "Discount", value: booking.discount_amount ? `- ${formatCurrencyMinor(booking.discount_amount, booking.currency_code)}` : formatCurrencyMinor(0, booking.currency_code), tone: booking.discount_amount ? "danger" : "default" },
        ],
        payoutStatus: payout ? payout.status.replaceAll("_", " ") : "No payout created yet",
        propertyLocation: property?.area ? `${property.area}, ${property.city}, Egypt` : `${property?.city ?? "Egypt"}`,
        propertyName: property?.title ?? "Property",
        propertyVerifiedLabel: "Property record available",
        ratingLabel: reviewAggregate.count ? `${(reviewAggregate.sum / reviewAggregate.count).toFixed(1)} (${reviewAggregate.count} reviews)` : "No reviews yet",
        refundEligibility:
          booking.status === "completed"
            ? "Completed stays are no longer cancellable."
            : booking.status === "confirmed"
              ? "Cancellation depends on the confirmed booking policy."
              : "Pending bookings can still be reviewed before confirmation.",
        statusLabel: status.replaceAll("-", " "),
        timeline: [
          { id: `${booking.id}-created`, state: "completed", timestamp: formatLongDateTime(booking.created_at), title: "Booking submitted" },
          ...(booking.payment_submitted_at ? [{ id: `${booking.id}-payment`, state: "completed" as const, timestamp: formatLongDateTime(booking.payment_submitted_at), title: "Payment submitted" }] : []),
          ...(booking.owner_actioned_at ? [{ id: `${booking.id}-owner`, state: "completed" as const, timestamp: formatLongDateTime(booking.owner_actioned_at), title: "Owner actioned request" }] : []),
          ...(booking.confirmed_at ? [{ id: `${booking.id}-confirmed`, state: "completed" as const, timestamp: formatLongDateTime(booking.confirmed_at), title: "Booking confirmed" }] : []),
          ...(booking.completed_at ? [{ id: `${booking.id}-completed`, state: "completed" as const, timestamp: formatLongDateTime(booking.completed_at), title: "Stay completed" }] : []),
          ...(booking.cancelled_at ? [{ id: `${booking.id}-cancelled`, state: "alert" as const, timestamp: formatLongDateTime(booking.cancelled_at), title: "Booking cancelled" }] : []),
        ],
      };

      return [booking.booking_reference, detail];
    }),
  ) satisfies Record<string, BookingDetail>;

  const countStatus = (status: BookingRecord["bookingStatus"]) => bookingRecords.filter((booking) => booking.bookingStatus === status).length;
  const revenueMinor = bookings.reduce((sum, booking) => sum + booking.total_amount, 0);

  return {
    bookings: bookingRecords,
    details,
    filters: {
      bookingStatus: [{ label: "All", value: "all" }],
      checkInDate: [{ label: "All seeded stays", value: "seed-snapshot" }],
      city: [{ label: "All", value: "all" }],
      paymentStatus: [{ label: "All", value: "all" }],
      propertyType: [{ label: "All", value: "all" }],
      riskLevel: [{ label: "All", value: "all" }],
      rowsPerPage: [
        { label: "5 per page", value: "5" },
        { label: "10 per page", value: "10" },
        { label: "20 per page", value: "20" },
      ],
    },
    metrics: [
      { accent: "brand", icon: "calendar", key: "total-bookings", label: "Total bookings", trendDirection: "up", trendLabel: "Seed snapshot", trendValue: formatNumber(bookings.length), value: formatNumber(bookings.length) },
      { accent: "warning", icon: "pending", key: "pending-approval", label: "Pending approval", trendDirection: "up", trendLabel: "Owner action required", trendValue: formatNumber(countStatus("pending-approval")), value: formatNumber(countStatus("pending-approval")) },
      { accent: "success", icon: "confirmed", key: "confirmed", label: "Confirmed", trendDirection: "up", trendLabel: "Confirmed stays", trendValue: formatNumber(countStatus("confirmed")), value: formatNumber(countStatus("confirmed")) },
      { accent: "warning", icon: "wallet", key: "payment-review", label: "Payment review", trendDirection: "up", trendLabel: "Manual review", trendValue: formatNumber(countStatus("payment-review")), value: formatNumber(countStatus("payment-review")) },
      { accent: "danger", icon: "cancelled", key: "completed", label: "Completed", trendDirection: "up", trendLabel: "Historical stays", trendValue: formatNumber(countStatus("completed")), value: formatNumber(countStatus("completed")) },
      { accent: "danger", icon: "disputes", key: "disputed", label: "Escalated", trendDirection: "up", trendLabel: "Cancelled / failed", trendValue: formatNumber(countStatus("disputed")), value: formatNumber(countStatus("disputed")) },
      { accent: "warning", icon: "revenue", key: "revenue", label: "Revenue tracked", trendDirection: "up", trendLabel: "Seed snapshot", trendValue: formatCurrencyMinor(revenueMinor), value: formatCurrencyMinor(revenueMinor) },
    ],
    selectedBookingId: bookingRecords[0]?.id ?? "",
    sidebarGroups: getAdminSidebarGroups("bookings"),
    tabs: [
      { label: "All", value: "all" },
      { count: countStatus("pending-approval"), label: "Pending approval", value: "pending-approval" },
      { count: countStatus("payment-review"), label: "Payment review", value: "payment-review" },
      { count: countStatus("confirmed"), label: "Confirmed", value: "confirmed" },
      { count: 0, label: "Check-in today", value: "check-in-today" },
      { count: countStatus("completed"), label: "Cancellations", value: "cancellations" },
      { count: countStatus("disputed"), label: "Disputes", value: "disputes" },
    ],
  };
}
