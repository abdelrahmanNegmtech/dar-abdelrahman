import { getOwnerBookings } from "@/features/bookings/data/booking-queries";
import { getOwnerProperties } from "@/features/properties/data/owner-property-queries";
import { getOwnerPayouts, type OwnerPayoutListItem } from "@/features/payouts/data/payout-queries";
import { getOwnerReviewsData } from "@/features/reviews/data/review-queries";
import { OwnerDashboardClient } from "@/components/owner/owner-dashboard-client";
import { ownerRoutes } from "@/lib/owner-routes";

type DashboardStatusTone =
  | "active"
  | "cancelled"
  | "completed"
  | "confirmed"
  | "draft"
  | "pending"
  | "processing"
  | "rejected";

type DashboardBookingItem = {
  dateLabel: string;
  href: string;
  id: string;
  locationLabel: string;
  requestedAtLabel: string;
  statusLabel: string;
  statusTone: DashboardStatusTone;
  totalLabel: string;
  travelerFullName: string;
  propertyTitle: string;
};

type DashboardPropertyItem = {
  href: string;
  id: string;
  location: string;
  photoCount: number;
  primaryActionHref: string;
  primaryActionLabel: string;
  statusLabel: string;
  statusTone: DashboardStatusTone;
  title: string;
  updatedAtLabel: string;
};

type DashboardPayoutItem = {
  amountLabel: string;
  dateLabel: string;
  href: string;
  id: string;
  progressPercent: number;
  propertyTitle: string;
  statusLabel: string;
};

type DashboardQuickAction = {
  description: string;
  href: string;
  icon:
    | "Building2"
    | "CalendarCheck2"
    | "CalendarDays"
    | "HelpCircle"
    | "MessageSquare"
    | "WalletCards";
  label: string;
};

type OwnerDashboardData = {
  activeBookingCount: number;
  averageRating: number;
  pendingBookingCount: number;
  payouts: DashboardPayoutItem[];
  properties: DashboardPropertyItem[];
  quickActions: DashboardQuickAction[];
  reviewCount: number;
  reviewsSubmittedCount: number;
  thisMonthEarningsLabel: string;
  totalEarningsLabel: string;
  totalProperties: number;
  visibleBookings: {
    confirmed: DashboardBookingItem[];
    pending: DashboardBookingItem[];
  };
};

function formatCurrency(amountMinor: number, currencyCode: string) {
  try {
    return new Intl.NumberFormat("en-EG", {
      currency: currencyCode,
      maximumFractionDigits: 0,
      style: "currency",
    }).format(amountMinor / 100);
  } catch {
    return `${currencyCode} ${Math.round(amountMinor / 100).toLocaleString("en-US")}`;
  }
}

function formatDateRange(checkInDate: string, checkOutDate: string) {
  const formatter = new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return `${formatter.format(new Date(`${checkInDate}T12:00:00Z`))} - ${formatter.format(new Date(`${checkOutDate}T12:00:00Z`))}`;
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function humanizeStatus(value: string) {
  return value
    .split("_")
    .map((part) => `${part[0]?.toUpperCase() ?? ""}${part.slice(1)}`)
    .join(" ");
}

function mapBookingTone(status: string): DashboardStatusTone {
  if (status === "confirmed") {
    return "confirmed";
  }

  if (status === "completed") {
    return "completed";
  }

  if (status === "pending_owner_approval" || status === "pending_payment") {
    return "pending";
  }

  if (status === "declined" || status === "cancelled" || status === "expired" || status === "refunded") {
    return "cancelled";
  }

  return "processing";
}

function mapPropertyTone(statusGroup: string): DashboardStatusTone {
  if (statusGroup === "published" || statusGroup === "approved") {
    return "active";
  }

  if (statusGroup === "pending_review") {
    return "pending";
  }

  if (statusGroup === "rejected" || statusGroup === "suspended") {
    return "rejected";
  }

  if (statusGroup === "archived") {
    return "cancelled";
  }

  return "draft";
}

function buildPayoutTotals(rows: OwnerPayoutListItem[]) {
  const now = new Date();
  const currentMonth = now.getUTCMonth();
  const currentYear = now.getUTCFullYear();

  return rows.reduce(
    (summary, payout) => {
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
      lifetimePaidMinor: 0,
      paidThisMonthMinor: 0,
    },
  );
}

async function getOwnerDashboardData(): Promise<OwnerDashboardData> {
  const [bookings, properties, payouts, reviews] = await Promise.all([
    getOwnerBookings(),
    getOwnerProperties(),
    getOwnerPayouts(),
    getOwnerReviewsData(),
  ]);

  const pendingBookings = bookings
    .filter((booking) => booking.status === "pending_owner_approval")
    .sort((left, right) => new Date(right.requestedAt).getTime() - new Date(left.requestedAt).getTime());
  const confirmedBookings = bookings
    .filter((booking) => booking.status === "confirmed")
    .sort((left, right) => new Date(right.checkInDate).getTime() - new Date(left.checkInDate).getTime());

  const firstProperty = properties[0];
  const currencyCode = payouts[0]?.currencyCode ?? bookings[0]?.currencyCode ?? "EGP";
  const maxNetAmount = payouts.reduce((currentMax, payout) => Math.max(currentMax, payout.netAmountMinor), 0);
  const payoutTotals = buildPayoutTotals(payouts);

  return {
    activeBookingCount: confirmedBookings.length,
    averageRating: reviews.averageRating,
    pendingBookingCount: pendingBookings.length,
    payouts: payouts.slice(0, 3).map((payout) => ({
      amountLabel: formatCurrency(payout.netAmountMinor, payout.currencyCode),
      dateLabel: payout.paidAt
        ? formatDateTime(payout.paidAt)
        : payout.scheduledFor
          ? formatDateTime(`${payout.scheduledFor}T12:00:00Z`)
          : formatDateTime(payout.createdAt),
      href: ownerRoutes.payouts,
      id: payout.id,
      progressPercent: maxNetAmount > 0 ? Math.max(18, Math.round((payout.netAmountMinor / maxNetAmount) * 100)) : 24,
      propertyTitle: payout.propertyTitle,
      statusLabel: payout.statusLabel,
    })),
    properties: properties.slice(0, 3).map((property) => ({
      href: ownerRoutes.property(property.id),
      id: property.id,
      location: property.location,
      photoCount: property.photoCount,
      primaryActionHref: property.primaryActionHref,
      primaryActionLabel: property.primaryActionLabel,
      statusLabel: property.statusLabel,
      statusTone: mapPropertyTone(property.statusGroup),
      title: property.title,
      updatedAtLabel: property.updatedAtLabel,
    })),
    quickActions: [
      {
        description: "Update listings and availability",
        href: ownerRoutes.properties,
        icon: "Building2",
        label: "Manage properties",
      },
      {
        description: pendingBookings.length
          ? `${pendingBookings.length} request${pendingBookings.length === 1 ? "" : "s"} need a response`
          : "Review owner booking decisions",
        href: ownerRoutes.bookingRequests,
        icon: "CalendarCheck2",
        label: "Review requests",
      },
      {
        description: "Manage dates and pricing",
        href: firstProperty ? ownerRoutes.calendar(firstProperty.id) : ownerRoutes.properties,
        icon: "CalendarDays",
        label: "Open calendar",
      },
      {
        description: "Continue guest conversations",
        href: ownerRoutes.messages,
        icon: "MessageSquare",
        label: "View messages",
      },
      {
        description: "Review earnings and transfers",
        href: ownerRoutes.payouts,
        icon: "WalletCards",
        label: "Track payouts",
      },
      {
        description: "Get help from the DAR team",
        href: ownerRoutes.help,
        icon: "HelpCircle",
        label: "Owner support",
      },
    ],
    reviewCount: reviews.reviews.length,
    reviewsSubmittedCount: reviews.submittedCount,
    thisMonthEarningsLabel: formatCurrency(payoutTotals.paidThisMonthMinor, currencyCode),
    totalEarningsLabel: formatCurrency(payoutTotals.lifetimePaidMinor, currencyCode),
    totalProperties: properties.length,
    visibleBookings: {
      confirmed: confirmedBookings.slice(0, 3).map((booking) => ({
        dateLabel: formatDateRange(booking.checkInDate, booking.checkOutDate),
        href: `${ownerRoutes.bookingDecision}?bookingId=${encodeURIComponent(booking.id)}`,
        id: booking.id,
        locationLabel: `${booking.propertyCity}, ${booking.propertyCountryName}`,
        propertyTitle: booking.propertyTitle,
        requestedAtLabel: formatDateTime(booking.requestedAt),
        statusLabel: humanizeStatus(booking.status),
        statusTone: mapBookingTone(booking.status),
        totalLabel: `${booking.currencyCode} ${booking.totalAmountMajor.toLocaleString("en-US")}`,
        travelerFullName: booking.travelerFullName,
      })),
      pending: pendingBookings.slice(0, 3).map((booking) => ({
        dateLabel: formatDateRange(booking.checkInDate, booking.checkOutDate),
        href: `${ownerRoutes.bookingDecision}?bookingId=${encodeURIComponent(booking.id)}`,
        id: booking.id,
        locationLabel: `${booking.propertyCity}, ${booking.propertyCountryName}`,
        propertyTitle: booking.propertyTitle,
        requestedAtLabel: formatDateTime(booking.requestedAt),
        statusLabel: humanizeStatus(booking.status),
        statusTone: mapBookingTone(booking.status),
        totalLabel: `${booking.currencyCode} ${booking.totalAmountMajor.toLocaleString("en-US")}`,
        travelerFullName: booking.travelerFullName,
      })),
    },
  };
}

export async function OwnerDashboard() {
  const data = await getOwnerDashboardData();

  return <OwnerDashboardClient data={data} />;
}
