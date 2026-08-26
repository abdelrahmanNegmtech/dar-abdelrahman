"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { featuredProperty } from "@/app/properties/[slug]/property-data";
import { cn } from "@/lib/utils";
import { requiredRedirectForStep } from "@/app/booking/flow-guards";

type GuestInfo = {
  fullName?: string;
  email?: string;
  phone?: string;
};

type BookingPayload = {
  propertyId?: string;
  title?: string;
  location?: string;
  image?: string;
  checkIn?: string;
  checkOut?: string;
  guests?: number;
  nights?: number;
  bedrooms?: number;
  bathrooms?: number;
  area?: number;
  pricePerNight?: number;
  cleaningFee?: number;
  serviceFee?: number;
  discount?: number;
  subtotal?: number;
  total?: number;
  currency?: "EGP";
  locale?: string;
  guestInfo?: GuestInfo;
  paymentId?: string;
  bookingStatus?: "confirmed";
  confirmationNumber?: string;
};

type IconName =
  | "calendar"
  | "check"
  | "chevronDown"
  | "chevronLeft"
  | "chevronRight"
  | "copy"
  | "globe"
  | "headset"
  | "help"
  | "home"
  | "location"
  | "lock"
  | "mail"
  | "message"
  | "phone"
  | "shield"
  | "user";

const storageKey = "dar-pending-booking";
const defaultConfirmation = "DAR-25052024-4837";

function iconPath(name: IconName) {
  const paths: Record<IconName, string> = {
    calendar:
      "M7 3v3M17 3v3M4.5 8.5h15M6 5h12a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z",
    check: "m5 12 4.2 4.2L19 6.5",
    chevronDown: "m7 9 5 5 5-5",
    chevronLeft: "M14.5 5 8.5 11l6 6",
    chevronRight: "m9 6 6 6-6 6",
    copy: "M8 8h10v10H8V8Zm-2 8H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1",
    globe:
      "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM3.6 9h16.8M3.6 15h16.8M12 3c2.2 2.3 3.4 5.3 3.4 9S14.2 18.7 12 21c-2.2-2.3-3.4-5.3-3.4-9S9.8 5.3 12 3Z",
    headset:
      "M4 13a8 8 0 0 1 16 0v3a2 2 0 0 1-2 2h-2v-6h4M4 16a2 2 0 0 0 2 2h2v-6H4v4Zm8 5h2a4 4 0 0 0 4-4",
    help: "M12 18h.01M9.5 9a2.7 2.7 0 1 1 4.3 2.2c-.9.6-1.8 1.3-1.8 2.8M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Z",
    home: "M3.5 11.5 12 4l8.5 7.5M5.5 10.5V20h13v-9.5M9.5 20v-6h5v6",
    location:
      "M12 21s7-4.4 7-11a7 7 0 1 0-14 0c0 6.6 7 11 7 11Zm0-8.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z",
    lock: "M7 10V8a5 5 0 0 1 10 0v2M6 10h12v10H6V10Zm6 4v2.5",
    mail: "M4 6h16v12H4V6Zm0 1 8 6 8-6",
    message: "M5 6.5h14v9H9l-4 3v-12Z",
    phone: "M6.6 3.5 10 7l-2 2c1 2.2 2.8 4 5 5l2-2 3.5 3.4-1.2 3.1c-.3.8-1.1 1.3-2 1.1C9.1 18.4 5.6 14.9 4.4 8.7c-.2-.9.3-1.7 1.1-2l1.1-3.2Z",
    shield: "M12 3 19 6v5c0 4.8-2.9 8-7 10-4.1-2-7-5.2-7-10V6l7-3Z",
    user: "M20 21a8 8 0 0 0-16 0M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10Z",
  };

  return paths[name];
}

function Icon({ name, className }: { name: IconName; className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className={cn("h-5 w-5", className)}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
    >
      <path d={iconPath(name)} />
    </svg>
  );
}

function formatEgp(value: number) {
  return `EGP ${new Intl.NumberFormat("en-EG", { maximumFractionDigits: 0 }).format(value)}`;
}

function formatDate(value?: string, withWeekday = true) {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return value ?? "20 May 2026";
  }

  return new Intl.DateTimeFormat("en-GB", {
    weekday: withWeekday ? "short" : undefined,
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(`${value}T12:00:00`));
}

function readBooking(): Required<Pick<BookingPayload, "title" | "location" | "image" | "checkIn" | "checkOut" | "guests" | "nights" | "total" | "locale">> &
  BookingPayload {
  const fallback = {
    propertyId: featuredProperty.slug,
    title: "Luxury Studio in Madinty",
    location: "B6, Madinty",
    image: "/properties/madinty-living.png",
    checkIn: "2026-05-20",
    checkOut: "2026-05-25",
    guests: 2,
    nights: 5,
    bedrooms: 1,
    bathrooms: 1,
    area: 58,
    total: 6370,
    currency: "EGP" as const,
    locale: "en",
    guestInfo: { email: "ahmed.hassan@email.com" },
    confirmationNumber: defaultConfirmation,
    bookingStatus: "confirmed" as const,
  };

  if (typeof window === "undefined") {
    return fallback;
  }

  try {
    const parsed = JSON.parse(window.sessionStorage.getItem(storageKey) ?? "{}") as BookingPayload;
    return {
      ...fallback,
      ...parsed,
      confirmationNumber: parsed.confirmationNumber ?? defaultConfirmation,
      bookingStatus: "confirmed",
    };
  } catch {
    return fallback;
  }
}

function localizedPath(booking: BookingPayload, path: string) {
  const locale = booking.locale ?? "en";
  const currentPath = typeof window !== "undefined" ? window.location.pathname : "";
  return currentPath.startsWith(`/${locale}/`) ? `/${locale}${path}` : path;
}

function updateConfirmedBooking(booking: BookingPayload) {
  if (typeof window === "undefined") {
    return;
  }
  window.sessionStorage.setItem(storageKey, JSON.stringify({ ...booking, bookingStatus: "confirmed" }));
}

export default function BookingConfirmedPage() {
  const router = useRouter();
  const [booking] = useState(readBooking);
  const confirmationNumber = booking.confirmationNumber ?? defaultConfirmation;
  const email = booking.guestInfo?.email ?? "ahmed.hassan@email.com";

  const copyConfirmation = async () => {
    await navigator.clipboard?.writeText(confirmationNumber);
  };

  useEffect(() => {
    const redirect = requiredRedirectForStep("confirmed");
    if (redirect) router.replace(redirect);
  }, [router]);

  useEffect(() => {
    updateConfirmedBooking(booking);
  }, [booking]);

  return (
    <main className="min-h-screen bg-[#F8FAFC] p-4 text-[#080B32]">
      <div className="mx-auto min-h-[calc(100vh-32px)] max-w-[1440px] overflow-hidden rounded-[28px] border border-[#DFE6F1] bg-white shadow-[0_28px_80px_rgba(15,23,42,0.06)]">
        <Header booking={booking} />
        <div className="px-5 pb-7 pt-2 lg:px-8">
          <section className="min-w-0">
            <div className="grid items-center gap-8 xl:grid-cols-[minmax(0,1fr)_520px]">
              <SuccessIntro booking={booking} confirmationNumber={confirmationNumber} onCopy={copyConfirmation} />
              <BookingSummary booking={booking} />
            </div>
            <TrustBar />
            <div className="mt-7 grid gap-6 lg:grid-cols-[1.15fr_0.82fr_0.75fr]">
              <NextSteps email={email} />
              <ImportantInfo />
              <SupportCard />
            </div>
            <div className="mt-7 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <Link href={localizedPath(booking, "/bookings")} className="order-2 inline-flex h-14 w-full items-center justify-center gap-3 rounded-[8px] border border-[#6C4CF1] bg-white px-10 text-[16px] font-bold text-[#5F36E9] hover:bg-[#F5F2FF] sm:order-1 sm:w-auto">
                <Icon name="chevronLeft" className="h-5 w-5" />
                Back to my bookings
              </Link>
              <div className="order-1 flex flex-col gap-3 sm:order-2 sm:flex-row">
                <Link href={localizedPath(booking, "/booking/invoice")} className="inline-flex h-14 w-full items-center justify-center gap-3 rounded-[8px] border border-[#6C4CF1] bg-white px-10 text-[16px] font-bold text-[#5F36E9] hover:bg-[#F5F2FF] sm:w-auto">
                  View invoice
                </Link>
                <Link href={localizedPath(booking, "/")} className="inline-flex h-14 w-full items-center justify-center gap-3 rounded-[8px] bg-[#5F36E9] px-12 text-[16px] font-bold text-white shadow-[0_14px_30px_rgba(95,54,233,0.24)] hover:bg-[#5130D8] sm:w-auto">
                  Go to homepage
                  <Icon name="home" className="h-5 w-5" />
                </Link>
              </div>
            </div>
          </section>
        </div>
        <footer className="border-t border-[#EEF2F7] bg-[#FBFCFF] px-5 py-5 text-center">
          <p className="inline-flex items-center gap-3 text-[16px] font-bold">
            <span className="grid h-10 w-10 place-items-center rounded-full bg-[#EEE8FF] text-[#5F36E9]">
              <Icon name="shield" className="h-5 w-5" />
            </span>
            Thank you for choosing DAR
          </p>
          <p className="mt-1 text-[13px] text-[#59637C]">We hope to welcome you again soon!</p>
        </footer>
      </div>
    </main>
  );
}

function Header({ booking }: { booking: BookingPayload }) {
  return (
    <header className="flex h-[70px] items-center justify-between px-6 lg:px-8">
      <Link href={localizedPath(booking, "/")} aria-label="DAR home">
        <Image src="/dar-logo-purple-header.png" alt="DAR" width={320} height={142} className="h-[44px] w-auto object-contain" priority />
      </Link>
      <button className="hidden items-center gap-3 text-[15px] font-bold lg:inline-flex">
        <Icon name="help" className="h-5 w-5" />
        Need help?
        <Icon name="chevronDown" className="h-4 w-4" />
      </button>
      <div className="flex items-center gap-4 lg:hidden">
        <Icon name="headset" className="h-6 w-6" />
      </div>
    </header>
  );
}

function SuccessIntro({
  booking,
  confirmationNumber,
  onCopy,
}: {
  booking: BookingPayload;
  confirmationNumber: string;
  onCopy: () => void;
}) {
  return (
    <section className="flex min-h-[360px] flex-col items-center justify-center text-center">
      <SuccessMark />
      <h1 className="mt-6 text-[28px] font-black leading-tight lg:text-[34px]">Booking confirmed!</h1>
      <p className="mt-3 max-w-[520px] text-[14px] font-medium leading-6 text-[#34405A]">
        Your booking has been confirmed and payment was successful. We can&apos;t wait to welcome you.
      </p>
      <div className="mt-8 flex w-full max-w-[420px] items-center justify-between rounded-[12px] border border-[#CDEFD8] bg-[#F0FFF5] px-4 py-4 text-left shadow-[0_14px_30px_rgba(31,179,107,0.08)]">
        <span className="grid h-9 w-9 place-items-center rounded-full border border-[#22B35C] text-[#1FB36B]">
          <Icon name="check" className="h-5 w-5" />
        </span>
        <span className="min-w-0 flex-1 px-3">
          <span className="block text-[12px] text-[#34405A]">Confirmation number</span>
          <span className="block truncate text-[18px] font-black">{confirmationNumber}</span>
        </span>
        <button onClick={onCopy} aria-label="Copy confirmation number" className="grid h-9 w-9 place-items-center rounded-full bg-[#E3F7EB] text-[#111735]">
          <Icon name="copy" className="h-5 w-5" />
        </button>
      </div>
      <Link href={localizedPath(booking, "/bookings")} className="sr-only">
        View or manage
      </Link>
    </section>
  );
}

function SuccessMark() {
  return (
    <div className="relative grid h-[128px] w-[170px] place-items-center">
      {[["left-3 top-9", "#F7B883"], ["right-4 top-11", "#35B866"], ["left-8 bottom-8", "#8D6BFF"], ["right-9 bottom-7", "#F29D7E"]].map(([position, color]) => (
        <span key={position} className={cn("absolute h-2 w-2 rotate-45", position)} style={{ backgroundColor: color }} />
      ))}
      <span className="grid h-[92px] w-[92px] place-items-center rounded-full bg-[#23B957] text-white shadow-[0_22px_42px_rgba(31,179,107,0.28)]">
        <Icon name="check" className="h-14 w-14" />
      </span>
    </div>
  );
}

function BookingSummary({ booking }: { booking: BookingPayload }) {
  return (
    <section className="self-center rounded-[14px] border border-[#E0E6F0] bg-white p-6 shadow-[0_16px_38px_rgba(15,23,42,0.08)]">
      <div className="flex items-center justify-between">
        <h2 className="text-[19px] font-bold">Your booking</h2>
        <Link href={localizedPath(booking, "/bookings")} className="text-[14px] font-bold text-[#5F36E9]">
          View or manage
        </Link>
      </div>
      <div className="mt-5 flex flex-col gap-5 sm:flex-row">
        <div className="relative h-[122px] w-full shrink-0 overflow-hidden rounded-[8px] bg-[#EEF2F8] sm:w-[176px]">
          <Image src={booking.image ?? featuredProperty.images[0].src} alt={booking.title ?? featuredProperty.title} fill className="object-cover" />
        </div>
        <div className="min-w-0">
          <h3 className="text-[18px] font-bold leading-7">{booking.title}</h3>
          <p className="mt-4 flex items-center gap-2 text-[14px] text-[#34405A]">
            <Icon name="location" className="h-5 w-5" />
            {booking.location}
          </p>
        </div>
      </div>
      <div className="mt-5 border-t border-[#E6EBF3] pt-5">
        <div className="flex items-start gap-4 text-[14px] text-[#34405A]">
          <Icon name="calendar" className="mt-0.5 h-5 w-5" />
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-4">
              <span>{formatDate(booking.checkIn)}</span>
              <span>-</span>
              <span>{formatDate(booking.checkOut)}</span>
            </div>
            <p className="mt-2 text-[13px]">{booking.nights} nights</p>
          </div>
        </div>
        <div className="mt-4 flex items-start gap-4 text-[14px] text-[#34405A]">
          <Icon name="user" className="h-5 w-5" />
          <div>
            <p>{booking.guests} guests, 1 room</p>
            <p className="mt-1">Premium residence</p>
          </div>
        </div>
      </div>
      <div className="mt-5 flex justify-between border-t border-[#E6EBF3] pt-5 text-[18px] font-bold">
        <span>Total paid</span>
        <span>{formatEgp(booking.total ?? 0)}</span>
      </div>
      <p className="mt-2 text-right text-[13px] text-[#59637C]">Inclusive of VAT</p>
    </section>
  );
}

function TrustBar() {
  const items = [
    ["Best price guarantee", "You got the best available rate.", "shield"],
    ["Secure booking", "Your payment is safe and protected.", "lock"],
    ["Free cancellation", "Until 18 May 2026", "calendar"],
    ["24/7 support", "We're here to help anytime.", "headset"],
  ] as const;
  return (
    <section className="mt-6 grid gap-4 rounded-[12px] border border-[#CDEFD8] bg-[#F0FFF5] px-6 py-4 md:grid-cols-4">
      {items.map(([title, body, icon], index) => (
        <div key={title} className={cn("flex gap-4", index > 0 ? "md:border-l md:border-[#CFE8D7] md:pl-6" : "")}>
          <Icon name={icon} className="h-7 w-7 shrink-0 text-[#168A43]" />
          <div>
            <p className="text-[13px] font-bold">{title}</p>
            <p className="mt-1 text-[12px] leading-5 text-[#34405A]">{body}</p>
          </div>
        </div>
      ))}
    </section>
  );
}

function NextSteps({ email }: { email: string }) {
  const rows = [
    ["We've sent a confirmation email", `A confirmation email has been sent to ${email}`, true],
    ["Hotel will be notified", "The host will prepare everything for your stay.", true],
    ["Enjoy your stay!", "We wish you a wonderful stay.", false],
  ] as const;
  return (
    <section className="min-h-[310px] rounded-[12px] border border-[#E1E7F0] bg-white p-6 shadow-[0_14px_35px_rgba(15,23,42,0.06)]">
      <h2 className="text-[19px] font-bold">What happens next?</h2>
      <div className="mt-5 space-y-6">
        {rows.map(([title, body, active], index) => (
          <div key={title} className="relative flex gap-5">
            {index < rows.length - 1 ? <span className="absolute left-[10px] top-6 h-[calc(100%+16px)] w-px bg-[#48BE70]" /> : null}
            <span className={cn("relative z-10 mt-1 grid h-5 w-5 shrink-0 place-items-center rounded-full border", active ? "border-[#2DBE61] bg-[#2DBE61] text-white" : "border-[#98A2B3] bg-white")} />
            <div className="min-w-0">
              <p className="text-[14px] font-bold">{title}</p>
              <p className="mt-2 text-[13px] leading-5 text-[#34405A]">{body}</p>
            </div>
            {index === 0 ? <Icon name="chevronRight" className="ml-auto mt-4 h-5 w-5" /> : null}
          </div>
        ))}
      </div>
    </section>
  );
}

function ImportantInfo() {
  const staticRows = [
    ["Check-in", "From 3:00 PM", "calendar"],
    ["Check-out", "Until 12:00 PM", "calendar"],
  ] as const;
  const linkRows = [
    ["Hotel policies", "View cancellation and other policies", "shield", "/legal"],
    ["Need to make changes?", "You can modify or cancel your booking before 18 May 2026", "help", "/bookings"],
  ] as const;
  return (
    <section className="min-h-[310px] rounded-[12px] border border-[#E1E7F0] bg-white p-6 shadow-[0_14px_35px_rgba(15,23,42,0.06)]">
      <h2 className="text-[19px] font-bold">Important information</h2>
      <div className="mt-5 space-y-4">
        {staticRows.map(([title, body, icon]) => (
          <div key={title} className="flex items-start gap-4 rounded-[8px]">
            <Icon name={icon} className="mt-1 h-5 w-5 shrink-0 text-[#34405A]" />
            <span className="min-w-0 flex-1">
              <span className="block text-[14px] font-bold">{title}</span>
              <span className="mt-1 block text-[13px] leading-5 text-[#34405A]">{body}</span>
            </span>
          </div>
        ))}
        {linkRows.map(([title, body, icon, href]) => (
          <Link key={title} href={href} className="flex items-start gap-4 rounded-[8px] hover:bg-[#F8FAFC]">
            <Icon name={icon} className="mt-1 h-5 w-5 shrink-0 text-[#34405A]" />
            <span className="min-w-0 flex-1">
              <span className="block text-[14px] font-bold">{title}</span>
              <span className="mt-1 block text-[13px] leading-5 text-[#34405A]">{body}</span>
            </span>
            <Icon name="chevronRight" className="mt-4 h-5 w-5" />
          </Link>
        ))}
      </div>
    </section>
  );
}

function SupportCard() {
  return (
    <section className="min-h-[310px] rounded-[12px] bg-[#F8F4FF] p-6 shadow-[0_14px_35px_rgba(15,23,42,0.05)]">
      <div className="flex gap-5">
        <span className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-[#5F36E9] text-white">
          <Icon name="headset" className="h-7 w-7" />
        </span>
        <div>
          <h2 className="text-[19px] font-bold">Need help?</h2>
          <p className="mt-2 text-[14px] leading-6 text-[#34405A]">Our team is here to assist you</p>
        </div>
      </div>
      <div className="mt-6 space-y-3">
        <a href="https://wa.me/201001234567" className="flex h-12 items-center justify-center gap-2 rounded-[8px] border border-[#E0D7FF] bg-white text-[14px] font-bold text-[#5F36E9]">
          <Icon name="message" className="h-4 w-4" />
          Chat with us
        </a>
        <a href="tel:+201001234567" className="flex h-12 items-center justify-center gap-2 rounded-[8px] border border-[#E0D7FF] bg-white text-[14px] font-bold text-[#5F36E9]">
          <Icon name="phone" className="h-4 w-4" />
          Call us
        </a>
        <a href="mailto:support@dar.example?subject=Booking%20confirmation%20support" className="flex h-12 items-center justify-center gap-2 rounded-[8px] border border-[#E0D7FF] bg-white text-[14px] font-bold text-[#5F36E9]">
          <Icon name="mail" className="h-4 w-4" />
          Email us
        </a>
      </div>
      <p className="mt-5 text-center text-[13px] text-[#34405A]">Response time: within a few minutes</p>
    </section>
  );
}
