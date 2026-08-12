"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import {
  Icon,
  formatEgp,
  formatShortDate,
} from "@/app/booking/hotel/shared";
import { shortPath } from "@/app/routing";
import { cancelTravelerBookingAction } from "@/features/bookings/actions";
import type { TravelerBooking } from "@/features/traveler/types";
import { cn } from "@/lib/utils";

function statusTone(status: TravelerBooking["status"]) {
  if (status === "confirmed") return "bg-[#E9F8EE] text-[#168A43]";
  if (status === "pending") return "bg-[#FFF8E9] text-[#B56B00]";
  if (status === "completed") return "bg-[#EEF2FF] text-[#3B47B5]";
  return "bg-[#FDECEC] text-[#D92D20]";
}

function statusLabel(status: TravelerBooking["status"]) {
  if (status === "pending") return "Pending";
  if (status === "completed") return "Completed";
  if (status === "cancelled") return "Cancelled";
  return "Confirmed";
}

function bookingLeadIn(checkIn: string) {
  const diff = Math.ceil(
    (new Date(`${checkIn}T12:00:00Z`).getTime() - Date.now()) / 86_400_000,
  );

  if (diff <= 0) return "Today";
  if (diff === 1) return "In 1 day";
  return `In ${diff} days`;
}

function paidOnLabel(booking: TravelerBooking) {
  const date = booking.paymentSubmittedAt ?? booking.createdAt;
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

export function LegacyBookingDetailsClient({ booking }: { booking: TravelerBooking }) {
  const router = useRouter();
  const [moreOpen, setMoreOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [localStatus, setLocalStatus] = useState(booking.status);
  const cancellationAllowed = booking.status === "pending" || booking.status === "confirmed";
  const guestName = booking.travelerFullName ?? "Traveler";
  const guestEmail = booking.travelerEmail ?? "Email unavailable";
  const guestPhone = booking.travelerPhone ?? "Phone unavailable";
  const daysLabel = useMemo(() => bookingLeadIn(booking.checkIn), [booking.checkIn]);

  function handleCancel() {
    if (!cancellationAllowed) {
      return;
    }

    startTransition(async () => {
      const result = await cancelTravelerBookingAction({
        bookingId: booking.id,
        reason: "Cancelled from legacy booking details page.",
      });

      if (result.ok) {
        setLocalStatus("cancelled");
        router.refresh();
      }
    });
  }

  return (
    <main className="min-h-screen bg-[#F8FAFC] text-[#080B32]">
      <div className="mx-auto min-h-screen max-w-[1840px] overflow-hidden bg-white shadow-[0_28px_80px_rgba(15,23,42,0.06)] xl:my-4 xl:rounded-[28px]">
        <Header bookingId={booking.id} />
        <div className="grid lg:grid-cols-[290px_minmax(0,1fr)]">
          <Sidebar />
          <section className="min-w-0 px-5 py-6 lg:px-9">
            <Link href="/traveler/bookings" className="inline-flex items-center gap-2 text-[15px] font-bold text-[#5F36E9]">
              <Icon name="chevronLeft" className="h-4 w-4" /> Back to bookings
            </Link>
            <div className="mt-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-[30px] font-black leading-tight">Booking Details</h1>
                <p className="mt-2 text-[15px] text-[#34405A]">Booking ID: {booking.reference}</p>
              </div>
              <div className="flex items-center gap-4">
                <span className={cn("inline-flex h-10 items-center gap-2 rounded-[8px] px-4 text-[14px] font-bold", statusTone(localStatus))}>
                  <Icon name={localStatus === "cancelled" ? "close" : localStatus === "pending" ? "bell" : "check"} className="h-4 w-4" />
                  {statusLabel(localStatus)}
                </span>
                <div className="relative">
                  <button type="button" onClick={() => setMoreOpen((value) => !value)} className="inline-flex h-11 items-center gap-3 rounded-[8px] border border-[#8D6BFF] px-8 text-[15px] font-bold text-[#5F36E9]">
                    <Icon name="dots" /> More actions
                  </button>
                  {moreOpen ? (
                    <div className="absolute right-0 z-10 mt-2 w-56 rounded-[10px] border border-[#E1E7F0] bg-white p-2 shadow-[0_18px_42px_rgba(15,23,42,0.14)]">
                      <a href={`/traveler/bookings/${booking.id}/invoice`} target="_blank" className="block rounded-[7px] px-3 py-2 text-[13px] font-bold hover:bg-[#F8FAFC]">
                        Download invoice
                      </a>
                      <a href="mailto:support@dar.example?subject=Booking%20support" className="block rounded-[7px] px-3 py-2 text-[13px] font-bold hover:bg-[#F8FAFC]">
                        Contact support
                      </a>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>

            <section className="mt-6 rounded-[14px] border border-[#E1E7F0] bg-white p-4 shadow-[0_12px_32px_rgba(15,23,42,0.05)]">
              <div className="grid gap-6 lg:grid-cols-[360px_minmax(0,1fr)_310px]">
                <div className="relative h-[198px] overflow-hidden rounded-[10px] bg-[#EEF2F8]">
                  <Image src={booking.property.imageUrl} alt={booking.property.title} fill className={cn("object-cover", booking.property.imagePosition)} />
                  <span className="absolute left-4 top-4 rounded-[7px] bg-[#5F36E9] px-3 py-1 text-[13px] font-bold text-white">{daysLabel}</span>
                </div>
                <div className="py-2">
                  <h2 className="text-[22px] font-black">{booking.property.title}</h2>
                  <p className="mt-4 text-[17px] text-[#F5A400]">★★★★★</p>
                  <p className="mt-4 flex items-center gap-2 text-[14px] text-[#34405A]"><Icon name="location" /> {booking.property.area}, {booking.property.city}</p>
                  <p className="mt-4 flex items-center gap-2 text-[14px] text-[#34405A]"><Icon name="bed" /> {booking.property.bedrooms > 1 ? "Apartment stay" : "Studio stay"}</p>
                  <p className="mt-4 flex items-center gap-2 text-[14px] text-[#34405A]"><Icon name="user" /> {booking.guestsCount} guests, {booking.roomsCount} room</p>
                </div>
                <div className="border-t border-[#E1E7F0] pt-4 lg:border-l lg:border-t-0 lg:pl-8">
                  <Info label="Check-in" value={formatShortDate(booking.checkIn)} sub={`From ${booking.checkInTime}`} />
                  <Info label="Check-out" value={formatShortDate(booking.checkOut)} sub={`Until ${booking.checkOutTime}`} />
                  <p className="mt-7 flex items-center gap-3 text-[15px] font-bold"><Icon name="moon" /> {booking.nightsCount} nights</p>
                </div>
              </div>
            </section>

            <div className="mt-6 grid gap-5 lg:grid-cols-3">
              <Card title="Booking summary">
                <Row label="Total paid" value={formatEgp(booking.totalAmount)} bold />
                <Row label={`Room rate (${booking.nightsCount} nights)`} value={formatEgp(booking.subtotal)} />
                <Row label="Cleaning fee" value={formatEgp(booking.cleaningFee)} />
                <Row label="Taxes and fees" value={formatEgp(booking.serviceFee)} />
                <div className="my-5 border-t border-[#E1E7F0]" />
                <Row label="Payment method" value={booking.paymentMethodLabel} accent />
                <Row label="Paid on" value={paidOnLabel(booking)} />
                <a href={`/traveler/bookings/${booking.id}/invoice`} target="_blank" className="mt-5 inline-flex items-center gap-2 text-[14px] font-bold text-[#5F36E9]">View payment details <Icon name="chevronRight" className="h-4 w-4" /></a>
              </Card>
              <Card title="Guest details">
                <p className="text-[15px] font-black">{guestName}</p>
                <p className="mt-2 text-[14px] text-[#34405A]">{guestEmail}</p>
                <p className="mt-1 text-[14px] text-[#34405A]">{guestPhone}</p>
                <div className="my-5 border-t border-[#E1E7F0]" />
                <p className="text-[15px] font-black">Additional guest</p>
                <p className="mt-2 text-[14px] text-[#34405A]">{booking.specialRequests || "No additional guest details provided."}</p>
                <Link href="/traveler/profile" className="mt-7 inline-flex items-center gap-2 text-[14px] font-bold text-[#5F36E9]">Edit guest details <Icon name="chevronRight" className="h-4 w-4" /></Link>
              </Card>
              <Card title="Cancellation policy">
                <p className="text-[14px] font-bold text-[#34405A]">Current cancellation policy</p>
                <p className="mt-2 text-[17px] font-black text-[#168A43]">{booking.cancellationPolicy}</p>
                <p className="mt-5 text-[14px] leading-6 text-[#34405A]">Historical totals and dates are locked to this booking snapshot.</p>
                <Link href="/legal/cancellation-policy" className="mt-7 inline-flex items-center gap-2 text-[14px] font-bold text-[#5F36E9]">View policy <Icon name="chevronRight" className="h-4 w-4" /></Link>
              </Card>
            </div>

            <section className="mt-6 flex flex-col gap-4 rounded-[12px] bg-[#F5F1FF] p-5 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-4"><Icon name="headset" className="h-10 w-10 text-[#5F36E9]" /><div><p className="text-[17px] font-black">Need help?</p><p className="text-[14px] text-[#34405A]">Our support team is here for you 24/7</p></div></div>
              <div className="grid gap-3 sm:grid-cols-2"><a href="mailto:support@dar.example?subject=Booking%20support" className="inline-flex h-11 items-center justify-center gap-2 rounded-[7px] border border-[#8D6BFF] px-10 text-[14px] font-bold text-[#5F36E9]"><Icon name="message" /> Chat with us</a><a href="tel:+201001234567" className="inline-flex h-11 items-center justify-center gap-2 rounded-[7px] bg-[#5F36E9] px-10 text-[14px] font-bold text-white"><Icon name="headset" /> Call us</a></div>
            </section>

            <section className="mt-6 rounded-[14px] border border-[#E1E7F0] bg-white p-5">
              <h2 className="text-[18px] font-black">Your itinerary</h2>
              <div className="mt-5 grid gap-5 md:grid-cols-3">
                <Itinerary icon="calendar" title="Check-in" value={formatShortDate(booking.checkIn)} sub={`From ${booking.checkInTime}`} />
                <Itinerary icon="calendar" title="Check-out" value={formatShortDate(booking.checkOut)} sub={`Until ${booking.checkOutTime}`} />
                <Itinerary icon="moon" title="Duration" value={`${booking.nightsCount} nights`} sub={`${booking.guestsCount} guests, ${booking.roomsCount} room`} />
              </div>
            </section>

            <div className="mt-8 grid gap-4 md:grid-cols-3">
              <Link href={`/traveler/bookings/${booking.id}`} className="inline-flex h-14 items-center justify-center gap-2 rounded-[8px] border border-[#8D6BFF] text-[15px] font-bold text-[#5F36E9]"><Icon name="edit" /> Manage booking</Link>
              <button type="button" disabled={!cancellationAllowed || isPending} onClick={handleCancel} className="inline-flex h-14 items-center justify-center gap-2 rounded-[8px] border border-[#FF6B6B] text-[15px] font-bold text-[#D92D20] disabled:cursor-not-allowed disabled:opacity-60"><Icon name="close" /> {isPending ? "Cancelling..." : "Cancel booking"}</button>
              <Link href={`/traveler/messages?booking=${booking.id}`} className="inline-flex h-14 items-center justify-center gap-2 rounded-[8px] bg-[#5F36E9] text-[15px] font-bold text-white"><Icon name="message" /> Contact property</Link>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

function Header({ bookingId }: { bookingId: string }) {
  return (
    <header className="flex h-[86px] items-center justify-between border-b border-[#E6EBF3] px-6 lg:px-9">
      <Link href={shortPath("/", "en")} aria-label="DAR home"><Image src="/dar-logo-purple-header.png" alt="DAR" width={320} height={142} className="h-[50px] w-auto object-contain" priority /></Link>
      <nav className="hidden items-center gap-10 text-[14px] font-semibold lg:flex">
        {["Home", "Bookings", "Stays", "Messages", "Profile"].map((item) => <Link key={item} href={item === "Bookings" ? `/bookings/${bookingId}` : item === "Messages" ? "/traveler/messages" : item === "Stays" ? "/rent" : "/"} className={cn(item === "Bookings" && "border-b-4 border-[#5F36E9] pb-8 text-[#080B32]")}>{item}</Link>)}
      </nav>
      <div className="flex items-center gap-5"><Icon name="bell" /><div className="hidden items-center gap-3 lg:flex"><div className="relative h-10 w-10 overflow-hidden rounded-full bg-[#EDE8FF]"><Image src="/properties/madinty-bedroom.png" alt="" fill className="object-cover" /></div><span className="font-bold">Traveler</span></div></div>
    </header>
  );
}

function Sidebar() {
  const items = ["Overview", "Upcoming Bookings", "Past Bookings", "Cancelled Bookings", "Saved Properties", "Payment Methods", "Settings"];
  return <aside className="hidden border-r border-[#E6EBF3] p-8 lg:block"><nav className="space-y-6">{items.map((item) => <Link key={item} href="/traveler/dashboard" className="block text-[15px] font-medium text-[#34405A]">{item}</Link>)}</nav><div className="mt-10 border-t border-[#E6EBF3] pt-8"><Link href="/" className="block text-[15px] font-medium text-[#34405A]">Help Center</Link><Link href="/" className="mt-6 block text-[15px] font-medium text-[#F04438]">Log out</Link></div></aside>;
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return <section className="rounded-[14px] border border-[#E1E7F0] bg-white p-5 shadow-[0_12px_32px_rgba(15,23,42,0.04)]"><h2 className="text-[18px] font-black">{title}</h2><div className="mt-5">{children}</div></section>;
}

function Row({ label, value, bold = false, accent = false }: { label: string; value: string; bold?: boolean; accent?: boolean }) {
  return <div className="mb-4 flex items-center justify-between gap-4 text-[14px]"><span className="text-[#34405A]">{label}</span><span className={cn("font-semibold", bold && "font-black", accent && "text-[#5F36E9]")}>{value}</span></div>;
}

function Info({ label, value, sub }: { label: string; value: string; sub: string }) {
  return <div className="mb-6 last:mb-0"><p className="text-[14px] text-[#59637C]">{label}</p><p className="mt-2 text-[16px] font-black">{value}</p><p className="mt-1 text-[14px] text-[#34405A]">{sub}</p></div>;
}

function Itinerary({ icon, title, value, sub }: { icon: "calendar" | "moon"; title: string; value: string; sub: string }) {
  return <div className="flex gap-4"><span className="grid h-12 w-12 place-items-center rounded-full bg-[#F1EBFF] text-[#5F36E9]"><Icon name={icon} /></span><div><p className="text-[15px] font-black">{title}</p><p className="mt-2 text-[14px]">{value}</p><p className="mt-1 text-[13px] text-[#34405A]">{sub}</p></div></div>;
}
