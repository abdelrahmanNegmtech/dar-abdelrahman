"use client";

import Link from "next/link";
import { Clock, CheckCircle2, XCircle } from "lucide-react";
import { Card } from "@/components/owner/owner-shell";
import { OwnerBookingStatus, useOwnerBookings, writeOwnerBookings } from "@/lib/owner-bookings";

const statusConfig: Record<string, { color: string; icon: typeof CheckCircle2 }> = {
  Confirmed: { color: "bg-green-100 text-green-700", icon: CheckCircle2 },
  Pending: { color: "bg-orange-100 text-orange-700", icon: Clock },
  Cancelled: { color: "bg-red-100 text-red-600", icon: XCircle },
};

export default function OwnerBookingsPage() {
  const bookings = useOwnerBookings();

  function updateStatus(id: string, status: OwnerBookingStatus) {
    writeOwnerBookings(bookings.map((booking) => booking.id === id ? { ...booking, status } : booking));
  }

  function declineBooking(id: string) {
    if (!window.confirm("Decline this booking request?")) return;
    updateStatus(id, "Cancelled");
  }

  return <div className="owner-dashboard-content">
        <div className="px-7 pt-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="owner-page-title">Booking Requests</h1>
              <p className="owner-page-description mt-1 text-[#5d667d]">
                Review and manage booking requests for your properties.
              </p>
            </div>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="mt-5 grid grid-cols-3 gap-4 px-7 max-[800px]:grid-cols-1">
          <Card className="p-4">
            <p className="owner-helper text-[#68718a]">Pending Response</p>
            <b className="owner-number-md mt-1 block text-[#e18a00]">{bookings.filter(b => b.status === "Pending").length}</b>
          </Card>
          <Card className="p-4">
            <p className="owner-helper text-[#68718a]">Confirmed</p>
            <b className="owner-number-md mt-1 block text-[#2fa84f]">{bookings.filter(b => b.status === "Confirmed").length}</b>
          </Card>
          <Card className="p-4">
            <p className="owner-helper text-[#68718a]">Total Bookings</p>
            <b className="owner-number-md mt-1 block">{bookings.length}</b>
          </Card>
        </div>

        {/* Bookings Table */}
        <div className="mt-5 px-7 pb-8">
          <Card className="overflow-hidden">
            <div className="flex items-center justify-between border-b border-[#e1e5ed] px-5 py-4">
              <h2 className="owner-section-title">All Bookings</h2>
              <span className="owner-helper text-[#68718a]">Sort by: Newest</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px]">
                <thead>
                  <tr className="bg-[#f5f6f9]">
                    {["Booking", "Property", "Guest", "Dates", "Total", "Status", "Action"].map((h) => (
                      <th key={h} className="owner-helper h-12 border-b border-[#e1e5ed] px-4 text-left font-medium text-[#5d667d]">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((booking) => {
                    const config = statusConfig[booking.status] || statusConfig.Pending;
                    const StatusIcon = config.icon;
                    return (
                      <tr key={booking.id} className="border-b border-[#eef0f5] transition-colors hover:bg-[#faf9ff]">
                        <td className="owner-body px-4 py-3">
                          <b className="owner-label">{booking.id}</b>
                        </td>
                        <td className="owner-body px-4 py-3">
                          <Link href="/owner/properties" className="text-[var(--brand)] hover:underline">
                            {booking.property}
                          </Link>
                        </td>
                        <td className="owner-body px-4 py-3">{booking.guest}</td>
                        <td className="owner-body px-4 py-3 whitespace-nowrap">{booking.dates}</td>
                        <td className="owner-body px-4 py-3 font-medium">
                          EGP {booking.total.toLocaleString()}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`owner-badge inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${config.color}`}>
                            <StatusIcon size={12} strokeWidth={2} />
                            {booking.status}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {booking.status === "Pending" ? (
                            <div className="flex gap-2">
                              <button onClick={() => updateStatus(booking.id, "Confirmed")} className="owner-button-text rounded-md bg-[var(--brand)] px-3 py-1.5 text-xs text-white transition-shadow duration-200 hover:shadow-[var(--shadow-card-hover)] disabled:hover:shadow-none">
                                Approve
                              </button>
                              <button onClick={() => declineBooking(booking.id)} className="owner-button-text rounded-md border border-[#dce1e9] px-3 py-1.5 text-xs transition-shadow duration-200 hover:shadow-[var(--shadow-card-hover)] disabled:hover:shadow-none">
                                Decline
                              </button>
                            </div>
                          ) : booking.status === "Confirmed" ? (
                            <Link
                              href="/owner/bookings/request-decision"
                              className="owner-button-text text-xs text-[var(--brand)] hover:underline"
                            >
                              View Details
                            </Link>
                          ) : null}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
      </div>
    </div>;
  
}
