import Link from "next/link";
import { getOwnerBookings } from "@/features/bookings/data/booking-queries";
import { OwnerShell } from "@/components/owner/owner-shell";

function formatDateRange(checkInDate: string, checkOutDate: string) {
  const formatter = new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return `${formatter.format(new Date(`${checkInDate}T12:00:00Z`))} - ${formatter.format(new Date(`${checkOutDate}T12:00:00Z`))}`;
}

function statusLabel(status: string) {
  return status
    .split("_")
    .map((part) => `${part[0]?.toUpperCase() ?? ""}${part.slice(1)}`)
    .join(" ");
}

function statusClasses(status: string) {
  if (status === "pending_owner_approval") {
    return "bg-amber-100 text-amber-800";
  }

  if (status === "confirmed" || status === "completed") {
    return "bg-emerald-100 text-emerald-800";
  }

  if (status === "declined" || status === "cancelled" || status === "expired") {
    return "bg-rose-100 text-rose-700";
  }

  return "bg-slate-100 text-slate-700";
}

export default async function OwnerBookingsPage() {
  const bookings = await getOwnerBookings();
  const pendingBookings = bookings.filter((booking) => booking.status === "pending_owner_approval");
  const visibleBookings = pendingBookings.length ? pendingBookings : bookings;

  return (
    <OwnerShell active="Booking Requests">
      <div className="owner-dashboard-page">
        <h1 className="owner-page-title">Booking requests</h1>
        <p className="owner-page-description text-slate-500">Review pending traveler requests and recent booking decisions.</p>
        {/*
        <Link href={ownerRoutes.bookingDecision} className="mt-6 flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-5 transition hover:border-violet-300 hover:bg-violet-50/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500">
          <div className="rounded-full bg-violet-100 p-3 text-violet-700"><CalendarDays className="h-6 w-6" /></div>
          <div className="min-w-0 flex-1">
            <h2 className="owner-card-title">Modern Apartment in Zamalek</h2>
            <p className="owner-helper text-slate-500">20 May – 25 May 2025</p>
            <span className="owner-helper mt-1 inline-flex items-center gap-1 text-slate-600"><Users className="h-4 w-4" /> Omar Khaled · 2 guests</span>
          </div>
          <span className="owner-badge rounded-full bg-amber-100 px-3 py-1 text-amber-700">Pending</span>
          <ChevronRight className="h-5 w-5 text-slate-400" />
        </Link>
        */}
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <p className="owner-helper text-slate-500">Pending approval</p>
            <p className="mt-2 text-3xl font-bold text-slate-900">{pendingBookings.length}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <p className="owner-helper text-slate-500">Total owner bookings</p>
            <p className="mt-2 text-3xl font-bold text-slate-900">{bookings.length}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <p className="owner-helper text-slate-500">Awaiting traveler check-in</p>
            <p className="mt-2 text-3xl font-bold text-slate-900">
              {bookings.filter((booking) => booking.status === "confirmed").length}
            </p>
          </div>
        </div>
        {visibleBookings.length ? (
          <div className="mt-6 space-y-4">
            {visibleBookings.map((booking) => (
              <Link
                href={`/owner/bookings/request-decision?bookingId=${booking.id}`}
                key={booking.id}
                className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-5 transition hover:border-violet-300 hover:bg-violet-50/30"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="owner-card-title">{booking.propertyTitle}</h2>
                    <p className="owner-helper mt-1 text-slate-500">
                      {booking.propertyCity}, {booking.propertyCountryName}
                    </p>
                  </div>
                  <span className={`owner-badge rounded-full px-3 py-1 ${statusClasses(booking.status)}`}>
                    {statusLabel(booking.status)}
                  </span>
                </div>
                <div className="grid gap-3 text-sm text-slate-600 md:grid-cols-4">
                  <p><span className="font-semibold text-slate-900">Traveler:</span> {booking.travelerFullName}</p>
                  <p><span className="font-semibold text-slate-900">Dates:</span> {formatDateRange(booking.checkInDate, booking.checkOutDate)}</p>
                  <p><span className="font-semibold text-slate-900">Guests:</span> {booking.guestsCount}</p>
                  <p><span className="font-semibold text-slate-900">Total:</span> {booking.currencyCode} {booking.totalAmountMajor.toLocaleString("en-US")}</p>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="mt-6 rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center">
            <h2 className="text-xl font-bold text-slate-900">No owner bookings yet</h2>
            <p className="mt-2 text-sm font-medium text-slate-500">New booking requests will appear here once travelers submit them.</p>
          </div>
        )}
      </div>
    </OwnerShell>
  );
}
