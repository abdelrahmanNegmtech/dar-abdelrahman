"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChangeEvent, useEffect, useRef, useState } from "react";
import { CheckCircle2, ChevronRight, Clock3, Info, ShieldCheck, UserRound, Users } from "lucide-react";
import { featuredProperty, resultProperties } from "@/app/properties/[slug]/property-data";
import { cn } from "@/lib/utils";
import { requiredRedirectForStep } from "@/app/booking/flow-guards";

type BookingStatus = "awaiting_payment" | "request_received" | "payment_pending" | "payment_failed" | "confirmed";

type GuestInfo = {
  fullName: string;
  email: string;
  phone: string;
  nationality: string;
  documentId: string;
  requests: string;
  shareWithOwner: boolean;
};

type BookingPayload = {
  bookingId?: string;
  conversationId?: string;
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
  guestInfo?: GuestInfo;
  paymentMethod?: string;
  paymentId?: string;
  paymentSubmitted?: boolean;
  bookingStatus?: BookingStatus;
  paymentSubmittedAt?: string;
  receiptStatus?: "uploaded" | "pending_review" | "not_required";
  receiptFileName?: string;
};

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

const storageKey = "dar-pending-booking";
const bookingReference = "DAR-MAD-58291";

const defaultGuestInfo: GuestInfo = {
  fullName: "Ismail Negm",
  email: "ismail.n***@gmail.com",
  phone: "+20 10* *** 4567",
  nationality: "Egypt",
  documentId: "",
  requests: "Arriving late evening around 9 PM. Please share self check-in instructions.",
  shareWithOwner: true,
};

function iconPath(name: IconName) {
  const paths: Record<IconName, string> = {
    bell: "M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9ZM13.7 21a2 2 0 0 1-3.4 0",
    calendar:
      "M7 3v3M17 3v3M4.5 8.5h15M6 5h12a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z",
    check: "m5 12 4.2 4.2L19 6.5",
    chevronDown: "m7 9 5 5 5-5",
    chevronRight: "m9 6 6 6-6 6",
    close: "M6 6l12 12M18 6 6 18",
    copy: "M8 8h10v10H8V8Zm-2 8H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1",
    download: "M12 4v10m0 0 4-4m-4 4-4-4M5 18h14",
    edit: "M4 20h4L19 9l-4-4L4 16v4Zm10-14 4 4",
    file: "M7 3h7l4 4v14H7V3Zm7 0v5h5",
    globe:
      "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM3.6 9h16.8M3.6 15h16.8M12 3c2.2 2.3 3.4 5.3 3.4 9S14.2 18.7 12 21c-2.2-2.3-3.4-5.3-3.4-9S9.8 5.3 12 3Z",
    headset:
      "M4 13a8 8 0 0 1 16 0v3a2 2 0 0 1-2 2h-2v-6h4M4 16a2 2 0 0 0 2 2h2v-6H4v4Zm8 5h2a4 4 0 0 0 4-4",
    help: "M12 18h.01M9.5 9a2.7 2.7 0 1 1 4.3 2.2c-.9.6-1.8 1.3-1.8 2.8M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Z",
    location:
      "M12 21s7-4.4 7-11a7 7 0 1 0-14 0c0 6.6 7 11 7 11Zm0-8.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z",
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

function formatDate(value: string, withWeekday = false) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return value;
  }

  return new Intl.DateTimeFormat("en-GB", {
    weekday: withWeekday ? "short" : undefined,
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(`${value}T12:00:00`));
}

function paymentLabel(method?: string) {
  const labels: Record<string, string> = {
    card: "Credit / Debit Card",
    meeza: "Meeza Card",
    paymob: "Paymob / Accept",
    instapay: "InstaPay",
    vodafone: "Vodafone Cash",
    fawry: "Fawry",
    bank: "Bank transfer",
    arrival: "Pay on arrival",
  };

  return labels[method ?? "instapay"] ?? "InstaPay";
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
    area: 58,
    pricePerNight: 1200,
    cleaningFee: 250,
    serviceFee: 420,
    discount: 300,
    subtotal,
    total: subtotal + 250 + 420 - 300,
    currency: "EGP",
    locale: "en",
    guestInfo: defaultGuestInfo,
    paymentMethod: "instapay",
    paymentId: "IP-739201",
    paymentSubmitted: true,
    bookingStatus: "request_received",
    paymentSubmittedAt: new Date().toISOString(),
    receiptStatus: "pending_review",
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
    const nextSubtotal =
      parsed.subtotal ?? (parsed.pricePerNight ?? fallback.pricePerNight) * (parsed.nights ?? fallback.nights);
    const cleaningFee = parsed.cleaningFee ?? fallback.cleaningFee;
    const serviceFee = parsed.serviceFee ?? fallback.serviceFee;
    const discount = parsed.discount ?? fallback.discount;

    return {
      ...fallback,
      ...parsed,
      guestInfo: { ...defaultGuestInfo, ...parsed.guestInfo },
      subtotal: nextSubtotal,
      cleaningFee,
      serviceFee,
      discount,
      total: parsed.total ?? nextSubtotal + cleaningFee + serviceFee - discount,
      paymentId: parsed.paymentId ?? fallback.paymentId,
      bookingStatus: "request_received",
      receiptStatus: parsed.receiptStatus ?? fallback.receiptStatus,
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

function downloadFile(filename: string, content: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function initials(name: string) {
  const parts = name.trim().split(/\s+/);
  return `${parts[0]?.[0] ?? "I"}${parts[1]?.[0] ?? "N"}`.toUpperCase();
}

function validConversationId(booking: BookingPayload) {
  const conversationId = booking.conversationId?.trim();
  return conversationId && /^[A-Za-z0-9][A-Za-z0-9_-]{2,127}$/.test(conversationId) ? conversationId : null;
}

export default function RequestReceivedPage() {
  const router = useRouter();
  const [booking, setBooking] = useState<BookingPayload | null>(null);
  const [toastOpen, setToastOpen] = useState(true);
  const receiptInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const redirect = requiredRedirectForStep("request-received");
    if (redirect) {
      router.replace(redirect);
      return;
    }

    const hydrationFrame = window.requestAnimationFrame(() => {
      setBooking(readBooking());
    });

    return () => window.cancelAnimationFrame(hydrationFrame);
  }, [router]);

  if (!booking) {
    return (
      <main className="min-h-screen overflow-x-hidden bg-[#F8FAFC] text-[#080B32]">
        <Header />
        <div className="grid min-h-[calc(100vh-76px)] place-items-center px-5 py-12" role="status" aria-live="polite">
          <div className="flex items-center gap-3 text-[14px] font-semibold text-[#59637C]">
            <span className="h-5 w-5 animate-spin rounded-full border-2 border-[#D8D0FF] border-t-[#5F36E9]" aria-hidden="true" />
            Loading booking details…
          </div>
        </div>
      </main>
    );
  }

  const guest = booking.guestInfo ?? defaultGuestInfo;
  const conversationId = validConversationId(booking);
  const messageOwnerHref = conversationId
    ? `/traveler/messages?conversation=${encodeURIComponent(conversationId)}`
    : null;
  const messageOwnerUnavailableReason = "Messaging is not yet available for this booking.";

  const updateAndNavigate = (path: string) => {
    writeBooking(booking);
    window.location.href = `${localizedPath(booking, path)}?${bookingQuery(booking)}`;
  };

  const viewBooking = () => {
    const nextBooking = { ...booking, bookingStatus: "payment_pending" as BookingStatus };
    setBooking(nextBooking);
    writeBooking(nextBooking);
    router.push(`${localizedPath(nextBooking, "/booking/pending")}?${bookingQuery(nextBooking)}`);
  };

  const downloadReceipt = () => {
    const receipt = [
      "DAR booking receipt",
      `Reference: ${bookingReference}`,
      `Property: ${booking.title}`,
      `Dates: ${formatDate(booking.checkIn)} - ${formatDate(booking.checkOut)}`,
      `Guests: ${booking.guests}`,
      `Payment method: ${paymentLabel(booking.paymentMethod)}`,
      `Amount: ${formatEgp(booking.total)}`,
      "Status: Pending payment verification",
    ].join("\n");
    downloadFile(`${bookingReference}-receipt.txt`, receipt, "text/plain;charset=utf-8");
  };

  const addToCalendar = () => {
    const start = booking.checkIn.replaceAll("-", "");
    const end = booking.checkOut.replaceAll("-", "");
    const ics = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//DAR//Booking//EN",
      "BEGIN:VEVENT",
      `UID:${bookingReference}@dar.local`,
      `DTSTART;VALUE=DATE:${start}`,
      `DTEND;VALUE=DATE:${end}`,
      `SUMMARY:DAR stay at ${booking.title}`,
      `LOCATION:${booking.location}`,
      `DESCRIPTION:Booking reference ${bookingReference}`,
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\r\n");
    downloadFile(`${bookingReference}.ics`, ics, "text/calendar;charset=utf-8");
  };

  const uploadAnotherReceipt = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }
    const nextBooking = {
      ...booking,
      receiptStatus: "pending_review" as const,
      receiptFileName: file.name,
      paymentSubmitted: true,
      bookingStatus: "request_received" as BookingStatus,
    };
    setBooking(nextBooking);
    writeBooking(nextBooking);
    setToastOpen(true);
  };

  const openDirections = () => {
    window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(booking.location)}`, "_blank", "noopener,noreferrer");
  };

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#F8FAFC] text-[#080B32]">
      <Header />
      <div className="mx-auto grid max-w-[1840px] gap-7 px-5 py-6 lg:px-8 xl:grid-cols-[minmax(0,1fr)_470px]">
        <section className="min-w-0 space-y-4">
          <Hero
            onViewBooking={viewBooking}
            messageOwnerHref={messageOwnerHref}
            messageOwnerUnavailableReason={messageOwnerUnavailableReason}
            onDownloadReceipt={downloadReceipt}
          />
          <Timeline />
          <div className="grid gap-4 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
            <StayDetails booking={booking} onDirections={openDirections} onCalendar={addToCalendar} />
            <GuestDetails guest={guest} onEdit={() => updateAndNavigate("/booking")} />
            <PaymentDetails
              booking={booking}
              onEdit={() => updateAndNavigate("/booking/payment")}
              onUpload={() => receiptInputRef.current?.click()}
            />
            <ImportantSteps />
            <div className="grid items-stretch gap-4 lg:grid-cols-[minmax(280px,0.72fr)_minmax(0,1.28fr)] xl:col-span-2">
              <Policies />
              <RecommendedActions booking={booking} />
            </div>
          </div>
          <SuggestedStays />
        </section>

        <aside className="min-w-0 space-y-4 xl:sticky xl:top-5 xl:self-start">
          {toastOpen ? <UploadToast onClose={() => setToastOpen(false)} /> : null}
          <BookingSummary booking={booking} />
          <SupportPanel />
          <HostCard
            messageOwnerHref={messageOwnerHref}
            messageOwnerUnavailableReason={messageOwnerUnavailableReason}
          />
          <ReferenceCard />
        </aside>
      </div>
      <input ref={receiptInputRef} type="file" className="hidden" onChange={uploadAnotherReceipt} accept="image/*,.pdf" />
    </main>
  );
}

function Header() {
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
          <button className="hidden items-center gap-2 md:inline-flex">
            <Icon name="globe" className="h-5 w-5" />
            English / EGP
            <Icon name="chevronDown" className="h-4 w-4" />
          </button>
          <button className="hidden items-center gap-2 md:inline-flex">
            <Icon name="help" className="h-5 w-5" />
            Help
          </button>
          <button aria-label="Notifications" className="relative">
            <Icon name="bell" />
          </button>
          <div className="hidden items-center gap-3 md:flex">
            <div className="h-9 w-9 overflow-hidden rounded-full bg-[#E9E3FF]">
              <Image src="/properties/madinty-bedroom.png" alt="" width={60} height={60} className="h-full w-full object-cover" />
            </div>
            Ismail
            <Icon name="chevronDown" className="h-4 w-4" />
          </div>
        </div>
      </div>
    </header>
  );
}

function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <section className={cn("rounded-[12px] border border-[#E1E7F0] bg-white p-5 shadow-[0_14px_35px_rgba(15,23,42,0.06)]", className)}>
      {children}
    </section>
  );
}

function Hero({
  onViewBooking,
  messageOwnerHref,
  messageOwnerUnavailableReason,
  onDownloadReceipt,
}: {
  onViewBooking: () => void;
  messageOwnerHref: string | null;
  messageOwnerUnavailableReason: string;
  onDownloadReceipt: () => void;
}) {
  return (
    <Card className="p-6 lg:p-8">
      <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)_250px] lg:items-center">
        <div className="flex justify-center">
          <div className="relative grid h-[142px] w-[142px] place-items-center rounded-full bg-[#5F36E9] text-white shadow-[0_22px_42px_rgba(95,54,233,0.25)]">
            <Icon name="file" className="h-20 w-20" />
            <span className="absolute bottom-1 right-1 grid h-14 w-14 place-items-center rounded-full border-[6px] border-white bg-[#F8FAFC] text-[#5F36E9]">
              <Icon name="check" className="h-8 w-8" />
            </span>
          </div>
        </div>
        <div className="min-w-0 text-center lg:text-left">
          <h1 className="text-[28px] font-black leading-tight lg:text-[34px]">Booking request received.</h1>
          <p className="mt-3 text-[15px] font-medium leading-6 text-[#34405A]">
            Your payment receipt is being reviewed by DAR. We will notify you once the booking is confirmed.
          </p>
          <div className="mt-5 flex flex-col gap-4 lg:flex-row lg:items-center">
            <span className="inline-flex h-9 items-center justify-center rounded-[8px] border border-[#F1CA82] bg-[#FFF8E9] px-4 text-[14px] font-bold text-[#B56B00]">
              Pending payment verification
            </span>
            <span className="hidden h-10 border-l border-[#DDE4F0] lg:block" />
            <div>
              <p className="text-[12px] font-semibold text-[#667085]">Booking reference</p>
              <p className="mt-1 flex items-center justify-center gap-2 text-[15px] font-bold lg:justify-start">
                {bookingReference}
                <Icon name="copy" className="h-4 w-4 text-[#59637C]" />
              </p>
            </div>
          </div>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <button onClick={onViewBooking} className="inline-flex h-11 items-center justify-center gap-2 rounded-[7px] bg-[#5F36E9] px-5 text-[14px] font-bold text-white shadow-[0_10px_22px_rgba(95,54,233,0.22)]">
              <Icon name="calendar" className="h-4 w-4" />
              View booking
            </button>
            {messageOwnerHref ? (
              <Link
                href={messageOwnerHref}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-[7px] border border-[#BDAEFF] px-5 text-[14px] font-bold text-[#5F36E9] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8B6DFF] focus-visible:ring-offset-2"
              >
                <Icon name="message" className="h-4 w-4" />
                Message owner
              </Link>
            ) : (
              <button
                type="button"
                disabled
                aria-disabled="true"
                aria-describedby="hero-message-owner-reason"
                title={messageOwnerUnavailableReason}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-[7px] border border-[#BDAEFF] px-5 text-[14px] font-bold text-[#5F36E9] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Icon name="message" className="h-4 w-4" />
                Message owner
              </button>
            )}
            <span id="hero-message-owner-reason" className="sr-only">
              {messageOwnerUnavailableReason}
            </span>
            <button onClick={onDownloadReceipt} className="inline-flex h-11 items-center justify-center gap-2 rounded-[7px] border border-[#D8DFEA] px-5 text-[14px] font-bold text-[#111735] hover:border-[#BFC7D6]">
              <Icon name="download" className="h-4 w-4" />
              Download receipt
            </button>
          </div>
        </div>
        <div className="rounded-[10px] border border-[#DDE4F0] p-5">
          <p className="text-[13px] font-semibold">After verification</p>
          <p className="mt-6 flex items-center gap-2 text-[20px] font-bold text-[#188A44]">
            <span className="grid h-7 w-7 place-items-center rounded-full border border-[#25A55D]">
              <Icon name="check" className="h-4 w-4" />
            </span>
            Confirmed
          </p>
          <p className="mt-3 text-[13px] leading-5 text-[#59637C]">We&apos;ll send you check-in details and booking confirmation.</p>
        </div>
      </div>
    </Card>
  );
}

function Timeline() {
  const steps = [
    ["1.", "Booking submitted", "May 19, 2026 - 10:24 AM", true],
    ["2", "Payment received", "May 19, 2026 - 10:28 AM", true],
    ["3", "DAR verification", "In progress", "active"],
    ["4", "Owner notified", "Pending", false],
    ["5", "Booking confirmed", "Pending", false],
  ] as const;

  return (
    <Card className="px-7 py-5">
      <div className="grid gap-6 md:grid-cols-5">
        {steps.map(([number, title, status, state], index) => (
          <div key={title} className="relative">
            {index < steps.length - 1 ? <span className="absolute left-[42px] top-4 hidden h-px w-[calc(100%+12px)] bg-[#DDE4F0] md:block" /> : null}
            <span
              className={cn(
                "relative z-10 grid h-8 w-8 place-items-center rounded-full text-[13px] font-black",
                state === true ? "bg-[#5F36E9] text-white" : state === "active" ? "bg-[#F7B928] text-[#080B32]" : "bg-[#E6EAF2] text-[#59637C]",
              )}
            >
              {state === true ? <Icon name="check" className="h-4 w-4" /> : number}
            </span>
            <p className="mt-3 text-[13px] font-bold">{title}</p>
            <p className="mt-1 text-[12px] text-[#59637C]">{status}</p>
          </div>
        ))}
      </div>
    </Card>
  );
}

function StayDetails({ booking, onDirections, onCalendar }: { booking: BookingPayload; onDirections: () => void; onCalendar: () => void }) {
  return (
    <Card>
      <h2 className="text-[17px] font-bold">Stay details</h2>
      <div className="mt-4 grid gap-5 md:grid-cols-[minmax(200px,0.82fr)_minmax(0,1.18fr)] md:items-start">
        <div className="min-w-0">
          <div className="relative aspect-[56/29] w-full overflow-hidden rounded-[8px] bg-[#EEF2F8]">
            <Image
              src={booking.image}
              alt={booking.title}
              fill
              sizes="(max-width: 767px) calc(100vw - 80px), (max-width: 1279px) 38vw, 280px"
              className="object-cover"
            />
          </div>
          <div className="mt-2 grid grid-cols-5 gap-2">
            {featuredProperty.images.slice(0, 4).map((image) => (
              <div key={image.src} className="relative aspect-square min-w-0 overflow-hidden rounded-[6px] bg-[#EEF2F8]">
                <Image
                  src={image.src}
                  alt=""
                  fill
                  sizes="(max-width: 767px) calc((100vw - 112px) / 5), (max-width: 1279px) 8vw, 56px"
                  className="object-cover"
                />
              </div>
            ))}
            <div className="grid aspect-square min-w-0 place-items-center rounded-[6px] bg-[#1F1A44] px-1 text-center text-[11px] font-bold leading-[1.15] text-white">
              <span>+12<br />Photos</span>
            </div>
          </div>
        </div>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <h3 className="min-w-0 text-[17px] font-bold leading-6">{booking.title}</h3>
            <span className="shrink-0 rounded-[6px] border border-[#F1CA82] bg-[#FFF8E9] px-2 py-1 text-[12px] font-bold text-[#B56B00]">Verified property</span>
          </div>
          <p className="mt-2 flex items-start gap-2 text-[13px] leading-5 text-[#34405A]">
            <Icon name="location" className="mt-0.5 h-4 w-4 shrink-0" />
            <span className="min-w-0">{booking.location}</span>
          </p>
          <div className="mt-4 grid grid-cols-2 gap-y-4 border-y border-[#E6EBF3] py-4 sm:grid-cols-4 sm:gap-y-0">
            <div className="min-w-0 pr-3 sm:pr-4">
              <Detail label="Check-in" value={formatDate(booking.checkIn)} sub="After 2:00 PM" />
            </div>
            <div className="min-w-0 border-l border-[#E6EBF3] pl-3 sm:px-4">
              <Detail label="Check-out" value={formatDate(booking.checkOut)} sub="Before 11:00 AM" />
            </div>
            <div className="min-w-0 pr-3 sm:border-l sm:border-[#E6EBF3] sm:px-4">
              <Detail label="Guests" value={`${booking.guests} guests`} />
            </div>
            <div className="min-w-0 border-l border-[#E6EBF3] pl-3 sm:pl-4">
              <Detail label="Property" value={booking.bedrooms && booking.bedrooms > 1 ? "Apartment" : "Studio"} />
            </div>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <button onClick={onDirections} className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-[7px] border border-[#DDE4F0] px-5 text-[13px] font-bold transition-shadow duration-200 hover:shadow-[0_8px_18px_rgba(15,23,42,0.10)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8B6DFF] focus-visible:ring-offset-2 active:shadow-[0_3px_8px_rgba(15,23,42,0.08)]">
              <Icon name="location" className="h-4 w-4" />
              Get directions
            </button>
            <button onClick={onCalendar} className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-[7px] border border-[#DDE4F0] px-5 text-[13px] font-bold transition-shadow duration-200 hover:shadow-[0_8px_18px_rgba(15,23,42,0.10)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8B6DFF] focus-visible:ring-offset-2 active:shadow-[0_3px_8px_rgba(15,23,42,0.08)]">
              <Icon name="calendar" className="h-4 w-4" />
              Add to calendar
            </button>
          </div>
        </div>
      </div>
    </Card>
  );
}

function GuestDetails({ guest, onEdit }: { guest: GuestInfo; onEdit: () => void }) {
  return (
    <Card>
      <div className="flex items-center justify-between">
        <h2 className="text-[17px] font-bold">Guest details</h2>
        <button
          onClick={onEdit}
          className="rounded-[5px] px-1.5 py-1 text-[13px] font-bold text-[#5F36E9] transition-shadow duration-200 hover:shadow-[0_5px_12px_rgba(15,23,42,0.10)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8B6DFF] focus-visible:ring-offset-2 active:shadow-[0_2px_6px_rgba(15,23,42,0.08)]"
        >
          Edit
        </button>
      </div>
      <div className="mt-4 flex items-start gap-3">
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-[#E8DDFF] text-[21px] font-bold text-[#5F36E9]">{initials(guest.fullName)}</span>
        <div className="min-w-0 pt-0.5">
          <p className="text-[16px] font-bold">{guest.fullName}</p>
          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-[#59637C]">
            <span className="min-w-0 break-words">{guest.email}</span>
            <span className="inline-flex shrink-0 items-center gap-1 text-[#188A44]">
              <Icon name="check" className="h-3.5 w-3.5" />
              Email verified
            </span>
          </div>
          <p className="mt-1.5 flex items-center gap-1.5 text-[13px] text-[#59637C]">
            <Icon name="phone" className="h-3.5 w-3.5 shrink-0" />
            <span>{guest.phone}</span>
          </p>
        </div>
      </div>
      <div className="mt-4">
        <p className="text-[12px] font-bold text-[#34405A]">Special requests</p>
        <div className="mt-1.5 rounded-[7px] border border-[#DDE4F0] bg-[#FBFCFF] p-3 text-[13px] leading-5 text-[#34405A]">
          {guest.requests || "No special requests added."}
        </div>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-2 text-[12px]">
        <span className="inline-flex items-center gap-1.5 font-bold text-[#34405A]">
          <Icon name="file" className="h-3.5 w-3.5 shrink-0" />
          ID verification
        </span>
        <span className="rounded-[6px] bg-[#F0ECFF] px-3 py-1 font-bold text-[#4C36B7]">Not required before confirmation</span>
        <span className="text-[#59637C]">You can upload ID after confirmation (optional).</span>
      </div>
    </Card>
  );
}

function PaymentDetails({ booking, onEdit, onUpload }: { booking: BookingPayload; onEdit: () => void; onUpload: () => void }) {
  return (
    <Card>
      <div className="flex items-center justify-between">
        <h2 className="text-[17px] font-bold">Payment details</h2>
        <button onClick={onEdit} className="text-[13px] font-bold text-[#5F36E9]">Edit</button>
      </div>
      <div className="mt-5 grid gap-4 border-b border-[#E6EBF3] pb-5 md:grid-cols-[1.2fr_1fr_1fr_1fr]">
        <div>
          <p className="text-[12px] text-[#59637C]">Payment method</p>
          <p className="mt-2 text-[19px] font-black text-[#5F36E9]">{paymentLabel(booking.paymentMethod)}</p>
          <span className="mt-2 inline-block rounded-[6px] bg-[#DDF7E8] px-3 py-1 text-[11px] font-bold text-[#188A44]">Popular in Egypt</span>
        </div>
        <Detail label="Amount paid" value={formatEgp(booking.total)} strong />
        <Detail label="Transaction ID" value={booking.paymentId ?? "IP-739201"} strong />
        <Detail label="Receipt status" value="Uploaded" sub="Pending review" strong />
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-5">
        <p className="text-[13px]">
          <span className="text-[#59637C]">Reference code</span>
          <span className="ml-4 font-bold">{bookingReference}</span>
        </p>
        <button onClick={onUpload} className="inline-flex h-10 items-center gap-2 rounded-[7px] border border-[#8D6BFF] px-6 text-[13px] font-bold text-[#5F36E9]">
          <Icon name="upload" className="h-4 w-4" />
          Upload another receipt
        </button>
      </div>
    </Card>
  );
}

function ImportantSteps() {
  return (
    <Card>
      <h2 className="text-[17px] font-bold">Important next steps</h2>
      <div className="mt-3.5 space-y-3">
        <p className="flex items-start gap-2.5 text-[14px] leading-5 text-[#34405A]">
          <ShieldCheck className="mt-0.5 h-[18px] w-[18px] shrink-0 text-[#5F36E9]" aria-hidden="true" />
          <span>DAR verifies payment receipt.</span>
        </p>
        <p className="flex items-start gap-2.5 text-[14px] leading-5 text-[#34405A]">
          <Users className="mt-0.5 h-[18px] w-[18px] shrink-0 text-[#5F36E9]" aria-hidden="true" />
          <span>Owner receives your booking request.</span>
        </p>
        <p className="flex items-start gap-2.5 text-[14px] leading-5 text-[#34405A]">
          <Icon name="mail" className="mt-0.5 h-[18px] w-[18px] shrink-0 text-[#5F36E9]" />
          <span>You get check-in details after confirmation.</span>
        </p>
        <p className="flex items-start gap-2.5 text-[14px] leading-5 text-[#34405A]">
          <Icon name="headset" className="mt-0.5 h-[18px] w-[18px] shrink-0 text-[#5F36E9]" />
          <span>Contact support if verification takes more than 2 hours.</span>
        </p>
      </div>
    </Card>
  );
}

function Policies() {
  return (
    <Card>
      <div className="flex items-start gap-3">
        <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-[#5F36E9]" aria-hidden="true" />
        <div className="min-w-0 flex-1">
          <h2 className="text-[16px] font-bold">Cancellation & policies</h2>
          <div className="mt-3 space-y-2 text-[13px] leading-5 text-[#34405A]">
            <p className="flex items-start gap-2">
              <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#188A44]" aria-hidden="true" />
              <span>Flexible cancellation before May 18, 2026.</span>
            </p>
            <p className="flex items-start gap-2">
              <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#188A44]" aria-hidden="true" />
              <span>Manual payment refunds may take 1-3 business days.</span>
            </p>
            <p className="flex flex-wrap items-start gap-x-2 gap-y-1">
              <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#188A44]" aria-hidden="true" />
              <span className="min-w-0 flex-1">House rules: No smoking, no parties, ID required.</span>
              <Link
                href="/legal/cancellation"
                className="shrink-0 rounded-[4px] font-semibold text-[#5F36E9] transition-shadow duration-200 hover:shadow-[0_4px_10px_rgba(15,23,42,0.10)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8B6DFF] focus-visible:ring-offset-2"
              >
                View full policy
              </Link>
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
}

function RecommendedActions({ booking }: { booking: BookingPayload }) {
  const actions = [
    ["Complete your profile", "/profile", UserRound, "purple"],
    ["Add your arrival time", "/bookings", Clock3, "orange"],
    ["Save owner contact", "/messages", Info, "purple"],
    ["Explore nearby stays", `/properties/${booking.propertyId}`, ShieldCheck, "purple"],
  ] as const;
  return (
    <Card>
      <h2 className="text-[17px] font-bold">Recommended actions</h2>
      <div className="mt-3 grid gap-2.5 sm:grid-cols-2 min-[1500px]:grid-cols-4">
        {actions.map(([label, href, ActionIcon, tone]) => (
          <Link
            key={label}
            href={href}
            className="flex min-h-[68px] min-w-0 items-center gap-2.5 rounded-[9px] bg-[#F8FAFC] px-3 text-[13px] font-bold transition-shadow duration-200 hover:shadow-[0_8px_18px_rgba(15,23,42,0.10)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8B6DFF] focus-visible:ring-offset-2 active:shadow-[0_3px_8px_rgba(15,23,42,0.08)]"
          >
            <span
              className={cn(
                "grid h-9 w-9 shrink-0 place-items-center rounded-full",
                tone === "orange" ? "bg-[#FFF1D8] text-[#E58A00]" : "bg-[#EEE8FF] text-[#5F36E9]",
              )}
            >
              <ActionIcon className="h-[18px] w-[18px]" aria-hidden="true" />
            </span>
            <span className="min-w-0 flex-1 leading-[18px]">{label}</span>
            <ChevronRight className="h-4 w-4 shrink-0 text-[#667085]" aria-hidden="true" />
          </Link>
        ))}
      </div>
    </Card>
  );
}

function BookingSummary({ booking }: { booking: BookingPayload }) {
  return (
    <Card className="p-6">
      <h2 className="text-[18px] font-bold">Booking summary</h2>
      <div className="mt-5 flex gap-4">
        <div className="relative h-[118px] w-[142px] shrink-0 overflow-hidden rounded-[8px]">
          <Image src={booking.image} alt={booking.title} fill className="object-cover" />
        </div>
        <div>
          <h3 className="text-[16px] font-bold">{booking.title}</h3>
          <p className="mt-2 text-[13px] text-[#59637C]">{booking.location}</p>
          <p className="mt-2 flex items-center gap-1 text-[13px]">
            <Icon name="star" filled className="h-4 w-4 text-[#F5A400]" />
            4.9 (32 reviews)
          </p>
          <span className="mt-2 inline-block rounded-[6px] border border-[#F1CA82] bg-[#FFF8E9] px-2 py-1 text-[12px] font-bold text-[#B56B00]">Verified property</span>
        </div>
      </div>
      <div className="mt-6 space-y-4 border-b border-[#E6EBF3] pb-5 text-[15px]">
        <PriceLine label={`${formatEgp(booking.pricePerNight)} x ${booking.nights} nights`} value={formatEgp(booking.subtotal)} />
        <PriceLine label="Cleaning fee" value={formatEgp(booking.cleaningFee)} />
        <PriceLine label="DAR service fee" value={formatEgp(booking.serviceFee)} />
        <PriceLine label="Launch discount" value={`- ${formatEgp(booking.discount)}`} green />
      </div>
      <div className="mt-5 flex items-end justify-between">
        <div>
          <p className="text-[18px] font-bold">Total</p>
          <p className="mt-1 text-[12px] text-[#59637C]">Including taxes and fees</p>
        </div>
        <p className="text-[26px] font-black text-[#5F36E9]">{formatEgp(booking.total)}</p>
      </div>
    </Card>
  );
}

function SupportPanel() {
  return (
    <Card>
      <h2 className="text-[18px] font-bold">Need help with your booking?</h2>
      <p className="mt-2 text-[13px] text-[#59637C]">DAR support available 24/7.</p>
      <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-2">
        <a href="mailto:support@dar.example?subject=Booking%20support" className="inline-flex h-12 items-center justify-center gap-2 rounded-[7px] bg-[#5F36E9] text-[14px] font-bold text-white">
          <Icon name="headset" className="h-5 w-5" />
          Contact support
        </a>
        <a href="https://wa.me/201001234567" target="_blank" rel="noreferrer" className="inline-flex h-12 items-center justify-center gap-2 rounded-[7px] border border-[#26A65B] text-[14px] font-bold text-[#188A44]">
          WhatsApp support
        </a>
      </div>
    </Card>
  );
}

function HostCard({
  messageOwnerHref,
  messageOwnerUnavailableReason,
}: {
  messageOwnerHref: string | null;
  messageOwnerUnavailableReason: string;
}) {
  return (
    <Card>
      <h2 className="text-[18px] font-bold">Hosted by</h2>
      <div className="mt-5 flex items-center gap-4">
        <div className="relative h-16 w-16 overflow-hidden rounded-full bg-[#E9E3FF]">
          <Image src="/properties/madinty-bedroom.png" alt="Ahmed Hassan" fill className="object-cover" />
        </div>
        <div>
          <p className="text-[17px] font-bold">Ahmed Hassan <span className="ml-2 rounded-[6px] border border-[#F1CA82] bg-[#FFF8E9] px-2 py-1 text-[12px] text-[#B56B00]">Verified Owner</span></p>
          <p className="mt-2 text-[13px] text-[#59637C]">Typically responds within 20 minutes</p>
        </div>
      </div>
      {messageOwnerHref ? (
        <Link
          href={messageOwnerHref}
          className="mt-6 inline-flex h-12 w-full items-center justify-center rounded-[7px] border border-[#DDE4F0] bg-[#F8FAFC] text-[14px] font-bold text-[#98A2B3] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8B6DFF] focus-visible:ring-offset-2"
        >
          Message owner
        </Link>
      ) : (
        <button
          type="button"
          disabled
          aria-disabled="true"
          aria-describedby="host-message-owner-reason"
          title={messageOwnerUnavailableReason}
          className="mt-6 h-12 w-full rounded-[7px] border border-[#DDE4F0] bg-[#F8FAFC] text-[14px] font-bold text-[#98A2B3] disabled:cursor-not-allowed"
        >
          Message owner
        </button>
      )}
      <p id="host-message-owner-reason" className="mt-3 text-center text-[12px] text-[#98A2B3]">
        {messageOwnerHref ? "Open your conversation with the owner." : messageOwnerUnavailableReason}
      </p>
    </Card>
  );
}

function ReferenceCard() {
  return (
    <Card>
      <h2 className="text-[18px] font-bold">Booking reference</h2>
      <p className="mt-4 text-[12px] text-[#59637C]">Show this at check-in after confirmation</p>
      <div className="mt-5 flex items-center justify-between gap-4">
        <p className="text-[23px] font-black">{bookingReference}</p>
        <span className="grid h-10 w-10 place-items-center rounded-[7px] border border-[#DDE4F0]"><Icon name="copy" className="h-5 w-5" /></span>
      </div>
      <div className="mt-5 grid h-[132px] w-[132px] grid-cols-5 gap-1 rounded-[8px] border border-[#8D6BFF] bg-white p-2">
        {Array.from({ length: 25 }).map((_, index) => (
          <span key={index} className={cn("rounded-[2px]", [0, 1, 3, 5, 6, 8, 10, 12, 14, 16, 18, 19, 20, 22, 24].includes(index) ? "bg-[#080B32]" : "bg-[#F2EEFF]")} />
        ))}
      </div>
    </Card>
  );
}

function UploadToast({ onClose }: { onClose: () => void }) {
  return (
    <div className="flex items-start gap-4 rounded-[10px] border border-[#BDE8CB] bg-white p-4 shadow-[0_15px_35px_rgba(15,23,42,0.08)]">
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#24A95A] text-white">
        <Icon name="check" className="h-5 w-5" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[15px] font-bold">Receipt uploaded successfully.</p>
        <p className="mt-1 text-[13px] text-[#59637C]">Verification is in progress.</p>
      </div>
      <button onClick={onClose} aria-label="Close upload notification">
        <Icon name="close" className="h-5 w-5" />
      </button>
    </div>
  );
}

function SuggestedStays() {
  return (
    <section className="pt-2">
      <h2 className="mb-3 text-[18px] font-bold">You may also like for your next trip</h2>
      <div className="grid gap-4 md:grid-cols-3">
        {resultProperties.slice(0, 3).map((property) => (
          <Link key={property.slug} href={`/properties/${property.slug}`} className="grid overflow-hidden rounded-[10px] border border-[#E1E7F0] bg-white shadow-[0_12px_26px_rgba(15,23,42,0.05)] md:grid-cols-[180px_minmax(0,1fr)]">
            <div className="relative h-[130px] md:h-full">
              <Image src={property.image} alt={property.title} fill className="object-cover" />
            </div>
            <div className="p-4">
              <p className="text-[13px] font-bold">{property.location}</p>
              <h3 className="mt-2 text-[15px] font-bold">{property.title}</h3>
              <p className="mt-4 flex items-center justify-between text-[13px]">
                <span>From {formatEgp(property.pricePerNight)} / night</span>
                <span className="flex items-center gap-1 text-[#34405A]"><Icon name="star" filled className="h-4 w-4 text-[#F5A400]" /> {property.rating}</span>
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

function Detail({ label, value, sub, strong = false }: { label: string; value: string; sub?: string; strong?: boolean }) {
  return (
    <div>
      <p className="text-[12px] font-medium text-[#59637C]">{label}</p>
      <p className={cn("mt-2 text-[13px]", strong ? "text-[18px] font-black text-[#5F36E9]" : "font-bold text-[#111735]")}>{value}</p>
      {sub ? <p className="mt-1 text-[12px] text-[#59637C]">{sub}</p> : null}
    </div>
  );
}

function PriceLine({ label, value, green = false }: { label: string; value: string; green?: boolean }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-[#34405A]">{label}</span>
      <span className={cn("font-semibold", green ? "text-[#0F9F3E]" : "text-[#111735]")}>{value}</span>
    </div>
  );
}
