"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { featuredProperty } from "@/app/properties/[slug]/property-data";
import { cn } from "@/lib/utils";
import { requiredRedirectForStep } from "@/app/booking/flow-guards";

type RefundStatus = "processing" | "completed" | "failed" | "not_eligible";

type CancellationData = {
  reason?: string;
  number?: string;
  cancelledAt?: string;
  cancelledBy?: string;
  refundStatus?: RefundStatus;
  refundMethod?: string;
  refundTimeline?: string;
  policyViewed?: boolean;
  feedbackReason?: string;
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
  locale?: string;
  guestInfo?: { fullName?: string; email?: string };
  paymentMethod?: string;
  paymentDetails?: Record<string, string | boolean>;
  bookingStatus?: "cancelled";
  cancellation?: CancellationData;
};

type IconName =
  | "calendar"
  | "check"
  | "chevronDown"
  | "chevronLeft"
  | "chevronRight"
  | "close"
  | "headset"
  | "home"
  | "location"
  | "mail"
  | "message"
  | "shield"
  | "wallet"
  | "user";

const storageKey = "dar-pending-booking";
const refundStatusKey = "dar-refund-status";
const activityKey = "dar-booking-activity";
const notificationKey = "dar-notifications";

function iconPath(name: IconName) {
  const paths: Record<IconName, string> = {
    calendar:
      "M7 3v3M17 3v3M4.5 8.5h15M6 5h12a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z",
    check: "m5 12 4.2 4.2L19 6.5",
    chevronDown: "m7 9 5 5 5-5",
    chevronLeft: "M14.5 5 8.5 11l6 6",
    chevronRight: "m9 6 6 6-6 6",
    close: "M6 6l12 12M18 6 6 18",
    headset:
      "M4 13a8 8 0 0 1 16 0v3a2 2 0 0 1-2 2h-2v-6h4M4 16a2 2 0 0 0 2 2h2v-6H4v4Zm8 5h2a4 4 0 0 0 4-4",
    home: "M3.5 11.5 12 4l8.5 7.5M5.5 10.5V20h13v-9.5M9.5 20v-6h5v6",
    location:
      "M12 21s7-4.4 7-11a7 7 0 1 0-14 0c0 6.6 7 11 7 11Zm0-8.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z",
    mail: "M4 6h16v12H4V6Zm0 1 8 6 8-6",
    message: "M5 6.5h14v9H9l-4 3v-12Z",
    shield: "M12 3 19 6v5c0 4.8-2.9 8-7 10-4.1-2-7-5.2-7-10V6l7-3Z",
    user: "M20 21a8 8 0 0 0-16 0M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10Z",
    wallet: "M4 7h15a2 2 0 0 1 2 2v9H6a3 3 0 0 1-3-3V6a3 3 0 0 0 3 3h15M16 14h.01",
  };
  return paths[name];
}

function Icon({ name, className }: { name: IconName; className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className={cn("h-5 w-5", className)} fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8">
      <path d={iconPath(name)} />
    </svg>
  );
}

function formatEgp(value: number) {
  return `EGP ${new Intl.NumberFormat("en-EG", { maximumFractionDigits: 0 }).format(value)}`;
}

function dateAtNoon(value?: string) {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return new Date("2026-05-20T12:00:00");
  }
  return new Date(`${value}T12:00:00`);
}

function formatDate(value?: string, withTime = false) {
  const date = value && /^\d{4}-\d{2}-\d{2}/.test(value) ? new Date(value) : dateAtNoon(value);
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: withTime ? "numeric" : undefined,
    minute: withTime ? "2-digit" : undefined,
  }).format(date);
}

function formatStayDate(value?: string) {
  return new Intl.DateTimeFormat("en-GB", { weekday: "short", day: "numeric", month: "long", year: "numeric" }).format(dateAtNoon(value));
}

function calculateCancellation(booking: BookingPayload) {
  const total = booking.total ?? 0;
  const cancelledAt = booking.cancellation?.cancelledAt ? new Date(booking.cancellation.cancelledAt) : new Date();
  const checkIn = dateAtNoon(booking.checkIn);
  const freeUntil = new Date(checkIn);
  freeUntil.setDate(freeUntil.getDate() - 2);
  freeUntil.setHours(23, 59, 0, 0);

  if (cancelledAt <= freeUntil) {
    return { eligible: true, fee: 0, refund: total, policy: "You cancelled within the free cancellation period." };
  }

  if (cancelledAt < checkIn) {
    const fee = Math.round(total * 0.25);
    return { eligible: true, fee, refund: Math.max(total - fee, 0), policy: "A partial cancellation fee was applied because the free cancellation period has passed." };
  }

  return { eligible: false, fee: total, refund: 0, policy: "This booking is no longer refundable under the cancellation policy." };
}

function readBooking(): BookingPayload {
  const subtotal = 1200 * 5;
  const fallback: BookingPayload = {
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
    pricePerNight: 1200,
    cleaningFee: 250,
    serviceFee: 420,
    discount: 300,
    subtotal,
    total: subtotal + 250 + 420 - 300,
    locale: "en",
    guestInfo: { fullName: "Ahmed Hassan", email: "ahmed.hassan@email.com" },
    paymentMethod: "card",
    paymentDetails: { cardLast4: "4242" },
    bookingStatus: "cancelled",
    cancellation: {
      reason: "Plans changed",
      number: "CAN-25052024-4837",
      cancelledAt: "2026-05-18T10:30:00",
      cancelledBy: "Ahmed Hassan",
      refundStatus: "processing",
      refundMethod: "Visa ending in 4242",
      refundTimeline: "Within 5-7 business days",
    },
  };

  if (typeof window === "undefined") {
    return fallback;
  }

  try {
    const parsed = JSON.parse(window.sessionStorage.getItem(storageKey) ?? "{}") as BookingPayload;
    return {
      ...fallback,
      ...parsed,
      guestInfo: { ...fallback.guestInfo, ...parsed.guestInfo },
      cancellation: { ...fallback.cancellation, ...parsed.cancellation },
      bookingStatus: "cancelled",
    };
  } catch {
    return fallback;
  }
}

function writeBooking(booking: BookingPayload) {
  window.sessionStorage.setItem(storageKey, JSON.stringify(booking));
}

function localizedPath(booking: BookingPayload, path: string) {
  const locale = booking.locale ?? "en";
  const currentPath = typeof window !== "undefined" ? window.location.pathname : "";
  return currentPath.startsWith(`/${locale}/`) ? `/${locale}${path}` : path;
}

function createCancellationSideEffects(booking: BookingPayload) {
  const email = booking.guestInfo?.email ?? "guest@example.com";
  const cancellationNumber = booking.cancellation?.number ?? booking.propertyId ?? "cancelled-booking";
  const entry = {
    id: cancellationNumber,
    type: "booking_cancelled",
    booking: booking.propertyId,
    at: booking.cancellation?.cancelledAt ?? new Date().toISOString(),
    message: `Cancellation confirmation sent to ${email}`,
  };
  const activity = JSON.parse(window.localStorage.getItem(activityKey) ?? "[]") as Array<{ id?: string }>;
  const nextActivity = activity.filter((item) => item.id !== cancellationNumber);
  window.localStorage.setItem(activityKey, JSON.stringify([entry, ...nextActivity].slice(0, 20)));
  const notifications = JSON.parse(window.localStorage.getItem(notificationKey) ?? "[]") as Array<{ id?: string }>;
  const nextNotifications = notifications.filter((item) => item.id !== cancellationNumber);
  window.localStorage.setItem(notificationKey, JSON.stringify([{ ...entry, channel: "email", to: email }, ...nextNotifications].slice(0, 20)));
}

export default function CancellationConfirmedPage() {
  const router = useRouter();
  const [booking, setBooking] = useState(readBooking);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [feedbackReason, setFeedbackReason] = useState(booking.cancellation?.feedbackReason ?? "");
  const cancellation = calculateCancellation(booking);
  const refundStatus = cancellation.eligible ? booking.cancellation?.refundStatus ?? "processing" : "not_eligible";
  const email = booking.guestInfo?.email ?? "guest@example.com";

  useEffect(() => {
    const redirect = requiredRedirectForStep("cancelled");
    if (redirect) {
      router.replace(redirect);
      return;
    }

    const nextBooking = {
      ...booking,
      bookingStatus: "cancelled" as const,
      cancellation: {
        ...booking.cancellation,
        refundStatus,
        refundMethod: booking.cancellation?.refundMethod ?? "Original payment method",
        refundTimeline: booking.cancellation?.refundTimeline ?? "Within 5-7 business days",
      },
    };
    writeBooking(nextBooking);
    createCancellationSideEffects(nextBooking);
    const syncRefundStatus = () => {
      const nextStatus = window.localStorage.getItem(refundStatusKey) as RefundStatus | null;
      if (nextStatus && nextStatus !== nextBooking.cancellation?.refundStatus) {
        setBooking((current) => ({
          ...current,
          cancellation: { ...current.cancellation, refundStatus: nextStatus },
        }));
      }
    };
    syncRefundStatus();
    const interval = window.setInterval(syncRefundStatus, 2500);
    window.addEventListener("storage", syncRefundStatus);
    return () => {
      window.clearInterval(interval);
      window.removeEventListener("storage", syncRefundStatus);
    };
  }, [booking, email, refundStatus, router]);

  const saveFeedback = () => {
    const nextBooking = {
      ...booking,
      cancellation: { ...booking.cancellation, feedbackReason },
    };
    setBooking(nextBooking);
    writeBooking(nextBooking);
    setFeedbackOpen(false);
  };

  return (
    <main className="min-h-screen bg-[#F8FAFC] p-4 text-[#080B32]">
      <div className="mx-auto grid min-h-[calc(100vh-32px)] max-w-[1440px] overflow-hidden rounded-[28px] border border-[#DFE6F1] bg-white shadow-[0_28px_80px_rgba(15,23,42,0.06)]">
        <Header booking={booking} />
        <div className="grid gap-8 px-5 pb-8 pt-2 lg:px-10 xl:grid-cols-[minmax(0,1fr)_560px]">
          <section className="min-w-0">
            <Hero email={email} />
            <RefundCard booking={booking} refund={cancellation.refund} refundStatus={refundStatus} eligible={cancellation.eligible} />
            <FeedbackCard onOpen={() => setFeedbackOpen(true)} />
            <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-between">
              <Link href={localizedPath(booking, "/bookings")} className="order-2 inline-flex h-14 items-center justify-center gap-3 rounded-[8px] border border-[#6C4CF1] bg-white px-10 text-[16px] font-bold text-[#5F36E9] sm:order-1">
                <Icon name="chevronLeft" />
                Back to my bookings
              </Link>
              <Link href={localizedPath(booking, "/")} className="order-1 inline-flex h-14 items-center justify-center gap-3 rounded-[8px] bg-[#5F36E9] px-12 text-[16px] font-bold text-white shadow-[0_14px_30px_rgba(95,54,233,0.24)] sm:order-2">
                Explore more stays
                <Icon name="home" />
              </Link>
            </div>
          </section>
          <aside className="min-w-0">
            <CancelledBookingCard booking={booking} refund={cancellation.refund} fee={cancellation.fee} policy={cancellation.policy} refundStatus={refundStatus} />
          </aside>
        </div>
      </div>
      {feedbackOpen ? (
        <FeedbackModal
          value={feedbackReason}
          setValue={setFeedbackReason}
          onClose={() => setFeedbackOpen(false)}
          onSave={saveFeedback}
        />
      ) : null}
    </main>
  );
}

function Header({ booking }: { booking: BookingPayload }) {
  return (
    <header className="flex h-[74px] items-center justify-between px-6 lg:px-8">
      <Link href={localizedPath(booking, "/")} aria-label="DAR home">
        <Image src="/dar-logo-purple-header.png" alt="DAR" width={320} height={142} className="h-[48px] w-auto object-contain" priority />
      </Link>
      <a href="mailto:support@dar.example?subject=Cancellation%20support" className="hidden items-center gap-3 text-[15px] font-bold lg:inline-flex">
        <Icon name="headset" />
        Need help?
        <Icon name="chevronDown" className="h-4 w-4" />
      </a>
      <a href="mailto:support@dar.example?subject=Cancellation%20support" aria-label="Need help" className="lg:hidden">
        <Icon name="headset" className="h-6 w-6" />
      </a>
    </header>
  );
}

function Hero({ email }: { email: string }) {
  return (
    <section className="flex flex-col items-center pt-8 text-center">
      <FailureMark />
      <h1 className="mt-7 text-[34px] font-black leading-tight">Cancellation confirmed</h1>
      <p className="mt-4 max-w-[520px] text-[15px] font-medium leading-6 text-[#34405A]">
        Your booking has been cancelled successfully.<br />We&apos;re sorry to see you go.
      </p>
      <div className="mt-9 flex w-full max-w-[560px] items-center gap-5 rounded-[10px] border border-[#F6D3D3] bg-[#FFF0F0] p-5 text-left">
        <span className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-[#FFE0E0] text-[#EF4444]">
          <Icon name="mail" className="h-7 w-7" />
        </span>
        <div>
          <p className="text-[15px] font-bold">You will receive a confirmation email shortly</p>
          <p className="mt-2 text-[14px] leading-6 text-[#34405A]">We&apos;ve sent the cancellation details to</p>
          <p className="text-[15px] font-bold">{email}</p>
        </div>
      </div>
    </section>
  );
}

function FailureMark() {
  return (
    <div className="relative grid h-[150px] w-[220px] place-items-center">
      <span className="absolute left-0 top-20 h-5 w-16 rounded-full bg-[#FAD7D7]" />
      <span className="absolute right-2 top-10 h-5 w-10 rounded-full bg-[#FAD7D7]" />
      <span className="absolute h-[132px] w-[132px] rounded-full border-2 border-[#FFC8C8]" />
      <span className="grid h-[104px] w-[104px] place-items-center rounded-full bg-[#EF4444] text-white shadow-[0_18px_35px_rgba(239,68,68,0.28)]">
        <Icon name="close" className="h-16 w-16" />
      </span>
    </div>
  );
}

function RefundCard({ booking, refund, refundStatus, eligible }: { booking: BookingPayload; refund: number; refundStatus: RefundStatus; eligible: boolean }) {
  const statusCopy: Record<RefundStatus, string> = {
    processing: "Your refund is being processed and will be returned to your original payment method within 5-7 business days.",
    completed: "Your refund has been completed and returned to your original payment method.",
    failed: "Your refund could not be completed. Please contact DAR support for help.",
    not_eligible: "This booking is not eligible for a refund under the cancellation policy.",
  };
  if (!eligible) {
    return (
      <section className="mx-auto mt-9 max-w-[650px] rounded-[12px] border border-[#F2D7D7] bg-white p-7 shadow-[0_14px_35px_rgba(15,23,42,0.06)]">
        <h2 className="flex items-center gap-4 text-[18px] font-bold"><Icon name="wallet" className="text-[#EF4444]" /> Refund status</h2>
        <p className="mt-7 text-[15px] leading-7 text-[#34405A]">{statusCopy.not_eligible}</p>
        <Link href={"/legal/cancellation"} className="mt-5 inline-flex items-center gap-2 text-[15px] font-bold text-[#5F36E9]">View refund policy <Icon name="chevronRight" className="h-4 w-4" /></Link>
      </section>
    );
  }
  return (
    <section className="mx-auto mt-9 max-w-[650px] rounded-[12px] border border-[#E1E7F0] bg-white p-7 shadow-[0_14px_35px_rgba(15,23,42,0.06)]">
      <div className="flex items-start justify-between gap-5">
        <h2 className="flex items-center gap-4 text-[18px] font-bold"><span className="grid h-11 w-11 place-items-center rounded-[10px] bg-[#E8F8EE] text-[#168A43]"><Icon name="wallet" /></span> Refund status</h2>
        <div className="rounded-[10px] bg-[#E8F8EE] px-5 py-3 text-center">
          <p className="text-[12px] text-[#168A43]">Refund amount</p>
          <p className="text-[16px] font-black text-[#168A43]">{formatEgp(refund)}</p>
        </div>
      </div>
      <p className="mt-7 text-[15px] leading-7 text-[#34405A]">{statusCopy[refundStatus]}</p>
      <Link href={"/legal/cancellation"} className="mt-5 inline-flex items-center gap-2 text-[15px] font-bold text-[#5F36E9]">View refund policy <Icon name="chevronRight" className="h-4 w-4" /></Link>
    </section>
  );
}

function FeedbackCard({ onOpen }: { onOpen: () => void }) {
  return (
    <section className="mx-auto mt-8 max-w-[650px] rounded-[12px] bg-[#F8F4FF] p-7 shadow-[0_14px_35px_rgba(15,23,42,0.05)]">
      <div className="flex items-center gap-5">
        <span className="grid h-16 w-16 place-items-center rounded-full bg-[#E8DDFF] text-[#5F36E9]"><Icon name="message" className="h-8 w-8" /></span>
        <div>
          <h2 className="text-[18px] font-bold">Help us improve</h2>
          <p className="mt-2 text-[15px] text-[#34405A]">We&apos;d love to know why you cancelled your booking.</p>
          <button onClick={onOpen} className="mt-5 h-12 rounded-[7px] border border-[#8D6BFF] bg-white px-10 text-[15px] font-bold text-[#5F36E9]">Tell us why</button>
        </div>
      </div>
    </section>
  );
}

function CancelledBookingCard({ booking, refund, fee, policy, refundStatus }: { booking: BookingPayload; refund: number; fee: number; policy: string; refundStatus: RefundStatus }) {
  const eligible = refundStatus !== "not_eligible";
  return (
    <section className="rounded-[14px] border border-[#E0E6F0] bg-white p-6 shadow-[0_16px_38px_rgba(15,23,42,0.08)]">
      <div className="flex items-center justify-between">
        <h2 className="text-[22px] font-bold">Cancelled booking</h2>
        <Link href={localizedPath(booking, "/bookings")} className="text-[14px] font-bold text-[#5F36E9]">View details</Link>
      </div>
      <BookingMini booking={booking} />
      <div className="mt-6 border-t border-[#E6EBF3] pt-6">
        <h3 className="text-[17px] font-bold">Cancellation details</h3>
        <DetailRow label="Cancellation number" value={booking.cancellation?.number ?? "CAN-25052024-4837"} />
        <DetailRow label="Cancelled on" value={formatDate(booking.cancellation?.cancelledAt, true)} />
        <DetailRow label="Cancelled by" value={booking.cancellation?.cancelledBy ?? booking.guestInfo?.fullName ?? "Guest"} />
      </div>
      <div className="mt-6 rounded-[10px] border border-[#F6D3D3] bg-[#FFF0F0] p-5">
        <h3 className="flex items-center gap-3 text-[16px] font-bold"><Icon name="shield" className="text-[#EF4444]" /> Cancellation policy applied</h3>
        <p className="mt-2 text-[14px] leading-6 text-[#34405A]">{policy}</p>
      </div>
      {eligible ? (
        <div className="mt-6 border-t border-[#E6EBF3] pt-6">
          <h3 className="text-[17px] font-bold">Payment summary</h3>
          <DetailRow label="Total paid" value={formatEgp(booking.total ?? 0)} />
          <DetailRow label="Refund amount" value={formatEgp(refund)} green />
          {fee > 0 ? <DetailRow label="Cancellation fee" value={formatEgp(fee)} /> : null}
          <DetailRow label="Refund method" value={booking.cancellation?.refundMethod ?? "Original payment method"} />
          <DetailRow label="Refund timeline" value={refundStatus === "completed" ? "Completed" : booking.cancellation?.refundTimeline ?? "Within 5-7 business days"} />
        </div>
      ) : null}
      <div className={cn("mt-6 rounded-[10px] p-5", fee > 0 || !eligible ? "bg-[#FFF0F0]" : "bg-[#F0FFF5]")}>
        <h3 className={cn("flex items-center gap-3 text-[16px] font-bold", fee > 0 || !eligible ? "text-[#B42318]" : "text-[#168A43]")}>
          <Icon name={fee > 0 || !eligible ? "close" : "check"} />
          {fee > 0 ? `${formatEgp(fee)} cancellation fee` : eligible ? "No cancellation fees" : "Refund not eligible"}
        </h3>
        <p className="mt-2 text-[14px] text-[#34405A]">{fee > 0 ? "The remaining refundable amount will be returned to your payment method." : eligible ? "You will receive a full refund." : "No refund will be returned for this cancellation."}</p>
      </div>
    </section>
  );
}

function BookingMini({ booking }: { booking: BookingPayload }) {
  return (
    <div className="mt-6">
      <div className="flex gap-5">
        <div className="relative h-[122px] w-[188px] shrink-0 overflow-hidden rounded-[8px]">
          <Image src={booking.image ?? featuredProperty.images[0].src} alt={booking.title ?? featuredProperty.title} fill className="object-cover" />
        </div>
        <div>
          <h3 className="text-[18px] font-bold leading-7">{booking.title}</h3>
          <p className="mt-4 flex items-center gap-2 text-[14px] text-[#34405A]"><Icon name="location" />{booking.location}</p>
        </div>
      </div>
      <div className="mt-6 space-y-5 border-t border-[#E6EBF3] pt-5 text-[14px] text-[#34405A]">
        <p className="flex gap-4"><Icon name="calendar" /> {formatStayDate(booking.checkIn)} - {formatStayDate(booking.checkOut)}<br /><span className="ml-9">{booking.nights} nights</span></p>
        <p className="flex gap-4"><Icon name="user" /> {booking.guests} guests, 1 room<br /><span className="ml-9">Premium residence</span></p>
      </div>
    </div>
  );
}

function DetailRow({ label, value, green = false }: { label: string; value: string; green?: boolean }) {
  return (
    <div className="mt-5 flex items-center justify-between gap-5 text-[15px]">
      <span className="text-[#34405A]">{label}</span>
      <span className={cn("font-semibold", green ? "text-[#168A43]" : "text-[#111735]")}>{value}</span>
    </div>
  );
}

function FeedbackModal({ value, setValue, onClose, onSave }: { value: string; setValue: (value: string) => void; onClose: () => void; onSave: () => void }) {
  const reasons = ["Plans changed", "Found another stay", "Price or fees", "Date conflict", "Other"];
  const modalRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const firstInput = modalRef.current?.querySelector<HTMLElement>("input, button");
    firstInput?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }

      if (event.key !== "Tab" || !modalRef.current) {
        return;
      }

      const focusable = Array.from(
        modalRef.current.querySelectorAll<HTMLElement>("button:not([disabled]), input:not([disabled])"),
      );
      if (focusable.length === 0) {
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      previousFocus?.focus();
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-[#080B32]/40 p-5" role="presentation" onMouseDown={onClose}>
      <section ref={modalRef} role="dialog" aria-modal="true" aria-labelledby="feedback-title" className="w-full max-w-[460px] rounded-[16px] bg-white p-6 shadow-[0_28px_80px_rgba(15,23,42,0.18)]" onMouseDown={(event) => event.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h2 id="feedback-title" className="text-[22px] font-black">Tell us why</h2>
          <button onClick={onClose} aria-label="Close feedback"><Icon name="close" /></button>
        </div>
        <div className="mt-5 space-y-3">
          {reasons.map((reason) => (
            <label key={reason} className="flex cursor-pointer items-center gap-3 rounded-[8px] border border-[#DDE4F0] p-3">
              <input type="radio" checked={value === reason} onChange={() => setValue(reason)} className="accent-[#5F36E9]" />
              <span className="text-[14px] font-semibold">{reason}</span>
            </label>
          ))}
        </div>
        <button onClick={onSave} disabled={!value} className="mt-6 h-12 w-full rounded-[8px] bg-[#5F36E9] text-[15px] font-bold text-white disabled:bg-[#B8AAF4]">Save feedback</button>
      </section>
    </div>
  );
}
