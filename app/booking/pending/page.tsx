"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { featuredProperty } from "@/app/properties/[slug]/property-data";
import { cn } from "@/lib/utils";
import { requiredRedirectForStep } from "@/app/booking/flow-guards";

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
  paymentSubmitted?: boolean;
  bookingStatus?: BookingStatus;
  paymentSubmittedAt?: string;
  failureReason?: string;
  guestInfo?: { fullName?: string; email?: string };
  cancellation?: {
    reason?: string;
    number?: string;
    cancelledAt?: string;
    cancelledBy?: string;
    refundStatus?: "processing" | "completed" | "failed" | "not_eligible";
    refundMethod?: string;
    refundTimeline?: string;
  };
};

type IconName =
  | "bell"
  | "calendar"
  | "card"
  | "check"
  | "chevronLeft"
  | "clock"
  | "close"
  | "heart"
  | "headset"
  | "home"
  | "menu"
  | "message"
  | "settings"
  | "shield"
  | "star"
  | "timer"
  | "user"
  | "wallet";

const storageKey = "dar-pending-booking";
const verificationKey = "dar-payment-verification-status";
const expiresInSeconds = 15 * 60;

function iconPath(name: IconName) {
  const paths: Record<IconName, string> = {
    bell: "M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9ZM13.7 21a2 2 0 0 1-3.4 0",
    calendar:
      "M7 3v3M17 3v3M4.5 8.5h15M6 5h12a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z",
    card: "M4 7.5h16v9A2.5 2.5 0 0 1 17.5 19h-11A2.5 2.5 0 0 1 4 16.5v-9ZM4 10h16M7 15h4",
    check: "m5 12 4.2 4.2L19 6.5",
    chevronLeft: "M14.5 5 8.5 11l6 6",
    clock: "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Zm0-15v6l4 2",
    close: "M6 6l12 12M18 6 6 18",
    heart: "M12 20.2s-6.8-4.4-9.4-8.3C.3 8.4 2.3 4.5 6.2 4.5c2 0 3.5 1 4.4 2.3.9-1.3 2.4-2.3 4.4-2.3 3.9 0 5.9 3.9 3.6 7.4-2.6 3.9-9.4 8.3-9.4 8.3Z",
    headset:
      "M4 13a8 8 0 0 1 16 0v3a2 2 0 0 1-2 2h-2v-6h4M4 16a2 2 0 0 0 2 2h2v-6H4v4Zm8 5h2a4 4 0 0 0 4-4",
    home: "M3.5 11.5 12 4l8.5 7.5M5.5 10.5V20h13v-9.5M9.5 20v-6h5v6",
    menu: "M4 7h16M4 12h16M4 17h16",
    message: "M5 6.5h14v9H9l-4 3v-12Z",
    settings:
      "M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7ZM19.4 15a1.8 1.8 0 0 0 .4 2l.1.1-2 3.5-.2-.1a1.8 1.8 0 0 0-2 .4l-.1.1h-4l-.1-.1a1.8 1.8 0 0 0-2-.4l-.2.1-2-3.5.1-.1a1.8 1.8 0 0 0 .4-2v-.1l-2.2-1.2v-3.4L7.8 9v-.1a1.8 1.8 0 0 0-.4-2l-.1-.1 2-3.5.2.1a1.8 1.8 0 0 0 2-.4l.1-.1h4l.1.1a1.8 1.8 0 0 0 2 .4l.2-.1 2 3.5-.1.1a1.8 1.8 0 0 0-.4 2V9l2.2 1.3v3.4L19.4 15Z",
    shield: "M12 3 19 6v5c0 4.8-2.9 8-7 10-4.1-2-7-5.2-7-10V6l7-3Z",
    star: "m12 2.8 2.8 5.7 6.3.9-4.5 4.4 1.1 6.2L12 17.7 6.4 20.6l1.1-6.2L3 10l6.3-.9L12 2.8Z",
    timer: "M10 2h4M12 14V8m0 14a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm4.5-13.5 1.5-1.5",
    user: "M20 21a8 8 0 0 0-16 0M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10Z",
    wallet: "M4 7h15a2 2 0 0 1 2 2v9H6a3 3 0 0 1-3-3V6a3 3 0 0 0 3 3h15M16 14h.01",
  };

  return paths[name];
}

function Icon({ name, className, filled = false }: { name: IconName; className?: string; filled?: boolean }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className={cn("h-5 w-5", className)}
      fill={filled ? "currentColor" : "none"}
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
  const subtotal = 2500 * 5;
  const fallback: BookingPayload = {
    propertyId: featuredProperty.slug,
    title: featuredProperty.title,
    location: featuredProperty.location,
    image: featuredProperty.images[0].src,
    checkIn: "2026-05-20",
    checkOut: "2026-05-25",
    guests: 4,
    nights: 5,
    bedrooms: featuredProperty.bedrooms,
    bathrooms: featuredProperty.bathrooms,
    area: featuredProperty.area,
    pricePerNight: 2500,
    cleaningFee: 500,
    serviceFee: 625,
    discount: 0,
    subtotal,
    total: subtotal + 500 + 625,
    currency: "EGP",
    locale: "en",
    paymentMethod: "card",
    paymentId: "#PAY-784512",
    paymentSubmitted: false,
    bookingStatus: "awaiting_payment",
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
    const parsedSubtotal =
      parsed.subtotal ?? (parsed.pricePerNight ?? fallback.pricePerNight) * (parsed.nights ?? fallback.nights);
    const cleaningFee = parsed.cleaningFee ?? fallback.cleaningFee;
    const serviceFee = parsed.serviceFee ?? fallback.serviceFee;
    const discount = parsed.discount ?? fallback.discount;

    return {
      ...fallback,
      ...parsed,
      bedrooms: parsed.bedrooms ?? fallback.bedrooms,
      bathrooms: parsed.bathrooms ?? fallback.bathrooms,
      area: parsed.area ?? fallback.area,
      subtotal: parsedSubtotal,
      cleaningFee,
      serviceFee,
      discount,
      total: parsed.total ?? parsedSubtotal + cleaningFee + serviceFee - discount,
      paymentId: parsed.paymentId ?? fallback.paymentId,
      bookingStatus: parsed.bookingStatus ?? fallback.bookingStatus,
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

function countdownText(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return {
    minutes: String(minutes).padStart(2, "0"),
    seconds: String(remainingSeconds).padStart(2, "0"),
  };
}

function paymentLabel(method?: string) {
  const labels: Record<string, string> = {
    card: "Mastercard",
    instapay: "InstaPay",
    vodafone: "Vodafone Cash",
    bank: "Bank transfer",
    fawry: "Fawry",
    arrival: "Pay on arrival",
    wallet: "Wallets",
    hotel: "Pay at hotel",
  };

  return labels[method ?? "card"] ?? "Mastercard";
}

export default function PaymentPendingPage() {
  const router = useRouter();
  const [booking, setBooking] = useState(readBooking);
  const [remaining, setRemaining] = useState(expiresInSeconds);
  const [isCancelled, setIsCancelled] = useState(false);

  const isSubmitted = booking.paymentSubmitted || booking.bookingStatus === "payment_pending";
  const time = countdownText(remaining);

  useEffect(() => {
    const redirect = requiredRedirectForStep("pending");
    if (redirect) router.replace(redirect);
  }, [router]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setRemaining((current) => Math.max(0, current - 1));
    }, 1000);

    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const checkVerification = () => {
      const verificationStatus = window.localStorage.getItem(verificationKey);
      if (verificationStatus === "confirmed") {
        const confirmedBooking = {
          ...booking,
          bookingStatus: "confirmed" as BookingStatus,
        };
        writeBooking(confirmedBooking);
        router.push(`${localizedPath(confirmedBooking, "/booking/confirmed")}?${bookingQuery(confirmedBooking)}`);
      }
      if (["failed", "declined", "error", "expired"].includes(verificationStatus ?? "")) {
        const failedBooking = {
          ...booking,
          bookingStatus: "payment_failed" as BookingStatus,
          failureReason: verificationStatus ?? "payment_failed",
        };
        writeBooking(failedBooking);
        router.push(`${localizedPath(failedBooking, "/booking/failed")}?${bookingQuery(failedBooking)}`);
      }
    };

    checkVerification();
    const interval = window.setInterval(checkVerification, 2500);
    window.addEventListener("storage", checkVerification);

    return () => {
      window.clearInterval(interval);
      window.removeEventListener("storage", checkVerification);
    };
  }, [booking, router]);

  useEffect(() => {
    if (remaining !== 0 || booking.bookingStatus === "confirmed" || booking.bookingStatus === "cancelled") {
      return;
    }

    const failedBooking = {
      ...booking,
      bookingStatus: "payment_failed" as BookingStatus,
      failureReason: "expired",
    };
    writeBooking(failedBooking);
    router.push(`${localizedPath(failedBooking, "/booking/failed")}?${bookingQuery(failedBooking)}`);
  }, [remaining, booking, router]);

  const completePayment = () => {
    const nextBooking = {
      ...booking,
      bookingStatus: "payment_pending" as BookingStatus,
      paymentSubmitted: true,
      paymentSubmittedAt: new Date().toISOString(),
    };
    setBooking(nextBooking);
    writeBooking(nextBooking);
  };

  const cancelBooking = () => {
    const cancelledAt = new Date();
    const cancellationNumber = `CAN-${new Intl.DateTimeFormat("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
      .format(cancelledAt)
      .replace(/\//g, "")}-4837`;
    const nextBooking = {
      ...booking,
      bookingStatus: "cancelled" as BookingStatus,
      cancellation: {
        ...booking.cancellation,
        reason: booking.cancellation?.reason ?? "Cancelled by guest",
        number: booking.cancellation?.number ?? cancellationNumber,
        cancelledAt: booking.cancellation?.cancelledAt ?? cancelledAt.toISOString(),
        cancelledBy: booking.cancellation?.cancelledBy ?? booking.guestInfo?.fullName ?? "Guest",
        refundStatus: booking.cancellation?.refundStatus ?? "processing",
        refundMethod: booking.cancellation?.refundMethod ?? paymentLabel(booking.paymentMethod),
        refundTimeline: booking.cancellation?.refundTimeline ?? "Within 5-7 business days",
      },
    };
    setIsCancelled(true);
    setBooking(nextBooking);
    writeBooking(nextBooking);
    router.push(`${localizedPath(nextBooking, "/booking/cancelled")}?${bookingQuery(nextBooking)}`);
  };

  return (
    <main className="min-h-screen bg-[#F8FAFC] text-[#080B32]">
      <div className="mx-auto grid min-h-screen max-w-[1840px] bg-white shadow-[0_28px_80px_rgba(15,23,42,0.06)] xl:grid-cols-[280px_minmax(0,1fr)] xl:my-4 xl:rounded-[28px]">
        <DesktopSidebar />
        <section className="min-w-0">
          <TopBar />
          <div className="grid gap-7 px-5 py-6 lg:px-9 xl:grid-cols-[minmax(0,1fr)_330px]">
            <div className="min-w-0">
              <Link
                href="/"
                className="inline-flex items-center gap-2 text-[15px] font-bold text-[#5F36E9]"
              >
                <Icon name="chevronLeft" className="h-4 w-4" />
                Back to bookings
              </Link>

              <section className="mt-7 flex items-start gap-5">
                <StatusClock />
                <div>
                  <h1 className="text-[30px] font-black leading-tight">Payment pending</h1>
                  <p className="mt-3 max-w-[640px] text-[15px] font-medium leading-6 text-[#34405A]">
                    {isSubmitted
                      ? "We're reviewing your submitted payment. You'll receive a confirmation once it is verified."
                      : "We're waiting for your payment to confirm your booking. Complete the payment within the time below to secure your reservation."}
                  </p>
                </div>
              </section>

              <CountdownCard time={time} isSubmitted={Boolean(isSubmitted)} />
              <NextSteps />

              <div className="mt-6 grid gap-5 lg:grid-cols-2">
                <PaymentDetails booking={booking} isSubmitted={Boolean(isSubmitted)} />
                <SupportCard />
              </div>

              <div className="mt-5 rounded-[10px] border border-[#EFE5FF] bg-[#FBF8FF] px-6 py-4 text-[14px] font-medium text-[#34405A] shadow-[0_10px_24px_rgba(95,54,233,0.05)]">
                <span className="mr-3 inline-grid h-6 w-6 place-items-center rounded-full border border-[#8D6BFF] text-[#5F36E9]">
                  i
                </span>
                {isSubmitted
                  ? "Your payment has been submitted. DAR will update this booking automatically after verification."
                  : "If you've already made the payment, please wait a few minutes and it will be updated automatically."}
              </div>

              <div className="mt-7 flex items-center gap-5 rounded-[10px] bg-[#F7F3FF] px-6 py-5">
                <span className="grid h-12 w-12 place-items-center rounded-full bg-[#6C4CF1] text-white">
                  <Icon name="shield" className="h-7 w-7" />
                </span>
                <div>
                  <h2 className="text-[17px] font-bold">Your booking is safe</h2>
                  <p className="mt-1 text-[14px] text-[#34405A]">
                    We use secure payment systems to keep your data protected.
                  </p>
                </div>
              </div>
            </div>

            <aside className="space-y-5 xl:sticky xl:top-8 xl:self-start">
              <BookingSummary booking={booking} />
              <div className="rounded-[14px] border border-[#E0E6F0] bg-white p-5 shadow-[0_16px_34px_rgba(15,23,42,0.07)]">
                {isSubmitted ? (
                  <div className="rounded-[9px] bg-[#FFF8E6] px-4 py-3 text-center text-[14px] font-bold text-[#A15C08]">
                    Payment submitted. Waiting for DAR review.
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={completePayment}
                    className="h-12 w-full rounded-[8px] bg-[#5F36E9] text-[15px] font-bold text-white shadow-[0_12px_26px_rgba(95,54,233,0.24)] hover:bg-[#5130D8]"
                  >
                    Complete payment
                  </button>
                )}
                <button
                  type="button"
                  onClick={cancelBooking}
                  disabled={isCancelled}
                  className="mt-3 h-12 w-full rounded-[8px] border border-[#6C4CF1] bg-white text-[15px] font-bold text-[#5F36E9] hover:bg-[#F5F2FF] disabled:cursor-not-allowed disabled:border-[#DCE3EF] disabled:text-[#8A94A9]"
                >
                  {isCancelled ? "Booking cancelled" : "Cancel booking"}
                </button>
              </div>
            </aside>
          </div>
        </section>
      </div>
    </main>
  );
}

function DesktopSidebar() {
  const links = [
    ["home", "Dashboard"],
    ["calendar", "Bookings"],
    ["heart", "Saved properties"],
    ["star", "Reviews"],
    ["card", "Payments"],
    ["message", "Messages"],
    ["settings", "Profile settings"],
  ] as const;

  return (
    <aside className="hidden border-r border-[#EEF2F7] bg-white px-8 py-7 xl:block xl:rounded-l-[28px]">
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
      <nav className="mt-12 space-y-3">
        {links.map(([icon, label]) => (
          <Link
            key={label}
            href="/"
            className={cn(
              "flex h-13 items-center gap-4 rounded-[10px] px-4 text-[15px] font-medium text-[#34405A]",
              label === "Bookings" && "bg-[#F4EEFF] font-bold text-[#5F36E9]",
            )}
          >
            <Icon name={icon} className="h-5 w-5" />
            {label}
            {label === "Messages" ? (
              <span className="ml-auto grid h-5 w-5 place-items-center rounded-full bg-[#5F36E9] text-[11px] text-white">
                2
              </span>
            ) : null}
          </Link>
        ))}
      </nav>
      <div className="mt-14 rounded-[12px] bg-[#F6F0FF] p-5">
        <h3 className="text-[15px] font-bold">Invite friends</h3>
        <p className="mt-3 text-[13px] leading-5 text-[#34405A]">Get EGP 300 when they book their first stay!</p>
        <button className="mt-4 h-10 rounded-[7px] border border-[#5F36E9] px-6 text-[13px] font-bold text-[#5F36E9]">
          Invite now
        </button>
      </div>
      <div className="mt-14 rounded-[12px] border border-[#E6EBF3] bg-white p-5">
        <h3 className="text-[15px] font-bold">Need help?</h3>
        <p className="mt-3 text-[13px] leading-5 text-[#34405A]">Our support team is here 24/7 to help you</p>
        <button className="mt-4 inline-flex h-10 w-full items-center justify-center gap-2 rounded-[7px] border border-[#5F36E9] text-[13px] font-bold text-[#5F36E9]">
          <Icon name="headset" className="h-4 w-4" />
          Contact support
        </button>
      </div>
    </aside>
  );
}

function TopBar() {
  return (
    <header className="flex h-[72px] items-center justify-between border-b border-[#EEF2F7] px-5 lg:px-9">
      <div className="flex items-center gap-3 xl:hidden">
        <button aria-label="Open menu">
          <Icon name="menu" className="h-6 w-6" />
        </button>
        <Link aria-label="Go to DAR homepage" className="block w-fit" href="/">
          <Image src="/dar-logo-purple-header.png" alt="DAR" width={320} height={142} className="h-[38px] w-auto" />
        </Link>
      </div>
      <div className="hidden xl:block" />
      <div className="flex items-center gap-7">
        <button className="relative text-[#080B32]" aria-label="Notifications">
          <Icon name="bell" className="h-6 w-6" />
          <span className="absolute -right-2 -top-2 grid h-5 w-5 place-items-center rounded-full bg-[#EF3E48] text-[10px] font-bold text-white">
            2
          </span>
        </button>
        <div className="hidden items-center gap-3 lg:flex">
          <span className="relative h-10 w-10 overflow-hidden rounded-full bg-[#DCE3EF]">
            <Image src={featuredProperty.images[1].src} alt="Ahmed H." fill className="object-cover" />
          </span>
          <span className="text-[15px] font-bold">Ahmed H.</span>
          <span aria-hidden="true">⌄</span>
        </div>
      </div>
    </header>
  );
}

function StatusClock() {
  return (
    <span className="grid h-[86px] w-[86px] shrink-0 place-items-center rounded-full bg-[#FFF2CE] text-[#F4A31F]">
      <span className="grid h-[48px] w-[48px] place-items-center rounded-full border-2 border-[#F4A31F]">
        <Icon name="clock" className="h-8 w-8" />
      </span>
    </span>
  );
}

function CountdownCard({ time, isSubmitted }: { time: { minutes: string; seconds: string }; isSubmitted: boolean }) {
  return (
    <section className="mt-9 rounded-[12px] border border-[#F2C766] bg-[#FFF9EC] px-6 py-6 shadow-[0_10px_26px_rgba(214,147,24,0.08)]">
      <div className="grid gap-5 md:grid-cols-[260px_1fr] md:items-center">
        <div className="flex items-center gap-5">
          <span className="grid h-[52px] w-[52px] place-items-center rounded-full bg-[#FFF0CF] text-[#F4A31F]">
            <Icon name="timer" className="h-8 w-8" />
          </span>
          <div>
            <p className="text-[15px] font-bold text-[#74460B]">
              {isSubmitted ? "Payment review window" : "Payment expires in"}
            </p>
            <div className="mt-2 flex items-end gap-3 text-[#080B32]">
              <span className="text-[34px] font-black leading-none">{time.minutes}</span>
              <span className="pb-1 text-[28px] font-black">:</span>
              <span className="text-[34px] font-black leading-none">{time.seconds}</span>
            </div>
            <div className="mt-2 flex gap-12 pl-2 text-[12px] font-semibold">Min <span>Sec</span></div>
          </div>
        </div>
        <p className="max-w-[360px] text-[15px] font-medium leading-6 text-[#34405A]">
          {isSubmitted
            ? "DAR is reviewing your payment. You can leave this page and we'll update the booking automatically."
            : "Complete your payment before the time expires, or your booking will be automatically cancelled."}
        </p>
      </div>
    </section>
  );
}

function NextSteps() {
  const steps = [
    ["1", "We're holding your booking", "Your dates are reserved while we wait for your payment.", "wallet"],
    ["2", "Payment confirmation", "Once payment is successful, you'll receive a confirmation.", "card"],
    ["3", "Booking confirmed", "You're all set! Enjoy your upcoming stay.", "check"],
  ] as const;

  return (
    <section className="mt-9">
      <h2 className="text-[18px] font-bold">What happens next?</h2>
      <div className="mt-4 grid gap-4 rounded-[14px] border border-[#E5EAF3] bg-white p-6 shadow-[0_12px_32px_rgba(15,23,42,0.04)] md:grid-cols-3">
        {steps.map(([number, title, body, icon], index) => (
          <div key={number} className="relative">
            {index < steps.length - 1 ? (
              <span className="absolute right-4 top-8 hidden text-[#B69BFF] md:block">--→</span>
            ) : null}
            <span
              className={cn(
                "grid h-14 w-14 place-items-center rounded-full",
                index === 0 && "bg-[#FFF1CE] text-[#F4A31F]",
                index === 1 && "bg-[#F1EAFF] text-[#5F36E9]",
                index === 2 && "bg-[#DFF8E9] text-[#19A759]",
              )}
            >
              <Icon name={icon} className="h-7 w-7" />
            </span>
            <p className="mt-3 text-[14px] font-black">{number}</p>
            <h3 className="mt-3 text-[15px] font-bold">{title}</h3>
            <p className="mt-2 max-w-[210px] text-[13px] leading-5 text-[#34405A]">{body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function PaymentDetails({ booking, isSubmitted }: { booking: BookingPayload; isSubmitted: boolean }) {
  return (
    <section className="rounded-[14px] border border-[#E5EAF3] bg-white p-5 shadow-[0_12px_32px_rgba(15,23,42,0.04)]">
      <h2 className="text-[17px] font-bold">Payment details</h2>
      <dl className="mt-6 space-y-5 text-[14px]">
        <Row label="Payment ID" value={booking.paymentId ?? "#PAY-784512"} />
        <Row
          label="Status"
          value={isSubmitted ? "Reviewing" : "Pending"}
          badge={isSubmitted ? "review" : "pending"}
        />
        <Row label="Amount" value={formatEgp(booking.total)} />
        <Row label="Method" value={paymentLabel(booking.paymentMethod)} />
        <Row label="Date" value={booking.paymentSubmittedAt ? formatDate(booking.paymentSubmittedAt.slice(0, 10)) : "20 May 2025 - 3:00 PM"} />
      </dl>
    </section>
  );
}

function Row({ label, value, badge }: { label: string; value: string; badge?: "pending" | "review" }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <dt className="font-medium text-[#59637C]">{label}</dt>
      <dd className="font-semibold text-[#111735]">
        {badge ? (
          <span className="rounded-full bg-[#FFF0C8] px-3 py-1 text-[12px] font-bold text-[#B16B00]">{value}</span>
        ) : (
          value
        )}
      </dd>
    </div>
  );
}

function SupportCard() {
  return (
    <section className="rounded-[14px] border border-[#E5EAF3] bg-white p-5 shadow-[0_12px_32px_rgba(15,23,42,0.04)]">
      <h2 className="text-[17px] font-bold">Need help?</h2>
      <p className="mt-5 text-[14px] leading-6 text-[#34405A]">
        If you&apos;re having trouble completing your payment, our support team is here to help.
      </p>
      <div className="mt-6 space-y-3">
        <button className="flex w-full items-center gap-4 rounded-[9px] border border-[#E6EBF3] px-4 py-3 text-left">
          <span className="grid h-10 w-10 place-items-center rounded-full bg-[#F4EEFF] text-[#5F36E9]">
            <Icon name="message" className="h-5 w-5" />
          </span>
          <span>
            <span className="block text-[14px] font-bold">Chat with support</span>
            <span className="text-[12px] text-[#59637C]">We typically reply in a few minutes</span>
          </span>
        </button>
        <button className="flex w-full items-center gap-4 rounded-[9px] border border-[#E6EBF3] px-4 py-3 text-left">
          <span className="grid h-10 w-10 place-items-center rounded-full bg-[#F4EEFF] text-[#5F36E9]">
            <Icon name="headset" className="h-5 w-5" />
          </span>
          <span>
            <span className="block text-[14px] font-bold">Call us</span>
            <span className="text-[12px] text-[#59637C]">+20 123 456 7890</span>
          </span>
        </button>
      </div>
    </section>
  );
}

function BookingSummary({ booking }: { booking: BookingPayload }) {
  return (
    <section className="rounded-[14px] border border-[#E0E6F0] bg-white p-5 shadow-[0_16px_34px_rgba(15,23,42,0.07)]">
      <h2 className="text-[18px] font-bold">Booking summary</h2>
      <div className="relative mt-5 h-[186px] overflow-hidden rounded-[10px] bg-[#EEF2F8]">
        <Image src={booking.image} alt={booking.title} fill className="object-cover" />
        <span className="absolute left-3 top-3 rounded-[6px] bg-[#5F36E9] px-3 py-1 text-[12px] font-bold text-white">
          Featured
        </span>
      </div>
      <h3 className="mt-5 text-[16px] font-bold">{booking.title}</h3>
      <p className="mt-4 flex items-center gap-2 text-[13px] text-[#34405A]">{booking.location}</p>
      <div className="mt-4 grid grid-cols-2 gap-y-3 text-[13px] font-medium text-[#34405A]">
        <span>2 Bedrooms</span>
        <span>2 Bathrooms</span>
        <span>{booking.guests} Guests</span>
        <span>{booking.area ?? 120} m²</span>
      </div>
      <div className="mt-5 divide-y divide-[#E6EBF3] text-[14px]">
        <SummaryLine label="Check-in" value={formatDate(booking.checkIn)} badge="3:00 PM" />
        <SummaryLine label="Check-out" value={formatDate(booking.checkOut)} badge="11:00 AM" />
        <SummaryLine label="Duration" value={`${booking.nights} nights`} />
      </div>
      <div className="mt-5 space-y-3 border-b border-[#E6EBF3] pb-5 text-[14px] text-[#34405A]">
        <PriceLine label={`${formatEgp(booking.pricePerNight)} x ${booking.nights} nights`} value={formatEgp(booking.subtotal)} />
        <PriceLine label="Cleaning fee" value={formatEgp(booking.cleaningFee)} />
        <PriceLine label="Service fee" value={formatEgp(booking.serviceFee)} />
      </div>
      <div className="mt-5 flex items-center justify-between text-[17px] font-bold">
        <span>Total</span>
        <span>{formatEgp(booking.total)}</span>
      </div>
    </section>
  );
}

function SummaryLine({ label, value, badge }: { label: string; value: string; badge?: string }) {
  return (
    <div className="flex items-center justify-between gap-4 py-4">
      <div>
        <p className="text-[12px] font-medium text-[#59637C]">{label}</p>
        <p className="mt-1 font-semibold">{value}</p>
      </div>
      {badge ? (
        <span className="rounded-[5px] border border-[#BDAEFF] bg-[#F6F1FF] px-2 py-1 text-[11px] font-bold text-[#5F36E9]">
          {badge}
        </span>
      ) : null}
    </div>
  );
}

function PriceLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span>{label}</span>
      <span className="font-semibold text-[#111735]">{value}</span>
    </div>
  );
}
