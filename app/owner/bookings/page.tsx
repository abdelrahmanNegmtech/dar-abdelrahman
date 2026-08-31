import Link from "next/link";
import {
  CheckCircle2,
  ChevronRight,
  Clock3,
  FileText,
  UserRound,
  XCircle,
} from "lucide-react";
import { getOwnerBookings } from "@/features/bookings/data/booking-queries";
import { OwnerShell } from "@/components/owner/owner-shell";

type OwnerBookingStatus =
  | "pending_owner_approval"
  | "confirmed"
  | "completed"
  | "declined"
  | "cancelled"
  | "expired";

function formatDateRange(checkInDate: string, checkOutDate: string) {
  const formatter = new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return `${formatter.format(new Date(`${checkInDate}T12:00:00Z`))} - ${formatter.format(new Date(`${checkOutDate}T12:00:00Z`))}`;
}

function formatRequestedAt(value: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function formatMoney(currencyCode: string, amountMajor: number) {
  try {
    return new Intl.NumberFormat("en-US", {
      currency: currencyCode,
      maximumFractionDigits: 0,
      style: "currency",
    }).format(amountMajor);
  } catch {
    return `${currencyCode} ${amountMajor.toLocaleString("en-US")}`;
  }
}

function getStatusMeta(status: string) {
  const statusMap: Record<
    OwnerBookingStatus,
    {
      badgeClass: string;
      icon: typeof Clock3;
      label: string;
    }
  > = {
    cancelled: {
      badgeClass: "bg-[#fdebed] text-[#d84955]",
      icon: XCircle,
      label: "Cancelled",
    },
    completed: {
      badgeClass: "bg-[#e9f7ee] text-[#168446]",
      icon: CheckCircle2,
      label: "Completed",
    },
    confirmed: {
      badgeClass: "bg-[#eef8f1] text-[#22864b]",
      icon: CheckCircle2,
      label: "Confirmed",
    },
    declined: {
      badgeClass: "bg-[#fdebed] text-[#d84955]",
      icon: XCircle,
      label: "Declined",
    },
    expired: {
      badgeClass: "bg-[#f2f4f8] text-[#667085]",
      icon: Clock3,
      label: "Expired",
    },
    pending_owner_approval: {
      badgeClass: "bg-[#fff5df] text-[#d98100]",
      icon: Clock3,
      label: "Pending approval",
    },
  };

  if (status in statusMap) {
    return statusMap[status as OwnerBookingStatus];
  }

  return {
    badgeClass: "bg-[#f2f4f8] text-[#667085]",
    icon: FileText,
    label: status
      .split("_")
      .map((part) => `${part[0]?.toUpperCase() ?? ""}${part.slice(1)}`)
      .join(" "),
  };
}

export default async function OwnerBookingsPage() {
  const bookings = await getOwnerBookings();
  const sortedBookings = [...bookings].sort((left, right) => {
    return new Date(right.requestedAt || right.createdAt).getTime() - new Date(left.requestedAt || left.createdAt).getTime();
  });
  const pendingCount = bookings.filter((booking) => booking.status === "pending_owner_approval").length;
  const confirmedCount = bookings.filter((booking) => booking.status === "confirmed").length;

  return (
    <OwnerShell active="Booking Requests">
      <div className="owner-dashboard-content">
        <div className="px-7 pt-6">
          <h1 className="owner-page-title">Booking Requests</h1>
          <p className="owner-page-description mt-1 text-[#5d667d]">
            Review and manage booking requests for your properties.
          </p>
        </div>

        <div className="mt-5 grid grid-cols-3 gap-4 px-7 max-[800px]:grid-cols-1">
          <div className="rounded-[18px] border border-[#e1e5ed] bg-white p-4">
            <p className="owner-helper text-[#68718a]">Pending Response</p>
            <b className="owner-number-md mt-1 block text-[#d98100]">{pendingCount}</b>
          </div>
          <div className="rounded-[18px] border border-[#e1e5ed] bg-white p-4">
            <p className="owner-helper text-[#68718a]">Confirmed</p>
            <b className="owner-number-md mt-1 block text-[#22864b]">{confirmedCount}</b>
          </div>
          <div className="rounded-[18px] border border-[#e1e5ed] bg-white p-4">
            <p className="owner-helper text-[#68718a]">Total Bookings</p>
            <b className="owner-number-md mt-1 block text-[#17213d]">{bookings.length}</b>
          </div>
        </div>

        <div className="mt-5 px-7 pb-8">
          {sortedBookings.length ? (
            <div className="overflow-hidden rounded-[18px] border border-[#e1e5ed] bg-white">
              <div className="flex items-center justify-between gap-3 border-b border-[#e1e5ed] px-5 py-4 max-[640px]:flex-col max-[640px]:items-start">
                <h2 className="owner-section-title">All Bookings</h2>
                <span className="owner-helper text-[#68718a]">Sort by: Newest</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[980px]">
                  <thead>
                    <tr className="bg-[#f5f6f9]">
                      {["Booking", "Property", "Guest", "Dates", "Total", "Status", "Action"].map((heading) => (
                        <th
                          key={heading}
                          className="owner-helper h-12 border-b border-[#e1e5ed] px-4 text-left font-medium text-[#5d667d]"
                        >
                          {heading}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {sortedBookings.map((booking) => {
                      const status = getStatusMeta(booking.status);
                      const StatusIcon = status.icon;
                      const actionHref = `/owner/bookings/request-decision?bookingId=${encodeURIComponent(booking.id)}`;
                      const bookingLabel = booking.reference || booking.id;

                      return (
                        <tr
                          key={booking.id}
                          className="border-b border-[#eef0f5] align-top transition-colors hover:bg-[#faf9ff]"
                        >
                          <td className="px-4 py-4">
                            <div className="owner-body min-w-[150px] text-[#59637d]">
                              <b className="owner-label block text-[#17213d]">{bookingLabel}</b>
                              <span className="mt-1 block">
                                Requested {formatRequestedAt(booking.requestedAt || booking.createdAt)}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <div className="owner-body min-w-[220px] text-[#59637d]">
                              <Link
                                href={`/owner/properties/${booking.propertyId}`}
                                className="owner-label text-[#5522d9] hover:underline"
                              >
                                {booking.propertyTitle}
                              </Link>
                              <span className="mt-1 block">
                                {booking.propertyCity}, {booking.propertyCountryName}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <div className="owner-body min-w-[170px] text-[#59637d]">
                              <span className="owner-label flex items-center gap-2 text-[#17213d]">
                                <UserRound aria-hidden="true" size={14} strokeWidth={1.8} />
                                {booking.travelerFullName}
                              </span>
                              <span className="mt-1 block">
                                {booking.guestsCount} guest{booking.guestsCount === 1 ? "" : "s"}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <div className="owner-body min-w-[180px] text-[#59637d]">
                              <b className="owner-label block text-[#17213d]">
                                {formatDateRange(booking.checkInDate, booking.checkOutDate)}
                              </b>
                              <span className="mt-1 block">Check-in to check-out</span>
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <div className="owner-body min-w-[120px]">
                              <b className="owner-label block text-[#17213d]">
                                {formatMoney(booking.currencyCode, booking.totalAmountMajor)}
                              </b>
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <span
                              className={`owner-badge inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 ${status.badgeClass}`}
                            >
                              <StatusIcon aria-hidden="true" size={12} strokeWidth={2} />
                              {status.label}
                            </span>
                          </td>
                          <td className="px-4 py-4">
                            <Link
                              href={actionHref}
                              className="owner-button-text inline-flex items-center gap-1.5 rounded-md border border-[#d7dce5] px-3 py-2 text-[#17213d] transition hover:border-[#c3cae0] hover:bg-[#fafbfe]"
                            >
                              {booking.status === "pending_owner_approval" ? "Review request" : "View details"}
                              <ChevronRight aria-hidden="true" size={14} strokeWidth={1.8} />
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="rounded-[18px] border border-dashed border-[#d6dbe5] bg-white px-6 py-12 text-center">
              <h2 className="owner-section-title">No booking requests yet</h2>
              <p className="owner-page-description mt-2 text-[#68718a]">
                New booking requests and reservation activity for your properties will appear here.
              </p>
            </div>
          )}
        </div>
      </div>
    </OwnerShell>
  );
}
