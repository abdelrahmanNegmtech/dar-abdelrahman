import Link from "next/link";
import { OwnerShell } from "@/components/owner/owner-shell";
import { OwnerBookingDecisionPanel } from "@/features/bookings/owner-booking-decision-panel";
import { getOwnerBookingById, getOwnerBookings } from "@/features/bookings/data/booking-queries";

function formatDateLabel(value: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(`${value}T12:00:00Z`));
}

function statusLabel(status: string) {
  return status
    .split("_")
    .map((part) => `${part[0]?.toUpperCase() ?? ""}${part.slice(1)}`)
    .join(" ");
}

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ bookingId?: string }>;
}) {
  const params = await searchParams;
  const ownerBookings = await getOwnerBookings();
  const selectedBookingId =
    params.bookingId
    ?? ownerBookings.find((booking) => booking.status === "pending_owner_approval")?.id
    ?? ownerBookings[0]?.id
    ?? null;
  const booking = selectedBookingId ? await getOwnerBookingById(selectedBookingId) : null;

  return (
    <OwnerShell active="Booking Requests">
      <div className="owner-dashboard-page">
        <Link href="/owner/bookings" className="owner-button-text inline-flex items-center gap-2 text-violet-700">
          Back to bookings
        </Link>
        <h1 className="owner-page-title mt-4">Booking request decision</h1>
        <p className="owner-page-description text-slate-500">Review the traveler details, stay dates, and payment snapshot before making your decision.</p>

        {!booking ? (
          <div className="mt-6 rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center">
            <h2 className="text-xl font-bold text-slate-900">No booking selected</h2>
            <p className="mt-2 text-sm font-medium text-slate-500">Choose a booking from the owner bookings list to review it here.</p>
          </div>
        ) : (
          <div className="mt-6 grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
            <div className="space-y-5">
              <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-[0_4px_18px_rgba(25,33,60,.025)]">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="owner-card-title">{booking.propertyTitle}</h2>
                    <p className="owner-helper mt-1 text-slate-500">
                      {booking.propertyArea ? `${booking.propertyArea}, ` : ""}{booking.propertyCity}, {booking.propertyCountryName}
                    </p>
                  </div>
                  <span className="owner-badge rounded-full bg-slate-100 px-3 py-1 text-slate-700">
                    {statusLabel(booking.status)}
                  </span>
                </div>
                <div className="mt-5 grid gap-4 text-sm text-slate-600 md:grid-cols-4">
                  <p><span className="font-semibold text-slate-900">Check-in:</span> {formatDateLabel(booking.checkInDate)}</p>
                  <p><span className="font-semibold text-slate-900">Check-out:</span> {formatDateLabel(booking.checkOutDate)}</p>
                  <p><span className="font-semibold text-slate-900">Guests:</span> {booking.guestsCount}</p>
                  <p><span className="font-semibold text-slate-900">Requested:</span> {new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeStyle: "short" }).format(new Date(booking.requestedAt))}</p>
                </div>
              </section>

              <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-[0_4px_18px_rgba(25,33,60,.025)]">
                <h2 className="owner-card-title">Traveler details</h2>
                <div className="mt-4 grid gap-3 text-sm text-slate-600 md:grid-cols-2">
                  <p><span className="font-semibold text-slate-900">Full name:</span> {booking.travelerFullName}</p>
                  <p><span className="font-semibold text-slate-900">Email:</span> {booking.travelerEmail ?? "Not provided"}</p>
                  <p><span className="font-semibold text-slate-900">Phone:</span> {booking.travelerPhone ?? "Not provided"}</p>
                  <p><span className="font-semibold text-slate-900">Booking reference:</span> {booking.reference}</p>
                </div>
                <div className="mt-4 rounded-lg bg-slate-50 p-4 text-sm text-slate-600">
                  <p className="font-semibold text-slate-900">Special requests</p>
                  <p className="mt-2">{booking.specialRequests?.trim() || "No special requests were provided."}</p>
                </div>
              </section>

              <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-[0_4px_18px_rgba(25,33,60,.025)]">
                <h2 className="owner-card-title">Price snapshot</h2>
                <div className="mt-4 grid gap-3 text-sm text-slate-600 md:grid-cols-2">
                  <p><span className="font-semibold text-slate-900">Nightly:</span> {booking.currencyCode} {booking.nightlyAmountMajor.toLocaleString("en-US")}</p>
                  <p><span className="font-semibold text-slate-900">Subtotal:</span> {booking.currencyCode} {booking.subtotalAmountMajor.toLocaleString("en-US")}</p>
                  <p><span className="font-semibold text-slate-900">Cleaning fee:</span> {booking.currencyCode} {booking.cleaningFeeMajor.toLocaleString("en-US")}</p>
                  <p><span className="font-semibold text-slate-900">Service fee:</span> {booking.currencyCode} {booking.serviceFeeMajor.toLocaleString("en-US")}</p>
                  <p><span className="font-semibold text-slate-900">Discount:</span> {booking.currencyCode} {booking.discountAmountMajor.toLocaleString("en-US")}</p>
                  <p><span className="font-semibold text-slate-900">Total:</span> {booking.currencyCode} {booking.totalAmountMajor.toLocaleString("en-US")}</p>
                </div>
              </section>
            </div>

            <div className="space-y-5">
              <OwnerBookingDecisionPanel
                bookingId={booking.id}
                canDecide={booking.status === "pending_owner_approval"}
                statusLabel={statusLabel(booking.status)}
              />
              <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-[0_4px_18px_rgba(25,33,60,.025)]">
                <h2 className="owner-card-title">Payment review status</h2>
                <p className="mt-3 text-sm text-slate-600">
                  Current backend payment status: <span className="font-semibold text-slate-900">{statusLabel(booking.paymentStatus)}</span>
                </p>
                <p className="mt-3 text-sm text-slate-600">
                  Payment reference: <span className="font-semibold text-slate-900">{booking.paymentReference ?? "Not available"}</span>
                </p>
                <p className="mt-3 text-sm text-slate-600">
                  Submitted at: <span className="font-semibold text-slate-900">{booking.paymentSubmittedAt ? new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeStyle: "short" }).format(new Date(booking.paymentSubmittedAt)) : "Not available"}</span>
                </p>
              </section>
            </div>
          </div>
        )}
      </div>
    </OwnerShell>
  );
}
