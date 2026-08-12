"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChangeEvent, useRef, useState } from "react";
import { featuredProperty, resultProperties } from "@/app/properties/[slug]/property-data";
import type { TravelerBooking } from "@/features/traveler/types";
import { cn } from "@/lib/utils";

type IconName =
  | "bell"
  | "calendar"
  | "check"
  | "chevronDown"
  | "chevronRight"
  | "close"
  | "copy"
  | "download"
  | "edit"
  | "file"
  | "globe"
  | "headset"
  | "help"
  | "location"
  | "mail"
  | "message"
  | "phone"
  | "shield"
  | "star"
  | "upload"
  | "user";

function iconPath(name: IconName) {
  const paths: Record<IconName, string> = {
    bell: "M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9ZM13.7 21a2 2 0 0 1-3.4 0",
    calendar: "M7 3v3M17 3v3M4.5 8.5h15M6 5h12a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z",
    check: "m5 12 4.2 4.2L19 6.5",
    chevronDown: "m7 9 5 5 5-5",
    chevronRight: "m9 6 6 6-6 6",
    close: "M6 6l12 12M18 6 6 18",
    copy: "M8 8h10v10H8V8Zm-2 8H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1",
    download: "M12 4v10m0 0 4-4m-4 4-4-4M5 18h14",
    edit: "M4 20h4L19 9l-4-4L4 16v4Zm10-14 4 4",
    file: "M7 3h7l4 4v14H7V3Zm7 0v5h5",
    globe: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM3.6 9h16.8M3.6 15h16.8M12 3c2.2 2.3 3.4 5.3 3.4 9S14.2 18.7 12 21c-2.2-2.3-3.4-5.3-3.4-9S9.8 5.3 12 3Z",
    headset: "M4 13a8 8 0 0 1 16 0v3a2 2 0 0 1-2 2h-2v-6h4M4 16a2 2 0 0 0 2 2h2v-6H4v4Zm8 5h2a4 4 0 0 0 4-4",
    help: "M12 18h.01M9.5 9a2.7 2.7 0 1 1 4.3 2.2c-.9.6-1.8 1.3-1.8 2.8M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Z",
    location: "M12 21s7-4.4 7-11a7 7 0 1 0-14 0c0 6.6 7 11 7 11Zm0-8.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z",
    mail: "M4 6h16v12H4V6Zm0 1 8 6 8-6",
    message: "M5 6.5h14v9H9l-4 3v-12Z",
    phone: "M6.6 3.5 10 7l-2 2c1 2.2 2.8 4 5 5l2-2 3.5 3.4-1.2 3.1c-.3.8-1.1 1.3-2 1.1C9.1 18.4 5.6 14.9 4.4 8.7c-.2-.9.3-1.7 1.1-2l1.1-3.2Z",
    shield: "M12 3 19 6v5c0 4.8-2.9 8-7 10-4.1-2-7-5.2-7-10V6l7-3Z",
    star: "m12 2.8 2.8 5.7 6.3.9-4.5 4.4 1.1 6.2L12 17.7 6.4 20.6l1.1-6.2L3 10l6.3-.9L12 2.8Z",
    upload: "M12 16V6m0 0L8 10m4-4 4 4M5 17v1.5A2.5 2.5 0 0 0 7.5 21h9a2.5 2.5 0 0 0 2.5-2.5V17",
    user: "M20 21a8 8 0 0 0-16 0M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10Z",
  };

  return paths[name];
}

function Icon({ name, className, filled = false }: { name: IconName; className?: string; filled?: boolean }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className={cn("h-5 w-5", className)} fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8">
      <path d={iconPath(name)} />
    </svg>
  );
}

function formatEgp(value: number) {
  return `EGP ${new Intl.NumberFormat("en-EG", { maximumFractionDigits: 0 }).format(value)}`;
}

function formatDate(value: string, withWeekday = false) {
  return new Intl.DateTimeFormat("en-GB", {
    weekday: withWeekday ? "short" : undefined,
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(`${value}T12:00:00`));
}

function initials(name: string) {
  const parts = name.trim().split(/\s+/);
  return `${parts[0]?.[0] ?? "T"}${parts[1]?.[0] ?? "R"}`.toUpperCase();
}

function downloadFile(filename: string, content: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function RequestReceivedClient({ booking }: { booking: TravelerBooking }) {
  const router = useRouter();
  const [toastOpen, setToastOpen] = useState(true);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const receiptInputRef = useRef<HTMLInputElement>(null);
  const guestName = booking.travelerFullName ?? "Traveler";
  const guestEmail = booking.travelerEmail ?? "Email unavailable";
  const guestPhone = booking.travelerPhone ?? "Phone unavailable";

  const downloadReceipt = () => {
    const receipt = [
      "DAR booking receipt",
      `Reference: ${booking.reference}`,
      `Property: ${booking.property.title}`,
      `Dates: ${formatDate(booking.checkIn)} - ${formatDate(booking.checkOut)}`,
      `Guests: ${booking.guestsCount}`,
      `Payment method: ${booking.paymentMethodLabel}`,
      `Amount: ${formatEgp(booking.totalAmount)}`,
      "Status: Pending payment verification",
    ].join("\n");
    downloadFile(`${booking.reference}-receipt.txt`, receipt, "text/plain;charset=utf-8");
  };

  const addToCalendar = () => {
    const start = booking.checkIn.replaceAll("-", "");
    const end = booking.checkOut.replaceAll("-", "");
    const ics = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//DAR//Booking//EN",
      "BEGIN:VEVENT",
      `UID:${booking.reference}@dar.local`,
      `DTSTART;VALUE=DATE:${start}`,
      `DTEND;VALUE=DATE:${end}`,
      `SUMMARY:DAR stay at ${booking.property.title}`,
      `LOCATION:${booking.property.area}, ${booking.property.city}`,
      `DESCRIPTION:Booking reference ${booking.reference}`,
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\r\n");
    downloadFile(`${booking.reference}.ics`, ics, "text/calendar;charset=utf-8");
  };

  const uploadAnotherReceipt = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploadedFileName(file.name);
    setToastOpen(true);
  };

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#F8FAFC] text-[#080B32]">
      <Header guestName={guestName} />
      <div className="mx-auto grid max-w-[1840px] gap-7 px-5 py-6 lg:px-8 xl:grid-cols-[minmax(0,1fr)_470px]">
        <section className="min-w-0 space-y-4">
          <Hero bookingReference={booking.reference} onDownloadReceipt={downloadReceipt} onViewBooking={() => router.push(`/traveler/bookings/${booking.id}`)} />
          <Timeline />
          <div className="grid gap-4 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
            <StayDetails booking={booking} onCalendar={addToCalendar} onDirections={() => window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${booking.property.area}, ${booking.property.city}`)}`, "_blank", "noopener,noreferrer")} />
            <GuestDetails email={guestEmail} guestName={guestName} phone={guestPhone} requests={booking.specialRequests} />
            <PaymentDetails booking={booking} uploadedFileName={uploadedFileName} onUpload={() => receiptInputRef.current?.click()} />
            <ImportantSteps />
            <Policies />
            <RecommendedActions booking={booking} />
          </div>
          <SuggestedStays />
        </section>

        <aside className="min-w-0 space-y-4 xl:sticky xl:top-5 xl:self-start">
          {toastOpen ? <UploadToast onClose={() => setToastOpen(false)} uploadedFileName={uploadedFileName} /> : null}
          <BookingSummary booking={booking} />
          <SupportPanel />
          <HostCard ownerName={booking.owner.name} />
          <ReferenceCard bookingReference={booking.reference} />
        </aside>
      </div>
      <input ref={receiptInputRef} type="file" className="hidden" onChange={uploadAnotherReceipt} accept="image/*,.pdf" />
    </main>
  );
}

function Header({ guestName }: { guestName: string }) {
  return (
    <header className="border-b border-[#E6EBF3] bg-white">
      <div className="mx-auto flex h-[72px] max-w-[1840px] items-center justify-between px-5 lg:px-8">
        <Link href="/" aria-label="DAR home">
          <Image src="/dar-logo-purple-header.png" alt="DAR" width={320} height={142} className="h-[43px] w-auto object-contain" priority />
        </Link>
        <div className="hidden items-center gap-2 text-[15px] font-bold md:flex">
          <Icon name="shield" className="h-5 w-5 text-[#5F36E9]" />
          Booking confirmation
        </div>
        <div className="flex items-center gap-5 text-[14px] font-semibold">
          <button className="hidden items-center gap-2 md:inline-flex"><Icon name="globe" className="h-5 w-5" />English / EGP<Icon name="chevronDown" className="h-4 w-4" /></button>
          <button className="hidden items-center gap-2 md:inline-flex"><Icon name="help" className="h-5 w-5" />Help</button>
          <button aria-label="Notifications" className="relative"><Icon name="bell" /></button>
          <div className="hidden items-center gap-3 md:flex">
            <div className="h-9 w-9 overflow-hidden rounded-full bg-[#E9E3FF]">
              <Image src="/properties/madinty-bedroom.png" alt="" width={60} height={60} className="h-full w-full object-cover" />
            </div>
            {guestName}
            <Icon name="chevronDown" className="h-4 w-4" />
          </div>
        </div>
      </div>
    </header>
  );
}

function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return <section className={cn("rounded-[12px] border border-[#E1E7F0] bg-white p-5 shadow-[0_14px_35px_rgba(15,23,42,0.06)]", className)}>{children}</section>;
}

function Hero({ bookingReference, onViewBooking, onDownloadReceipt }: { bookingReference: string; onViewBooking: () => void; onDownloadReceipt: () => void }) {
  return (
    <Card className="p-6 lg:p-8">
      <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)_250px] lg:items-center">
        <div className="flex justify-center"><div className="relative grid h-[142px] w-[142px] place-items-center rounded-full bg-[#5F36E9] text-white shadow-[0_22px_42px_rgba(95,54,233,0.25)]"><Icon name="file" className="h-20 w-20" /><span className="absolute bottom-1 right-1 grid h-14 w-14 place-items-center rounded-full border-[6px] border-white bg-[#F8FAFC] text-[#5F36E9]"><Icon name="check" className="h-8 w-8" /></span></div></div>
        <div className="min-w-0 text-center lg:text-left">
          <h1 className="text-[28px] font-black leading-tight lg:text-[34px]">Booking request received.</h1>
          <p className="mt-3 text-[15px] font-medium leading-6 text-[#34405A]">Your payment receipt is being reviewed by DAR. We will notify you once the booking is confirmed.</p>
          <div className="mt-5 flex flex-col gap-4 lg:flex-row lg:items-center">
            <span className="inline-flex h-9 items-center justify-center rounded-[8px] border border-[#F1CA82] bg-[#FFF8E9] px-4 text-[14px] font-bold text-[#B56B00]">Pending payment verification</span>
            <span className="hidden h-10 border-l border-[#DDE4F0] lg:block" />
            <div><p className="text-[12px] font-semibold text-[#667085]">Booking reference</p><p className="mt-1 flex items-center justify-center gap-2 text-[15px] font-bold lg:justify-start">{bookingReference}<Icon name="copy" className="h-4 w-4 text-[#59637C]" /></p></div>
          </div>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <button onClick={onViewBooking} className="inline-flex h-11 items-center justify-center gap-2 rounded-[7px] bg-[#5F36E9] px-5 text-[14px] font-bold text-white shadow-[0_10px_22px_rgba(95,54,233,0.22)]"><Icon name="calendar" className="h-4 w-4" />View booking</button>
            <button disabled className="inline-flex h-11 items-center justify-center gap-2 rounded-[7px] border border-[#BDAEFF] px-5 text-[14px] font-bold text-[#5F36E9] disabled:cursor-not-allowed disabled:opacity-60"><Icon name="message" className="h-4 w-4" />Message owner</button>
            <button onClick={onDownloadReceipt} className="inline-flex h-11 items-center justify-center gap-2 rounded-[7px] border border-[#D8DFEA] px-5 text-[14px] font-bold text-[#111735] hover:border-[#BFC7D6]"><Icon name="download" className="h-4 w-4" />Download receipt</button>
          </div>
        </div>
        <div className="rounded-[10px] border border-[#DDE4F0] p-5"><p className="text-[13px] font-semibold">After verification</p><p className="mt-6 flex items-center gap-2 text-[20px] font-bold text-[#188A44]"><span className="grid h-7 w-7 place-items-center rounded-full border border-[#25A55D]"><Icon name="check" className="h-4 w-4" /></span>Confirmed</p><p className="mt-3 text-[13px] leading-5 text-[#59637C]">We&apos;ll send you check-in details and booking confirmation.</p></div>
      </div>
    </Card>
  );
}

function Timeline() {
  const steps = [["1.", "Booking submitted", "Completed", true], ["2", "Payment received", "Completed", true], ["3", "DAR verification", "In progress", "active"], ["4", "Owner notified", "Pending", false], ["5", "Booking confirmed", "Pending", false]] as const;
  return <Card className="px-7 py-5"><div className="grid gap-6 md:grid-cols-5">{steps.map(([number, title, status, state], index) => <div key={title} className="relative">{index < steps.length - 1 ? <span className="absolute left-[42px] top-4 hidden h-px w-[calc(100%+12px)] bg-[#DDE4F0] md:block" /> : null}<span className={cn("relative z-10 grid h-8 w-8 place-items-center rounded-full text-[13px] font-black", state === true ? "bg-[#5F36E9] text-white" : state === "active" ? "bg-[#F7B928] text-[#080B32]" : "bg-[#E6EAF2] text-[#59637C]")}>{state === true ? <Icon name="check" className="h-4 w-4" /> : number}</span><p className="mt-3 text-[13px] font-bold">{title}</p><p className="mt-1 text-[12px] text-[#59637C]">{status}</p></div>)}</div></Card>;
}

function StayDetails({ booking, onDirections, onCalendar }: { booking: TravelerBooking; onDirections: () => void; onCalendar: () => void }) {
  return <Card><h2 className="text-[17px] font-bold">Stay details</h2><div className="mt-4 grid gap-5 md:grid-cols-[280px_minmax(0,1fr)]"><div><div className="relative h-[145px] overflow-hidden rounded-[8px] bg-[#EEF2F8]"><Image src={booking.property.imageUrl} alt={booking.property.title} fill className={cn("object-cover", booking.property.imagePosition)} /></div><div className="mt-2 grid grid-cols-5 gap-2">{featuredProperty.images.slice(0, 4).map((image) => <div key={image.src} className="relative h-12 overflow-hidden rounded-[6px]"><Image src={image.src} alt="" fill className="object-cover" /></div>)}<div className="grid h-12 place-items-center rounded-[6px] bg-[#1F1A44] text-[11px] font-bold text-white">+12 Photos</div></div></div><div className="min-w-0"><div className="flex flex-wrap items-center gap-3"><h3 className="text-[17px] font-bold">{booking.property.title}</h3><span className="rounded-[6px] border border-[#F1CA82] bg-[#FFF8E9] px-2 py-1 text-[12px] font-bold text-[#B56B00]">Verified property</span></div><p className="mt-3 flex items-center gap-2 text-[13px] text-[#34405A]"><Icon name="location" className="h-4 w-4" />{booking.property.area}, {booking.property.city}</p><div className="mt-6 grid gap-4 border-y border-[#E6EBF3] py-4 sm:grid-cols-4"><Detail label="Check-in" value={formatDate(booking.checkIn)} sub={`After ${booking.checkInTime}`} /><Detail label="Check-out" value={formatDate(booking.checkOut)} sub={`Before ${booking.checkOutTime}`} /><Detail label="Guests" value={`${booking.guestsCount} guests`} /><Detail label="Property" value={booking.property.type === "studio" ? "Studio" : "Apartment"} /></div><div className="mt-4 flex flex-wrap gap-3"><button onClick={onDirections} className="inline-flex h-10 items-center gap-2 rounded-[7px] border border-[#DDE4F0] px-5 text-[13px] font-bold"><Icon name="location" className="h-4 w-4" />Get directions</button><button onClick={onCalendar} className="inline-flex h-10 items-center gap-2 rounded-[7px] border border-[#DDE4F0] px-5 text-[13px] font-bold"><Icon name="calendar" className="h-4 w-4" />Add to calendar</button></div></div></div></Card>;
}

function GuestDetails({ email, guestName, phone, requests }: { email: string; guestName: string; phone: string; requests?: string | null }) {
  return <Card><div className="flex items-center justify-between"><h2 className="text-[17px] font-bold">Guest details</h2><Link href="/traveler/profile" className="text-[13px] font-bold text-[#5F36E9]">Edit</Link></div><div className="mt-5 flex items-center gap-4"><span className="grid h-16 w-16 place-items-center rounded-full bg-[#E8DDFF] text-[25px] font-bold text-[#5F36E9]">{initials(guestName)}</span><div><p className="text-[16px] font-bold">{guestName}</p><p className="mt-1 text-[13px] text-[#59637C]">{email} <span className="ml-3 text-[#188A44]">Email verified</span></p><p className="mt-2 text-[13px] text-[#59637C]">{phone}</p></div></div><div className="mt-6"><p className="text-[12px] font-bold text-[#34405A]">Special requests</p><div className="mt-2 rounded-[7px] border border-[#DDE4F0] bg-[#FBFCFF] p-3 text-[13px] leading-5 text-[#34405A]">{requests || "No special requests added."}</div></div><p className="mt-4 text-[12px]"><span className="rounded-[6px] bg-[#F0ECFF] px-3 py-1 font-bold text-[#4C36B7]">Not required before confirmation</span><span className="ml-2 text-[#59637C]">You can upload ID after confirmation (optional).</span></p></Card>;
}

function PaymentDetails({ booking, uploadedFileName, onUpload }: { booking: TravelerBooking; uploadedFileName: string | null; onUpload: () => void }) {
  return <Card><div className="flex items-center justify-between"><h2 className="text-[17px] font-bold">Payment details</h2><Link href="/traveler/payments" className="text-[13px] font-bold text-[#5F36E9]">Edit</Link></div><div className="mt-5 grid gap-4 border-b border-[#E6EBF3] pb-5 md:grid-cols-[1.2fr_1fr_1fr_1fr]"><div><p className="text-[12px] text-[#59637C]">Payment method</p><p className="mt-2 text-[19px] font-black text-[#5F36E9]">{booking.paymentMethodLabel}</p><span className="mt-2 inline-block rounded-[6px] bg-[#DDF7E8] px-3 py-1 text-[11px] font-bold text-[#188A44]">Popular in Egypt</span></div><Detail label="Amount paid" value={formatEgp(booking.totalAmount)} strong /><Detail label="Transaction ID" value={booking.paymentReference ?? "Manual review"} strong /><Detail label="Receipt status" value="Uploaded" sub="Pending review" strong /></div><div className="mt-4 flex flex-wrap items-center gap-5"><p className="text-[13px]"><span className="text-[#59637C]">Reference code</span><span className="ml-4 font-bold">{booking.reference}</span></p><button onClick={onUpload} className="inline-flex h-10 items-center gap-2 rounded-[7px] border border-[#8D6BFF] px-6 text-[13px] font-bold text-[#5F36E9]"><Icon name="upload" className="h-4 w-4" />Upload another receipt</button>{uploadedFileName ? <span className="text-[12px] text-[#59637C]">{uploadedFileName}</span> : null}</div></Card>;
}

function ImportantSteps() {
  const steps = ["DAR verifies payment receipt.", "Owner receives your booking request.", "You get check-in details after confirmation.", "Contact support if verification takes more than 2 hours."];
  return <Card><h2 className="text-[17px] font-bold">Important next steps</h2><div className="mt-5 space-y-4">{steps.map((step, index) => <p key={step} className="flex items-center gap-3 text-[14px] text-[#34405A]"><Icon name={index === 2 ? "mail" : index === 3 ? "headset" : "shield"} className="h-5 w-5 text-[#5F36E9]" />{step}</p>)}</div></Card>;
}

function Policies() {
  return <Card><h2 className="mb-4 flex items-center gap-2 text-[16px] font-bold"><Icon name="shield" className="h-5 w-5 text-[#5F36E9]" />Cancellation & policies</h2><p className="text-[13px] leading-6 text-[#34405A]">Cancellation terms follow the booking snapshot attached to this reservation.</p><p className="text-[13px] leading-6 text-[#34405A]">Manual payment refunds may take 1-3 business days.</p><p className="text-[13px] leading-6 text-[#34405A]">House rules: No smoking, no parties, ID required.</p></Card>;
}

function RecommendedActions({ booking }: { booking: TravelerBooking }) {
  const actions = [["Complete your profile", "/traveler/profile", "user"], ["Add your arrival time", `/traveler/bookings/${booking.id}`, "calendar"], ["Save owner contact", "/traveler/messages", "phone"], ["Explore nearby stays", `/properties/${booking.property.id}`, "shield"]] as const;
  return <Card><h2 className="text-[17px] font-bold">Recommended actions</h2><div className="mt-4 grid gap-3 md:grid-cols-4">{actions.map(([label, href, icon]) => <Link key={label} href={href} className="flex min-h-[74px] items-center justify-between rounded-[9px] bg-[#F8FAFC] px-4 text-[13px] font-bold hover:bg-[#F2F5FB]"><span className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-full bg-[#EEE8FF] text-[#5F36E9]"><Icon name={icon} className="h-5 w-5" /></span>{label}</span><Icon name="chevronRight" className="h-4 w-4" /></Link>)}</div></Card>;
}

function BookingSummary({ booking }: { booking: TravelerBooking }) {
  return <Card className="p-6"><h2 className="text-[18px] font-bold">Booking summary</h2><div className="mt-5 flex gap-4"><div className="relative h-[118px] w-[142px] shrink-0 overflow-hidden rounded-[8px]"><Image src={booking.property.imageUrl} alt={booking.property.title} fill className={cn("object-cover", booking.property.imagePosition)} /></div><div><h3 className="text-[16px] font-bold">{booking.property.title}</h3><p className="mt-2 text-[13px] text-[#59637C]">{booking.property.area}, {booking.property.city}</p><p className="mt-2 flex items-center gap-1 text-[13px]"><Icon name="star" filled className="h-4 w-4 text-[#F5A400]" />4.9 (32 reviews)</p><span className="mt-2 inline-block rounded-[6px] border border-[#F1CA82] bg-[#FFF8E9] px-2 py-1 text-[12px] font-bold text-[#B56B00]">Verified property</span></div></div><div className="mt-6 space-y-4 border-b border-[#E6EBF3] pb-5 text-[15px]"><PriceLine label={`${formatEgp(booking.property.pricePerNight)} x ${booking.nightsCount} nights`} value={formatEgp(booking.subtotal)} /><PriceLine label="Cleaning fee" value={formatEgp(booking.cleaningFee)} /><PriceLine label="DAR service fee" value={formatEgp(booking.serviceFee)} /></div><div className="mt-5 flex items-end justify-between"><div><p className="text-[18px] font-bold">Total</p><p className="mt-1 text-[12px] text-[#59637C]">Including taxes and fees</p></div><p className="text-[26px] font-black text-[#5F36E9]">{formatEgp(booking.totalAmount)}</p></div></Card>;
}

function SupportPanel() {
  return <Card><h2 className="text-[18px] font-bold">Need help with your booking?</h2><p className="mt-2 text-[13px] text-[#59637C]">DAR support available 24/7.</p><div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-2"><a href="mailto:support@dar.example?subject=Booking%20support" className="inline-flex h-12 items-center justify-center gap-2 rounded-[7px] bg-[#5F36E9] text-[14px] font-bold text-white"><Icon name="headset" className="h-5 w-5" />Contact support</a><a href="https://wa.me/201001234567" target="_blank" rel="noreferrer" className="inline-flex h-12 items-center justify-center gap-2 rounded-[7px] border border-[#26A65B] text-[14px] font-bold text-[#188A44]">WhatsApp support</a></div></Card>;
}

function HostCard({ ownerName }: { ownerName: string }) {
  return <Card><h2 className="text-[18px] font-bold">Hosted by</h2><div className="mt-5 flex items-center gap-4"><div className="relative h-16 w-16 overflow-hidden rounded-full bg-[#E9E3FF]"><Image src="/properties/madinty-bedroom.png" alt={ownerName} fill className="object-cover" /></div><div><p className="text-[17px] font-bold">{ownerName} <span className="ml-2 rounded-[6px] border border-[#F1CA82] bg-[#FFF8E9] px-2 py-1 text-[12px] text-[#B56B00]">Verified Owner</span></p><p className="mt-2 text-[13px] text-[#59637C]">Typically responds within 20 minutes</p></div></div><button disabled className="mt-6 h-12 w-full rounded-[7px] border border-[#DDE4F0] bg-[#F8FAFC] text-[14px] font-bold text-[#98A2B3]">Message owner</button><p className="mt-3 text-center text-[12px] text-[#98A2B3]">You can message after confirmation.</p></Card>;
}

function ReferenceCard({ bookingReference }: { bookingReference: string }) {
  return <Card><h2 className="text-[18px] font-bold">Booking reference</h2><p className="mt-4 text-[12px] text-[#59637C]">Show this at check-in after confirmation</p><div className="mt-5 flex items-center justify-between gap-4"><p className="text-[23px] font-black">{bookingReference}</p><span className="grid h-10 w-10 place-items-center rounded-[7px] border border-[#DDE4F0]"><Icon name="copy" className="h-5 w-5" /></span></div><div className="mt-5 grid h-[132px] w-[132px] grid-cols-5 gap-1 rounded-[8px] border border-[#8D6BFF] bg-white p-2">{Array.from({ length: 25 }).map((_, index) => <span key={index} className={cn("rounded-[2px]", [0, 1, 3, 5, 6, 8, 10, 12, 14, 16, 18, 19, 20, 22, 24].includes(index) ? "bg-[#080B32]" : "bg-[#F2EEFF]")} />)}</div></Card>;
}

function UploadToast({ onClose, uploadedFileName }: { onClose: () => void; uploadedFileName: string | null }) {
  return <div className="flex items-start gap-4 rounded-[10px] border border-[#BDE8CB] bg-white p-4 shadow-[0_15px_35px_rgba(15,23,42,0.08)]"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#24A95A] text-white"><Icon name="check" className="h-5 w-5" /></span><div className="min-w-0 flex-1"><p className="text-[15px] font-bold">Receipt uploaded successfully.</p><p className="mt-1 text-[13px] text-[#59637C]">{uploadedFileName ? `${uploadedFileName} attached for review.` : "Verification is in progress."}</p></div><button onClick={onClose} aria-label="Close upload notification"><Icon name="close" className="h-5 w-5" /></button></div>;
}

function SuggestedStays() {
  return <section className="pt-2"><h2 className="mb-3 text-[18px] font-bold">You may also like for your next trip</h2><div className="grid gap-4 md:grid-cols-3">{resultProperties.slice(0, 3).map((property) => <Link key={property.slug} href={`/properties/${property.slug}`} className="grid overflow-hidden rounded-[10px] border border-[#E1E7F0] bg-white shadow-[0_12px_26px_rgba(15,23,42,0.05)] md:grid-cols-[180px_minmax(0,1fr)]"><div className="relative h-[130px] md:h-full"><Image src={property.image} alt={property.title} fill className="object-cover" /></div><div className="p-4"><p className="text-[13px] font-bold">{property.location}</p><h3 className="mt-2 text-[15px] font-bold">{property.title}</h3><p className="mt-4 flex items-center justify-between text-[13px]"><span>From {formatEgp(property.pricePerNight)} / night</span><span className="flex items-center gap-1 text-[#34405A]"><Icon name="star" filled className="h-4 w-4 text-[#F5A400]" /> {property.rating}</span></p></div></Link>)}</div></section>;
}

function Detail({ label, value, sub, strong = false }: { label: string; value: string; sub?: string; strong?: boolean }) {
  return <div><p className="text-[12px] font-medium text-[#59637C]">{label}</p><p className={cn("mt-2 text-[13px]", strong ? "text-[18px] font-black text-[#5F36E9]" : "font-bold text-[#111735]")}>{value}</p>{sub ? <p className="mt-1 text-[12px] text-[#59637C]">{sub}</p> : null}</div>;
}

function PriceLine({ label, value }: { label: string; value: string }) {
  return <div className="flex justify-between gap-4"><span className="text-[#34405A]">{label}</span><span className="font-semibold text-[#111735]">{value}</span></div>;
}
