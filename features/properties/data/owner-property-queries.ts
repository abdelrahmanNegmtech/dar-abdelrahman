import "server-only";

import { unstable_noStore as noStore } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { DbEnum, PropertyRow, TableRow } from "@/lib/supabase/database";
import type { Database } from "@/lib/supabase/database.types";
import { requireOwner } from "@/lib/supabase/auth";

type PropertyPhotoRow = TableRow<"property_photos">;
type PropertyAvailabilityRow = TableRow<"property_availability">;
type PropertyPricingRuleRow = TableRow<"property_pricing_rules">;
type OwnerPropertyListRpcRow = Database["public"]["Functions"]["list_owner_properties"]["Returns"][number];
type OwnerPropertyRpcRow = Database["public"]["Functions"]["get_owner_property"]["Returns"][number];
type OwnerAvailabilityRpcRow =
  Database["public"]["Functions"]["get_owner_property_availability"]["Returns"][number];
type OwnerPhotoRpcRow = Database["public"]["Functions"]["get_owner_property_photos"]["Returns"][number];

export type OwnerPropertyStatusGroup =
  | "draft"
  | "pending_review"
  | "approved"
  | "published"
  | "rejected"
  | "suspended"
  | "archived";

export type OwnerPropertyListItem = {
  id: string;
  location: string;
  moderationStatus: PropertyRow["moderation_status"];
  photoCount: number;
  primaryActionHref: string;
  primaryActionLabel: string;
  publicationStatus: PropertyRow["publication_status"];
  statusBadgeClassName: string;
  statusGroup: OwnerPropertyStatusGroup;
  statusLabel: string;
  title: string;
  updatedAtLabel: string;
};

export type OwnerPropertyRecord = Pick<
  PropertyRow,
  | "address_line_1"
  | "address_line_2"
  | "approved_at"
  | "area"
  | "area_size_sqm"
  | "archived_at"
  | "base_nightly_amount"
  | "bathrooms_count"
  | "bedrooms_count"
  | "beds_count"
  | "building_name"
  | "city"
  | "cleaning_fee_amount"
  | "country_code"
  | "country_name"
  | "created_at"
  | "currency_code"
  | "description"
  | "id"
  | "instant_book_enabled"
  | "latitude"
  | "location_precision"
  | "longitude"
  | "max_guests"
  | "maximum_nights"
  | "minimum_nights"
  | "moderation_status"
  | "owner_profile_id"
  | "property_type"
  | "public_slug"
  | "publication_status"
  | "published_at"
  | "rejected_at"
  | "security_deposit_amount"
  | "submitted_for_review_at"
  | "suspended_at"
  | "title"
  | "unpublished_at"
  | "updated_at"
>;

export type OwnerPropertyPhotoViewModel = {
  caption: string | null;
  category: PropertyPhotoRow["photo_category"];
  createdAt: string;
  id: string;
  isCover: boolean;
  sortOrder: number;
  storagePath: string;
};

export type OwnerAvailabilityViewModel = {
  bookingId: string | null;
  date: string;
  id: string;
  isManual: boolean;
  note: string | null;
  reason: PropertyAvailabilityRow["reason"];
  status: PropertyAvailabilityRow["status"];
};

export type OwnerPricingRuleViewModel = {
  daysOfWeekMask: number | null;
  deletedAt: string | null;
  endsOn: string;
  id: string;
  isActive: boolean;
  label: string;
  maximumNightsOverride: number | null;
  minimumNightsOverride: number | null;
  nightlyAmountOverride: number | null;
  percentAdjustment: number | null;
  priority: number;
  ruleType: PropertyPricingRuleRow["rule_type"];
  startsOn: string;
};

export type OwnerPropertySummary = {
  addressLine1: string;
  area: string | null;
  bathroomsCount: number;
  bedroomsCount: number;
  bedsCount: number;
  buildingName: string | null;
  city: string;
  countryName: string;
  description: string | null;
  id: string;
  instantBookEnabled: boolean;
  isApproved: boolean;
  isPublished: boolean;
  isRejected: boolean;
  locationLabel: string;
  maxGuests: number;
  maximumNights: number | null;
  minimumNights: number;
  moderationStatus: PropertyRow["moderation_status"];
  photoCount: number;
  photos: OwnerPropertyPhotoViewModel[];
  pricePerNight: number;
  propertyType: PropertyRow["property_type"];
  publicationStatus: PropertyRow["publication_status"];
  statusGroup: OwnerPropertyStatusGroup;
  statusLabel: string;
  submittedForReviewAt: string | null;
  title: string;
};

type OwnerPropertyListRow = Pick<
  PropertyRow,
  | "area"
  | "city"
  | "country_name"
  | "id"
  | "moderation_status"
  | "publication_status"
  | "title"
  | "updated_at"
>;

function buildLocationLabel(row: {
  address_line_1?: string | null;
  area: string | null;
  city: string;
  country_name: string;
}) {
  const parts = [row.area, row.city, row.country_name].filter(Boolean);
  return parts.length ? parts.join(", ") : row.address_line_1 ?? "Location pending";
}

export function mapOwnerPropertyStatusGroup(
  moderationStatus: PropertyRow["moderation_status"],
  publicationStatus: PropertyRow["publication_status"],
): OwnerPropertyStatusGroup {
  if (publicationStatus === "archived") {
    return "archived";
  }

  if (moderationStatus === "suspended") {
    return "suspended";
  }

  if (moderationStatus === "rejected") {
    return "rejected";
  }

  if (moderationStatus === "approved" && publicationStatus === "published") {
    return "published";
  }

  if (moderationStatus === "approved") {
    return "approved";
  }

  if (moderationStatus === "submitted" || moderationStatus === "under_review") {
    return "pending_review";
  }

  return "draft";
}

export function mapOwnerPropertyStatusLabel(statusGroup: OwnerPropertyStatusGroup) {
  switch (statusGroup) {
    case "pending_review":
      return "Pending review";
    case "approved":
      return "Approved";
    case "published":
      return "Published";
    case "rejected":
      return "Rejected";
    case "suspended":
      return "Suspended";
    case "archived":
      return "Archived";
    default:
      return "Draft";
  }
}

export function mapOwnerPropertyStatusBadgeClassName(statusGroup: OwnerPropertyStatusGroup) {
  switch (statusGroup) {
    case "pending_review":
      return "bg-[#fff3d7]";
    case "published":
    case "approved":
      return "bg-[#eaf8ed]";
    case "rejected":
      return "bg-[#fff0f0]";
    case "suspended":
      return "bg-[#fde6e6]";
    case "archived":
      return "bg-[#eef2f7]";
    default:
      return "bg-[#f5f0ff]";
  }
}

function mapPrimaryAction(statusGroup: OwnerPropertyStatusGroup, propertyId: string) {
  if (statusGroup === "rejected") {
    return {
      primaryActionHref: `/owner/properties/${propertyId}/rejected`,
      primaryActionLabel: "View rejection reasons",
    };
  }

  if (statusGroup === "draft") {
    return {
      primaryActionHref: `/owner/properties/${propertyId}/edit`,
      primaryActionLabel: "Continue editing",
    };
  }

  return {
    primaryActionHref: `/owner/properties/${propertyId}`,
    primaryActionLabel: "View property",
  };
}

function formatUpdatedAtLabel(updatedAt: string) {
  return new Date(updatedAt).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function mapPropertyListRow(row: OwnerPropertyListRow, photoCount: number): OwnerPropertyListItem {
  const statusGroup = mapOwnerPropertyStatusGroup(row.moderation_status, row.publication_status);
  const primaryAction = mapPrimaryAction(statusGroup, row.id);

  return {
    id: row.id,
    location: buildLocationLabel(row),
    moderationStatus: row.moderation_status,
    photoCount,
    primaryActionHref: primaryAction.primaryActionHref,
    primaryActionLabel: primaryAction.primaryActionLabel,
    publicationStatus: row.publication_status,
    statusBadgeClassName: mapOwnerPropertyStatusBadgeClassName(statusGroup),
    statusGroup,
    statusLabel: mapOwnerPropertyStatusLabel(statusGroup),
    title: row.title,
    updatedAtLabel: formatUpdatedAtLabel(row.updated_at),
  };
}

function mapPhotoRow(row: PropertyPhotoRow): OwnerPropertyPhotoViewModel {
  return {
    caption: row.caption,
    category: row.photo_category,
    createdAt: "",
    id: row.id,
    isCover: row.is_cover,
    sortOrder: row.sort_order,
    storagePath: row.storage_path,
  };
}

function mapAvailabilityRow(row: PropertyAvailabilityRow): OwnerAvailabilityViewModel {
  return {
    bookingId: row.booking_id,
    date: row.availability_date,
    id: row.id,
    isManual: row.booking_id === null,
    note: row.note,
    reason: row.reason,
    status: row.status,
  };
}

function mapPricingRuleRow(row: PropertyPricingRuleRow): OwnerPricingRuleViewModel {
  return {
    daysOfWeekMask: row.days_of_week_mask,
    deletedAt: row.deleted_at,
    endsOn: row.ends_on,
    id: row.id,
    isActive: row.is_active,
    label: row.label,
    maximumNightsOverride: row.maximum_nights_override,
    minimumNightsOverride: row.minimum_nights_override,
    nightlyAmountOverride: row.nightly_amount_override,
    percentAdjustment: row.percent_adjustment,
    priority: row.priority,
    ruleType: row.rule_type,
    startsOn: row.starts_on,
  };
}

async function getOwnerScopedSupabase() {
  const { user } = await requireOwner();
  return { supabase: await createClient(), user };
}

export async function getOwnerProperties() {
  noStore();

  const { supabase } = await getOwnerScopedSupabase();
  const { data, error } = await supabase.rpc("list_owner_properties");

  if (error) {
    throw new Error("Unable to load owner properties.");
  }

  return ((data ?? []) as OwnerPropertyListRpcRow[]).map((row) =>
    mapPropertyListRow(row as OwnerPropertyListRow, Number(row.photo_count ?? 0)),
  );
}

export async function getOwnerPropertyById(propertyId: string) {
  noStore();

  const { supabase } = await getOwnerScopedSupabase();
  const { data, error } = await supabase.rpc("get_owner_property", {
    property_uuid: propertyId,
  });

  if (error) {
    throw new Error("Unable to load owner property.");
  }

  return ((data as OwnerPropertyRpcRow[] | null)?.[0] as OwnerPropertyRecord | undefined) ?? null;
}

export async function getOwnerPropertyPhotos(propertyId: string) {
  noStore();

  const { supabase } = await getOwnerScopedSupabase();
  const { data, error } = await supabase.rpc("get_owner_property_photos", {
    property_uuid: propertyId,
  });

  if (error) {
    throw new Error("Unable to load owner property photos.");
  }

  return ((data ?? []) as OwnerPhotoRpcRow[]).map((row) => mapPhotoRow(row as PropertyPhotoRow));
}

export async function getOwnerPropertyAvailability(
  propertyId: string,
  range?: { dateFrom?: string | null; dateTo?: string | null },
) {
  noStore();

  const { supabase } = await getOwnerScopedSupabase();
  const { data, error } = await supabase.rpc("get_owner_property_availability", {
    property_uuid: propertyId,
    date_from: range?.dateFrom ?? undefined,
    date_to: range?.dateTo ?? undefined,
  });

  if (error) {
    throw new Error("Unable to load owner property availability.");
  }

  return ((data ?? []) as OwnerAvailabilityRpcRow[]).map((row) =>
    mapAvailabilityRow(row as PropertyAvailabilityRow),
  );
}

export async function getOwnerPropertyPricingRules(
  propertyId: string,
  options?: { includeDeleted?: boolean; ruleTypes?: PropertyPricingRuleRow["rule_type"][] },
) {
  noStore();

  const { supabase } = await getOwnerScopedSupabase();
  let query = supabase
    .from("property_pricing_rules")
    .select(
      "id, rule_type, label, starts_on, ends_on, priority, nightly_amount_override, percent_adjustment, minimum_nights_override, maximum_nights_override, days_of_week_mask, is_active, deleted_at",
    )
    .eq("property_id", propertyId)
    .order("priority", { ascending: true })
    .order("starts_on", { ascending: true });

  if (!options?.includeDeleted) {
    query = query.is("deleted_at", null);
  }

  if (options?.ruleTypes?.length) {
    query = query.in("rule_type", options.ruleTypes);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error("Unable to load owner pricing rules.");
  }

  return ((data ?? []) as PropertyPricingRuleRow[]).map(mapPricingRuleRow);
}

export async function getOwnerPropertySummary(propertyId: string): Promise<OwnerPropertySummary | null> {
  const [property, photos] = await Promise.all([
    getOwnerPropertyById(propertyId),
    getOwnerPropertyPhotos(propertyId),
  ]);

  if (!property) {
    return null;
  }

  const statusGroup = mapOwnerPropertyStatusGroup(
    property.moderation_status,
    property.publication_status,
  );

  return {
    addressLine1: property.address_line_1,
    area: property.area,
    bathroomsCount: property.bathrooms_count,
    bedroomsCount: property.bedrooms_count,
    bedsCount: property.beds_count,
    buildingName: property.building_name,
    city: property.city,
    countryName: property.country_name,
    description: property.description,
    id: property.id,
    instantBookEnabled: property.instant_book_enabled,
    isApproved: property.moderation_status === "approved",
    isPublished: property.publication_status === "published",
    isRejected: property.moderation_status === "rejected",
    locationLabel: buildLocationLabel(property),
    maxGuests: property.max_guests,
    maximumNights: property.maximum_nights,
    minimumNights: property.minimum_nights,
    moderationStatus: property.moderation_status,
    photoCount: photos.length,
    photos,
    pricePerNight: Math.round(property.base_nightly_amount / 100),
    propertyType: property.property_type,
    publicationStatus: property.publication_status,
    statusGroup,
    statusLabel: mapOwnerPropertyStatusLabel(statusGroup),
    submittedForReviewAt: property.submitted_for_review_at,
    title: property.title,
  };
}

export function mapPropertyTypeToOwnerLabel(propertyType: DbEnum<"property_type">) {
  switch (propertyType) {
    case "studio":
      return "Studio";
    case "villa":
      return "Villa";
    case "duplex":
      return "Duplex";
    case "hotel":
      return "Hotel";
    default:
      return "Apartment";
  }
}

export function mapOwnerLabelToPropertyType(value: string): DbEnum<"property_type"> {
  switch (value.toLowerCase()) {
    case "studio":
      return "studio";
    case "villa":
      return "villa";
    case "duplex":
      return "duplex";
    case "hotel":
      return "hotel";
    default:
      return "apartment";
  }
}
