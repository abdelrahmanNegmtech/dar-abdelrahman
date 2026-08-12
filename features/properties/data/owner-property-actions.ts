"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import type {
  PropertyInsert,
  PropertyUpdate,
  TableInsert,
  TableUpdate,
} from "@/lib/supabase/database";
import type { Database } from "@/lib/supabase/database.types";
import { requireOwner } from "@/lib/supabase/auth";
import { createClient } from "@/lib/supabase/server";
import { mapOwnerLabelToPropertyType } from "./owner-property-queries";

type ActionResult<T = undefined> =
  | { ok: true; data: T; message?: string }
  | { ok: false; message: string };

type SubmissionRpcRow =
  Database["public"]["Functions"]["submit_property_for_review"]["Returns"][number];

const ownerPropertyEditSchema = z.object({
  addressLine1: z.string().trim().min(1),
  addressLine2: z.string().trim().optional(),
  area: z.string().trim().optional(),
  areaSizeSqm: z.string().trim().optional(),
  bathrooms: z.string().trim().min(1),
  bedrooms: z.string().trim().min(1),
  beds: z.string().trim().min(1),
  buildingName: z.string().trim().optional(),
  city: z.string().trim().min(1),
  countryCode: z.string().trim().default("EG"),
  countryName: z.string().trim().default("Egypt"),
  description: z.string().trim().optional(),
  guests: z.string().trim().min(1),
  id: z.string().uuid(),
  instantBookEnabled: z.boolean().default(false),
  latitude: z.string().trim().optional(),
  locationPrecision: z.enum(["approximate", "exact_private", "exact_public"]).default("approximate"),
  longitude: z.string().trim().optional(),
  maximumNights: z.string().trim().optional(),
  minimumNights: z.string().trim().min(1),
  nightlyPrice: z.string().trim().min(1),
  title: z.string().trim().min(1),
  type: z.string().trim().min(1),
});

const ownerAvailabilityRangeSchema = z.object({
  dateFrom: z.string().trim().min(10),
  dateTo: z.string().trim().min(10),
  note: z.string().trim().optional(),
  propertyId: z.string().uuid(),
  reason: z.enum(["owner_blocked", "maintenance"]).optional(),
  status: z.enum(["available", "blocked"]),
});

const ownerAvailabilityRowSchema = z.object({
  availabilityId: z.string().uuid(),
  note: z.string().trim().optional(),
  propertyId: z.string().uuid(),
  reason: z.enum(["owner_blocked", "maintenance"]).nullable(),
  status: z.enum(["available", "blocked"]),
});

const ownerAvailabilityDeleteSchema = z.object({
  availabilityId: z.string().uuid(),
  propertyId: z.string().uuid(),
});

const availabilitySettingsSchema = z.object({
  instantBookEnabled: z.boolean(),
  maximumNights: z.number().int().positive().nullable(),
  minimumNights: z.number().int().positive(),
  propertyId: z.string().uuid(),
});

const ownerMinimumStayRuleSchema = z.object({
  endsOn: z.string().trim().min(10),
  isActive: z.boolean().default(true),
  label: z.string().trim().min(1),
  maximumNightsOverride: z.number().int().positive().nullable(),
  minimumNightsOverride: z.number().int().min(1),
  priority: z.number().int().min(0).default(100),
  propertyId: z.string().uuid(),
  ruleId: z.string().uuid().optional(),
  startsOn: z.string().trim().min(10),
});

const ownerPricingRuleSchema = z.object({
  daysOfWeekMask: z.number().int().min(0).max(127).nullable(),
  endsOn: z.string().trim().min(10),
  isActive: z.boolean().default(true),
  label: z.string().trim().min(1),
  maximumNightsOverride: z.number().int().positive().nullable(),
  minimumNightsOverride: z.number().int().positive().nullable(),
  nightlyAmountOverride: z.number().int().positive().nullable(),
  percentAdjustment: z.number().min(-100).max(1000).nullable(),
  priority: z.number().int().min(0).default(100),
  propertyId: z.string().uuid(),
  ruleId: z.string().uuid().optional(),
  ruleType: z.enum([
    "seasonal_override",
    "weekend_override",
    "date_range_discount",
    "date_range_markup",
    "custom",
  ]),
  startsOn: z.string().trim().min(10),
});

const ownerPricingRuleToggleSchema = z.object({
  isActive: z.boolean(),
  propertyId: z.string().uuid(),
  ruleId: z.string().uuid(),
});

const ownerPhotoCreateSchema = z.object({
  caption: z.string().trim().optional(),
  category: z.enum([
    "cover",
    "living_room",
    "bedroom",
    "bathroom",
    "kitchen",
    "balcony",
    "exterior",
    "amenity",
    "other",
  ]),
  isCover: z.boolean().default(false),
  propertyId: z.string().uuid(),
  sortOrder: z.number().int().min(0),
  storagePath: z.string().trim().min(1),
});

const ownerPhotoUpdateSchema = ownerPhotoCreateSchema.extend({
  photoId: z.string().uuid(),
});

const ownerPhotoDeleteSchema = z.object({
  photoId: z.string().uuid(),
  propertyId: z.string().uuid(),
});

function fail<T = undefined>(message: string): ActionResult<T> {
  return { message, ok: false };
}

function ok<T>(data: T, message?: string): ActionResult<T> {
  return { data, message, ok: true };
}

function revalidateOwnerPropertyPaths(propertyId: string) {
  revalidatePath("/owner");
  revalidatePath("/owner/properties");
  revalidatePath("/owner/properties/drafts");
  revalidatePath(`/owner/properties/${propertyId}`);
  revalidatePath(`/owner/properties/${propertyId}/edit`);
  revalidatePath(`/owner/properties/${propertyId}/publish`);
  revalidatePath(`/owner/properties/${propertyId}/rejected`);
  revalidatePath(`/owner/properties/${propertyId}/availability-rules`);
  revalidatePath(`/owner/properties/${propertyId}/seasonal-pricing`);
  revalidatePath(`/owner/properties/${propertyId}/calendar-management`);
  revalidatePath(`/owner/properties/${propertyId}/photos`);
}

function buildUniquePublicSlug(title: string) {
  const base = title
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48) || "owner-property";
  return `${base}-${crypto.randomUUID().slice(0, 8)}`;
}

function parseInteger(value: string, minimum = 0) {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed >= minimum ? parsed : null;
}

function parseNullableInteger(value?: string | null, minimum = 0) {
  if (!value || value.trim() === "") {
    return null;
  }

  return parseInteger(value, minimum);
}

function parseCoordinate(value?: string | null) {
  if (!value || value.trim() === "") {
    return null;
  }

  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function parseMinorAmount(value: string) {
  const normalized = value.replace(/,/g, "").trim();
  const amount = Number.parseFloat(normalized);
  if (!Number.isFinite(amount) || amount <= 0) {
    return null;
  }

  return Math.round(amount * 100);
}

function mapEditPayload(input: z.infer<typeof ownerPropertyEditSchema>): PropertyUpdate {
  const bathroomsCount = parseInteger(input.bathrooms, 1);
  const bedroomsCount = parseInteger(input.bedrooms, 0);
  const bedsCount = parseInteger(input.beds, 0);
  const maxGuests = parseInteger(input.guests, 1);
  const minimumNights = parseInteger(input.minimumNights, 1);
  const baseNightlyAmount = parseMinorAmount(input.nightlyPrice);
  const maximumNights = parseNullableInteger(input.maximumNights, 1);

  if (
    bathroomsCount === null
    || bedroomsCount === null
    || bedsCount === null
    || maxGuests === null
    || minimumNights === null
    || baseNightlyAmount === null
  ) {
    return {};
  }

  return {
    address_line_1: input.addressLine1.trim(),
    address_line_2: input.addressLine2?.trim() || null,
    area: input.area?.trim() || null,
    area_size_sqm: parseNullableInteger(input.areaSizeSqm, 1),
    bathrooms_count: bathroomsCount,
    base_nightly_amount: baseNightlyAmount,
    bedrooms_count: bedroomsCount,
    beds_count: bedsCount,
    building_name: input.buildingName?.trim() || null,
    city: input.city.trim(),
    country_code: input.countryCode.trim() || "EG",
    country_name: input.countryName.trim() || "Egypt",
    description: input.description?.trim() || null,
    instant_book_enabled: input.instantBookEnabled,
    latitude: parseCoordinate(input.latitude),
    location_precision: input.locationPrecision,
    longitude: parseCoordinate(input.longitude),
    max_guests: maxGuests,
    maximum_nights: maximumNights,
    minimum_nights: minimumNights,
    property_type: mapOwnerLabelToPropertyType(input.type),
    title: input.title.trim(),
  };
}

export async function createOwnerDraftProperty(): Promise<ActionResult<{ propertyId: string }>> {
  const { user } = await requireOwner();
  const supabase = await createClient();
  const draftInsert: PropertyInsert = {
    address_line_1: "Draft address",
    address_line_2: null,
    area: "Cairo",
    area_size_sqm: null,
    base_nightly_amount: 100000,
    building_name: null,
    bathrooms_count: 1,
    bedrooms_count: 1,
    beds_count: 1,
    city: "Cairo",
    cleaning_fee_amount: 0,
    country_code: "EG",
    country_name: "Egypt",
    currency_code: "EGP",
    description: null,
    instant_book_enabled: false,
    latitude: null,
    location_precision: "approximate",
    longitude: null,
    max_guests: 2,
    maximum_nights: null,
    minimum_nights: 1,
    owner_profile_id: user.id,
    property_type: "apartment",
    security_deposit_amount: 0,
    public_slug: buildUniquePublicSlug("owner-draft-property"),
    title: "Untitled draft property",
  };

  const { data, error } = await supabase
    .from("properties")
    .insert(draftInsert)
    .select("id")
    .single();

  if (error || !data) {
    return fail("We could not create a new draft right now.");
  }

  revalidateOwnerPropertyPaths(data.id);
  return ok({ propertyId: data.id });
}

export async function saveOwnerPropertyEdit(
  input: z.infer<typeof ownerPropertyEditSchema>,
): Promise<ActionResult<{ propertyId: string }>> {
  const parsed = ownerPropertyEditSchema.safeParse(input);
  if (!parsed.success) {
    return fail("Please review the property details and try again.");
  }

  await requireOwner();
  const supabase = await createClient();
  const payload = mapEditPayload(parsed.data);
  if (!Object.keys(payload).length) {
    return fail("Please review the property details and try again.");
  }

  if (
    payload.maximum_nights !== null
    && payload.maximum_nights !== undefined
    && payload.minimum_nights !== undefined
    && payload.maximum_nights < payload.minimum_nights
  ) {
    return fail("Maximum nights must be greater than or equal to minimum nights.");
  }

  const { error } = await supabase
    .from("properties")
    .update(payload)
    .eq("id", parsed.data.id);

  if (error) {
    return fail("We could not save your property changes right now.");
  }

  revalidateOwnerPropertyPaths(parsed.data.id);
  return ok({ propertyId: parsed.data.id }, "Property changes saved.");
}

export async function submitOwnerPropertyForReview(
  propertyId: string,
): Promise<ActionResult<{ propertyId: string; status: string }>> {
  if (!propertyId) {
    return fail("Missing property.");
  }

  await requireOwner();
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("submit_property_for_review", {
    property_uuid: propertyId,
  });

  if (error) {
    return fail("We could not submit this property for review.");
  }

  const row = (data as SubmissionRpcRow[] | null)?.[0] ?? null;
  if (!row) {
    return fail("We could not submit this property for review.");
  }

  revalidateOwnerPropertyPaths(propertyId);
  return ok({ propertyId, status: row.moderation_status }, "Property submitted for review.");
}

function eachDateInclusive(dateFrom: string, dateTo: string) {
  const start = new Date(`${dateFrom}T00:00:00Z`);
  const end = new Date(`${dateTo}T00:00:00Z`);
  const dates: string[] = [];

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || start > end) {
    return dates;
  }

  const cursor = new Date(start);
  while (cursor <= end) {
    dates.push(cursor.toISOString().slice(0, 10));
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }

  return dates;
}

export async function saveOwnerAvailabilityRange(
  input: z.infer<typeof ownerAvailabilityRangeSchema>,
): Promise<ActionResult<{ propertyId: string }>> {
  const parsed = ownerAvailabilityRangeSchema.safeParse(input);
  if (!parsed.success) {
    return fail("Please choose a valid date range.");
  }

  await requireOwner();
  const supabase = await createClient();
  const propertyId = parsed.data.propertyId;
  const dates = eachDateInclusive(parsed.data.dateFrom, parsed.data.dateTo);
  if (!dates.length) {
    return fail("Please choose a valid date range.");
  }
  const { error } = await supabase.rpc("set_owner_property_availability_range", {
    date_from: parsed.data.dateFrom,
    date_to: parsed.data.dateTo,
    property_uuid: propertyId,
    target_note: parsed.data.note?.trim() || undefined,
    target_reason: parsed.data.status === "blocked" ? (parsed.data.reason ?? "owner_blocked") : undefined,
    target_status: parsed.data.status,
  });

  if (error) {
    return fail(
      error.message === "Booked dates cannot be edited or deleted"
        ? error.message
        : "We could not save those availability dates.",
    );
  }

  revalidateOwnerPropertyPaths(propertyId);
  return ok({ propertyId }, "Availability updated.");
}

export async function updateOwnerAvailabilityEntry(
  input: z.infer<typeof ownerAvailabilityRowSchema>,
): Promise<ActionResult<{ propertyId: string }>> {
  const parsed = ownerAvailabilityRowSchema.safeParse(input);
  if (!parsed.success) {
    return fail("Please review the availability row and try again.");
  }

  await requireOwner();
  const supabase = await createClient();
  const { error } = await supabase.rpc("update_owner_property_availability_entry", {
    availability_uuid: parsed.data.availabilityId,
    target_note: parsed.data.note?.trim() || undefined,
    target_reason: parsed.data.status === "blocked" ? (parsed.data.reason ?? "owner_blocked") : undefined,
    target_status: parsed.data.status,
  });

  if (error) {
    return fail("We could not update that availability row.");
  }

  revalidateOwnerPropertyPaths(parsed.data.propertyId);
  return ok({ propertyId: parsed.data.propertyId }, "Availability row updated.");
}

export async function deleteOwnerAvailabilityEntry(
  input: z.infer<typeof ownerAvailabilityDeleteSchema>,
): Promise<ActionResult<{ propertyId: string }>> {
  const parsed = ownerAvailabilityDeleteSchema.safeParse(input);
  if (!parsed.success) {
    return fail("Please choose a valid availability row.");
  }

  await requireOwner();
  const supabase = await createClient();
  const { error } = await supabase.rpc("delete_owner_property_availability_entry", {
    availability_uuid: parsed.data.availabilityId,
  });

  if (error) {
    return fail("We could not delete that availability row.");
  }

  revalidateOwnerPropertyPaths(parsed.data.propertyId);
  return ok({ propertyId: parsed.data.propertyId }, "Availability row removed.");
}

export async function saveOwnerAvailabilitySettings(
  input: z.infer<typeof availabilitySettingsSchema>,
): Promise<ActionResult<{ propertyId: string }>> {
  const parsed = availabilitySettingsSchema.safeParse(input);
  if (!parsed.success) {
    return fail("Please review the availability settings.");
  }

  await requireOwner();
  const supabase = await createClient();
  const propertyId = parsed.data.propertyId;

  const propertyUpdate = await supabase
    .from("properties")
    .update({
      instant_book_enabled: parsed.data.instantBookEnabled,
      maximum_nights: parsed.data.maximumNights,
      minimum_nights: parsed.data.minimumNights,
    })
    .eq("id", propertyId);

  if (propertyUpdate.error) {
    return fail("We could not save those availability settings.");
  }

  revalidateOwnerPropertyPaths(propertyId);
  return ok({ propertyId }, "Availability settings saved.");
}

export async function saveOwnerMinimumStayRule(
  input: z.infer<typeof ownerMinimumStayRuleSchema>,
): Promise<ActionResult<{ propertyId: string }>> {
  const parsed = ownerMinimumStayRuleSchema.safeParse(input);
  if (!parsed.success) {
    return fail("Please review the custom minimum-stay rule.");
  }

  await requireOwner();
  const supabase = await createClient();
  const propertyId = parsed.data.propertyId;

  if (parsed.data.maximumNightsOverride !== null
    && parsed.data.maximumNightsOverride < parsed.data.minimumNightsOverride) {
    return fail("Maximum nights must be greater than or equal to minimum nights.");
  }

  const payload: TableInsert<"property_pricing_rules"> | TableUpdate<"property_pricing_rules"> = {
    ends_on: parsed.data.endsOn,
    is_active: parsed.data.isActive,
    label: parsed.data.label,
    maximum_nights_override: parsed.data.maximumNightsOverride,
    minimum_nights_override: parsed.data.minimumNightsOverride,
    priority: parsed.data.priority,
    property_id: propertyId,
    rule_type: "minimum_stay_override",
    starts_on: parsed.data.startsOn,
  };

  const result = parsed.data.ruleId
    ? await supabase
        .from("property_pricing_rules")
        .update(payload)
        .eq("id", parsed.data.ruleId)
    : await supabase.from("property_pricing_rules").insert(payload as TableInsert<"property_pricing_rules">);

  if (result.error) {
    return fail("We could not save the minimum-stay rule.");
  }

  revalidateOwnerPropertyPaths(propertyId);
  return ok({ propertyId }, "Minimum-stay rule saved.");
}

export async function saveOwnerSeasonalPricing(
  propertyId: string,
  basePrice: number,
): Promise<ActionResult<{ propertyId: string }>> {
  if (!propertyId) {
    return fail("Missing property.");
  }

  if (!Number.isInteger(basePrice) || basePrice <= 0) {
    return fail("Please enter a valid base nightly price.");
  }

  await requireOwner();
  const supabase = await createClient();
  const propertyUpdate = await supabase
    .from("properties")
    .update({ base_nightly_amount: basePrice * 100 })
    .eq("id", propertyId);

  if (propertyUpdate.error) {
    return fail("We could not save the base nightly price.");
  }

  revalidateOwnerPropertyPaths(propertyId);
  return ok({ propertyId }, "Base nightly price saved.");
}

export async function saveOwnerPricingRule(
  input: z.infer<typeof ownerPricingRuleSchema>,
): Promise<ActionResult<{ propertyId: string }>> {
  const parsed = ownerPricingRuleSchema.safeParse(input);
  if (!parsed.success) {
    return fail("Please review the pricing rule.");
  }

  if (
    parsed.data.nightlyAmountOverride === null
    && parsed.data.percentAdjustment === null
    && parsed.data.minimumNightsOverride === null
    && parsed.data.maximumNightsOverride === null
  ) {
    return fail("Each pricing rule needs at least one effect.");
  }

  if (
    parsed.data.maximumNightsOverride !== null
    && parsed.data.minimumNightsOverride !== null
    && parsed.data.maximumNightsOverride < parsed.data.minimumNightsOverride
  ) {
    return fail("Maximum nights must be greater than or equal to minimum nights.");
  }

  await requireOwner();
  const supabase = await createClient();
  const propertyId = parsed.data.propertyId;
  const payload: TableInsert<"property_pricing_rules"> | TableUpdate<"property_pricing_rules"> = {
    days_of_week_mask: parsed.data.daysOfWeekMask,
    ends_on: parsed.data.endsOn,
    is_active: parsed.data.isActive,
    label: parsed.data.label,
    maximum_nights_override: parsed.data.maximumNightsOverride,
    minimum_nights_override: parsed.data.minimumNightsOverride,
    nightly_amount_override: parsed.data.nightlyAmountOverride === null
      ? null
      : parsed.data.nightlyAmountOverride * 100,
    percent_adjustment: parsed.data.percentAdjustment,
    priority: parsed.data.priority,
    property_id: propertyId,
    rule_type: parsed.data.ruleType,
    starts_on: parsed.data.startsOn,
  };

  const result = parsed.data.ruleId
    ? await supabase
        .from("property_pricing_rules")
        .update(payload)
        .eq("id", parsed.data.ruleId)
    : await supabase.from("property_pricing_rules").insert(payload as TableInsert<"property_pricing_rules">);

  if (result.error) {
    return fail("We could not save the pricing rule.");
  }

  revalidateOwnerPropertyPaths(propertyId);
  return ok({ propertyId }, "Pricing rule saved.");
}

export async function toggleOwnerPricingRule(
  input: z.infer<typeof ownerPricingRuleToggleSchema>,
): Promise<ActionResult<{ propertyId: string }>> {
  const parsed = ownerPricingRuleToggleSchema.safeParse(input);
  if (!parsed.success) {
    return fail("Please choose a valid pricing rule.");
  }

  await requireOwner();
  const supabase = await createClient();
  const { error } = await supabase
    .from("property_pricing_rules")
    .update({ is_active: parsed.data.isActive })
    .eq("id", parsed.data.ruleId);

  if (error) {
    return fail("We could not update that pricing rule.");
  }

  revalidateOwnerPropertyPaths(parsed.data.propertyId);
  return ok({ propertyId: parsed.data.propertyId }, "Pricing rule updated.");
}

export async function deleteOwnerPricingRule(
  propertyId: string,
  ruleId: string,
): Promise<ActionResult<{ propertyId: string }>> {
  if (!propertyId || !ruleId) {
    return fail("Missing pricing rule.");
  }

  await requireOwner();
  const supabase = await createClient();
  const { error } = await supabase
    .from("property_pricing_rules")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", ruleId);

  if (error) {
    return fail("We could not remove that pricing rule.");
  }

  revalidateOwnerPropertyPaths(propertyId);
  return ok({ propertyId }, "Pricing rule removed.");
}

function buildExpectedPhotoPathPrefix(ownerId: string, propertyId: string) {
  return `${ownerId}/${propertyId}/`;
}

export async function createOwnerPhotoMetadata(
  input: z.infer<typeof ownerPhotoCreateSchema>,
): Promise<ActionResult<{ propertyId: string }>> {
  const parsed = ownerPhotoCreateSchema.safeParse(input);
  if (!parsed.success) {
    return fail("Please review the photo metadata.");
  }

  const { user } = await requireOwner();
  const expectedPrefix = buildExpectedPhotoPathPrefix(user.id, parsed.data.propertyId);
  if (!parsed.data.storagePath.startsWith(expectedPrefix)) {
    return fail("Photo storage paths must follow the approved owner/property structure.");
  }

  const supabase = await createClient();
  if (parsed.data.isCover) {
    const clearCover = await supabase
      .from("property_photos")
      .update({ is_cover: false })
      .eq("property_id", parsed.data.propertyId);

    if (clearCover.error) {
      return fail("We could not assign the cover photo.");
    }
  }

  const { error } = await supabase.from("property_photos").insert({
    caption: parsed.data.caption?.trim() || null,
    is_cover: parsed.data.isCover,
    photo_category: parsed.data.category,
    property_id: parsed.data.propertyId,
    sort_order: parsed.data.sortOrder,
    storage_path: parsed.data.storagePath.trim(),
  });

  if (error) {
    return fail("We could not save the photo metadata.");
  }

  revalidateOwnerPropertyPaths(parsed.data.propertyId);
  return ok({ propertyId: parsed.data.propertyId }, "Photo metadata saved.");
}

export async function updateOwnerPhotoMetadata(
  input: z.infer<typeof ownerPhotoUpdateSchema>,
): Promise<ActionResult<{ propertyId: string }>> {
  const parsed = ownerPhotoUpdateSchema.safeParse(input);
  if (!parsed.success) {
    return fail("Please review the photo metadata.");
  }

  const { user } = await requireOwner();
  const expectedPrefix = buildExpectedPhotoPathPrefix(user.id, parsed.data.propertyId);
  if (!parsed.data.storagePath.startsWith(expectedPrefix)) {
    return fail("Photo storage paths must follow the approved owner/property structure.");
  }

  const supabase = await createClient();
  if (parsed.data.isCover) {
    const clearCover = await supabase
      .from("property_photos")
      .update({ is_cover: false })
      .eq("property_id", parsed.data.propertyId)
      .neq("id", parsed.data.photoId);

    if (clearCover.error) {
      return fail("We could not assign the cover photo.");
    }
  }

  const { error } = await supabase
    .from("property_photos")
    .update({
      caption: parsed.data.caption?.trim() || null,
      is_cover: parsed.data.isCover,
      photo_category: parsed.data.category,
      sort_order: parsed.data.sortOrder,
      storage_path: parsed.data.storagePath.trim(),
    })
    .eq("id", parsed.data.photoId);

  if (error) {
    return fail("We could not update the photo metadata.");
  }

  revalidateOwnerPropertyPaths(parsed.data.propertyId);
  return ok({ propertyId: parsed.data.propertyId }, "Photo metadata updated.");
}

export async function deleteOwnerPhotoMetadata(
  input: z.infer<typeof ownerPhotoDeleteSchema>,
): Promise<ActionResult<{ propertyId: string }>> {
  const parsed = ownerPhotoDeleteSchema.safeParse(input);
  if (!parsed.success) {
    return fail("Please choose a valid photo.");
  }

  await requireOwner();
  const supabase = await createClient();
  const { error } = await supabase
    .from("property_photos")
    .update({ deleted_at: new Date().toISOString(), is_cover: false })
    .eq("id", parsed.data.photoId);

  if (error) {
    return fail("We could not remove that photo.");
  }

  revalidateOwnerPropertyPaths(parsed.data.propertyId);
  return ok({ propertyId: parsed.data.propertyId }, "Photo metadata removed.");
}
