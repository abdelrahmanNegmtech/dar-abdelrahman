import "server-only";

import { unstable_noStore as noStore } from "next/cache";
import { marketplaceImages } from "@/features/public-marketplace/assets";
import type {
  BookingStatus as TravelerBookingStatus,
  PaymentStatus as TravelerPaymentStatus,
  TravelerBooking,
  TravelerProperty,
} from "@/features/traveler/types";
import { getPropertyFallbackPreset } from "@/features/properties/data/public-property-fallbacks";
import type { DbEnum } from "@/lib/supabase/database";
import type { Database } from "@/lib/supabase/database.types";
import { requireAuthenticatedUser, requireOwner } from "@/lib/supabase/auth";
import { createClient } from "@/lib/supabase/server";

type BookingRowStatus = DbEnum<"booking_status">;
type BookingRowPaymentStatus = DbEnum<"booking_payment_status">;
type TravelerBookingRpcRow =
  Database["public"]["Functions"]["get_traveler_bookings"]["Returns"][number];
type TravelerBookingDetailsRpcRow =
  Database["public"]["Functions"]["get_traveler_booking_details"]["Returns"][number];
type OwnerBookingRpcRow =
  Database["public"]["Functions"]["get_owner_bookings"]["Returns"][number];
type OwnerBookingDetailsRpcRow =
  Database["public"]["Functions"]["get_owner_booking_details"]["Returns"][number];

const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export type OwnerBookingListItem = {
  checkInDate: string;
  checkOutDate: string;
  createdAt: string;
  currencyCode: string;
  guestsCount: number;
  id: string;
  ownerResponseMessage: string | null;
  paymentStatus: BookingRowPaymentStatus;
  propertyCity: string;
  propertyCountryName: string;
  propertyId: string;
  propertySlug: string;
  propertyTitle: string;
  requestedAt: string;
  specialRequests: string | null;
  status: BookingRowStatus;
  totalAmountMajor: number;
  travelerEmail: string | null;
  travelerFullName: string;
  travelerId: string;
  travelerPhone: string | null;
  reference: string;
};

export type OwnerBookingDetail = OwnerBookingListItem & {
  cancelledAt: string | null;
  cleaningFeeMajor: number;
  completedAt: string | null;
  confirmedAt: string | null;
  discountAmountMajor: number;
  nightlyAmountMajor: number;
  ownerActionedAt: string | null;
  paymentReference: string | null;
  paymentSubmittedAt: string | null;
  propertyArea: string | null;
  propertyMaxGuests: number;
  propertyType: DbEnum<"property_type">;
  serviceFeeMajor: number;
  subtotalAmountMajor: number;
  updatedAt: string;
};

function toMajorAmount(amountMinor: number | null | undefined) {
  return Math.round((amountMinor ?? 0) / 100);
}

function isUuid(value: string) {
  return uuidPattern.test(value);
}

function mapBookingStatus(status: BookingRowStatus): TravelerBookingStatus {
  switch (status) {
    case "confirmed":
      return "confirmed";
    case "completed":
      return "completed";
    case "cancelled":
    case "declined":
    case "expired":
    case "refunded":
      return "cancelled";
    default:
      return "pending";
  }
}

function mapPaymentStatus(status: BookingRowPaymentStatus): TravelerPaymentStatus {
  switch (status) {
    case "paid":
    case "authorized":
      return "paid";
    case "failed":
      return "failed";
    case "refunded":
    case "partially_refunded":
      return "refunded";
    default:
      return "pending";
  }
}

function buildPaymentMethodLabel(paymentReference: string | null) {
  const normalized = (paymentReference ?? "").toLowerCase();

  if (normalized.startsWith("instapay-")) {
    return "InstaPay";
  }
  if (normalized.startsWith("vodafone-")) {
    return "Vodafone Cash";
  }
  if (normalized.startsWith("bank-")) {
    return "Bank transfer";
  }
  if (normalized.startsWith("fawry-")) {
    return "Fawry";
  }
  if (normalized.startsWith("paymob-")) {
    return "Paymob / Accept";
  }
  if (normalized.startsWith("meeza-")) {
    return "Meeza Card";
  }

  return "Manual payment review";
}

function buildCancellationPolicy(status: BookingRowStatus, checkInDate: string) {
  if (status === "completed") {
    return "This completed stay is no longer cancellable.";
  }

  if (status === "cancelled" || status === "declined" || status === "expired") {
    return "This booking is already closed and cannot be cancelled again.";
  }

  const date = new Date(`${checkInDate}T12:00:00Z`);
  date.setUTCDate(date.getUTCDate() - 2);
  const label = new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);

  return `Free cancellation until ${label}.`;
}

function buildPropertyImage(slug: string) {
  const preset = getPropertyFallbackPreset(slug);
  return {
    imagePosition: preset.gallery[0]?.position ?? "object-center",
    imageUrl: preset.gallery[0]?.src ?? marketplaceImages.modernApartment,
  };
}

function normalizeImageUrl(value: string | null | undefined, fallback: string) {
  if (!value) {
    return fallback;
  }

  if (value.startsWith("/") || value.startsWith("http://") || value.startsWith("https://")) {
    return value;
  }

  return fallback;
}

function buildTravelerPropertyFromBookingRow(
  row: TravelerBookingRpcRow | TravelerBookingDetailsRpcRow,
  savedPropertyIds: Set<string>,
): TravelerProperty {
  const image = buildPropertyImage(row.property_slug);

  return {
    address: "",
    amenities: [],
    area: row.property_area ?? row.property_city,
    areaSize: Math.max(1, row.property_area_size_sqm ?? 1),
    bathrooms: Math.max(1, row.property_bathrooms_count ?? 1),
    bedrooms: Math.max(1, row.property_bedrooms_count ?? 1),
    city: row.property_city,
    country: row.property_country_name,
    currency: row.currency_code,
    description: `${row.property_title} booking snapshot.`,
    id: row.property_id,
    imagePosition: image.imagePosition,
    imageUrl: image.imageUrl,
    isFeatured: row.status === "confirmed",
    isSaved: savedPropertyIds.has(row.property_id),
    maxGuests: row.property_max_guests,
    ownerId: row.owner_id,
    pricePerNight: toMajorAmount(row.nightly_amount),
    ratingAverage: 4.9,
    reviewsCount: 24,
    status: row.status === "declined" || row.status === "expired" ? "pending" : "published",
    title: row.property_title,
    type: row.property_type === "villa"
      ? "villa"
      : row.property_type === "studio"
        ? "studio"
        : row.property_type === "duplex"
          ? "duplex"
          : row.property_type === "hotel"
            ? "hotel"
            : "apartment",
  };
}

function mapTravelerBooking(
  row: TravelerBookingRpcRow | TravelerBookingDetailsRpcRow,
  savedPropertyIds: Set<string>,
): TravelerBooking {
  const property = buildTravelerPropertyFromBookingRow(row, savedPropertyIds);

  return {
    checkIn: row.check_in_date,
    checkInTime: "3:00 PM",
    checkOut: row.check_out_date,
    checkOutTime: "11:00 AM",
    cleaningFee: toMajorAmount(row.cleaning_fee_amount),
    createdAt: row.created_at,
    currency: row.currency_code,
    guestsCount: row.guests_count,
    id: row.id,
    nightsCount: Math.max(
      1,
      Math.round(
        (new Date(`${row.check_out_date}T12:00:00Z`).getTime() - new Date(`${row.check_in_date}T12:00:00Z`).getTime())
          / 86_400_000,
      ),
    ),
    owner: {
      avatarUrl: "owner_avatar_url" in row && row.owner_avatar_url
        ? normalizeImageUrl(row.owner_avatar_url, marketplaceImages.host)
        : marketplaceImages.host,
      id: row.owner_id,
      isSuperhost: true,
      name:
        ("owner_display_name" in row && row.owner_display_name)
        || ("owner_full_name" in row && row.owner_full_name)
        || "Property owner",
      rating: 4.9,
      responseTime: "Usually within 20 min",
    },
    paymentMethodLabel: buildPaymentMethodLabel(row.payment_reference),
    paymentReference: row.payment_reference,
    paymentStatus: mapPaymentStatus(row.payment_status),
    paymentSubmittedAt: row.payment_submitted_at,
    property,
    reference: row.booking_reference,
    roomsCount: 1,
    serviceFee: toMajorAmount(row.service_fee_amount),
    specialRequests: row.special_requests,
    status: mapBookingStatus(row.status),
    subtotal: toMajorAmount(row.subtotal_amount),
    totalAmount: toMajorAmount(row.total_amount),
    travelerEmail: row.traveler_email,
    travelerFullName: row.traveler_full_name,
    travelerId: "",
    travelerPhone: row.traveler_phone,
    cancellationPolicy: buildCancellationPolicy(row.status, row.check_in_date),
  };
}

async function getSavedPropertyIds(propertyIds: string[]) {
  if (!propertyIds.length) {
    return new Set<string>();
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("saved_properties")
    .select("property_id")
    .in("property_id", propertyIds);

  if (error) {
    return new Set<string>();
  }

  return new Set((data ?? []).map((row) => row.property_id));
}

export async function getTravelerBookings() {
  noStore();
  await requireAuthenticatedUser();
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_traveler_bookings");

  if (error) {
    throw new Error("Unable to load traveler bookings.");
  }

  const rows = (data ?? []) as TravelerBookingRpcRow[];
  const savedPropertyIds = await getSavedPropertyIds(rows.map((row) => row.property_id));
  return rows.map((row) => mapTravelerBooking(row, savedPropertyIds));
}

export async function getTravelerBookingById(bookingId: string) {
  noStore();
  if (!isUuid(bookingId)) {
    return null;
  }
  await requireAuthenticatedUser();
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_traveler_booking_details", {
    booking_uuid: bookingId,
  });

  if (error) {
    throw new Error("Unable to load traveler booking details.");
  }

  const row = ((data ?? []) as TravelerBookingDetailsRpcRow[])[0];

  if (!row) {
    return null;
  }

  const savedPropertyIds = await getSavedPropertyIds([row.property_id]);
  return mapTravelerBooking(row, savedPropertyIds);
}

function mapOwnerBookingRow(row: OwnerBookingRpcRow | OwnerBookingDetailsRpcRow): OwnerBookingListItem {
  return {
    checkInDate: row.check_in_date,
    checkOutDate: row.check_out_date,
    createdAt: row.created_at,
    currencyCode: row.currency_code,
    guestsCount: row.guests_count,
    id: row.id,
    ownerResponseMessage: row.owner_response_message,
    paymentStatus: row.payment_status,
    propertyCity: row.property_city,
    propertyCountryName: row.property_country_name,
    propertyId: row.property_id,
    propertySlug: row.property_slug,
    propertyTitle: row.property_title,
    reference: row.booking_reference,
    requestedAt: row.requested_at,
    specialRequests: row.special_requests,
    status: row.status,
    totalAmountMajor: toMajorAmount(row.total_amount),
    travelerEmail: row.traveler_email,
    travelerFullName: row.traveler_full_name,
    travelerId: row.traveler_id,
    travelerPhone: row.traveler_phone,
  };
}

export async function getOwnerBookings() {
  noStore();
  await requireOwner();
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_owner_bookings");

  if (error) {
    throw new Error("Unable to load owner bookings.");
  }

  return ((data ?? []) as OwnerBookingRpcRow[]).map(mapOwnerBookingRow);
}

export async function getOwnerBookingById(bookingId: string) {
  noStore();
  if (!isUuid(bookingId)) {
    return null;
  }
  await requireOwner();
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_owner_booking_details", {
    booking_uuid: bookingId,
  });

  if (error) {
    throw new Error("Unable to load owner booking details.");
  }

  const row = ((data ?? []) as OwnerBookingDetailsRpcRow[])[0];

  if (!row) {
    return null;
  }

  return {
    ...mapOwnerBookingRow(row),
    cancelledAt: row.cancelled_at,
    cleaningFeeMajor: toMajorAmount(row.cleaning_fee_amount),
    completedAt: row.completed_at,
    confirmedAt: row.confirmed_at,
    discountAmountMajor: toMajorAmount(row.discount_amount),
    nightlyAmountMajor: toMajorAmount(row.nightly_amount),
    ownerActionedAt: row.owner_actioned_at,
    paymentReference: row.payment_reference,
    paymentSubmittedAt: row.payment_submitted_at,
    propertyArea: row.property_area,
    propertyMaxGuests: row.property_max_guests,
    propertyType: row.property_type,
    serviceFeeMajor: toMajorAmount(row.service_fee_amount),
    subtotalAmountMajor: toMajorAmount(row.subtotal_amount),
    updatedAt: row.updated_at,
  } satisfies OwnerBookingDetail;
}
