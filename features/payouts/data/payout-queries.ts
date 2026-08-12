import "server-only";

import { unstable_noStore as noStore } from "next/cache";
import { getOwnerBookings, type OwnerBookingListItem } from "@/features/bookings/data/booking-queries";
import { getPropertyFallbackPreset } from "@/features/properties/data/public-property-fallbacks";
import { marketplaceImages } from "@/features/public-marketplace/assets";
import { payouts as mockPayouts, properties as mockProperties } from "@/lib/dar-data";
import { getCurrentProfile, requireOwner } from "@/lib/supabase/auth";
import type { DbEnum, PayoutRow } from "@/lib/supabase/database";
import { getSupabaseConfig } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

type PayoutStatus = DbEnum<"payout_status">;
type PayoutMethod = DbEnum<"payout_method">;
type PayoutListRow = Pick<
  PayoutRow,
  | "booking_id"
  | "cancelled_at"
  | "commission_amount"
  | "created_at"
  | "currency_code"
  | "external_reference"
  | "failed_at"
  | "failure_reason"
  | "gross_amount"
  | "id"
  | "method"
  | "net_amount"
  | "notes"
  | "paid_at"
  | "processed_at"
  | "scheduled_for"
  | "status"
  | "updated_at"
>;

export type OwnerPayoutListItem = {
  bookingId: string | null;
  bookingReference: string | null;
  cancelledAt: string | null;
  checkInDate: string | null;
  checkOutDate: string | null;
  commissionAmountMinor: number;
  createdAt: string;
  currencyCode: string;
  externalReference: string | null;
  failedAt: string | null;
  failureReason: string | null;
  grossAmountMinor: number;
  guestName: string | null;
  id: string;
  method: PayoutMethod;
  methodLabel: string;
  netAmountMinor: number;
  nightsCount: number | null;
  notes: string | null;
  paidAt: string | null;
  processedAt: string | null;
  propertyCity: string | null;
  propertyId: string | null;
  propertyImageUrl: string;
  propertySlug: string | null;
  propertyTitle: string;
  scheduledFor: string | null;
  status: PayoutStatus;
  statusLabel: string;
  updatedAt: string;
};

export type OwnerPayoutSummary = {
  availableToWithdrawMinor: number;
  failedMinor: number;
  lifetimePaidMinor: number;
  paidThisMonthMinor: number;
  pendingVerificationMinor: number;
  upcomingMinor: number;
};

export type OwnerPayoutDestinationDisplay = {
  accountHolderLabel: string;
  destinationPrimary: string;
  destinationSecondary: string;
  isDeferred: boolean;
  methodLabel: string;
  verificationLabel: string;
};

export type OwnerPayoutPageData = {
  destinationDisplay: OwnerPayoutDestinationDisplay;
  payouts: OwnerPayoutListItem[];
  summary: OwnerPayoutSummary;
  usingFallback: boolean;
};

function getStatusLabel(status: PayoutStatus) {
  switch (status) {
    case "on_hold":
      return "On hold";
    case "paid":
      return "Paid";
    case "pending":
      return "Pending";
    case "processing":
      return "Processing";
    case "scheduled":
      return "Scheduled";
    case "failed":
      return "Failed";
    case "cancelled":
      return "Cancelled";
    default:
      return "Pending";
  }
}

function getMethodLabel(method: PayoutMethod) {
  switch (method) {
    case "bank_transfer":
      return "Bank transfer";
    case "instapay":
      return "InstaPay";
    case "vodafone_cash":
      return "Vodafone Cash";
    case "cash_pickup":
      return "Cash pickup";
    default:
      return "Bank transfer";
  }
}

function getFallbackImage(propertySlug: string | null | undefined) {
  if (propertySlug) {
    return getPropertyFallbackPreset(propertySlug).gallery[0]?.src ?? marketplaceImages.modernApartment;
  }

  return marketplaceImages.modernApartment;
}

function getNightsCount(checkInDate: string | null, checkOutDate: string | null) {
  if (!checkInDate || !checkOutDate) {
    return null;
  }

  const checkIn = new Date(`${checkInDate}T12:00:00Z`).getTime();
  const checkOut = new Date(`${checkOutDate}T12:00:00Z`).getTime();

  return Math.max(1, Math.round((checkOut - checkIn) / 86_400_000));
}

function getPayoutEventDate(payout: OwnerPayoutListItem) {
  return (
    payout.paidAt
    ?? payout.failedAt
    ?? payout.processedAt
    ?? payout.scheduledFor
    ?? payout.createdAt
  );
}

function sortPayouts(rows: OwnerPayoutListItem[]) {
  return [...rows].sort((left, right) => {
    return new Date(getPayoutEventDate(right)).getTime() - new Date(getPayoutEventDate(left)).getTime();
  });
}

function buildSummary(rows: OwnerPayoutListItem[]): OwnerPayoutSummary {
  const now = new Date();
  const currentMonth = now.getUTCMonth();
  const currentYear = now.getUTCFullYear();

  return rows.reduce<OwnerPayoutSummary>(
    (summary, payout) => {
      if (payout.status === "pending" || payout.status === "scheduled") {
        summary.availableToWithdrawMinor += payout.netAmountMinor;
      }

      if (payout.status === "scheduled" || payout.status === "processing") {
        summary.upcomingMinor += payout.netAmountMinor;
      }

      if (payout.status === "pending") {
        summary.pendingVerificationMinor += payout.netAmountMinor;
      }

      if (payout.status === "failed") {
        summary.failedMinor += payout.netAmountMinor;
      }

      if (payout.status === "paid") {
        summary.lifetimePaidMinor += payout.netAmountMinor;

        if (payout.paidAt) {
          const paidAt = new Date(payout.paidAt);
          if (paidAt.getUTCMonth() === currentMonth && paidAt.getUTCFullYear() === currentYear) {
            summary.paidThisMonthMinor += payout.netAmountMinor;
          }
        }
      }

      return summary;
    },
    {
      availableToWithdrawMinor: 0,
      failedMinor: 0,
      lifetimePaidMinor: 0,
      paidThisMonthMinor: 0,
      pendingVerificationMinor: 0,
      upcomingMinor: 0,
    },
  );
}

function buildDestinationDisplay(
  ownerName: string,
  payouts: OwnerPayoutListItem[],
): OwnerPayoutDestinationDisplay {
  const prioritized = payouts.find((payout) => payout.status !== "failed") ?? payouts[0] ?? null;
  const methodLabel = prioritized ? prioritized.methodLabel : "Payout method on file";

  return {
    accountHolderLabel: ownerName,
    destinationPrimary: "Managed during owner verification",
    destinationSecondary: "Destination details are masked and not exposed by the payout schema.",
    isDeferred: true,
    methodLabel,
    verificationLabel: "Verified with DAR",
  };
}

function mapPayoutRow(
  row: PayoutListRow,
  booking: OwnerBookingListItem | undefined,
): OwnerPayoutListItem {
  return {
    bookingId: row.booking_id,
    bookingReference: booking?.reference ?? null,
    cancelledAt: row.cancelled_at,
    checkInDate: booking?.checkInDate ?? null,
    checkOutDate: booking?.checkOutDate ?? null,
    commissionAmountMinor: row.commission_amount,
    createdAt: row.created_at,
    currencyCode: row.currency_code,
    externalReference: row.external_reference,
    failedAt: row.failed_at,
    failureReason: row.failure_reason,
    grossAmountMinor: row.gross_amount,
    guestName: booking?.travelerFullName ?? null,
    id: row.id,
    method: row.method,
    methodLabel: getMethodLabel(row.method),
    netAmountMinor: row.net_amount,
    nightsCount: getNightsCount(booking?.checkInDate ?? null, booking?.checkOutDate ?? null),
    notes: row.notes,
    paidAt: row.paid_at,
    processedAt: row.processed_at,
    propertyCity: booking?.propertyCity ?? null,
    propertyId: booking?.propertyId ?? null,
    propertyImageUrl: getFallbackImage(booking?.propertySlug),
    propertySlug: booking?.propertySlug ?? null,
    propertyTitle: booking?.propertyTitle ?? "No linked booking",
    scheduledFor: row.scheduled_for,
    status: row.status,
    statusLabel: getStatusLabel(row.status),
    updatedAt: row.updated_at,
  };
}

function mapMockStatus(status: string): PayoutStatus {
  switch (status) {
    case "Upcoming":
      return "scheduled";
    case "Paid":
      return "paid";
    case "Processing":
      return "processing";
    case "Failed":
      return "failed";
    case "On hold":
      return "on_hold";
    default:
      return "pending";
  }
}

function mapMockMethod(method: string): PayoutMethod {
  switch (method) {
    case "InstaPay":
      return "instapay";
    case "Bank transfer":
      return "bank_transfer";
    case "Vodafone Cash":
      return "vodafone_cash";
    default:
      return "cash_pickup";
  }
}

function getMockOwnerPayouts(): OwnerPayoutListItem[] {
  return sortPayouts(
    mockPayouts.map((payout) => {
      const property = mockProperties.find((item) => item.id === payout.propertyId);
      const status = mapMockStatus(payout.status);
      const method = mapMockMethod(payout.method);

      return {
        bookingId: null,
        bookingReference: payout.booking,
        cancelledAt: null,
        checkInDate: null,
        checkOutDate: payout.checkout,
        commissionAmountMinor: payout.commission * 100,
        createdAt: "2026-05-01T09:00:00Z",
        currencyCode: "EGP",
        externalReference: null,
        failedAt: status === "failed" ? "2026-05-30T10:00:00Z" : null,
        failureReason: status === "failed" ? "Destination details must be updated before DAR can resend this payout." : null,
        grossAmountMinor: payout.gross * 100,
        guestName: payout.guest,
        id: payout.id,
        method,
        methodLabel: getMethodLabel(method),
        netAmountMinor: payout.net * 100,
        nightsCount: null,
        notes: null,
        paidAt: status === "paid" ? "2026-05-22T12:00:00Z" : null,
        processedAt: status === "processing" || status === "paid" ? "2026-05-21T12:00:00Z" : null,
        propertyCity: property?.location.split(",")[0] ?? null,
        propertyId: payout.propertyId,
        propertyImageUrl: property?.image ?? marketplaceImages.modernApartment,
        propertySlug: null,
        propertyTitle: payout.property,
        scheduledFor: status === "scheduled" ? "2026-06-07" : null,
        status,
        statusLabel: getStatusLabel(status),
        updatedAt: "2026-05-30T10:00:00Z",
      } satisfies OwnerPayoutListItem;
    }),
  );
}

async function getOwnerPayoutRows() {
  await requireOwner();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("payouts")
    .select(
      "id, booking_id, status, method, gross_amount, commission_amount, net_amount, currency_code, scheduled_for, processed_at, paid_at, failed_at, cancelled_at, external_reference, failure_reason, notes, created_at, updated_at",
    )
    .order("paid_at", { ascending: false, nullsFirst: false })
    .order("scheduled_for", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error("Unable to load owner payouts.");
  }

  return (data ?? []) as PayoutListRow[];
}

export async function getOwnerPayouts() {
  noStore();

  if (!getSupabaseConfig()) {
    return getMockOwnerPayouts();
  }

  const [payoutRows, bookings] = await Promise.all([
    getOwnerPayoutRows(),
    getOwnerBookings(),
  ]);

  const bookingById = new Map(bookings.map((booking) => [booking.id, booking]));
  return sortPayouts(
    payoutRows.map((row) => mapPayoutRow(row, row.booking_id ? bookingById.get(row.booking_id) : undefined)),
  );
}

export async function getOwnerPayoutById(id: string) {
  const payouts = await getOwnerPayouts();
  return payouts.find((payout) => payout.id === id) ?? null;
}

export async function getOwnerPayoutSummary() {
  const payouts = await getOwnerPayouts();
  return buildSummary(payouts);
}

export async function getPayoutBookingContext(id: string) {
  const payout = await getOwnerPayoutById(id);

  if (!payout) {
    return null;
  }

  return {
    bookingId: payout.bookingId,
    bookingReference: payout.bookingReference,
    checkInDate: payout.checkInDate,
    checkOutDate: payout.checkOutDate,
    guestName: payout.guestName,
    nightsCount: payout.nightsCount,
    propertyId: payout.propertyId,
    propertySlug: payout.propertySlug,
    propertyTitle: payout.propertyTitle,
  };
}

export async function getOwnerPayoutPageData(): Promise<OwnerPayoutPageData> {
  noStore();

  if (!getSupabaseConfig()) {
    const payouts = getMockOwnerPayouts();
    return {
      destinationDisplay: buildDestinationDisplay("Ahmed Hassan", payouts),
      payouts,
      summary: buildSummary(payouts),
      usingFallback: true,
    };
  }

  const [payouts, profile] = await Promise.all([
    getOwnerPayouts(),
    getCurrentProfile(),
  ]);

  const ownerName = profile?.full_name ?? profile?.display_name ?? "Owner";

  return {
    destinationDisplay: buildDestinationDisplay(ownerName, payouts),
    payouts,
    summary: buildSummary(payouts),
    usingFallback: false,
  };
}
