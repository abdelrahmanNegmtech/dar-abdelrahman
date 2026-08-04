"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { featuredProperty } from "@/app/properties/[slug]/property-data";
import { cn } from "@/lib/utils";
import { isHotelBooking, requiredRedirectForStep } from "@/app/booking/flow-guards";

type BookingStatus = "awaiting_payment" | "payment_pending" | "payment_failed" | "confirmed" | "cancelled";

type BookingPayload = {
  propertyId: string;
  title: string;
  location: string;
  image: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  nights: number;
  bedrooms?: number;
  bathrooms?: number;
  area?: number;
  pricePerNight: number;
  cleaningFee: number;
  serviceFee: number;
  discount: number;
  subtotal: number;
  total: number;
  currency: "EGP";
  locale: string;
  paymentMethod?: string;
  paymentId?: string;
  bookingStatus?: BookingStatus;
  failureReason?: string;
};

type IconName =
  | "bank"
  | "calendar"
  | "card"
  | "chevronLeft"
  | "chevronRight"
  | "close"
  | "headset"
  | "help"
  | "location"
  | "menu"
  | "refresh"
  | "user";

const storageKey = "dar-pending-booking";

function iconPath(name: IconName) {
  const paths: Record<IconName, string> = {
    bank: "M4 19h16M6 17V9m4 8V9m4 8V9m4 8V9M3 7l9-4 9 4H3Z",
    calendar:
      "M7 3v3M17 3v3M4.5 8.5h15M6 5h12a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z",
    card: "M4 7.5h16v9A2.5 2.5 0 0 1 17.5 19h-11A2.5 2.5 0 0 1 4 16.5v-9ZM4 10h16M7 15h4",
    chevronLeft: "M14.5 5 8.5 11l6 6",
    chevronRight: "m9 6 6 6-6 6",
    close: "M6 6l12 12M18 6 6 18",
    headset:
      "M4 13a8 8 0 0 1 16 0v3a2 2 0 0 1-2 2h-2v-6h4M4 16a2 2 0 0 0 2 2h2v-6H4v4Zm8 5h2a4 4 0 0 0 4-4",
    help: "M12 18h.01M9.5 9a2.7 2.7 0 1 1 4.3 2.2c-.9.6-1.8 1.3-1.8 2.8M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Z",
    location:
      "M12 21s7-4.4 7-11a7 7 0 1 0-14 0c0 6.6 7 11 7 11Zm0-8.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z",
    menu: "M4 7h16M4 12h16M4 17h16",
    refresh: "M20 12a8 8 0 0 1-14.8 4.2M4 12A8 8 0 0 1 18.8 7.8M18 3v5h-5M6 21v-5h5",
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

function formatDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return value;
  }

  return new Intl.DateTimeFormat("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(`${value}T12:00:00`));
}

function readBooking(): BookingPayload {
  const subtotal = 3200 * 2;
  const fallback: BookingPayload = {
    propertyId: featuredProperty.slug,
    title: featuredProperty.title,
    location: featuredProperty.location,
    image: featuredProperty.images[0].src,
    checkIn: "2026-05-20",
    checkOut: "2026-05-22",
    guests: 2,
    nights: 2,
    bedrooms: featuredProperty.bedrooms,
    bathrooms: featuredProperty.bathrooms,
    area: featuredProperty.area,
    pricePerNight: 3200,
    cleaningFee: 0,
    serviceFee: 800,
    discount: 0,
    subtotal,
    total: subtotal + 800,
    currency: "EGP",
    locale: "en",
    paymentMethod: "card",
    paymentId: "#PAY-784512",
    bookingStatus: "payment_failed",
    failureReason: "payment_declined",
  };

  if (typeof window === "undefined") {
    return fallback;
  }

  try {
    const raw = window.sessionStorage.getItem(storageKey);
    if (!raw) {
      return fallback;
    }

    const parsed = JSON.parse(raw) as Partial<BookingPayload>;
    const subtotal =
      parsed.subtotal ?? (parsed.pricePerNight ?? fallback.pricePerNight) * (parsed.nights ?? fallback.nights);
    const serviceFee = parsed.serviceFee ?? fallback.serviceFee;
    const cleaningFee = parsed.cleaningFee ?? fallback.cleaningFee;
    const discount = parsed.discount ?? fallback.discount;

    return {
      ...fallback,
      ...parsed,
      subtotal,
      serviceFee,
      cleaningFee,
      discount,
      total: parsed.total ?? subtotal + cleaningFee + serviceFee - discount,
      bookingStatus: "payment_failed",
    };
  } catch {
    return fallback;
  }
}

function writeBooking(booking: BookingPayload) {
  window.sessionStorage.setItem(storageKey, JSON.stringify(booking));
}

function bookingQuery(booking: BookingPayload) {
  return new URLSearchParams({
    property: booking.propertyId,
    checkIn: booking.checkIn,
    checkOut: booking.checkOut,
    guests: String(booking.guests),
    nights: String(booking.nights),
    locale: booking.locale,
  }).toString();
}

function localizedPath(booking: BookingPayload, path: string) {
  const currentPath = typeof window !== "undefined" ? window.location.pathname : "";
  return currentPath.startsWith(`/${booking.locale}/`) ? `/${booking.locale}${path}` : path;
}

export default function PaymentFailedPage() {
  const router = useRouter();
  const [booking] = useState(readBooking);

  useEffect(() => {
    const redirect = requiredRedirectForStep("failed");
    if (redirect) router.replace(redirect);
  }, [router]);

  const goToPayment = (changeMethod = false) => {
    const retryBooking = {
      ...booking,
      bookingStatus: "awaiting_payment" as BookingStatus,
      failureReason: undefined,
    };
    writeBooking(retryBooking);
    const params = bookingQuery(retryBooking);
    const path = changeMethod
      ? localizedPath(retryBooking, isHotelBooking(retryBooking) ? "/booking/hotel/payment" : "/booking")
      : localizedPath(retryBooking, "/checkout");
    const query = changeMethod ? `changePayment=1&${params}` : `retry=1&${params}`;
    const hash = changeMethod ? "#payment-method" : "";
    router.push(`${path}?${query}${hash}`);
  };

  return (
    <main className="min-h-screen bg-[#F8FAFC] p-4 text-[#080B32]">
      <div className="mx-auto min-h-[calc(100vh-32px)] max-w-[1440px] rounded-[28px] border border-[#DFE6F1] bg-white shadow-[0_28px_80px_rgba(15,23,42,0.06)]">
        <header className="flex h-[74px] items-center justify-between px-6 lg:px-8">
          <Link href="/" aria-label="DAR home">
            <Image
              src="/dar-logo-purple-header.png"
              alt="DAR"
              width={320}
              height={142}
              className="h-[48px] w-auto object-contain"
              priority
            />
          </Link>
          <button className="hidden items-center gap-3 text-[15px] font-bold lg:inline-flex">
            <Icon name="help" className="h-5 w-5" />
            Need help?
            <span aria-hidden="true">⌄</span>
          </button>
          <button className="lg:hidden" aria-label="Open menu">
            <Icon name="menu" className="h-6 w-6" />
          </button>
        </header>

        <div className="grid min-w-0 gap-8 px-5 pb-8 pt-2 lg:grid-cols-[minmax(0,1fr)_420px] lg:px-24 lg:pb-24 lg:pt-10">
          <section className="mx-auto min-w-0 max-w-full text-center lg:max-w-[710px]">
            <FailedMark />
            <h1 className="mt-7 break-words text-[28px] font-black leading-tight sm:text-[32px]">Payment failed</h1>
            <p className="mx-auto mt-4 max-w-[500px] break-words text-[15px] font-medium leading-6 text-[#34405A]">
              We couldn&apos;t process your payment. Please review your payment details and try again.
            </p>

            <div className="mx-auto mt-9 flex max-w-[610px] items-center gap-4 rounded-[10px] border border-[#F4CACA] bg-[#FFF0F0] px-6 py-5 text-left">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#EF4444] text-[24px] font-black text-white">
                !
              </span>
              <div>
                <h2 className="text-[15px] font-bold">Your payment was not completed</h2>
                <p className="mt-2 text-[14px] text-[#34405A]">No amount has been deducted from your account.</p>
              </div>
            </div>

            <RecoveryCard onBack={() => goToPayment(false)} onDifferent={() => goToPayment(true)} />

            <div className="mx-auto mt-9 grid max-w-[680px] gap-5 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => goToPayment(false)}
                className="inline-flex h-14 items-center justify-center gap-3 rounded-[8px] border border-[#6C4CF1] bg-white text-[16px] font-bold text-[#5F36E9] hover:bg-[#F5F2FF]"
              >
                <Icon name="chevronLeft" className="h-5 w-5" />
                Back to payment
              </button>
              <button
                type="button"
                onClick={() => goToPayment(false)}
                className="inline-flex h-14 items-center justify-center gap-3 rounded-[8px] bg-[#5F36E9] text-[16px] font-bold text-white shadow-[0_14px_30px_rgba(95,54,233,0.24)] hover:bg-[#5130D8]"
              >
                Try again
                <Icon name="refresh" className="h-5 w-5" />
              </button>
            </div>
          </section>

          <aside className="min-w-0 space-y-5">
            <BookingSummary booking={booking} />
            <SupportCard />
          </aside>
        </div>
      </div>
    </main>
  );
}

function FailedMark() {
  return (
    <div className="relative mx-auto mt-12 grid h-[156px] w-[220px] place-items-center">
      <span className="absolute left-0 top-20 h-5 w-16 rounded-full bg-[#FAD7D7]" />
      <span className="absolute right-2 top-10 h-5 w-10 rounded-full bg-[#FAD7D7]" />
      <span className="absolute inset-x-8 h-[132px] w-[132px] rounded-full border-2 border-[#FFC8C8]" />
      <span className="grid h-[104px] w-[104px] place-items-center rounded-full bg-[#EF4444] text-white shadow-[0_18px_35px_rgba(239,68,68,0.28)]">
        <Icon name="close" className="h-16 w-16" />
      </span>
    </div>
  );
}

function RecoveryCard({
  onBack,
  onDifferent,
}: {
  onBack: () => void;
  onDifferent: () => void;
}) {
  const rows = [
    {
      icon: "card" as IconName,
      title: "Check your card details and try again",
      body: "Make sure your card number, expiry date, and CVV are correct.",
      action: onBack,
    },
    {
      icon: "card" as IconName,
      title: "Try a different payment method",
      body: "You can try another card or choose a different payment option.",
      action: onDifferent,
    },
    {
      icon: "bank" as IconName,
      title: "Contact your bank",
      body: "If the issue persists, please contact your bank for assistance.",
      action: () => undefined,
    },
  ];

  return (
    <section className="mx-auto mt-8 max-w-[705px] rounded-[12px] border border-[#E6EBF3] bg-white p-7 text-left shadow-[0_16px_36px_rgba(15,23,42,0.07)]">
      <h2 className="flex items-center gap-4 text-[18px] font-bold">
        <span className="grid h-11 w-11 place-items-center rounded-full bg-[#FFE7E7] text-[#EF4444]">!</span>
        What can you do?
      </h2>
      <div className="mt-5 space-y-2">
        {rows.map((row) => (
          <button
            key={row.title}
            type="button"
            onClick={row.action}
            className="flex w-full items-center gap-5 rounded-[10px] px-3 py-4 text-left hover:bg-[#F8FAFC]"
          >
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-[#F4F1FF] text-[#080B32]">
              <Icon name={row.icon} className="h-6 w-6" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[15px] font-bold">{row.title}</span>
              <span className="mt-2 block text-[13px] leading-5 text-[#59637C]">{row.body}</span>
            </span>
            <Icon name="chevronRight" className="h-5 w-5 text-[#080B32]" />
          </button>
        ))}
      </div>
    </section>
  );
}

function BookingSummary({ booking }: { booking: BookingPayload }) {
  return (
    <section className="rounded-[14px] border border-[#E0E6F0] bg-white p-6 shadow-[0_16px_38px_rgba(15,23,42,0.08)]">
      <h2 className="text-[19px] font-bold">Your booking</h2>
      <div className="mt-7 flex min-w-0 flex-col gap-5 sm:flex-row">
        <div className="relative h-[118px] w-full shrink-0 overflow-hidden rounded-[8px] bg-[#EEF2F8] sm:w-[160px]">
          <Image src={booking.image} alt={booking.title} fill className="object-cover" />
        </div>
        <div className="min-w-0">
          <h3 className="break-words text-[18px] font-bold leading-7">{booking.title}</h3>
          <p className="mt-5 flex items-center gap-2 text-[14px] text-[#34405A]">
            <Icon name="location" className="h-5 w-5" />
            {booking.location}
          </p>
        </div>
      </div>
      <div className="mt-6 border-t border-[#E6EBF3] pt-5">
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
        <div className="mt-6 flex items-center gap-4 text-[14px] text-[#34405A]">
          <Icon name="user" className="h-5 w-5" />
          {booking.guests} guests, 1 room
        </div>
      </div>
      <div className="mt-6 border-t border-[#E6EBF3] pt-6">
        <h3 className="text-[15px] font-bold">Room details</h3>
        <div className="mt-5 flex items-center justify-between">
          <p className="font-bold">Premium residence</p>
          <p className="font-semibold">{formatEgp(booking.pricePerNight)} / night</p>
        </div>
        <div className="mt-5 grid gap-3 text-[13px] text-[#34405A] sm:grid-cols-3">
          <span>{booking.area ?? 120} m²</span>
          <span>King bed</span>
          <span>Community view</span>
        </div>
        <p className="mt-6 text-[15px] font-semibold text-[#0F9F3E]">Free cancellation until 18 May 2026</p>
      </div>
      <div className="mt-6 space-y-4 border-t border-[#E6EBF3] pt-6 text-[15px]">
        <PriceLine label={`${formatEgp(booking.pricePerNight)} x ${booking.nights} nights`} value={formatEgp(booking.subtotal)} />
        <PriceLine label="Taxes and fees" value={formatEgp(booking.cleaningFee + booking.serviceFee - booking.discount)} />
      </div>
      <div className="mt-6 flex justify-between border-t border-[#E6EBF3] pt-6 text-[18px] font-bold">
        <span>Total</span>
        <span>{formatEgp(booking.total)}</span>
      </div>
      <p className="mt-2 text-right text-[13px] text-[#59637C]">Inclusive of VAT</p>
    </section>
  );
}

function PriceLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 text-[#34405A]">
      <span>{label}</span>
      <span className="font-semibold text-[#111735]">{value}</span>
    </div>
  );
}

function SupportCard() {
  return (
    <section className="rounded-[12px] bg-[#F8F4FF] p-6">
      <div className="flex gap-5">
        <span className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-[#5F36E9] text-white">
          <Icon name="headset" className="h-7 w-7" />
        </span>
        <div>
          <h2 className="text-[17px] font-bold">Need help?</h2>
          <p className="mt-2 text-[14px] leading-6 text-[#34405A]">Our team is here to help you complete your booking.</p>
          <button className="mt-5 h-11 rounded-[7px] border border-[#5F36E9] bg-white px-8 text-[14px] font-bold text-[#5F36E9]">
            Contact support
          </button>
        </div>
      </div>
    </section>
  );
}
