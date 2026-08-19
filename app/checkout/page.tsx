"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChangeEvent, useEffect, useState, useSyncExternalStore } from "react";
import { featuredProperty } from "@/app/properties/[slug]/property-data";
import { requiredRedirectForStep } from "@/app/booking/flow-guards";
import { compactBookingQuery, shortPath } from "@/app/routing";
import { cn } from "@/lib/utils";

type IconName =
  | "bank"
  | "calendar"
  | "card"
  | "check"
  | "chevronDown"
  | "chevronRight"
  | "close"
  | "copy"
  | "file"
  | "globe"
  | "headset"
  | "help"
  | "home"
  | "lock"
  | "shield"
  | "star"
  | "upload"
  | "user"
  | "wallet";

function iconPath(name: IconName) {
  const paths: Record<IconName, string> = {
    bank: "M4 19h16M6 17V9m4 8V9m4 8V9m4 8V9M3 7l9-4 9 4H3Z",
    calendar:
      "M7 3v3M17 3v3M4.5 8.5h15M6 5h12a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z",
    card: "M4 7.5h16v9A2.5 2.5 0 0 1 17.5 19h-11A2.5 2.5 0 0 1 4 16.5v-9ZM4 10h16M7 15h4",
    check: "m5 12 4.2 4.2L19 6.5",
    chevronDown: "m7 9 5 5 5-5",
    chevronRight: "m9 6 6 6-6 6",
    close: "M6 6l12 12M18 6 6 18",
    copy: "M8 8h10v10H8V8Zm-2 8H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1",
    file: "M7 3h7l4 4v14H7V3Zm7 0v5h5",
    globe:
      "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM3.6 9h16.8M3.6 15h16.8M12 3c2.2 2.3 3.4 5.3 3.4 9S14.2 18.7 12 21c-2.2-2.3-3.4-5.3-3.4-9S9.8 5.3 12 3Z",
    headset:
      "M4 13a8 8 0 0 1 16 0v3a2 2 0 0 1-2 2h-2v-6h4M4 16a2 2 0 0 0 2 2h2v-6H4v4Zm8 5h2a4 4 0 0 0 4-4",
    help: "M12 18h.01M9.5 9a2.7 2.7 0 1 1 4.3 2.2c-.9.6-1.8 1.3-1.8 2.8M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Z",
    home: "M3.5 11.5 12 4l8.5 7.5M5.5 10.5V20h13v-9.5M9.5 20v-6h5v6",
    lock: "M7 10V8a5 5 0 0 1 10 0v2M6 10h12v10H6V10Zm6 4v2.5",
    shield: "M12 3 19 6v5c0 4.8-2.9 8-7 10-4.1-2-7-5.2-7-10V6l7-3Z",
    star: "m12 2.8 2.8 5.7 6.3.9-4.5 4.4 1.1 6.2L12 17.7 6.4 20.6l1.1-6.2L3 10l6.3-.9L12 2.8Z",
    upload: "M12 16V6m0 0L8 10m4-4 4 4M5 17v1.5A2.5 2.5 0 0 0 7.5 21h9a2.5 2.5 0 0 0 2.5-2.5V17",
    user: "M20 21a8 8 0 0 0-16 0M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10Z",
    wallet: "M4 7h15a2 2 0 0 1 2 2v9H6a3 3 0 0 1-3-3V6a3 3 0 0 0 3 3h15M16 14h.01",
  };

  return paths[name];
}

function Icon({
  name,
  className,
  filled = false,
}: {
  name: IconName;
  className?: string;
  filled?: boolean;
}) {
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
  return `EGP ${new Intl.NumberFormat("en-EG", {
    maximumFractionDigits: 0,
  }).format(value)}`;
}

type CheckoutBooking = {
  propertyId: string;
  title: string;
  location: string;
  image: string;
  checkIn: string;
  checkOut: string;
  guests: string;
  type: string;
  nightly: number;
  nights: number;
  cleaning: number;
  service: number;
  discount: number;
  promoDiscount: number;
};

type PendingBookingPayload = {
  propertyId?: string;
  title?: string;
  location?: string;
  image?: string;
  checkIn?: string;
  checkOut?: string;
  guests?: number;
  nights?: number;
  pricePerNight?: number;
  cleaningFee?: number;
  serviceFee?: number;
  discount?: number;
  promoCode?: string;
  promoDiscount?: number;
  promoStatus?: "idle" | "applied" | "invalid";
  paymentDetails?: {
    receiptFileName?: string;
    receiptFileType?: string;
    receiptFileSize?: number;
    [key: string]: string | number | boolean | undefined;
  };
  subtotal?: number;
  paymentMethod?: string;
  paymentId?: string;
  paymentSubmitted?: boolean;
  bookingStatus?: string;
  paymentSubmittedAt?: string;
  currency?: string;
  locale?: string;
};

const defaultBooking: CheckoutBooking = {
  propertyId: featuredProperty.slug,
  title: "Luxury Studio in Madinty",
  location: "B6, Madinty",
  image: "/properties/madinty-living.png",
  checkIn: "May 20, 2026",
  checkOut: "May 25, 2026",
  guests: "2 guests",
  type: "Instant request",
  nightly: 1200,
  nights: 5,
  cleaning: 250,
  service: 420,
  discount: 300,
  promoDiscount: 0,
};

function getBookingTotal(booking: CheckoutBooking) {
  return booking.nightly * booking.nights + booking.cleaning + booking.service - booking.discount - booking.promoDiscount;
}

function formatCheckoutDate(value: string | undefined) {
  if (!value) {
    return "";
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return value;
  }

  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(`${value}T12:00:00`));
}

function readPendingBooking(): CheckoutBooking | null {
  try {
    if (typeof window === "undefined") {
      return null;
    }

    const raw = window.sessionStorage.getItem("dar-pending-booking");
    if (!raw) {
      return null;
    }

    const pending = JSON.parse(raw) as PendingBookingPayload;
    const guests = pending.guests ?? 2;

    return {
      propertyId: pending.propertyId ?? featuredProperty.slug,
      title: pending.title ?? defaultBooking.title,
      location: pending.location ?? defaultBooking.location,
      image: pending.image ?? defaultBooking.image,
      checkIn: formatCheckoutDate(pending.checkIn) || defaultBooking.checkIn,
      checkOut: formatCheckoutDate(pending.checkOut) || defaultBooking.checkOut,
      guests: `${guests} guest${guests > 1 ? "s" : ""}`,
      type: defaultBooking.type,
      nightly: pending.pricePerNight ?? defaultBooking.nightly,
      nights: pending.nights ?? defaultBooking.nights,
      cleaning: pending.cleaningFee ?? defaultBooking.cleaning,
      service: pending.serviceFee ?? defaultBooking.service,
      discount: pending.discount ?? defaultBooking.discount,
      promoDiscount: pending.promoDiscount ?? 0,
    };
  } catch {
    return null;
  }
}

function readPendingPaymentMethod() {
  try {
    if (typeof window === "undefined") {
      return "instapay";
    }

    const raw = window.sessionStorage.getItem("dar-pending-booking");
    if (!raw) {
      return "instapay";
    }

    const pending = JSON.parse(raw) as PendingBookingPayload;
    return pending.paymentMethod ?? "instapay";
  } catch {
    return "instapay";
  }
}

function readPendingPayload(): PendingBookingPayload | null {
  try {
    if (typeof window === "undefined") return null;
    const raw = window.sessionStorage.getItem("dar-pending-booking");
    return raw ? (JSON.parse(raw) as PendingBookingPayload) : null;
  } catch {
    return null;
  }
}

function paymentLabel(method: string) {
  const labels: Record<string, string> = {
    card: "Credit / Debit Card",
    meeza: "Meeza Card",
    paymob: "Paymob / Accept",
    instapay: "InstaPay",
    vodafone: "Vodafone Cash",
    fawry: "Fawry",
    bank: "Bank transfer",
    arrival: "Pay on arrival",
    wallet: "Wallets",
    hotel: "Pay at hotel",
  };

  return labels[method] ?? "Selected payment";
}

function subscribeToHydration() {
  return () => undefined;
}

export default function CheckoutPage() {
  const isHydrated = useSyncExternalStore(subscribeToHydration, () => true, () => false);
  return isHydrated ? <CheckoutContent /> : null;
}

function CheckoutContent() {
  const router = useRouter();
  const [booking] = useState(() => readPendingBooking() ?? defaultBooking);
  const [selectedPayment] = useState(readPendingPaymentMethod);
  const initialPayload = readPendingPayload();
  const [receiptMetadata, setReceiptMetadata] = useState(() => ({
    name: initialPayload?.paymentDetails?.receiptFileName ?? "",
    type: initialPayload?.paymentDetails?.receiptFileType ?? "",
    size: Number(initialPayload?.paymentDetails?.receiptFileSize ?? 0),
  }));
  const [receiptError, setReceiptError] = useState("");
  const [promoCode, setPromoCode] = useState(initialPayload?.promoCode ?? "");
  const [promoStatus, setPromoStatus] = useState<"idle" | "applied" | "invalid">(initialPayload?.promoStatus ?? "idle");
  const [promoDiscount, setPromoDiscount] = useState(initialPayload?.promoDiscount ?? booking.promoDiscount);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const effectiveBooking = { ...booking, promoDiscount };
  const total = getBookingTotal(effectiveBooking);
  const needsReceipt = ["instapay", "vodafone", "fawry", "bank", "wallet"].includes(selectedPayment);

  const persistCheckoutState = (extra: Partial<PendingBookingPayload>) => {
    const current = readPendingPayload() ?? {};
    window.sessionStorage.setItem("dar-pending-booking", JSON.stringify({ ...current, ...extra }));
  };

  const applyPromo = () => {
    if (promoCode.trim().toUpperCase() === "DAR10") {
      const value = Math.round(booking.nightly * booking.nights * 0.1);
      setPromoCode("DAR10");
      setPromoDiscount(value);
      setPromoStatus("applied");
      persistCheckoutState({ promoCode: "DAR10", promoDiscount: value, promoStatus: "applied" });
    } else {
      setPromoDiscount(0);
      setPromoStatus("invalid");
      persistCheckoutState({ promoCode, promoDiscount: 0, promoStatus: "invalid" });
    }
  };

  useEffect(() => {
    const redirect = requiredRedirectForStep("checkout");
    if (redirect) router.replace(redirect);
  }, [router]);

  const submitForVerification = () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    const raw = window.sessionStorage.getItem("dar-pending-booking");
    const currentBooking = raw ? (JSON.parse(raw) as PendingBookingPayload) : {};
    const pendingBooking = {
      ...currentBooking,
      title: currentBooking.title ?? booking.title,
      location: currentBooking.location ?? booking.location,
      image: currentBooking.image ?? booking.image,
      checkIn: currentBooking.checkIn ?? booking.checkIn,
      checkOut: currentBooking.checkOut ?? booking.checkOut,
      guests: currentBooking.guests ?? Number.parseInt(booking.guests, 10) ?? 2,
      nights: currentBooking.nights ?? booking.nights,
      pricePerNight: currentBooking.pricePerNight ?? booking.nightly,
      cleaningFee: currentBooking.cleaningFee ?? booking.cleaning,
      serviceFee: currentBooking.serviceFee ?? booking.service,
      discount: currentBooking.discount ?? booking.discount,
      promoCode,
      promoDiscount,
      promoStatus,
      subtotal: currentBooking.subtotal ?? booking.nightly * booking.nights,
      total,
      currency: currentBooking.currency ?? "EGP",
      locale: currentBooking.locale ?? "en",
      paymentMethod: selectedPayment,
      paymentId: currentBooking.paymentId ?? "#PAY-784512",
      paymentSubmitted: true,
      bookingStatus: "request_received",
      paymentSubmittedAt: new Date().toISOString(),
      receiptStatus: needsReceipt && receiptMetadata.name ? "pending_review" : "not_required",
      paymentDetails: {
        ...currentBooking.paymentDetails,
        receiptFileName: receiptMetadata.name,
        receiptFileType: receiptMetadata.type,
        receiptFileSize: receiptMetadata.size,
      },
      bookingReference: "DAR-MAD-58291",
    };

    window.sessionStorage.setItem("dar-pending-booking", JSON.stringify(pendingBooking));
    const locale = pendingBooking.locale;
    const confirmationPath = shortPath("/booking/request-received", String(locale ?? "en"));
    const params = compactBookingQuery({
      property: pendingBooking.propertyId ?? featuredProperty.slug,
      checkIn: String(pendingBooking.checkIn),
      checkOut: String(pendingBooking.checkOut),
      guests: String(pendingBooking.guests),
      nights: String(pendingBooking.nights),
      locale: String(locale),
    });

    router.push(`${confirmationPath}?${params}`);
  };

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#FBFCFF] text-[#080B32]">
      <header className="border-b border-[#E5EAF3] bg-white">
        <div className="mx-auto flex h-[72px] w-full max-w-[1840px] items-center justify-between px-5 sm:px-8">
          <Link href={shortPath("/", "en")} aria-label="DAR home" className="flex items-center">
            <Image
              src="/dar-logo-purple-header.png"
              alt="DAR"
              width={320}
              height={142}
              className="h-[42px] w-auto object-contain"
              priority
            />
          </Link>

          <div className="hidden items-center gap-8 text-[14px] font-semibold text-[#111735] md:flex">
            <span className="inline-flex items-center gap-2">
              <Icon name="lock" className="h-4 w-4 text-[#D18B00]" />
              Secure checkout
            </span>
            <span className="inline-flex items-center gap-2 text-[#667085]">
              <span className="grid h-5 w-5 place-items-center rounded-full border border-[#1FB36B] text-[#1FB36B]">
                <Icon name="check" className="h-3.5 w-3.5" />
              </span>
              Your payment is protected
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button className="hidden items-center gap-2 rounded-lg px-2.5 py-2 text-[14px] font-semibold text-[#111735] hover:bg-[#F4F6FB] lg:inline-flex">
              <Icon name="globe" className="h-[18px] w-[18px]" />
              English / EGP
              <Icon name="chevronDown" className="h-4 w-4" />
            </button>
            <Link href="/help" className="hidden h-10 items-center gap-2 rounded-lg border border-[#DDE3EE] bg-white px-4 text-[14px] font-semibold shadow-[0_2px_8px_rgba(15,23,42,0.04)] transition-shadow hover:shadow-[0_6px_18px_rgba(15,23,42,.12)] sm:inline-flex">
              <Icon name="help" className="h-[18px] w-[18px]" />
              Help
            </Link>
            <Link href="/login" className="hidden h-10 items-center gap-2 rounded-lg border border-[#DDE3EE] bg-white px-4 text-[14px] font-semibold shadow-[0_2px_8px_rgba(15,23,42,0.04)] transition-shadow hover:shadow-[0_6px_18px_rgba(15,23,42,.12)] sm:inline-flex">
              <Icon name="user" className="h-[18px] w-[18px]" />
              Sign in
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto w-full max-w-[1840px] px-5 py-5 sm:px-8">
        <nav className="mb-3 flex items-center gap-2 text-[13px] text-[#64708B]">
          <Link href={shortPath("/", "en")} className="hover:text-[#5F36E9]">
            Home
          </Link>
          <Icon name="chevronRight" className="h-3.5 w-3.5" />
          <Link href={shortPath(`/properties/${featuredProperty.slug}`, "en")} className="hover:text-[#5F36E9]">
            {booking.title}
          </Link>
          <Icon name="chevronRight" className="h-3.5 w-3.5" />
          <span className="font-semibold text-[#111735]">Checkout</span>
        </nav>

        <section className="mb-4">
          <h1 className="text-[30px] font-bold leading-[1.05] tracking-[0] text-[#080B32] sm:text-[34px]">
            Secure checkout.
          </h1>
          <p className="mt-2 max-w-full break-words text-[15px] font-medium text-[#59637C]">
            Review your booking and submit it for DAR payment verification.
          </p>
        </section>

        <TrustStrip />
        <ProgressStrip />
        <BookingDetails booking={booking} />

        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_470px]">
          <div className="space-y-5">
            <VerificationStatus selectedPayment={selectedPayment} needsReceipt={needsReceipt} hasReceipt={Boolean(receiptMetadata.name)} />
            {needsReceipt ? (
              <ReceiptVerification
                receiptMetadata={receiptMetadata}
                setReceiptMetadata={setReceiptMetadata}
                error={receiptError}
                setError={setReceiptError}
                persist={(metadata) => persistCheckoutState({ paymentDetails: { ...(readPendingPayload()?.paymentDetails ?? {}), receiptFileName: metadata.name, receiptFileType: metadata.type, receiptFileSize: metadata.size } })}
              />
            ) : null}
            <VerificationTimeline needsReceipt={needsReceipt} />
          </div>

          <aside className="space-y-5 xl:sticky xl:top-5 xl:self-start">
            <OrderSummary
              booking={effectiveBooking}
              total={total}
              promoCode={promoCode}
              setPromoCode={setPromoCode}
              promoStatus={promoStatus}
              promoDiscount={promoDiscount}
              applyPromo={applyPromo}
              selectedPayment={selectedPayment}
            />
            <ProtectionCard />
            <OwnerPayoutCard />
          </aside>
        </div>

        <div className="mt-5 flex flex-col-reverse items-center gap-3 border-t border-[#E4EAF3] pt-5 md:flex-row md:justify-center">
          <Link
            href={shortPath(`/properties/${featuredProperty.slug}`, "en")}
            className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-[8px] border border-[#DDE3EE] bg-white px-8 text-[14px] font-bold text-[#111735] shadow-[0_2px_8px_rgba(15,23,42,0.03)] md:w-[200px]"
          >
            <span aria-hidden="true">←</span>
            Back to property
          </Link>
          <button
            onClick={submitForVerification}
            disabled={isSubmitting}
            className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-[8px] bg-[#5F36E9] px-8 text-[14px] font-bold text-white shadow-[0_10px_22px_rgba(95,54,233,0.22)] transition-shadow hover:shadow-[0_14px_28px_rgba(95,54,233,.28)] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:shadow-[0_10px_22px_rgba(95,54,233,0.22)] md:w-[430px]"
          >
            <Icon name="lock" className="h-4 w-4" />
            {isSubmitting ? "Submitting…" : "Submit payment for verification"}
          </button>
        </div>
        <p className="mt-2 text-center text-[12px] font-medium text-[#667085]">
          You won&apos;t be charged yet. We&apos;ll verify your payment first.
        </p>
      </div>

    </main>
  );
}

function TrustStrip() {
  const items = [
    { icon: "lock" as IconName, title: "SSL secured", body: "256-bit encryption" },
    { icon: "file" as IconName, title: "DAR payment verification", body: "Manual review for your safety" },
    { icon: "lock" as IconName, title: "Verified property", body: "Owner and property verified" },
    { icon: "shield" as IconName, title: "Egyptian payment methods", body: "Local and secure options" },
  ];

  return (
    <div className="mb-3 grid gap-2 rounded-[10px] border border-[#E0E6F0] bg-white px-4 py-3 shadow-[0_8px_24px_rgba(15,23,42,0.035)] sm:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => (
        <div key={item.title} className="flex items-center gap-3 px-1 py-1.5">
          <Icon name={item.icon} className="h-5 w-5 text-[#5F36E9]" />
          <div>
            <p className="text-[12px] font-bold text-[#111735]">{item.title}</p>
            <p className="mt-0.5 text-[11px] font-medium text-[#667085]">{item.body}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function ProgressStrip() {
  const steps = [
    { number: 1, title: "Booking details", status: "Completed", active: "gold" },
    { number: 2, title: "Payment", status: "In progress", active: "purple" },
    { number: 3, title: "Verification", status: "Pending", active: "muted" },
    { number: 4, title: "Confirmation", status: "Upcoming", active: "muted" },
  ];

  return (
    <div className="mb-3 rounded-[10px] border border-[#E0E6F0] bg-white px-5 py-4 shadow-[0_8px_24px_rgba(15,23,42,0.035)]">
      <div className="grid gap-4 md:grid-cols-4">
        {steps.map((step, index) => (
          <div key={step.title} className="flex items-center gap-3">
            <div
              className={cn(
                "grid h-9 w-9 shrink-0 place-items-center rounded-full text-[14px] font-bold",
                step.active === "gold" && "bg-[#D99011] text-white",
                step.active === "purple" && "bg-[#5F36E9] text-white",
                step.active === "muted" && "bg-[#E9EEF7] text-[#111735]",
              )}
            >
              {step.number}
            </div>
            <div className="min-w-0">
              <p className="text-[13px] font-bold text-[#111735]">{step.title}</p>
              <p className="text-[12px] font-medium text-[#667085]">{step.status}</p>
            </div>
            {index < steps.length - 1 && (
              <div
                className={cn(
                  "ml-auto hidden h-px flex-1 md:block",
                  index === 0 ? "bg-[#9B78FF]" : "bg-[#DDE4EF]",
                )}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function BookingDetails({ booking }: { booking: CheckoutBooking }) {
  return (
    <Card className="mb-3">
      <div className="mb-3 flex items-center justify-between gap-4">
        <h2 className="text-[15px] font-bold text-[#111735]">Your booking details</h2>
        <Link href={`/properties/${booking.propertyId}`} className="inline-flex items-center gap-1 text-[12px] font-bold text-[#5F36E9] focus-visible:outline-2 focus-visible:outline-[#5F36E9]">
          Change details
          <span aria-hidden="true">✎</span>
        </Link>
      </div>
      <div className="grid gap-4 md:grid-cols-[210px_minmax(170px,1fr)_repeat(4,minmax(120px,1fr))] md:items-center">
        <div className="relative h-[78px] overflow-hidden rounded-[8px] bg-[#EEF2F8]">
          <Image src={booking.image} alt={booking.title} fill className="object-cover" />
        </div>
        <div>
          <h3 className="text-[16px] font-bold text-[#111735]">{booking.title}</h3>
          <p className="mt-1 text-[12px] font-medium text-[#667085]">{booking.location}</p>
        </div>
        <Detail label="Check-in" value={booking.checkIn} />
        <Detail label="Check-out" value={booking.checkOut} />
        <Detail label="Guests" value={booking.guests} />
        <Detail label="Booking type" value={booking.type} />
      </div>
    </Card>
  );
}

function VerificationStatus({
  selectedPayment,
  needsReceipt,
  hasReceipt,
}: {
  selectedPayment: string;
  needsReceipt: boolean;
  hasReceipt: boolean;
}) {
  return (
    <Card>
      <SectionTitle index="1." title="Payment verification status" />
      <div className="mt-4 grid gap-4 md:grid-cols-[1fr_1fr]">
        <div className="rounded-[10px] border border-[#DCE3EF] bg-[#FBFCFF] p-4">
          <p className="text-[12px] font-semibold text-[#667085]">Selected payment method</p>
          <p className="mt-2 text-[18px] font-bold text-[#111735]">{paymentLabel(selectedPayment)}</p>
          <p className="mt-2 text-[13px] leading-5 text-[#667085]">
            This was selected in the previous payment step and is locked for this checkout review.
          </p>
        </div>
        <div className="rounded-[10px] border border-[#F4D9A5] bg-[#FFFCF6] p-4">
          <p className="text-[12px] font-semibold text-[#A15C08]">Current status</p>
          <p className="mt-2 text-[18px] font-bold text-[#111735]">
            {needsReceipt && hasReceipt ? "Receipt pending review" : "Ready for verification"}
          </p>
          <p className="mt-2 text-[13px] leading-5 text-[#667085]">
            {needsReceipt && hasReceipt
              ? "DAR will verify the uploaded receipt before confirming the booking."
              : needsReceipt
                ? "You may add an optional receipt before submitting these local payment details for review."
                : "DAR will submit your payment details for verification before holding the booking."}
          </p>
        </div>
      </div>
    </Card>
  );
}

function VerificationTimeline({ needsReceipt }: { needsReceipt: boolean }) {
  const steps = [
    ["Booking details", "Completed", true],
    ["Payment details", "Completed", true],
    [needsReceipt ? "Receipt review" : "Payment verification", "In progress", false],
    ["Booking confirmed", "Pending", false],
  ] as const;

  return (
    <Card>
      <SectionTitle index="3." title="Verification timeline" />
      <div className="mt-5 grid gap-4 md:grid-cols-4">
        {steps.map(([title, status, complete], index) => (
          <div key={title} className="relative text-center">
            {index < steps.length - 1 ? (
              <span className="absolute left-1/2 top-5 hidden h-px w-full bg-[#D8E0EC] md:block" />
            ) : null}
            <span
              className={cn(
                "relative z-10 mx-auto grid h-10 w-10 place-items-center rounded-full border bg-white",
                complete
                  ? "border-[#16A25D] bg-[#DCFCE7] text-[#16A25D]"
                  : index === 2
                    ? "border-[#5F36E9] bg-[#F4EEFF] text-[#5F36E9]"
                    : "border-[#C9D2E3] text-[#667085]",
              )}
            >
              {complete ? <Icon name="check" className="h-5 w-5" /> : index + 1}
            </span>
            <p className="mt-3 text-[12px] font-bold text-[#111735]">{title}</p>
            <p className="mt-1 text-[11px] font-medium text-[#667085]">{status}</p>
          </div>
        ))}
      </div>
    </Card>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-[#E2E8F0] md:border-l md:pl-5">
      <p className="text-[12px] font-medium text-[#667085]">{label}</p>
      <p className="mt-2 text-[13px] font-bold text-[#111735]">{value}</p>
    </div>
  );
}

function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <section
      className={cn(
        "rounded-[10px] border border-[#E0E6F0] bg-white p-4 shadow-[0_8px_24px_rgba(15,23,42,0.035)]",
        className,
      )}
    >
      {children}
    </section>
  );
}

function SectionTitle({
  index,
  title,
  compact = false,
}: {
  index: string;
  title: string;
  compact?: boolean;
}) {
  return (
    <h2 className={cn("flex items-center gap-2 font-bold text-[#111735]", compact ? "text-[13px]" : "text-[14px]")}>
      <span className="text-[#5F36E9]">{index}</span>
      {title}
    </h2>
  );
}

function ReceiptVerification({
  receiptMetadata,
  setReceiptMetadata,
  error,
  setError,
  persist,
}: {
  receiptMetadata: { name: string; type: string; size: number };
  setReceiptMetadata: (value: { name: string; type: string; size: number }) => void;
  error: string;
  setError: (value: string) => void;
  persist: (value: { name: string; type: string; size: number }) => void;
}) {
  const selectReceipt = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp", "application/pdf"].includes(file.type)) {
      setError("Choose a JPG, PNG, WEBP, or PDF file.");
      event.target.value = "";
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError("Receipt files must be 10 MB or smaller.");
      event.target.value = "";
      return;
    }
    const metadata = { name: file.name, type: file.type, size: file.size };
    setReceiptMetadata(metadata);
    setError("");
    persist(metadata);
  };
  return (
    <Card>
      <SectionTitle index="3." title="Upload receipt & verification" />
      <div className="mt-4 grid gap-5 md:grid-cols-[220px_minmax(0,1fr)]">
        <label className="flex min-h-[230px] cursor-pointer flex-col items-center justify-center rounded-[10px] border border-dashed border-[#8D6BFF] bg-[#FBFAFF] px-5 text-center hover:bg-[#F7F3FF]">
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,application/pdf"
            className="sr-only"
            onChange={selectReceipt}
          />
          <Icon name="upload" className="h-10 w-10 text-[#5F36E9]" />
          <p className="mt-5 text-[13px] font-bold text-[#111735]">Drag & drop your receipt here</p>
          <p className="mt-1 text-[11px] font-medium text-[#667085]">PNG, JPG or PDF up to 10MB</p>
          <p className="mt-4 inline-flex items-center gap-1.5 text-[12px] font-semibold text-[#16A25D]">
            <Icon name="check" className="h-4 w-4" />
            {receiptMetadata.name || "Ready for receipt"}
          </p>
          <span className="mt-3 rounded-md bg-[#FEF3C7] px-3 py-1 text-[11px] font-semibold text-[#9A5B07]">
            Pending review
          </span>
        </label>
        {error ? <p role="alert" className="text-[12px] font-semibold text-[#D92D20] md:col-span-2">{error}</p> : null}

        <div className="grid gap-3">
          <Field label="Sender full name" required defaultValue="Omar Nabil" />
          <Field label="Sender phone number" required defaultValue="+20 100 123 4567" />
          <Field label="Transaction ID / Reference" required defaultValue="INST-892734561" />
          <Field label="Payment time" required defaultValue="May 20, 2026 - 10:35 AM" icon="calendar" />
        </div>
      </div>
      <Timeline />
    </Card>
  );
}

function Field({
  label,
  defaultValue,
  required,
  icon,
}: {
  label: string;
  defaultValue?: string;
  required?: boolean;
  icon?: IconName;
}) {
  return (
    <label className="block">
      <span className="text-[12px] font-semibold text-[#34405A]">
        {label} {required && <span className="text-[#E5484D]">*</span>}
      </span>
      <span className="mt-1.5 flex h-10 items-center rounded-[7px] border border-[#DCE3EF] bg-white px-3 focus-within:border-[#8D6BFF]">
        <input
          defaultValue={defaultValue}
          className="min-w-0 flex-1 bg-transparent text-[13px] font-semibold text-[#111735] outline-none"
        />
        {icon && <Icon name={icon} className="h-4 w-4 text-[#667085]" />}
      </span>
    </label>
  );
}

function Timeline() {
  const steps = [
    ["Payment submitted", "Just now", true],
    ["DAR review", "In progress", false],
    ["Owner notification", "Pending", false],
    ["Booking confirmed", "Pending", false],
  ] as const;

  return (
    <div className="mt-5">
      <h3 className="text-[12px] font-bold text-[#111735]">Verification timeline</h3>
      <div className="mt-4 grid grid-cols-4 gap-2">
        {steps.map(([title, status, active], index) => (
          <div key={title} className="relative text-center">
            {index < steps.length - 1 && (
              <span className="absolute left-1/2 top-3 h-px w-full bg-[#B8C3D7]" />
            )}
            <span
              className={cn(
                "relative z-10 mx-auto grid h-7 w-7 place-items-center rounded-full border bg-white",
                active ? "border-[#5F36E9] bg-[#5F36E9] text-white" : "border-[#B8C3D7] text-[#667085]",
              )}
            >
              {active ? <Icon name="check" className="h-4 w-4" /> : <Icon name="file" className="h-3.5 w-3.5" />}
            </span>
            <p className="mt-3 text-[11px] font-bold text-[#111735]">{title}</p>
            <p className="mt-1 text-[10px] font-medium text-[#667085]">{status}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function OrderSummary({
  booking,
  total,
  promoCode,
  setPromoCode,
  promoStatus,
  promoDiscount,
  applyPromo,
  selectedPayment,
}: {
  booking: CheckoutBooking;
  total: number;
  promoCode: string;
  setPromoCode: (value: string) => void;
  promoStatus: "idle" | "applied" | "invalid";
  promoDiscount: number;
  applyPromo: () => void;
  selectedPayment: string;
}) {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-3">
        <h2 className="text-[18px] font-bold text-[#111735]">Order summary</h2>
        <span className="rounded-[7px] bg-[#DCFCE7] px-3 py-1.5 text-[12px] font-semibold text-[#168B4B]">
          {paymentLabel(selectedPayment)} selected
        </span>
      </div>
      <div className="mt-5 flex gap-4">
        <div className="relative h-[110px] w-[132px] shrink-0 overflow-hidden rounded-[9px] bg-[#EEF2F8]">
          <Image src={booking.image} alt={booking.title} fill className="object-cover" />
        </div>
        <div className="min-w-0">
          <h3 className="text-[15px] font-bold text-[#111735]">{booking.title}</h3>
          <p className="mt-1 text-[12px] font-semibold text-[#667085]">{booking.location}</p>
          <p className="mt-2 flex items-center gap-1 text-[12px] font-bold text-[#111735]">
            <Icon name="star" className="h-4 w-4 text-[#D99011]" filled />
            4.9 <span className="font-medium text-[#667085]">(32 reviews)</span>
          </p>
          <span className="mt-2 inline-flex items-center gap-1 rounded-[6px] bg-[#FFF2DE] px-2 py-1 text-[11px] font-semibold text-[#A15C08]">
            Verified property
            <Icon name="shield" className="h-3.5 w-3.5" />
          </span>
        </div>
      </div>

      <div className="mt-5 space-y-3 border-b border-[#E8EDF5] pb-4 text-[14px] font-medium text-[#34405A]">
        <PriceLine label={`${formatEgp(booking.nightly)} x ${booking.nights} nights`} value={formatEgp(booking.nightly * booking.nights)} />
        <PriceLine label="Cleaning fee" value={formatEgp(booking.cleaning)} />
        <PriceLine label="DAR service fee" value={formatEgp(booking.service)} />
        <PriceLine label="Launch discount" value={`- ${formatEgp(booking.discount)}`} discount />
        {promoDiscount > 0 ? <PriceLine label="DAR10 promo" value={`- ${formatEgp(promoDiscount)}`} discount /> : null}
      </div>

      <div className="mt-4 flex items-start justify-between">
        <div>
          <p className="text-[19px] font-bold text-[#111735]">Total due</p>
          <p className="mt-1 text-[12px] font-medium text-[#667085]">Including taxes and fees</p>
        </div>
        <p className="text-[28px] font-bold text-[#5F36E9]">{formatEgp(total)}</p>
      </div>

      <div className="mt-5 border-t border-[#E8EDF5] pt-4">
        <label className="text-[13px] font-semibold text-[#34405A]">Promo code (optional)</label>
        <div className="mt-2 flex gap-3">
          <input
            value={promoCode}
            onChange={(event) => setPromoCode(event.target.value)}
            placeholder="Enter code"
            className="h-11 min-w-0 flex-1 rounded-[8px] border border-[#DCE3EF] px-3 text-[13px] font-semibold outline-none focus:border-[#8D6BFF]"
          />
          <button type="button" onClick={applyPromo} className="h-11 rounded-[8px] bg-[#5F36E9] px-7 text-[14px] font-bold text-white transition-shadow hover:shadow-[0_8px_20px_rgba(95,54,233,.24)]">
            Apply
          </button>
        </div>
        {promoStatus !== "idle" ? <p aria-live="polite" className={cn("mt-2 text-[11px] font-semibold", promoStatus === "applied" ? "text-[#168B4B]" : "text-[#D92D20]")}>{promoStatus === "applied" ? `DAR10 applied: ${formatEgp(promoDiscount)} local demo discount.` : "This promo code is not available."}</p> : null}
      </div>
    </Card>
  );
}

function PriceLine({ label, value, discount = false }: { label: string; value: string; discount?: boolean }) {
  return (
    <div className="flex justify-between gap-4">
      <span>{label}</span>
      <span className={cn("font-bold text-[#111735]", discount && "text-[#16A25D]")}>{value}</span>
    </div>
  );
}

function ProtectionCard() {
  return (
    <Card className="p-5">
      <h2 className="text-[17px] font-bold text-[#111735]">Booking protection</h2>
      <div className="mt-4 space-y-4">
        {[
          ["Verified property", "Owner and property verified"],
          ["Secure payment tracking", "Your payment is protected"],
          ["Support available", "We're here 24/7 for you"],
        ].map(([title, body]) => (
          <div key={title} className="flex gap-3">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#E8F8EF] text-[#16A25D]">
              <Icon name="shield" className="h-5 w-5" />
            </span>
            <div>
              <p className="text-[13px] font-bold text-[#111735]">{title}</p>
              <p className="mt-1 text-[12px] font-medium text-[#667085]">{body}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-5 rounded-[9px] border border-[#DDE3EE] p-4">
        <div className="flex gap-3">
          <Icon name="headset" className="h-8 w-8 shrink-0 text-[#111735]" />
          <div>
            <p className="text-[13px] font-bold text-[#111735]">Need help with your booking?</p>
            <p className="mt-1 text-[12px] font-medium text-[#667085]">
              Our support team is ready to assist you.
            </p>
          </div>
        </div>
        <Link href="/help" className="mt-4 flex h-10 w-full items-center justify-center rounded-[8px] border border-[#744BFF] text-[13px] font-bold text-[#5F36E9] transition-shadow hover:shadow-[0_6px_18px_rgba(15,23,42,.1)]">
          Contact DAR support
        </Link>
      </div>
    </Card>
  );
}

function OwnerPayoutCard() {
  return (
    <Card className="border-[#F4D9A5] bg-[#FFFCF6] p-5">
      <div className="flex gap-4">
        <Icon name="bank" className="h-8 w-8 shrink-0 text-[#D99011]" />
        <div>
          <h2 className="text-[15px] font-bold text-[#111735]">Owner payout</h2>
          <p className="mt-1 text-[13px] font-medium leading-5 text-[#34405A]">
            The owner will receive payout after check-in confirmation.
          </p>
        </div>
      </div>
    </Card>
  );
}

