import "server-only";

import { unstable_noStore as noStore } from "next/cache";
import type { Database } from "@/lib/supabase/database.types";
import { requireAdmin } from "@/lib/supabase/auth";
import { createClient } from "@/lib/supabase/server";
import type { PropertiesPageData, PropertyChecklistItem, PropertyRecord } from "@/features/properties/types";
import { getAdminSidebarGroups } from "@/features/users/data/users-management.data";
import { formatCurrencyMinor, formatNumber, mapPropertyThumbnailKey } from "./utils";

type PropertyRow = Database["public"]["Tables"]["properties"]["Row"];
type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];
type ReviewRow = Database["public"]["Tables"]["reviews"]["Row"];
type VerificationRow = Database["public"]["Tables"]["owner_verifications"]["Row"];

function mapPropertyStatus(property: Pick<PropertyRow, "moderation_status" | "publication_status">): PropertyRecord["status"] {
  if (property.moderation_status === "approved" && property.publication_status === "published") return "live";
  if (property.moderation_status === "submitted" || property.moderation_status === "under_review") return "under-review";
  if (property.moderation_status === "rejected") return "reported";
  if (property.moderation_status === "suspended") return "reported";
  return "draft";
}

function mapChecklist(
  property: Pick<PropertyRow, "moderation_status" | "publication_status" | "submitted_for_review_at" | "published_at">,
  verificationStatus: VerificationRow["status"] | null,
): PropertyChecklistItem[] {
  return [
    { id: "owner", label: "Owner verification", state: verificationStatus === "approved" ? "verified" : verificationStatus ? "pending" : "missing" },
    { id: "submission", label: "Submission packet", state: property.submitted_for_review_at ? "verified" : "pending" },
    { id: "moderation", label: "Moderation state", state: property.moderation_status === "approved" ? "verified" : property.moderation_status === "draft" ? "pending" : "missing", detail: property.moderation_status.replaceAll("-", " ") },
    { id: "publication", label: "Publication state", state: property.publication_status === "published" ? "verified" : "pending", detail: property.publication_status },
  ];
}

export async function getAdminPropertiesPageData(): Promise<PropertiesPageData> {
  noStore();
  await requireAdmin();
  const supabase = await createClient();

  const [propertiesResult, profilesResult, reviewsResult, verificationsResult] = await Promise.all([
    supabase.from("properties").select("id, owner_profile_id, public_slug, title, city, area, property_type, base_nightly_amount, currency_code, moderation_status, publication_status, submitted_for_review_at, published_at, approved_at, rejected_at, suspended_at"),
    supabase.from("profiles").select("id, full_name, display_name, email, phone"),
    supabase.from("reviews").select("id, property_id, rating"),
    supabase.from("owner_verifications").select("id, owner_profile_id, status, created_at"),
  ]);

  if (propertiesResult.error || profilesResult.error || reviewsResult.error || verificationsResult.error) {
    throw new Error("Unable to load admin property data.");
  }

  const properties = (propertiesResult.data ?? []) as Array<
    Pick<PropertyRow, "id" | "owner_profile_id" | "public_slug" | "title" | "city" | "area" | "property_type" | "base_nightly_amount" | "currency_code" | "moderation_status" | "publication_status" | "submitted_for_review_at" | "published_at" | "approved_at" | "rejected_at" | "suspended_at">
  >;
  const profiles = (profilesResult.data ?? []) as Array<Pick<ProfileRow, "id" | "full_name" | "display_name" | "email" | "phone">>;
  const reviews = (reviewsResult.data ?? []) as Array<Pick<ReviewRow, "id" | "property_id" | "rating">>;
  const verifications = (verificationsResult.data ?? []) as VerificationRow[];

  const profileById = new Map(profiles.map((profile) => [profile.id, profile]));
  const latestVerificationByOwner = new Map<string, VerificationRow>();
  for (const verification of verifications) {
    const current = latestVerificationByOwner.get(verification.owner_profile_id);
    if (!current || new Date(verification.created_at).getTime() > new Date(current.created_at).getTime()) {
      latestVerificationByOwner.set(verification.owner_profile_id, verification);
    }
  }

  const reviewsByProperty = new Map<string, { count: number; sum: number }>();
  for (const review of reviews) {
    const current = reviewsByProperty.get(review.property_id) ?? { count: 0, sum: 0 };
    reviewsByProperty.set(review.property_id, { count: current.count + 1, sum: current.sum + review.rating });
  }

  const propertyRecords: PropertyRecord[] = properties.map((property) => {
    const owner = profileById.get(property.owner_profile_id);
    const reviewAggregate = reviewsByProperty.get(property.id) ?? { count: 0, sum: 0 };
    const avgRating = reviewAggregate.count ? reviewAggregate.sum / reviewAggregate.count : 0;
    const verification = latestVerificationByOwner.get(property.owner_profile_id) ?? null;
    const status = mapPropertyStatus(property);
    const qualityScore = Math.max(
      45,
      Math.min(
        98,
        Math.round(
          (status === "live" ? 35 : status === "under-review" ? 20 : 12)
          + (verification?.status === "approved" ? 20 : 5)
          + reviewAggregate.count * 4
          + avgRating * 6,
        ),
      ),
    );

    return {
      actionLabel: status === "under-review" ? "Review" : "View",
      badgeLabel: verification?.status === "approved" ? "Verified owner" : undefined,
      checklist: mapChecklist(property, verification?.status ?? null),
      cityArea: property.area ? `${property.city} / ${property.area}` : property.city,
      email: owner?.email ?? "Not provided",
      id: property.id,
      ownerName: owner?.full_name || owner?.display_name || owner?.email || "Owner",
      ownerProfileId: property.owner_profile_id,
      ownerType: "individual",
      performancePrimary: reviewAggregate.count ? `${reviewAggregate.count}` : "0",
      performanceSecondary: reviewAggregate.count ? "Reviews" : "No reviews",
      phone: owner?.phone ?? "Not provided",
      price: `${formatCurrencyMinor(property.base_nightly_amount, property.currency_code)} / night`,
      qualityScore,
      reviewCount: reviewAggregate.count,
      status,
      statusLabel:
        property.moderation_status === "approved" && property.publication_status === "published"
          ? "Live"
          : property.moderation_status.replaceAll("_", " "),
      thumbnailKey: mapPropertyThumbnailKey(property.public_slug, property.property_type),
      title: property.title,
      type: property.property_type.replaceAll("_", " "),
      verificationLabel:
        verification?.status === "approved"
          ? "Owner verified"
          : verification?.status
            ? `Owner ${verification.status.replaceAll("_", " ")}`
            : "Verification pending",
      verificationState:
        verification?.status === "approved"
          ? "docs-complete"
          : verification?.status === "rejected"
            ? "risk-flag"
            : "authorization-missing",
    };
  });

  const countWhere = (predicate: (property: PropertyRecord) => boolean) => propertyRecords.filter(predicate).length;
  const initialPropertyId =
    propertyRecords.find((property) => property.status === "under-review")?.id
    ?? propertyRecords[0]?.id
    ?? "";

  return {
    categoryTabs: [
      { count: formatNumber(propertyRecords.length), label: "All", value: "all" },
      { count: formatNumber(countWhere((property) => property.status === "live")), label: "Live", value: "live" },
      { count: formatNumber(countWhere((property) => property.status === "under-review")), label: "Under review", value: "under-review" },
      { count: formatNumber(countWhere((property) => property.status === "draft")), label: "Drafts", value: "drafts" },
      { count: formatNumber(countWhere((property) => property.status === "reported")), label: "Rejected / suspended", value: "reported" },
      { count: "0", label: "Hotels", value: "hotels" },
      { count: formatNumber(countWhere((property) => property.status !== "live")), label: "Needs update", value: "needs-update" },
    ],
    checklist: propertyRecords.find((property) => property.id === initialPropertyId)?.checklist ?? [],
    filterOptions: {
      city: [{ label: "All cities", value: "all" }],
      ownerType: [{ label: "All owner types", value: "all" }],
      qualityScore: [{ label: "Any quality score", value: "any" }],
      rowsPerPage: [
        { label: "5 / page", value: 5 },
        { label: "10 / page", value: 10 },
        { label: "20 / page", value: 20 },
      ],
      status: [{ label: "All statuses", value: "all" }],
      type: [{ label: "All property types", value: "all" }],
    },
    initialCategory: "all",
    initialFilters: {
      city: "all",
      endDate: "",
      maxPrice: "",
      minPrice: "",
      ownerType: "all",
      qualityScore: "any",
      search: "",
      startDate: "",
      status: "all",
      type: "all",
    },
    initialPropertyId,
    metrics: [
      { accent: "brand", hint: "Seed snapshot", icon: "property", key: "total", label: "Total properties", value: formatNumber(propertyRecords.length) },
      { accent: "success", hint: "Approved + published", icon: "live", key: "live", label: "Live listings", value: formatNumber(countWhere((property) => property.status === "live")) },
      { accent: "warning", hint: "Submitted or under review", icon: "review", key: "review", label: "Under review", value: formatNumber(countWhere((property) => property.status === "under-review")) },
      { accent: "neutral", hint: "Draft workflow", icon: "draft", key: "drafts", label: "Drafts", value: formatNumber(countWhere((property) => property.status === "draft")) },
      { accent: "danger", hint: "Moderation blocked", icon: "rejected", key: "rejected", label: "Rejected / suspended", value: formatNumber(countWhere((property) => property.status === "reported")) },
      { accent: "danger", hint: "Review attention", icon: "reported", key: "needs_update", label: "Needs update", value: formatNumber(countWhere((property) => property.status !== "live")) },
      { accent: "brand", hint: "Current schema", icon: "hotel", key: "owner_types", label: "Owner-backed listings", value: formatNumber(propertyRecords.length) },
    ],
    properties: propertyRecords,
    qualityDistribution: [
      { color: "#5B34E6", label: "90+ (Excellent)", value: countWhere((property) => property.qualityScore >= 90) },
      { color: "#16A34A", label: "70-89 (Good)", value: countWhere((property) => property.qualityScore >= 70 && property.qualityScore < 90) },
      { color: "#F59E0B", label: "50-69 (Fair)", value: countWhere((property) => property.qualityScore >= 50 && property.qualityScore < 70) },
      { color: "#EF4444", label: "Below 50 (Poor)", value: countWhere((property) => property.qualityScore < 50) },
    ],
    sidebarGroups: getAdminSidebarGroups("properties"),
    summaryCards: {
      lowQualityPhotos: { linkLabel: "Review queue", subtitle: "properties below quality threshold", title: "Needs attention", tone: "info", value: formatNumber(countWhere((property) => property.qualityScore < 70)) },
      missingDocuments: { linkLabel: "Verification queue", subtitle: "owner verification not approved", title: "Missing verification", tone: "warning", value: formatNumber(countWhere((property) => property.verificationLabel !== "Owner verified")) },
      reportedListings: { linkLabel: "Moderation list", subtitle: "rejected or suspended", title: "Blocked listings", tone: "danger", value: formatNumber(countWhere((property) => property.status === "reported")) },
      reviewQueue: { linkLabel: "Open queue", subtitle: "submitted or under review", title: "Review queue", tone: "brand", value: formatNumber(countWhere((property) => property.status === "under-review")) },
    },
  };
}
