"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Icon, formatEgp, formatShortDate, paymentLabel } from "@/app/booking/hotel/shared";
import { readStoredBooking, type StoredBooking } from "@/app/booking/flow-guards";
import { shortPath } from "@/app/routing";

function bookingId(booking: StoredBooking) {
  return String(booking.bookingId ?? booking.confirmationNumber ?? booking.bookingReference ?? "DAR-25052024-4837");
}

function statusLabel(status?: string) {
  const labels: Record<string, string> = {
    request_received: "Request received",
    payment_pending: "Payment pending",
    payment_failed: "Payment failed",
    confirmed: "Confirmed",
    cancelled: "Cancelled",
  };
  return labels[status ?? ""] ?? "In progress";
}

function statusClass(status?: string) {
  if (status === "confirmed") return "bg-[#EAF8EF] text-[#168A43]";
  if (status === "cancelled" || status === "payment_failed") return "bg-[#FFF1F1] text-[#D92D20]";
  return "bg-[#FFF7E6] text-[#B66A00]";
}

export default function MyBookingsPage() {
  const [booking] = useState<StoredBooking | null>(() => readStoredBooking());

  return (
    <main className="min-h-screen bg-[#F8FAFC] p-4 text-[#080B32]">
      <div className="mx-auto min-h-[calc(100vh-32px)] max-w-[1180px] overflow-hidden rounded-[28px] border border-[#DFE6F1] bg-white shadow-[0_28px_80px_rgba(15,23,42,0.06)]">
        <header className="flex h-[76px] items-center justify-between border-b border-[#E6EBF3] px-6 lg:px-8">
          <Link href={shortPath("/", "en")} aria-label="DAR home">
            <Image src="/dar-logo-purple-header.png" alt="DAR" width={320} height={142} className="h-[48px] w-auto object-contain" priority />
          </Link>
          <Link href={shortPath("/hotels", "en")} className="rounded-[8px] border border-[#8D6BFF] px-5 py-2.5 text-[14px] font-bold text-[#5F36E9]">Explore stays</Link>
        </header>

        <section className="px-6 py-8 lg:px-10">
          <Link href={shortPath("/", "en")} className="inline-flex items-center gap-2 text-[15px] font-bold text-[#5F36E9]">
            <Icon name="chevronLeft" className="h-4 w-4" /> Back home
          </Link>
          <h1 className="mt-5 text-[34px] font-black leading-tight">My bookings</h1>
          <p className="mt-2 text-[15px] text-[#59637C]">Manage your DAR stays, invoices, support, and cancellation options.</p>

          {!booking ? (
            <div className="mt-8 rounded-[16px] border border-[#E1E7F0] bg-[#FBFCFF] p-8 text-center">
              <p className="text-[22px] font-black">No bookings yet</p>
              <p className="mx-auto mt-2 max-w-[440px] text-[15px] leading-7 text-[#59637C]">Start from a hotel or stay listing, choose your dates, and your booking will appear here once created.</p>
              <Link href={shortPath("/hotels", "en")} className="mt-6 inline-flex h-12 items-center justify-center rounded-[8px] bg-[#5F36E9] px-8 text-[15px] font-bold text-white">Browse hotels</Link>
            </div>
          ) : (
            <Link href={shortPath(`/bookings/${bookingId(booking)}`, "en")} className="mt-8 grid gap-5 rounded-[16px] border border-[#E1E7F0] bg-white p-5 shadow-[0_14px_34px_rgba(15,23,42,0.06)] transition hover:border-[#BFAEFF] md:grid-cols-[240px_minmax(0,1fr)_180px]">
              <div className="relative h-[170px] overflow-hidden rounded-[12px] bg-[#EEF2F8]">
                <Image src={String(booking.image ?? "/properties/madinty-living.png")} alt={String(booking.title ?? "DAR booking")} fill className="object-cover" />
              </div>
              <div>
                <span className={`inline-flex rounded-full px-3 py-1 text-[12px] font-black ${statusClass(booking.bookingStatus)}`}>{statusLabel(booking.bookingStatus)}</span>
                <h2 className="mt-3 text-[24px] font-black">{String(booking.title ?? "DAR booking")}</h2>
                <p className="mt-2 flex items-center gap-2 text-[15px] text-[#34405A]"><Icon name="location" /> {String(booking.location ?? "DAR stay")}</p>
                <div className="mt-5 grid gap-3 text-[14px] text-[#34405A] sm:grid-cols-3">
                  <span><strong className="block text-[#080B32]">Check-in</strong>{formatShortDate(String(booking.checkIn ?? "2026-05-20"))}</span>
                  <span><strong className="block text-[#080B32]">Check-out</strong>{formatShortDate(String(booking.checkOut ?? "2026-05-22"))}</span>
                  <span><strong className="block text-[#080B32]">Guests</strong>{Number(booking.guests ?? 2)} guests</span>
                </div>
              </div>
              <div className="flex flex-col justify-between border-t border-[#E6EBF3] pt-4 md:border-l md:border-t-0 md:pl-5 md:pt-0">
                <div>
                  <p className="text-[13px] text-[#59637C]">Total paid</p>
                  <p className="mt-1 text-[22px] font-black">{formatEgp(Number(booking.total ?? 0))}</p>
                  <p className="mt-4 text-[13px] text-[#59637C]">Payment</p>
                  <p className="font-bold">{paymentLabel(String(booking.paymentMethod ?? "card"))}</p>
                </div>
                <span className="mt-5 inline-flex h-11 items-center justify-center rounded-[8px] bg-[#5F36E9] text-[14px] font-bold text-white">View details</span>
              </div>
            </Link>
          )}
        </section>
      </div>
    </main>
  );
}
