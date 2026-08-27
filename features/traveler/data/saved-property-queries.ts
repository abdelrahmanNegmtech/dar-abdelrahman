import "server-only";

import { unstable_noStore as noStore } from "next/cache";
import { getPropertyFallbackPreset } from "@/features/properties/data/public-property-fallbacks";
import { getSupabaseConfig } from "@/lib/supabase/config";
import type { PropertyRow, ReviewRow } from "@/lib/supabase/database";
import { createClient } from "@/lib/supabase/server";
import type { TravelerProperty } from "../types";

type SavedPropertyRow = Pick<
  PropertyRow,
  | "id"
  | "public_slug"
  | "property_type"
  | "title"
  | "description"
  | "city"
  | "area"
  | "country_name"
  | "max_guests"
  | "bedrooms_count"
  | "bathrooms_count"
  | "area_size_sqm"
  | "base_nightly_amount"
  | "currency_code"
>;

type SavedPropertyReviewRow = Pick<ReviewRow, "property_id" | "rating">;

function mapPropertyType(propertyType: SavedPropertyRow["property_type"]): TravelerProperty["type"] {
  if (propertyType === "villa" || propertyType === "studio" || propertyType === "duplex" || propertyType === "hotel") {
    return propertyType;
  }

  return "apartment";
}

function buildRatingMap(reviewRows: SavedPropertyReviewRow[]) {
  const grouped = new Map<string, SavedPropertyReviewRow[]>();

  for (const review of reviewRows) {
    const current = grouped.get(review.property_id) ?? [];
    current.push(review);
    grouped.set(review.property_id, current);
  }

  return grouped;
}

function mapTravelerProperty(
  row: SavedPropertyRow,
  reviewRows: SavedPropertyReviewRow[],
  isSaved: boolean,
): TravelerProperty {
  const preset = getPropertyFallbackPreset(row.public_slug);
  const ratingAverage = reviewRows.length
    ? reviewRows.reduce((sum, review) => sum + review.rating, 0) / reviewRows.length
    : 4.9;

  return {
    address: "",
    amenities: preset.tags,
    area: row.area ?? row.city,
    areaSize: Math.max(1, row.area_size_sqm ?? 1),
    bathrooms: Math.max(1, row.bathrooms_count ?? 1),
    bedrooms: Math.max(1, row.bedrooms_count ?? 1),
    city: row.city,
    country: row.country_name,
    currency: row.currency_code,
    description: row.description ?? `${row.title} in ${row.city}.`,
    id: row.id,
    imagePosition: preset.gallery[0]?.position ?? "object-center",
    imageUrl: preset.gallery[0]?.src ?? "/assets/images/backgrounds/Nighttime_photo.jpeg",
    isFeatured: false,
    isSaved,
    maxGuests: row.max_guests,
    ownerId: "",
    pricePerNight: Math.round(row.base_nightly_amount / 100),
    ratingAverage: Number(ratingAverage.toFixed(1)),
    reviewsCount: reviewRows.length,
    status: "published",
    title: row.title,
    type: mapPropertyType(row.property_type),
  };
}

async function getSavedPropertyIds() {
  if (!getSupabaseConfig()) {
    return [];
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return [];
  }

  const { data, error } = await supabase
    .from("saved_properties")
    .select("property_id")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error("Unable to load saved properties.");
  }

  return (data ?? []).map((row) => row.property_id);
}

async function getPropertyReviewRows(propertyIds: string[]) {
  if (!propertyIds.length) {
    return [] as SavedPropertyReviewRow[];
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("reviews")
    .select("property_id, rating")
    .in("property_id", propertyIds)
    .eq("status", "submitted")
    .is("hidden_at", null)
    .is("removed_at", null);

  if (error) {
    throw new Error("Unable to load property ratings.");
  }

  return (data ?? []) as SavedPropertyReviewRow[];
}

async function getPropertiesByIds(propertyIds: string[]) {
  if (!propertyIds.length) {
    return [] as SavedPropertyRow[];
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("properties")
    .select("id, public_slug, property_type, title, description, city, area, country_name, max_guests, bedrooms_count, bathrooms_count, area_size_sqm, base_nightly_amount, currency_code")
    .in("id", propertyIds);

  if (error) {
    throw new Error("Unable to load saved property details.");
  }

  const rows = (data ?? []) as SavedPropertyRow[];
  const order = new Map(propertyIds.map((propertyId, index) => [propertyId, index]));

  return rows.sort((left, right) => (order.get(left.id) ?? 0) - (order.get(right.id) ?? 0));
}

export async function getTravelerSavedProperties() {
  noStore();

  const propertyIds = await getSavedPropertyIds();
  const [properties, reviewRows] = await Promise.all([
    getPropertiesByIds(propertyIds),
    getPropertyReviewRows(propertyIds),
  ]);
  const reviewsByPropertyId = buildRatingMap(reviewRows);

  return properties.map((property) => mapTravelerProperty(property, reviewsByPropertyId.get(property.id) ?? [], true));
}

export async function getTravelerSavedPropertyIds() {
  noStore();
  return getSavedPropertyIds();
}

export async function getRecommendedTravelerProperties(limit = 4) {
  noStore();

  if (!getSupabaseConfig()) {
    return [] as TravelerProperty[];
  }

  const [savedPropertyIds, properties] = await Promise.all([
    getSavedPropertyIds(),
    (async () => {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from("properties")
        .select("id, public_slug, property_type, title, description, city, area, country_name, max_guests, bedrooms_count, bathrooms_count, area_size_sqm, base_nightly_amount, currency_code")
        .order("published_at", { ascending: false })
        .limit(limit);

      if (error) {
        throw new Error("Unable to load traveler recommendations.");
      }

      return (data ?? []) as SavedPropertyRow[];
    })(),
  ]);
  const savedIdSet = new Set(savedPropertyIds);
  const reviewRows = await getPropertyReviewRows(properties.map((property) => property.id));
  const reviewsByPropertyId = buildRatingMap(reviewRows);

  return properties.map((property) =>
    mapTravelerProperty(property, reviewsByPropertyId.get(property.id) ?? [], savedIdSet.has(property.id)),
  );
}
