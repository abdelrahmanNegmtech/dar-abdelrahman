import "server-only";

import { unstable_noStore as noStore } from "next/cache";
import { marketplaceImages } from "@/features/public-marketplace/assets";
import { properties as mockSearchProperties, type SearchProperty } from "@/features/public-marketplace/search/data";
import { createClient } from "@/lib/supabase/server";
import type {
  PropertyRow,
  ReviewRow,
  TableRow,
} from "@/lib/supabase/database";
import {
  buildFallbackAbout,
  buildFallbackReviewAuthor,
  buildFallbackReviewDate,
  getFallbackGalleryCategories,
  getFallbackPhotoCountLabel,
  getPropertyFallbackPreset,
} from "./public-property-fallbacks";

type AvailabilityRow = Pick<
  TableRow<"property_availability">,
  "availability_date" | "property_id" | "status"
>;

type PublicPropertyRow = Pick<
  PropertyRow,
  | "id"
  | "public_slug"
  | "property_type"
  | "title"
  | "description"
  | "city"
  | "area"
  | "country_name"
  | "latitude"
  | "longitude"
  | "location_precision"
  | "max_guests"
  | "bedrooms_count"
  | "beds_count"
  | "bathrooms_count"
  | "area_size_sqm"
  | "base_nightly_amount"
  | "cleaning_fee_amount"
  | "currency_code"
  | "minimum_nights"
  | "maximum_nights"
  | "instant_book_enabled"
  | "created_at"
  | "published_at"
>;

type PublicReviewRow = Pick<
  ReviewRow,
  | "id"
  | "property_id"
  | "rating"
  | "comment"
  | "status"
  | "submitted_at"
  | "created_at"
  | "cleanliness_rating"
  | "accuracy_rating"
  | "communication_rating"
  | "location_rating"
  | "value_rating"
>;

export type SearchSort = "newest" | "price_asc" | "price_desc";

export type PublicPropertyFilters = {
  bathrooms?: number | null;
  bedrooms?: number | null;
  checkIn?: string | null;
  checkOut?: string | null;
  destination?: string | null;
  guests?: number | null;
  instantBook?: boolean;
  maxPrice?: number | null;
  minPrice?: number | null;
  page?: number;
  propertyType?: string | null;
  sort?: SearchSort;
};

export type PublicPropertyCard = Omit<SearchProperty, "id"> & {
  id: string;
  instantBookEnabled: boolean;
  propertyTypeLabel: string;
};

export type PublicPropertyGalleryPhoto = {
  category: string;
  label: string;
  position: string;
  src: string;
  verified: boolean;
};

export type PublicPropertyReview = {
  author: string;
  body: string;
  date: string;
  rating: number;
};

export type PublicPropertyDetail = {
  about: string;
  availabilityDates: string[];
  bathroomsCount: number;
  bedroomsCount: number;
  bedsCount: number;
  breadcrumbLabel: string;
  city: string;
  cleaningFeeAmount: number;
  coordinates: { lat: number; lng: number };
  countryName: string;
  currencyCode: string;
  facts: Array<{ label: string; value: string }>;
  galleryCategories: string[];
  galleryPhotos: PublicPropertyGalleryPhoto[];
  highlights: string[];
  id: string;
  instantBookEnabled: boolean;
  isUsingFallbackImages: boolean;
  locationLabel: string;
  locationPrecisionLabel: string;
  maxGuests: number;
  minimumNights: number;
  maximumNights: number | null;
  photoCountLabel: string;
  priceLabel: string;
  pricePerNight: number;
  propertyTypeLabel: string;
  rating: number;
  ratingBreakdown: Array<[string, string, string]>;
  reviews: PublicPropertyReview[];
  reviewsCount: number;
  slug: string;
  subtitle: string;
  similarStays: Array<{
    imagePosition: string;
    imageSrc: string;
    location: string;
    price: string;
    rating: string;
    slug: string;
    title: string;
  }>;
  tags: string[];
  title: string;
};

export type PublicPropertyListResult = {
  items: PublicPropertyCard[];
  page: number;
  pageCount: number;
  pageSize: number;
  sort: SearchSort;
  totalCount: number;
  unsupportedFilters: string[];
};

const PAGE_SIZE = 6;
const DEFAULT_COORDINATES = { lat: 30.0911, lng: 31.6366 };
const CITY_COORDINATES: Record<string, { lat: number; lng: number }> = {
  Cairo: { lat: 30.064498, lng: 31.491318 },
  "Ain Sokhna": { lat: 29.591122, lng: 32.326775 },
};

function clampPage(page: number | undefined) {
  if (!page || Number.isNaN(page) || page < 1) {
    return 1;
  }

  return Math.floor(page);
}

function parseDateRange(checkIn?: string | null, checkOut?: string | null) {
  if (!checkIn || !checkOut) {
    return null;
  }

  const start = new Date(`${checkIn}T00:00:00Z`);
  const end = new Date(`${checkOut}T00:00:00Z`);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end <= start) {
    return null;
  }

  return { checkIn, checkOut };
}

function mapSort(sort: string | null | undefined): SearchSort {
  if (sort === "price_asc" || sort === "price_desc") {
    return sort;
  }

  return "newest";
}

function mapPropertyTypeLabel(propertyType: PublicPropertyRow["property_type"]) {
  switch (propertyType) {
    case "apartment":
      return "Furnished apartment";
    case "studio":
      return "Studio";
    case "villa":
      return "Villa";
    default:
      return "Property";
  }
}

function formatCurrency(amountMinor: number, currencyCode: string) {
  return `${currencyCode} ${Math.round(amountMinor / 100).toLocaleString("en-US")}`;
}

function buildRatingString(rating: number, reviewsCount: number) {
  return `${rating.toFixed(1)} (${reviewsCount})`;
}

function sanitizeCoordinates(row: PublicPropertyRow) {
  if (
    row.location_precision !== "exact_private" &&
    row.latitude !== null &&
    row.longitude !== null
  ) {
    return { lat: row.latitude, lng: row.longitude };
  }

  return CITY_COORDINATES[row.city] ?? DEFAULT_COORDINATES;
}

function buildLocationLabel(row: PublicPropertyRow) {
  const area = row.area?.trim();
  return area ? `${area}, ${row.city}` : row.city;
}

function buildFallbackSearchCard(
  row: PublicPropertyRow,
  reviewsByPropertyId: Map<string, PublicReviewRow[]>,
): PublicPropertyCard {
  const preset = getPropertyFallbackPreset(row.public_slug);
  const reviewRows = reviewsByPropertyId.get(row.id) ?? [];
  const averageRating = getAverageRating(reviewRows);

  return {
    area: row.area ?? preset.areaLabel,
    description: row.description ?? `${row.title} in ${buildLocationLabel(row)}.`,
    id: row.id,
    imagePosition: preset.gallery[0]?.position ?? "object-center",
    imageSrc: preset.gallery[0]?.src ?? marketplaceImages.modernApartment,
    instantBookEnabled: row.instant_book_enabled,
    lat: sanitizeCoordinates(row).lat,
    lng: sanitizeCoordinates(row).lng,
    location: row.city,
    photos: getFallbackPhotoCountLabel(row.public_slug),
    price: formatCurrency(row.base_nightly_amount, row.currency_code),
    propertyTypeLabel: mapPropertyTypeLabel(row.property_type),
    rating: buildRatingString(averageRating, reviewRows.length),
    slug: row.public_slug,
    tags: preset.tags,
    title: row.title,
  };
}

function getAverageRating(reviewRows: PublicReviewRow[]) {
  if (!reviewRows.length) {
    return 4.9;
  }

  const total = reviewRows.reduce((sum, review) => sum + review.rating, 0);
  return Number((total / reviewRows.length).toFixed(1));
}

function buildRatingBreakdown(reviewRows: PublicReviewRow[]): Array<[string, string, string]> {
  const metrics = [
    ["Cleanliness", "cleanliness_rating"],
    ["Accuracy", "accuracy_rating"],
    ["Communication", "communication_rating"],
    ["Location", "location_rating"],
    ["Value", "value_rating"],
  ] as const;

  return metrics.map(([label, key]) => {
    const values = reviewRows
      .map((review) => review[key])
      .filter((value): value is number => typeof value === "number");
    const average = values.length
      ? values.reduce((sum, value) => sum + value, 0) / values.length
      : 4.8;
    const rounded = Number(average.toFixed(1));
    const width = Math.max(40, Math.min(100, Math.round((rounded / 5) * 100)));

    return [label, rounded.toFixed(1), `w-[${width}%]`];
  });
}

function mapReviewRows(reviewRows: PublicReviewRow[]): PublicPropertyReview[] {
  return reviewRows.map((review, index) => ({
    author: buildFallbackReviewAuthor(index),
    body: review.comment?.trim() || "Verified guest feedback is available for this stay.",
    date: buildFallbackReviewDate(review),
    rating: review.rating,
  }));
}

async function getBlockedPropertyIds(range: { checkIn: string; checkOut: string } | null) {
  if (!range) {
    return [];
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("property_availability")
    .select("property_id, availability_date, status")
    .gte("availability_date", range.checkIn)
    .lt("availability_date", range.checkOut)
    .in("status", ["booked", "blocked"]);

  if (error) {
    throw new Error("Unable to filter public property availability.");
  }

  return Array.from(new Set((data ?? []).map((row) => row.property_id)));
}

async function getPublicReviewsByPropertyIds(propertyIds: string[]) {
  if (!propertyIds.length) {
    return new Map<string, PublicReviewRow[]>();
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("reviews")
    .select(
      "id, property_id, rating, comment, status, submitted_at, created_at, cleanliness_rating, accuracy_rating, communication_rating, location_rating, value_rating",
    )
    .in("property_id", propertyIds)
    .eq("status", "submitted")
    .is("hidden_at", null)
    .is("removed_at", null)
    .order("submitted_at", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error("Unable to load public property reviews.");
  }

  const grouped = new Map<string, PublicReviewRow[]>();
  for (const review of (data ?? []) as PublicReviewRow[]) {
    const current = grouped.get(review.property_id) ?? [];
    current.push(review);
    grouped.set(review.property_id, current);
  }

  return grouped;
}

async function getAvailabilityByPropertyId(propertyId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("property_availability")
    .select("property_id, availability_date, status")
    .eq("property_id", propertyId)
    .in("status", ["booked", "blocked"])
    .order("availability_date", { ascending: true });

  if (error) {
    throw new Error("Unable to load public property availability.");
  }

  return (data ?? []) as AvailabilityRow[];
}

function getUnsupportedFilters(filters: PublicPropertyFilters) {
  const unsupported: string[] = [];

  if (filters.bathrooms) {
    unsupported.push("bathrooms");
  }

  return unsupported;
}

export async function getPublicProperties(filters: PublicPropertyFilters = {}): Promise<PublicPropertyListResult> {
  noStore();

  const page = clampPage(filters.page);
  const sort = filters.sort ?? "newest";
  const range = parseDateRange(filters.checkIn, filters.checkOut);
  const blockedIds = await getBlockedPropertyIds(range);
  const supabase = await createClient();

  let query = supabase
    .from("properties")
    .select(
      "id, public_slug, property_type, title, description, city, area, country_name, latitude, longitude, location_precision, max_guests, bedrooms_count, beds_count, bathrooms_count, area_size_sqm, base_nightly_amount, cleaning_fee_amount, currency_code, minimum_nights, maximum_nights, instant_book_enabled, created_at, published_at",
      { count: "exact" },
    );

  if (filters.destination?.trim()) {
    const value = filters.destination.trim();
    query = query.or(`city.ilike.%${value}%,area.ilike.%${value}%`);
  }

  if (filters.propertyType) {
    query = query.eq("property_type", filters.propertyType as PublicPropertyRow["property_type"]);
  }

  if (filters.guests) {
    query = query.gte("max_guests", filters.guests);
  }

  if (filters.bedrooms) {
    query = query.gte("bedrooms_count", filters.bedrooms);
  }

  if (filters.bathrooms) {
    query = query.gte("bathrooms_count", filters.bathrooms);
  }

  if (typeof filters.minPrice === "number") {
    query = query.gte("base_nightly_amount", filters.minPrice);
  }

  if (typeof filters.maxPrice === "number") {
    query = query.lte("base_nightly_amount", filters.maxPrice);
  }

  if (filters.instantBook) {
    query = query.eq("instant_book_enabled", true);
  }

  if (blockedIds.length) {
    query = query.not("id", "in", `(${blockedIds.map((id) => `"${id}"`).join(",")})`);
  }

  if (sort === "price_asc") {
    query = query.order("base_nightly_amount", { ascending: true }).order("id", { ascending: true });
  } else if (sort === "price_desc") {
    query = query.order("base_nightly_amount", { ascending: false }).order("id", { ascending: true });
  } else {
    query = query.order("published_at", { ascending: false }).order("id", { ascending: true });
  }

  query = query.range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);

  const { data, error, count } = await query;

  if (error) {
    throw new Error("Unable to load public properties.");
  }

  const rows = (data ?? []) as PublicPropertyRow[];
  const reviewsByPropertyId = await getPublicReviewsByPropertyIds(rows.map((row) => row.id));

  return {
    items: rows.map((row) => buildFallbackSearchCard(row, reviewsByPropertyId)),
    page,
    pageCount: Math.max(1, Math.ceil((count ?? 0) / PAGE_SIZE)),
    pageSize: PAGE_SIZE,
    sort,
    totalCount: count ?? 0,
    unsupportedFilters: getUnsupportedFilters(filters),
  };
}

export async function getFeaturedPublicProperties(limit = 4) {
  const result = await getPublicProperties({ page: 1, sort: "newest" });
  return result.items.slice(0, limit);
}

export async function getPublicPropertyBySlug(slug: string): Promise<PublicPropertyDetail | null> {
  noStore();

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("properties")
    .select(
      "id, public_slug, property_type, title, description, city, area, country_name, latitude, longitude, location_precision, max_guests, bedrooms_count, beds_count, bathrooms_count, area_size_sqm, base_nightly_amount, cleaning_fee_amount, currency_code, minimum_nights, maximum_nights, instant_book_enabled, created_at, published_at",
    )
    .eq("public_slug", slug)
    .maybeSingle();

  if (error) {
    throw new Error("Unable to load public property details.");
  }

  if (!data) {
    return null;
  }

  const row = data as PublicPropertyRow;
  const [availabilityRows, reviewsByPropertyId, searchResult] = await Promise.all([
    getAvailabilityByPropertyId(row.id),
    getPublicReviewsByPropertyIds([row.id]),
    getPublicProperties({ page: 1, sort: "newest" }),
  ]);

  const preset = getPropertyFallbackPreset(row.public_slug);
  const reviewRows = reviewsByPropertyId.get(row.id) ?? [];
  const averageRating = getAverageRating(reviewRows);
  const coordinates = sanitizeCoordinates(row);
  const similarStays = searchResult.items
    .filter((item) => item.slug !== row.public_slug)
    .slice(0, 3)
    .map((item) => ({
      imagePosition: item.imagePosition,
      imageSrc: item.imageSrc,
      location: `${item.area}, ${item.location}`,
      price: `${item.price} / night`,
      rating: item.rating,
      slug: item.slug,
      title: item.title,
    }));

  return {
    about: buildFallbackAbout(row),
    availabilityDates: availabilityRows.map((item) => item.availability_date),
    bathroomsCount: row.bathrooms_count,
    bedroomsCount: row.bedrooms_count,
    bedsCount: row.beds_count,
    breadcrumbLabel: row.area ?? row.city,
    city: row.city,
    cleaningFeeAmount: row.cleaning_fee_amount,
    coordinates,
    countryName: row.country_name,
    currencyCode: row.currency_code,
    facts: [
      { label: "Guests", value: String(row.max_guests) },
      { label: row.bedrooms_count === 1 ? "Bedroom" : "Bedrooms", value: String(row.bedrooms_count) },
      { label: row.beds_count === 1 ? "Bed" : "Beds", value: String(row.beds_count) },
      { label: row.bathrooms_count === 1 ? "Bathroom" : "Bathrooms", value: String(row.bathrooms_count) },
      { label: "Size", value: row.area_size_sqm ? `${row.area_size_sqm} m²` : "N/A" },
    ],
    galleryCategories: getFallbackGalleryCategories(),
    galleryPhotos: preset.gallery.map((photo) => ({ ...photo, verified: true })),
    highlights: preset.highlights,
    id: row.id,
    instantBookEnabled: row.instant_book_enabled,
    isUsingFallbackImages: true,
    locationLabel: buildLocationLabel(row),
    locationPrecisionLabel:
      row.location_precision === "approximate"
        ? "Approximate area pin shown"
        : "Verified property",
    maxGuests: row.max_guests,
    maximumNights: row.maximum_nights,
    minimumNights: row.minimum_nights,
    photoCountLabel: getFallbackPhotoCountLabel(row.public_slug),
    priceLabel: formatCurrency(row.base_nightly_amount, row.currency_code),
    pricePerNight: Math.round(row.base_nightly_amount / 100),
    propertyTypeLabel: mapPropertyTypeLabel(row.property_type),
    rating: averageRating,
    ratingBreakdown: buildRatingBreakdown(reviewRows),
    reviews: mapReviewRows(reviewRows),
    reviewsCount: reviewRows.length,
    similarStays,
    slug: row.public_slug,
    subtitle: `${row.area ?? row.city}, ${row.city}, ${row.country_name}`,
    tags: preset.tags,
    title: row.title,
  };
}

export async function getPublicPropertyAvailability(
  propertyId: string,
  range?: { checkIn?: string | null; checkOut?: string | null },
) {
  noStore();

  const availabilityRows = await getAvailabilityByPropertyId(propertyId);
  const parsedRange = parseDateRange(range?.checkIn, range?.checkOut);

  if (!parsedRange) {
    return availabilityRows;
  }

  return availabilityRows.filter(
    (row) =>
      row.availability_date >= parsedRange.checkIn &&
      row.availability_date < parsedRange.checkOut,
  );
}

export async function getPublicPropertyPhotoMetadata() {
  noStore();
  return [];
}

export function parsePublicPropertyFilters(
  searchParams: Record<string, string | string[] | undefined>,
): PublicPropertyFilters {
  const destination = firstValue(searchParams.destination);
  const guests = parseInteger(firstValue(searchParams.guests));
  const bedrooms = parseBedroomValue(firstValue(searchParams.bedrooms));
  const bathrooms = parseInteger(firstValue(searchParams.bathrooms));
  const checkIn = firstValue(searchParams.checkIn);
  const checkOut = firstValue(searchParams.checkOut);
  const minPrice = parsePrice(firstValue(searchParams.minPrice));
  const maxPrice = parsePrice(firstValue(searchParams.maxPrice));
  const type = mapPropertyType(firstValue(searchParams.type), firstValue(searchParams.filters));
  const instantBook =
    firstValue(searchParams.instant) === "true" ||
    (firstValue(searchParams.filters) ?? "").toLowerCase().includes("instant booking");

  return {
    bathrooms,
    bedrooms,
    checkIn,
    checkOut,
    destination,
    guests,
    instantBook,
    maxPrice,
    minPrice,
    page: parseInteger(firstValue(searchParams.page)) ?? 1,
    propertyType: type,
    sort: mapSort(firstValue(searchParams.sort)),
  };
}

export function buildSearchFallbackResult(): PublicPropertyListResult {
  return {
    items: mockSearchProperties.map((property) => ({
      ...property,
      id: String(property.id),
      instantBookEnabled: property.tags.includes("Instant booking"),
      propertyTypeLabel: "Property",
    })),
    page: 1,
    pageCount: 1,
    pageSize: PAGE_SIZE,
    sort: "newest",
    totalCount: mockSearchProperties.length,
    unsupportedFilters: [],
  };
}

function firstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function parseInteger(value: string | undefined) {
  if (!value) {
    return null;
  }

  const match = value.match(/\d+/);
  if (!match) {
    return null;
  }

  return Number(match[0]);
}

function parseBedroomValue(value: string | undefined) {
  if (!value || value === "Any") {
    return null;
  }

  if (value === "4+") {
    return 4;
  }

  return parseInteger(value);
}

function parsePrice(value: string | undefined) {
  const parsed = parseInteger(value);
  return parsed ? parsed * 100 : null;
}

function mapPropertyType(type: string | undefined, filters: string | undefined) {
  const normalized = type?.toLowerCase().trim();
  if (normalized) {
    if (normalized.includes("apartment")) return "apartment";
    if (normalized.includes("studio")) return "studio";
    if (normalized.includes("villa")) return "villa";
  }

  const filterLabels = (filters ?? "").toLowerCase();
  if (filterLabels.includes("furnished apartment")) return "apartment";
  if (filterLabels.includes("studio")) return "studio";
  if (filterLabels.includes("villa")) return "villa";

  return null;
}
