import "server-only";

import { unstable_noStore as noStore } from "next/cache";
import { getOwnerBookings, getTravelerBookings, type OwnerBookingListItem } from "@/features/bookings/data/booking-queries";
import { getPropertyFallbackPreset } from "@/features/properties/data/public-property-fallbacks";
import type { TravelerBooking, TravelerReview } from "@/features/traveler/types";
import { getCurrentProfile, requireOwner } from "@/lib/supabase/auth";
import type { DbEnum, ReviewRow } from "@/lib/supabase/database";
import { createClient } from "@/lib/supabase/server";
import { marketplaceImages } from "@/features/public-marketplace/assets";

type ReviewStatus = DbEnum<"review_status">;

type ReviewListRow = Pick<
  ReviewRow,
  | "accuracy_rating"
  | "booking_id"
  | "cleanliness_rating"
  | "comment"
  | "communication_rating"
  | "created_at"
  | "hidden_at"
  | "id"
  | "location_rating"
  | "owner_response"
  | "property_id"
  | "rating"
  | "removed_at"
  | "status"
  | "submitted_at"
  | "value_rating"
>;

export type OwnerReviewListItem = {
  bookingId: string;
  comment: string;
  createdAt: string;
  id: string;
  ownerResponse: string | null;
  propertyCity: string;
  propertySlug: string;
  propertyTitle: string;
  rating: number;
  status: ReviewStatus;
  travelerName: string;
};

function isUiVisibleReview(row: ReviewListRow) {
  return row.removed_at === null && row.hidden_at === null && (row.status === "pending" || row.status === "submitted");
}

function buildReviewProperty(booking: TravelerBooking) {
  const preset = getPropertyFallbackPreset(booking.property.id);
  const fallbackImage = preset.gallery[0]?.src ?? marketplaceImages.modernApartment;
  const fallbackPosition = preset.gallery[0]?.position ?? "object-center";

  return {
    ...booking.property,
    id: booking.property.id,
    imagePosition: booking.property.imagePosition || fallbackPosition,
    imageUrl: booking.property.imageUrl || fallbackImage,
  };
}

function mapTravelerReview(
  row: ReviewListRow,
  booking: TravelerBooking,
  propertySlug: string | null,
  travelerName: string,
  travelerAvatarUrl: string,
): TravelerReview {
  return {
    accuracyRating: Number(row.accuracy_rating ?? 0),
    bookingId: row.booking_id,
    cleanlinessRating: Number(row.cleanliness_rating ?? 0),
    comment: row.comment ?? "",
    communicationRating: Number(row.communication_rating ?? 0),
    createdAt: row.submitted_at ?? row.created_at,
    hostName: booking.owner.name,
    id: row.id,
    locationRating: Number(row.location_rating ?? 0),
    ownerResponse: row.owner_response ?? undefined,
    property: buildReviewProperty(booking),
    propertySlug: propertySlug ?? undefined,
    rating: Number(row.rating ?? 0),
    status: row.status === "pending" ? "pending" : "submitted",
    travelerAvatarUrl,
    travelerName,
    valueRating: Number(row.value_rating ?? 0),
  };
}

function buildPendingTravelerReview(
  booking: TravelerBooking,
  propertySlug: string | null,
  travelerName: string,
  travelerAvatarUrl: string,
): TravelerReview {
  return {
    accuracyRating: 0,
    bookingId: booking.id,
    cleanlinessRating: 0,
    comment: "",
    communicationRating: 0,
    createdAt: booking.checkOut,
    hostName: booking.owner.name,
    id: `pending-${booking.id}`,
    locationRating: 0,
    property: buildReviewProperty(booking),
    propertySlug: propertySlug ?? undefined,
    rating: 0,
    status: "pending",
    travelerAvatarUrl,
    travelerName,
    valueRating: 0,
  };
}

async function getTravelerReviewRows() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("reviews")
    .select("id, booking_id, property_id, status, rating, cleanliness_rating, communication_rating, location_rating, accuracy_rating, value_rating, comment, owner_response, submitted_at, hidden_at, removed_at, created_at")
    .is("removed_at", null)
    .order("submitted_at", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error("Unable to load traveler reviews.");
  }

  return (data ?? []) as ReviewListRow[];
}

async function getPropertySlugMap(propertyIds: string[]) {
  if (!propertyIds.length) {
    return new Map<string, string>();
  }

  const supabase = await createClient();
  const { data } = await supabase
    .from("properties")
    .select("id, public_slug")
    .in("id", Array.from(new Set(propertyIds)));

  return new Map((data ?? []).map((row) => [row.id, row.public_slug]));
}

export async function getTravelerReviewsData() {
  noStore();

  const [bookings, currentProfile, reviewRows] = await Promise.all([
    getTravelerBookings(),
    getCurrentProfile(),
    getTravelerReviewRows(),
  ]);

  const travelerName = currentProfile?.full_name ?? currentProfile?.display_name ?? "Traveler";
  const travelerAvatarUrl = currentProfile?.avatar_url ?? marketplaceImages.host;
  const bookingById = new Map(bookings.map((booking) => [booking.id, booking]));
  const propertySlugMap = await getPropertySlugMap(bookings.map((booking) => booking.property.id));
  const visibleReviewRows = reviewRows.filter(isUiVisibleReview);

  const submitted = visibleReviewRows
    .filter((row) => row.status === "submitted")
    .map((row) => {
      const booking = bookingById.get(row.booking_id);
      return booking
        ? mapTravelerReview(row, booking, propertySlugMap.get(booking.property.id) ?? null, travelerName, travelerAvatarUrl)
        : null;
    })
    .filter((review): review is TravelerReview => review !== null);

  const explicitPending = visibleReviewRows
    .filter((row) => row.status === "pending")
    .map((row) => {
      const booking = bookingById.get(row.booking_id);
      return booking
        ? mapTravelerReview(row, booking, propertySlugMap.get(booking.property.id) ?? null, travelerName, travelerAvatarUrl)
        : null;
    })
    .filter((review): review is TravelerReview => review !== null);

  const activeReviewBookingIds = new Set(visibleReviewRows.map((row) => row.booking_id));
  const derivedPending = bookings
    .filter((booking) => booking.status === "completed")
    .filter((booking) => !activeReviewBookingIds.has(booking.id))
    .map((booking) => buildPendingTravelerReview(booking, propertySlugMap.get(booking.property.id) ?? null, travelerName, travelerAvatarUrl));

  const pending = [...explicitPending, ...derivedPending];

  return {
    pending,
    reviews: [...pending, ...submitted],
    submitted,
  };
}

async function getOwnerReviewRows() {
  await requireOwner();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("reviews")
    .select("id, booking_id, property_id, status, rating, comment, owner_response, submitted_at, hidden_at, removed_at, created_at")
    .is("removed_at", null)
    .is("hidden_at", null)
    .order("submitted_at", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error("Unable to load owner reviews.");
  }

  return (data ?? []) as ReviewListRow[];
}

function mapOwnerReview(
  row: ReviewListRow,
  booking: OwnerBookingListItem,
): OwnerReviewListItem {
  return {
    bookingId: row.booking_id,
    comment: row.comment ?? "",
    createdAt: row.submitted_at ?? row.created_at,
    id: row.id,
    ownerResponse: row.owner_response,
    propertyCity: booking.propertyCity,
    propertySlug: booking.propertySlug,
    propertyTitle: booking.propertyTitle,
    rating: Number(row.rating ?? 0),
    status: row.status,
    travelerName: booking.travelerFullName,
  };
}

export async function getOwnerReviewsData() {
  noStore();

  const [bookings, reviewRows] = await Promise.all([
    getOwnerBookings(),
    getOwnerReviewRows(),
  ]);

  const bookingById = new Map(bookings.map((booking) => [booking.id, booking]));
  const reviews = reviewRows
    .filter(isUiVisibleReview)
    .map((row) => {
      const booking = bookingById.get(row.booking_id);
      return booking ? mapOwnerReview(row, booking) : null;
    })
    .filter((review): review is OwnerReviewListItem => review !== null);

  const averageRating = reviews.length
    ? Number((reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1))
    : 0;

  return {
    averageRating,
    reviews,
    submittedCount: reviews.filter((review) => review.status === "submitted").length,
  };
}
