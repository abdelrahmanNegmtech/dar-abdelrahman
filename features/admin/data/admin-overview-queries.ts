import "server-only";

import { unstable_noStore as noStore } from "next/cache";
import type { Database } from "@/lib/supabase/database.types";
import { requireAdmin } from "@/lib/supabase/auth";
import { createClient } from "@/lib/supabase/server";
import type { OverviewPageData, OverviewRevenuePoint, OverviewLinePoint, SignupSegment } from "@/features/overview/types";
import { getAdminSidebarGroups } from "@/features/users/data/users-management.data";
import {
  formatCurrencyMinor,
  formatDateRangeLabel,
  formatNumber,
  mapOverviewThumbnailKey,
} from "./utils";

type BookingRow = Database["public"]["Tables"]["bookings"]["Row"];
type PropertyRow = Database["public"]["Tables"]["properties"]["Row"];
type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];

function emptyPoints(): OverviewLinePoint[] {
  return Array.from({ length: 7 }, (_, index) => ({
    label: `Day ${index + 1}`,
    lastWeek: 0,
    thisWeek: 0,
  }));
}

function emptyRevenuePoints(): OverviewRevenuePoint[] {
  return Array.from({ length: 7 }, (_, index) => ({
    label: `Day ${index + 1}`,
    value: 0,
  }));
}

function buildSignupSegments(profiles: Pick<ProfileRow, "account_type">[]): SignupSegment[] {
  const total = Math.max(1, profiles.length);
  const counts = {
    Guests: profiles.filter((profile) => profile.account_type === "guest").length,
    Owners: profiles.filter((profile) => profile.account_type === "owner").length,
    Admins: profiles.filter((profile) => profile.account_type === "admin").length,
    "Support staff": profiles.filter((profile) => profile.account_type === "support_staff").length,
  };

  return [
    { color: "#5B34E6", label: "Guests", value: counts.Guests },
    { color: "#F59E0B", label: "Owners", value: counts.Owners },
    { color: "#16A34A", label: "Admins", value: counts.Admins },
    { color: "#3B82F6", label: "Support staff", value: counts["Support staff"] },
  ].map((segment) => ({
    ...segment,
    percentageLabel: `${((segment.value / total) * 100).toFixed(1)}%`,
  }));
}

export async function getAdminOverviewPageData(): Promise<OverviewPageData> {
  noStore();
  await requireAdmin();
  const supabase = await createClient();

  const [
    profilesResult,
    propertiesResult,
    bookingsResult,
    supportTicketsResult,
    reviewsResult,
    payoutsResult,
  ] = await Promise.all([
    supabase.from("profiles").select("id, account_type"),
    supabase
      .from("properties")
      .select("id, title, city, area, property_type, public_slug, moderation_status, publication_status"),
    supabase
      .from("bookings")
      .select("id, property_id, booking_reference, check_in_date, check_out_date, total_amount, status, created_at")
      .order("created_at", { ascending: false }),
    supabase.from("support_tickets").select("id"),
    supabase.from("reviews").select("id"),
    supabase.from("payouts").select("id"),
  ]);

  if (profilesResult.error || propertiesResult.error || bookingsResult.error || supportTicketsResult.error || reviewsResult.error || payoutsResult.error) {
    throw new Error("Unable to load admin overview data.");
  }

  const profiles = (profilesResult.data ?? []) as Pick<ProfileRow, "id" | "account_type">[];
  const properties = (propertiesResult.data ?? []) as Array<
    Pick<PropertyRow, "id" | "title" | "city" | "area" | "property_type" | "public_slug" | "moderation_status" | "publication_status">
  >;
  const bookings = (bookingsResult.data ?? []) as Array<
    Pick<BookingRow, "id" | "property_id" | "booking_reference" | "check_in_date" | "check_out_date" | "total_amount" | "status" | "created_at">
  >;

  const propertyById = new Map(properties.map((property) => [property.id, property]));
  const recentBookings = bookings.slice(0, 4).map((booking) => {
    const property = propertyById.get(booking.property_id);
    const city = property?.city ?? "Cairo";
    const area = property?.area ? `${property.area}, ${city}` : city;

    return {
      amount: formatCurrencyMinor(booking.total_amount),
      dateRange: formatDateRangeLabel(booking.check_in_date, booking.check_out_date),
      id: booking.id,
      location: area,
      nights: `${Math.max(1, Math.round((new Date(`${booking.check_out_date}T12:00:00Z`).getTime() - new Date(`${booking.check_in_date}T12:00:00Z`).getTime()) / 86_400_000))} nights`,
      propertyName: property?.title ?? booking.booking_reference,
      status:
        booking.status === "confirmed"
          ? "confirmed"
          : booking.status === "cancelled" || booking.status === "declined" || booking.status === "expired"
            ? "cancelled"
            : "pending",
      thumbnailKey: mapOverviewThumbnailKey(city),
    } as const;
  });

  const bookingsPerProperty = new Map<string, number>();
  for (const booking of bookings) {
    bookingsPerProperty.set(booking.property_id, (bookingsPerProperty.get(booking.property_id) ?? 0) + 1);
  }

  const topProperties = Array.from(bookingsPerProperty.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([propertyId, bookingCount], index) => {
      const property = propertyById.get(propertyId);
      const city = property?.city ?? "Cairo";

      return {
        bookings: bookingCount,
        id: propertyId,
        location: property?.area ? `${property.area}, ${city}` : city,
        propertyName: property?.title ?? "Property",
        rank: index + 1,
        thumbnailKey: mapOverviewThumbnailKey(city),
      };
    });

  const totalRevenueMinor = bookings.reduce((sum, booking) => sum + booking.total_amount, 0);
  const approvedPublishedProperties = properties.filter(
    (property) => property.moderation_status === "approved" && property.publication_status === "published",
  ).length;

  return {
    bookingOverview: {
      comparisonValue: "Seed snapshot",
      points: bookings.length ? emptyPoints() : emptyPoints(),
      totalLabel: formatNumber(bookings.length),
    },
    currencyOptions: [{ label: "EGP", value: "egp" }],
    dateRanges: [{ label: "All seeded operational data", value: "seed-snapshot" }],
    metrics: [
      {
        accent: "brand",
        icon: "users",
        key: "users",
        label: "Total users",
        sparkline: [profiles.length, profiles.length, profiles.length, profiles.length, profiles.length, profiles.length, profiles.length, profiles.length, profiles.length],
        trendLabel: "Seed snapshot",
        trendValue: formatNumber(profiles.length),
        value: formatNumber(profiles.length),
      },
      {
        accent: "info",
        icon: "property",
        key: "properties",
        label: "Visible properties",
        sparkline: [approvedPublishedProperties, approvedPublishedProperties, approvedPublishedProperties, approvedPublishedProperties, approvedPublishedProperties, approvedPublishedProperties, approvedPublishedProperties, approvedPublishedProperties, approvedPublishedProperties],
        trendLabel: "Approved + published",
        trendValue: formatNumber(approvedPublishedProperties),
        value: formatNumber(approvedPublishedProperties),
      },
      {
        accent: "success",
        icon: "bookings",
        key: "bookings",
        label: "Bookings",
        sparkline: [bookings.length, bookings.length, bookings.length, bookings.length, bookings.length, bookings.length, bookings.length, bookings.length, bookings.length],
        trendLabel: "Seed snapshot",
        trendValue: formatNumber(bookings.length),
        value: formatNumber(bookings.length),
      },
      {
        accent: "warning",
        icon: "revenue",
        key: "revenue",
        label: "Gross booking value",
        sparkline: [1, 1, 1, 1, 1, 1, 1, 1, 1],
        trendLabel: "Seed snapshot",
        trendValue: formatCurrencyMinor(totalRevenueMinor),
        value: formatCurrencyMinor(totalRevenueMinor),
      },
    ],
    quickActions: [
      "Review submitted properties",
      "Review owner verifications",
      "Inspect support load",
      "Check payout operations",
    ],
    recentBookings,
    revenueOverview: {
      comparisonValue: "Seed snapshot",
      points: bookings.length ? emptyRevenuePoints() : emptyRevenuePoints(),
      totalLabel: formatCurrencyMinor(totalRevenueMinor),
    },
    sidebarGroups: getAdminSidebarGroups("overview"),
    signupSegments: buildSignupSegments(profiles),
    systemStatus: [
      { label: "Database", value: "Operational" },
      { label: "Properties", value: `${approvedPublishedProperties} public` },
      { label: "Support tickets", value: `${supportTicketsResult.data?.length ?? 0} tracked` },
      { label: "Operational records", value: `${(reviewsResult.data?.length ?? 0) + (payoutsResult.data?.length ?? 0)} reviews + payouts` },
    ],
    topProperties,
  };
}
