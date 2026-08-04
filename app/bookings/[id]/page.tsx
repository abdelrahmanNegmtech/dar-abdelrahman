"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  Icon,
  bookingQuery,
  formatEgp,
  formatShortDate,
  localizedPath,
  paymentLabel,
  readHotelBooking,
  writeHotelBooking,
} from "@/app/booking/hotel/shared";
import { requiredRedirectForStep } from "@/app/booking/flow-guards";
import { shortPath } from "@/app/routing";
import { cn } from "@/lib/utils";

export default function BookingDetailsPage() {
  const router = useRouter();
  const { booking } = useMemo(() => readHotelBooking(), []);
  const [moreOpen, setMoreOpen] = useState(false);
  const bookingId = booking.bookingId ?? "DAR-25052024-4837";

  useEffect(() => {
    const redirect = requiredRedirectForStep("booking-details");
    if (redirect) router.replace(redirect);
  }, [router]);

  const cancelBooking = () => {
    const nextBooking = {
      ...booking,
      bookingStatus: "cancelled",
      cancellation: {
        reason: "Cancelled by guest",
        number: "CAN-25052024-4837",
        cancelledAt: new Date().toISOString(),
        cancelledBy: booking.guestInfo?.fullName || "Guest",
        refundStatus: "processing",
        refundMethod: paymentLabel(booking.paymentMethod),
        refundTimeline: "Within 5-7 business days",
      },
    };
    writeHotelBooking(nextBooking);
    router.push(`${localizedPath(nextBooking, "/booking/cancelled")}?${bookingQuery(nextBooking)}`);
  };

  return (
    <main className="min-h-screen bg-[#F8FAFC] text-[#080B32]">
      <div className="mx-auto min-h-screen max-w-[1840px] overflow-hidden bg-white shadow-[0_28px_80px_rgba(15,23,42,0.06)] xl:my-4 xl:rounded-[28px]">
        <Header />
        <div className="grid lg:grid-cols-[290px_minmax(0,1fr)]">
          <Sidebar />
          <section className="min-w-0 px-5 py-6 lg:px-9">
            <Link href={localizedPath(booking, "/bookings")} className="inline-flex items-center gap-2 text-[15px] font-bold text-[#5F36E9]"><Icon name="chevronLeft" className="h-4 w-4" /> Back to bookings</Link>
            <div className="mt-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-[30px] font-black leading-tight">Booking Details</h1>
                <p className="mt-2 text-[15px] text-[#34405A]">Booking ID: {bookingId}</p>
              </div>
              <div className="flex items-center gap-4">
                <span className="inline-flex h-10 items-center gap-2 rounded-[8px] bg-[#E9F8EE] px-4 text-[14px] font-bold text-[#168A43]"><Icon name="check" className="h-4 w-4" /> Confirmed</span>
                <div className="relative">
                  <button type="button" onClick={() => setMoreOpen((value) => !value)} className="inline-flex h-11 items-center gap-3 rounded-[8px] border border-[#8D6BFF] px-8 text-[15px] font-bold text-[#5F36E9]"><Icon name="dots" /> More actions</button>
                  {moreOpen ? (
                    <div className="absolute right-0 z-10 mt-2 w-56 rounded-[10px] border border-[#E1E7F0] bg-white p-2 shadow-[0_18px_42px_rgba(15,23,42,0.14)]">
                      <Link href={localizedPath(booking, "/booking/invoice")} className="block rounded-[7px] px-3 py-2 text-[13px] font-bold hover:bg-[#F8FAFC]">Download invoice</Link>
                      <a href="mailto:support@dar.example?subject=Booking%20support" className="block rounded-[7px] px-3 py-2 text-[13px] font-bold hover:bg-[#F8FAFC]">Contact support</a>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>

            <section className="mt-6 rounded-[14px] border border-[#E1E7F0] bg-white p-4 shadow-[0_12px_32px_rgba(15,23,42,0.05)]">
              <div className="grid gap-6 lg:grid-cols-[360px_minmax(0,1fr)_310px]">
                <div className="relative h-[198px] overflow-hidden rounded-[10px] bg-[#EEF2F8]"><Image src={booking.image} alt={booking.title} fill className="object-cover" /><span className="absolute left-4 top-4 rounded-[7px] bg-[#5F36E9] px-3 py-1 text-[13px] font-bold text-white">In 5 days</span></div>
                <div className="py-2">
                  <h2 className="text-[22px] font-black">{booking.title}</h2>
                  <p className="mt-4 text-[17px] text-[#F5A400]">★★★★★</p>
                  <p className="mt-4 flex items-center gap-2 text-[14px] text-[#34405A]"><Icon name="location" /> {booking.location}</p>
                  <p className="mt-4 flex items-center gap-2 text-[14px] text-[#34405A]"><Icon name="bed" /> {booking.roomName}</p>
                  <p className="mt-4 flex items-center gap-2 text-[14px] text-[#34405A]"><Icon name="user" /> {booking.guests} guests, {booking.rooms ?? 1} room</p>
                </div>
                <div className="border-t border-[#E1E7F0] pt-4 lg:border-l lg:border-t-0 lg:pl-8">
                  <Info label="Check-in" value={formatShortDate(booking.checkIn)} sub="From 3:00 PM" />
                  <Info label="Check-out" value={formatShortDate(booking.checkOut)} sub="Until 12:00 PM" />
                  <p className="mt-7 flex items-center gap-3 text-[15px] font-bold"><Icon name="moon" /> {booking.nights} nights</p>
                </div>
              </div>
            </section>

            <div className="mt-6 grid gap-5 lg:grid-cols-3">
              <Card title="Booking summary">
                <Row label="Total paid" value={formatEgp(booking.total)} bold />
                <Row label={`Room rate (${booking.nights} nights)`} value={formatEgp(booking.subtotal)} />
                <Row label="Taxes and fees" value={formatEgp(booking.serviceFee)} />
                <div className="my-5 border-t border-[#E1E7F0]" />
                <Row label="Payment method" value={paymentLabel(booking.paymentMethod)} accent />
                <Row label="Paid on" value="10 May 2024, 11:24 AM" />
                <Link href={localizedPath(booking, "/booking/invoice")} className="mt-5 inline-flex items-center gap-2 text-[14px] font-bold text-[#5F36E9]">View payment details <Icon name="chevronRight" className="h-4 w-4" /></Link>
              </Card>
              <Card title="Guest details">
                <p className="text-[15px] font-black">{booking.guestInfo?.fullName || "Ahmed Hassan"}</p>
                <p className="mt-2 text-[14px] text-[#34405A]">{booking.guestInfo?.email || "ahmed.hassan@email.com"}</p>
                <p className="mt-1 text-[14px] text-[#34405A]">+20 {booking.guestInfo?.phone || "100 123 4567"}</p>
                <div className="my-5 border-t border-[#E1E7F0]" />
                <p className="text-[15px] font-black">Additional guest</p>
                <p className="mt-2 text-[14px] text-[#34405A]">No additional guests</p>
                <Link href={`${localizedPath(booking, "/booking/hotel/guest")}?${bookingQuery(booking)}&edit=guest`} className="mt-7 inline-flex items-center gap-2 text-[14px] font-bold text-[#5F36E9]">Edit guest details <Icon name="chevronRight" className="h-4 w-4" /></Link>
              </Card>
              <Card title="Cancellation policy">
                <p className="text-[14px] font-bold text-[#34405A]">Free cancellation until</p>
                <p className="mt-2 text-[17px] font-black text-[#168A43]">18 May 2024, 3:00 PM</p>
                <p className="mt-5 text-[14px] leading-6 text-[#34405A]">After this date, the booking is non-refundable.</p>
                <Link href={`${shortPath(`/hotels/${booking.hotelId ?? booking.propertyId}`, booking.locale)}#policies`} className="mt-7 inline-flex items-center gap-2 text-[14px] font-bold text-[#5F36E9]">View policy <Icon name="chevronRight" className="h-4 w-4" /></Link>
              </Card>
            </div>

            <section className="mt-6 flex flex-col gap-4 rounded-[12px] bg-[#F5F1FF] p-5 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-4"><Icon name="headset" className="h-10 w-10 text-[#5F36E9]" /><div><p className="text-[17px] font-black">Need help?</p><p className="text-[14px] text-[#34405A]">Our support team is here for you 24/7</p></div></div>
              <div className="grid gap-3 sm:grid-cols-2"><a href="mailto:support@dar.example?subject=Booking%20support" className="inline-flex h-11 items-center justify-center gap-2 rounded-[7px] border border-[#8D6BFF] px-10 text-[14px] font-bold text-[#5F36E9]"><Icon name="message" /> Chat with us</a><a href="tel:+201001234567" className="inline-flex h-11 items-center justify-center gap-2 rounded-[7px] bg-[#5F36E9] px-10 text-[14px] font-bold text-white"><Icon name="headset" /> Call us</a></div>
            </section>

            <section className="mt-6 rounded-[14px] border border-[#E1E7F0] bg-white p-5">
              <h2 className="text-[18px] font-black">Your itinerary</h2>
              <div className="mt-5 grid gap-5 md:grid-cols-3">
                <Itinerary icon="calendar" title="Check-in" value={formatShortDate(booking.checkIn)} sub="From 3:00 PM" />
                <Itinerary icon="calendar" title="Check-out" value={formatShortDate(booking.checkOut)} sub="Until 12:00 PM" />
                <Itinerary icon="moon" title="Duration" value={`${booking.nights} nights`} sub={`${booking.guests} guests, ${booking.rooms ?? 1} room`} />
              </div>
            </section>

            <div className="mt-8 grid gap-4 md:grid-cols-3">
              <Link href={`${localizedPath(booking, "/booking/hotel/guest")}?${bookingQuery(booking)}&modify=dates`} className="inline-flex h-14 items-center justify-center gap-2 rounded-[8px] border border-[#8D6BFF] text-[15px] font-bold text-[#5F36E9]"><Icon name="edit" /> Modify booking</Link>
              <button type="button" onClick={cancelBooking} className="inline-flex h-14 items-center justify-center gap-2 rounded-[8px] border border-[#FF6B6B] text-[15px] font-bold text-[#D92D20]"><Icon name="close" /> Cancel booking</button>
              <a href="mailto:hotel@dar.example?subject=Contact%20property" className="inline-flex h-14 items-center justify-center gap-2 rounded-[8px] bg-[#5F36E9] text-[15px] font-bold text-white"><Icon name="message" /> Contact property</a>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

function Header() {
  return (
    <header className="flex h-[86px] items-center justify-between border-b border-[#E6EBF3] px-6 lg:px-9">
      <Link href={shortPath("/", "en")} aria-label="DAR home"><Image src="/dar-logo-purple-header.png" alt="DAR" width={320} height={142} className="h-[50px] w-auto object-contain" priority /></Link>
      <nav className="hidden items-center gap-10 text-[14px] font-semibold lg:flex">
        {["Home", "Bookings", "Stays", "Messages", "Profile"].map((item) => <Link key={item} href={item === "Bookings" ? shortPath("/bookings/DAR-25052024-4837", "en") : item === "Messages" ? shortPath("/messages", "en") : item === "Stays" ? shortPath("/rent", "en") : shortPath("/", "en")} className={cn(item === "Bookings" && "border-b-4 border-[#5F36E9] pb-8 text-[#080B32]")}>{item}</Link>)}
      </nav>
      <div className="flex items-center gap-5"><Icon name="bell" /><div className="hidden items-center gap-3 lg:flex"><div className="relative h-10 w-10 overflow-hidden rounded-full bg-[#EDE8FF]"><Image src="/properties/madinty-bedroom.png" alt="Ahmed Hassan" fill className="object-cover" /></div><span className="font-bold">Ahmed Hassan</span></div></div>
    </header>
  );
}

function Sidebar() {
  const items = ["Overview", "Upcoming Bookings", "Past Bookings", "Cancelled Bookings", "Saved Properties", "Payment Methods", "Settings"];
  return <aside className="hidden border-r border-[#E6EBF3] p-8 lg:block"><nav className="space-y-6">{items.map((item) => <Link key={item} href="/" className="block text-[15px] font-medium text-[#34405A]">{item}</Link>)}</nav><div className="mt-10 border-t border-[#E6EBF3] pt-8"><Link href="/" className="block text-[15px] font-medium text-[#34405A]">Help Center</Link><Link href="/" className="mt-6 block text-[15px] font-medium text-[#F04438]">Log out</Link></div></aside>;
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
