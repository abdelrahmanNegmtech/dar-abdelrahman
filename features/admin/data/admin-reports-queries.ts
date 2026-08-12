import "server-only";

import { unstable_noStore as noStore } from "next/cache";
import type { Database } from "@/lib/supabase/database.types";
import { requireAdmin } from "@/lib/supabase/auth";
import { createClient } from "@/lib/supabase/server";
import type { ReportsPageData } from "@/features/reports/types";
import { getAdminSidebarGroups } from "@/features/users/data/users-management.data";
import { formatCurrencyMinor, formatNumber, formatPercent, mapPropertyThumbnailKey } from "./utils";

type BookingRow = Database["public"]["Tables"]["bookings"]["Row"];
type PropertyRow = Database["public"]["Tables"]["properties"]["Row"];
type PayoutRow = Database["public"]["Tables"]["payouts"]["Row"];
type ReviewRow = Database["public"]["Tables"]["reviews"]["Row"];
type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];

export async function getAdminReportsPageData(): Promise<ReportsPageData> {
  noStore();
  await requireAdmin();
  const supabase = await createClient();

  const [bookingsResult, propertiesResult, payoutsResult, reviewsResult, profilesResult] = await Promise.all([
    supabase.from("bookings").select("id, owner_id, property_id, total_amount, service_fee_amount, payment_status, status, created_at, payment_reference"),
    supabase.from("properties").select("id, owner_profile_id, title, city, property_type, public_slug, base_nightly_amount, moderation_status, publication_status"),
    supabase.from("payouts").select("id, owner_id, commission_amount, net_amount, status"),
    supabase.from("reviews").select("id, owner_id, property_id, rating"),
    supabase.from("profiles").select("id, full_name, display_name, email"),
  ]);

  if (bookingsResult.error || propertiesResult.error || payoutsResult.error || reviewsResult.error || profilesResult.error) {
    throw new Error("Unable to load admin reports data.");
  }

  const bookings = (bookingsResult.data ?? []) as Array<
    Pick<BookingRow, "id" | "owner_id" | "property_id" | "total_amount" | "service_fee_amount" | "payment_status" | "status" | "created_at" | "payment_reference">
  >;
  const properties = (propertiesResult.data ?? []) as Array<
    Pick<PropertyRow, "id" | "owner_profile_id" | "title" | "city" | "property_type" | "public_slug" | "base_nightly_amount" | "moderation_status" | "publication_status">
  >;
  const payouts = (payoutsResult.data ?? []) as Array<Pick<PayoutRow, "id" | "owner_id" | "commission_amount" | "net_amount" | "status">>;
  const reviews = (reviewsResult.data ?? []) as Array<Pick<ReviewRow, "id" | "owner_id" | "property_id" | "rating">>;
  const profiles = (profilesResult.data ?? []) as Array<Pick<ProfileRow, "id" | "full_name" | "display_name" | "email">>;

  const propertyById = new Map(properties.map((property) => [property.id, property]));
  const ownerNameById = new Map(profiles.map((profile) => [profile.id, profile.full_name || profile.display_name || profile.email || "Owner"]));

  const totalBookings = bookings.length;
  const confirmedBookings = bookings.filter((booking) => booking.status === "confirmed" || booking.status === "completed").length;
  const refundedBookings = bookings.filter((booking) => booking.payment_status === "refunded" || booking.payment_status === "partially_refunded").length;
  const totalRevenueMinor = bookings.reduce((sum, booking) => sum + booking.total_amount, 0);
  const totalCommissionMinor = bookings.reduce((sum, booking) => sum + booking.service_fee_amount, 0);
  const activeProperties = properties.filter(
    (property) => property.moderation_status === "approved" && property.publication_status === "published",
  ).length;
  const pendingPayouts = payouts.filter((payout) =>
    payout.status === "pending" || payout.status === "scheduled" || payout.status === "on_hold",
  ).length;

  const bookingsByMonth = new Map<string, { gbv: number; commission: number; refunds: number }>();
  for (const booking of bookings) {
    const label = new Intl.DateTimeFormat("en-US", { month: "short" }).format(new Date(booking.created_at));
    const current = bookingsByMonth.get(label) ?? { commission: 0, gbv: 0, refunds: 0 };
    current.gbv += booking.total_amount / 100;
    current.commission += booking.service_fee_amount / 100;
    if (booking.payment_status === "refunded" || booking.payment_status === "partially_refunded") {
      current.refunds += booking.total_amount / 100;
    }
    bookingsByMonth.set(label, current);
  }

  const cityMap = new Map<string, { bookings: number; gbv: number }>();
  const typeMap = new Map<string, { count: number; avgPrice: number }>();
  const propertyBookingMap = new Map<string, { bookings: number; gbv: number }>();
  for (const booking of bookings) {
    const property = propertyById.get(booking.property_id);
    if (!property) continue;

    const city = property.city;
    const cityCurrent = cityMap.get(city) ?? { bookings: 0, gbv: 0 };
    cityCurrent.bookings += 1;
    cityCurrent.gbv += booking.total_amount;
    cityMap.set(city, cityCurrent);

    const typeCurrent = typeMap.get(property.property_type) ?? { avgPrice: 0, count: 0 };
    typeCurrent.count += 1;
    typeCurrent.avgPrice += property.base_nightly_amount;
    typeMap.set(property.property_type, typeCurrent);

    const propertyCurrent = propertyBookingMap.get(property.id) ?? { bookings: 0, gbv: 0 };
    propertyCurrent.bookings += 1;
    propertyCurrent.gbv += booking.total_amount;
    propertyBookingMap.set(property.id, propertyCurrent);
  }

  const ownerPerformanceMap = new Map<string, { bookings: number; gbv: number; cancellations: number }>();
  for (const booking of bookings) {
    const current = ownerPerformanceMap.get(booking.owner_id) ?? { bookings: 0, cancellations: 0, gbv: 0 };
    current.bookings += 1;
    current.gbv += booking.total_amount;
    if (booking.status === "cancelled" || booking.status === "declined") {
      current.cancellations += 1;
    }
    ownerPerformanceMap.set(booking.owner_id, current);
  }

  const reviewCountByProperty = new Map<string, { count: number; sum: number }>();
  for (const review of reviews) {
    const current = reviewCountByProperty.get(review.property_id) ?? { count: 0, sum: 0 };
    current.count += 1;
    current.sum += review.rating;
    reviewCountByProperty.set(review.property_id, current);
  }

  const paymentMethodCounts = new Map<string, number>();
  for (const booking of bookings) {
    const label = booking.payment_reference?.split("-")[0] ?? "manual";
    paymentMethodCounts.set(label, (paymentMethodCounts.get(label) ?? 0) + 1);
  }

  return {
    cityPerformance: Array.from(cityMap.entries()).map(([city, value]) => ({
      bookings: formatNumber(value.bookings),
      city,
      gbv: formatCurrencyMinor(value.gbv),
      occupancy: value.bookings ? Math.min(100, 50 + value.bookings * 10) : 0,
    })),
    filterOptions: {
      cities: [{ label: "All cities", value: "all" }],
      ownerTypes: [{ label: "All owners", value: "all" }],
      paymentMethods: [{ label: "All methods", value: "all" }],
      propertyTypes: [{ label: "All types", value: "all" }],
    },
    funnel: [
      { label: "Property views", value: "Deferred" },
      { label: "Booking requests", value: formatNumber(totalBookings) },
      { label: "Confirmed bookings", value: formatNumber(confirmedBookings), conversion: totalBookings ? formatPercent((confirmedBookings / totalBookings) * 100) : "0%" },
      { label: "Refunded bookings", value: formatNumber(refundedBookings), conversion: totalBookings ? formatPercent((refundedBookings / totalBookings) * 100) : "0%" },
    ],
    metrics: [
      { accent: "brand", delta: formatNumber(totalBookings), hint: "Seed snapshot", icon: "gbv", key: "gbv", label: "Gross booking value", sparkline: [1, 1, 1, 1, 1, 1, 1, 1, 1], value: formatCurrencyMinor(totalRevenueMinor) },
      { accent: "brand", delta: formatNumber(confirmedBookings), hint: "Confirmed + completed", icon: "bookings", key: "confirmed", label: "Confirmed bookings", sparkline: [1, 1, 1, 1, 1, 1, 1, 1, 1], value: formatNumber(confirmedBookings) },
      { accent: "brand", delta: "Deferred", hint: "No traffic analytics in schema", icon: "conversion", key: "conversion", label: "Conversion rate", sparkline: [0, 0, 0, 0, 0, 0, 0, 0, 0], value: "Deferred" },
      { accent: "warning", delta: formatCurrencyMinor(totalCommissionMinor), hint: "Service fees", icon: "commission", key: "commission", label: "DAR commission", sparkline: [1, 1, 1, 1, 1, 1, 1, 1, 1], value: formatCurrencyMinor(totalCommissionMinor) },
      { accent: "brand", delta: formatNumber(activeProperties), hint: "Approved + published", icon: "properties", key: "active-properties", label: "Active properties", sparkline: [1, 1, 1, 1, 1, 1, 1, 1, 1], value: formatNumber(activeProperties) },
      { accent: "brand", delta: "Derived", hint: "Bookings per active property", icon: "occupancy", key: "occupancy", label: "Average occupancy", sparkline: [1, 1, 1, 1, 1, 1, 1, 1, 1], value: activeProperties ? formatPercent((confirmedBookings / activeProperties) * 100) : "0%" },
      { accent: "danger", delta: formatNumber(refundedBookings), hint: "Refunded payment rows", icon: "refund", key: "refund", label: "Refund rate", sparkline: [1, 1, 1, 1, 1, 1, 1, 1, 1], value: totalBookings ? formatPercent((refundedBookings / totalBookings) * 100) : "0%" },
    ],
    ownerPerformance: Array.from(ownerPerformanceMap.entries()).map(([ownerId, value]) => ({
      approvalRate: value.bookings ? formatPercent(((value.bookings - value.cancellations) / value.bookings) * 100) : "0%",
      cancellationRate: value.bookings ? formatPercent((value.cancellations / value.bookings) * 100) : "0%",
      owner: ownerNameById.get(ownerId) ?? "Owner",
      responseTime: "Deferred",
      revenue: formatCurrencyMinor(value.gbv),
    })),
    paymentMethods: Array.from(paymentMethodCounts.entries()).map(([method, count]) => ({
      delay: "Operational review",
      label: method,
      percentage: totalBookings ? Math.round((count / totalBookings) * 100) : 0,
    })),
    propertyTypeBreakdown: Array.from(typeMap.entries()).map(([propertyType, value]) => ({
      avgPrice: formatCurrencyMinor(Math.round(value.avgPrice / Math.max(1, value.count))),
      color: "#5B34E6",
      label: propertyType,
      percentage: properties.length ? Math.round((value.count / properties.length) * 100) : 0,
    })),
    quickLinks: [
      "Property moderation queue",
      "Owner verification queue",
      `Payout operations snapshot (${formatNumber(pendingPayouts)} pending/scheduled)`,
      "Support operations snapshot",
    ],
    revenueTrend: Array.from(bookingsByMonth.entries()).map(([label, value]) => ({
      commission: value.commission,
      gbv: value.gbv,
      label,
      refunds: value.refunds,
    })),
    savedReports: [
      { cadence: "Manual", lastRun: "Local seed snapshot", title: "Operations overview" },
      { cadence: "Manual", lastRun: "Local seed snapshot", title: "Property moderation" },
      { cadence: "Manual", lastRun: "Local seed snapshot", title: "Payout status" },
    ],
    sidebarGroups: getAdminSidebarGroups("reports"),
    topProperties: Array.from(propertyBookingMap.entries())
      .sort((a, b) => b[1].gbv - a[1].gbv)
      .slice(0, 5)
      .map(([propertyId, value]) => {
        const property = propertyById.get(propertyId);
        const reviewAggregate = reviewCountByProperty.get(propertyId) ?? { count: 0, sum: 0 };
        return {
          conversion: "Deferred",
          occupancy: value.bookings ? formatPercent(Math.min(100, 50 + value.bookings * 10)) : "0%",
          property: property?.title ?? "Property",
          rating: reviewAggregate.count ? (reviewAggregate.sum / reviewAggregate.count).toFixed(1) : "0.0",
          revenue: formatCurrencyMinor(value.gbv),
          thumbnailKey: mapPropertyThumbnailKey(property?.public_slug ?? propertyId, property?.property_type ?? "apartment"),
          views: "Deferred",
        };
      }),
  };
}
