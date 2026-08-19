"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChangeEvent, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { featuredProperty } from "@/app/properties/[slug]/property-data";
import { requiredRedirectForStep } from "@/app/booking/flow-guards";
import { compactBookingQuery, shortPath } from "@/app/routing";
import { cn } from "@/lib/utils";

type FlowStep = "guest" | "payment";

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
  paymentDetails?: PaymentDetailsState;
  promoCode?: string;
  promoDiscount?: number;
  promoStatus?: PromoStatus;
};

type GuestInfo = {
  fullName: string;
  email: string;
  phone: string;
  phoneCountryCode: string;
  nationality: string;
  documentId: string;
  requests: string;
  shareWithOwner: boolean;
};

type PaymentDetailsState = {
  phoneCountryCode: string;
  vodafoneNumber: string;
  senderPhone: string;
  cardNumber: string;
  cardExpiry: string;
  cardCvv: string;
  cardName: string;
  instapayAlias: string;
  transferReference: string;
  receiptFileName: string;
  receiptFileType: string;
  receiptFileSize: number;
  houseRules?: boolean;
  termsAccepted?: boolean;
};

type PromoStatus = "idle" | "applied" | "invalid";
type ValidationErrors = Record<string, string>;

type IconName =
  | "bank"
  | "calendar"
  | "card"
  | "check"
  | "chevronDown"
  | "chevronRight"
  | "close"
  | "globe"
  | "headset"
  | "home"
  | "info"
  | "lock"
  | "shield"
  | "star"
  | "tag"
  | "upload"
  | "wallet";

const storageKey = "dar-pending-booking";
const receiptRequiredMethods = new Set(["vodafone", "instapay", "fawry", "bank"]);
const receiptTypes = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
const maxReceiptSize = 10 * 1024 * 1024;

const defaultGuestInfo: GuestInfo = {
  fullName: "Ahmed Mohamed",
  email: "ahmed.mo@example.com",
  phone: "10 1234 5678",
  phoneCountryCode: "+20",
  nationality: "Egypt",
  documentId: "A12345678",
  requests: "",
  shareWithOwner: true,
};

const defaultPaymentDetails: PaymentDetailsState = {
  phoneCountryCode: "+20",
  vodafoneNumber: "010 1234 5678",
  senderPhone: "10 1234 5678",
  cardNumber: "",
  cardExpiry: "",
  cardCvv: "",
  cardName: "Ahmed Mohamed",
  instapayAlias: "",
  transferReference: "",
  receiptFileName: "",
  receiptFileType: "",
  receiptFileSize: 0,
};

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
    globe:
      "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM3.6 9h16.8M3.6 15h16.8M12 3c2.2 2.3 3.4 5.3 3.4 9S14.2 18.7 12 21c-2.2-2.3-3.4-5.3-3.4-9S9.8 5.3 12 3Z",
    headset:
      "M4 13a8 8 0 0 1 16 0v3a2 2 0 0 1-2 2h-2v-6h4M4 16a2 2 0 0 0 2 2h2v-6H4v4Zm8 5h2a4 4 0 0 0 4-4",
    home: "M3.5 11.5 12 4l8.5 7.5M5.5 10.5V20h13v-9.5M9.5 20v-6h5v6",
    info: "M12 17v-6M12 7h.01M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Z",
    lock: "M7 10V8a5 5 0 0 1 10 0v2M6 10h12v10H6V10Zm6 4v2.5",
    shield: "M12 3 19 6v5c0 4.8-2.9 8-7 10-4.1-2-7-5.2-7-10V6l7-3Z",
    star: "m12 2.8 2.8 5.7 6.3.9-4.5 4.4 1.1 6.2L12 17.7 6.4 20.6l1.1-6.2L3 10l6.3-.9L12 2.8Z",
    tag: "M20 12 12 20 4 12V4h8l8 8ZM8 8h.01",
    upload: "M12 16V6m0 0L8 10m4-4 4 4M5 17v1.5A2.5 2.5 0 0 0 7.5 21h9a2.5 2.5 0 0 0 2.5-2.5V17",
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
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(`${value}T12:00:00`));
}

function readBooking(): BookingPayload {
  const fallbackSubtotal = 1200 * 5;
  const fallback: BookingPayload = {
    propertyId: featuredProperty.slug,
    title: "Luxury Studio in Madinty",
    location: "B6, Madinty",
    image: "/properties/madinty-living.png",
    checkIn: "2026-05-20",
    checkOut: "2026-05-25",
    guests: 2,
    nights: 5,
    pricePerNight: 1200,
    cleaningFee: 250,
    serviceFee: 420,
    discount: 300,
    subtotal: fallbackSubtotal,
    total: fallbackSubtotal + 250 + 420 - 300,
    currency: "EGP",
    locale: "en",
    guestInfo: defaultGuestInfo,
    paymentMethod: "vodafone",
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
    const subtotal = parsed.subtotal ?? (parsed.pricePerNight ?? fallback.pricePerNight) * (parsed.nights ?? fallback.nights);
    const discount = parsed.discount ?? fallback.discount;
    const cleaningFee = parsed.cleaningFee ?? fallback.cleaningFee;
    const serviceFee = parsed.serviceFee ?? fallback.serviceFee;

    return {
      ...fallback,
      ...parsed,
      guestInfo: { ...defaultGuestInfo, ...parsed.guestInfo },
      paymentMethod: parsed.paymentMethod ?? fallback.paymentMethod,
      paymentDetails: { ...defaultPaymentDetails, ...parsed.paymentDetails },
      promoCode: parsed.promoCode ?? "",
      promoDiscount: parsed.promoDiscount ?? 0,
      promoStatus: parsed.promoStatus ?? "idle",
      subtotal,
      discount,
      cleaningFee,
      serviceFee,
      total: parsed.total ?? subtotal + cleaningFee + serviceFee - discount,
    };
  } catch {
    return fallback;
  }
}

function writeBooking(nextBooking: BookingPayload) {
  window.sessionStorage.setItem(storageKey, JSON.stringify(nextBooking));
}

function bookingQuery(booking: BookingPayload) {
  return compactBookingQuery({
    property: booking.propertyId,
    checkIn: booking.checkIn,
    checkOut: booking.checkOut,
    guests: String(booking.guests),
    nights: String(booking.nights),
    locale: booking.locale,
  });
}

function localizedPath(booking: BookingPayload, path: string) {
  return shortPath(path, booking.locale);
}

function subscribeToHydration() {
  return () => undefined;
}

export function BookingFlowPage({ step }: { step: FlowStep }) {
  const isHydrated = useSyncExternalStore(subscribeToHydration, () => true, () => false);
  return isHydrated ? <BookingFlowContent step={step} /> : null;
}

function BookingFlowContent({ step }: { step: FlowStep }) {
  const router = useRouter();
  const [booking, setBooking] = useState(readBooking);
  const [guestInfo, setGuestInfo] = useState<GuestInfo>(booking.guestInfo ?? defaultGuestInfo);
  const [paymentMethod, setPaymentMethod] = useState(booking.paymentMethod ?? (step === "payment" ? "card" : "vodafone"));
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetailsState>({
    ...defaultPaymentDetails,
    ...booking.paymentDetails,
    cardName: booking.paymentDetails?.cardName || guestInfo.fullName,
  });
  const [houseRules, setHouseRules] = useState(Boolean(booking.paymentDetails?.houseRules ?? step === "guest"));
  const [termsAccepted, setTermsAccepted] = useState(Boolean(booking.paymentDetails?.termsAccepted ?? step === "guest"));
  const [promoCode, setPromoCode] = useState(booking.promoCode ?? "");
  const [promoStatus, setPromoStatus] = useState<PromoStatus>(booking.promoStatus ?? "idle");
  const [promoDiscount, setPromoDiscount] = useState(booking.promoDiscount ?? 0);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const paymentSectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const redirect = requiredRedirectForStep(step === "payment" ? "payment-method" : "guest");
    if (redirect) router.replace(redirect);
  }, [router, step]);

  useEffect(() => {
    if (step !== "guest" || window.location.hash !== "#payment-method") return;
    window.requestAnimationFrame(() => {
      paymentSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      paymentSectionRef.current?.querySelector<HTMLElement>("[role='radiogroup']")?.focus();
    });
  }, [step]);

  const total = useMemo(
    () => booking.subtotal + booking.cleaningFee + booking.serviceFee - booking.discount - promoDiscount,
    [booking, promoDiscount],
  );

  const updateGuest = (key: keyof GuestInfo, value: string | boolean) => {
    setGuestInfo((current) => {
      const next = { ...current, [key]: value };
      writeBooking({ ...booking, guestInfo: next, paymentMethod, paymentDetails, promoCode, promoDiscount, promoStatus, total });
      return next;
    });
    setErrors((current) => ({ ...current, [key]: "" }));
  };

  const updatePayment = (key: keyof PaymentDetailsState, value: string | number) => {
    setPaymentDetails((current) => {
      const next = { ...current, [key]: value };
      writeBooking({ ...booking, guestInfo, paymentMethod, paymentDetails: next, promoCode, promoDiscount, promoStatus, total });
      return next;
    });
    setErrors((current) => ({ ...current, [key]: "" }));
  };

  const persist = (extra: Partial<BookingPayload>) => {
    const nextBooking = {
      ...booking,
      ...extra,
      guestInfo,
      paymentMethod,
      paymentDetails,
      promoCode,
      promoDiscount,
      promoStatus,
      total,
    };
    setBooking(nextBooking);
    writeBooking(nextBooking);
    return nextBooking;
  };

  const focusFirstError = (nextErrors: ValidationErrors) => {
    const key = Object.keys(nextErrors)[0];
    if (!key) return;
    window.requestAnimationFrame(() => {
      document.querySelector<HTMLElement>(`[data-booking-field="${key}"]`)?.focus();
    });
  };

  const validateGuest = () => {
    const next: ValidationErrors = {};
    if (guestInfo.fullName.trim().length < 2) next.fullName = "Enter your full name.";
    if (!/^\S+@\S+\.\S+$/.test(guestInfo.email)) next.email = "Enter a valid email address.";
    if (!guestInfo.phoneCountryCode) next.phoneCountryCode = "Choose a country code.";
    if (!/^\d{7,12}$/.test(guestInfo.phone.replace(/\D/g, ""))) next.phone = "Enter a valid phone number.";
    if (!guestInfo.nationality.trim()) next.nationality = "Choose your nationality.";
    if (guestInfo.documentId.trim().length < 5) next.documentId = "Enter a valid ID or passport number.";
    if (!guestInfo.shareWithOwner) next.shareWithOwner = "Consent is required to continue.";
    return next;
  };

  const validatePayment = () => {
    const next: ValidationErrors = {};
    if (!paymentMethod) next.paymentMethod = "Choose a payment method.";
    if (["card", "meeza", "paymob"].includes(paymentMethod)) {
      if (paymentDetails.cardNumber.replace(/\D/g, "").length < 12) next.cardNumber = "Enter a valid card number.";
      if (!/^\d{2}\s*\/\s*\d{2}$/.test(paymentDetails.cardExpiry)) next.cardExpiry = "Use MM / YY format.";
      if (!/^\d{3,4}$/.test(paymentDetails.cardCvv)) next.cardCvv = "Enter a valid CVV.";
      if (!paymentDetails.cardName.trim()) next.cardName = "Enter the name on the card.";
    } else if (paymentMethod === "vodafone") {
      if (paymentDetails.vodafoneNumber.replace(/\D/g, "").length < 10) next.vodafoneNumber = "Enter a valid Vodafone Cash number.";
      if (paymentDetails.senderPhone.replace(/\D/g, "").length < 10) next.senderPhone = "Enter a valid sender phone number.";
    } else if (paymentMethod === "instapay") {
      if (!paymentDetails.instapayAlias.trim()) next.instapayAlias = "Enter the sender InstaPay alias.";
      if (!paymentDetails.transferReference.trim()) next.transferReference = "Enter the transfer reference.";
    } else if (["fawry", "bank"].includes(paymentMethod) && !paymentDetails.transferReference.trim()) {
      next.transferReference = "Enter the payment reference.";
    }
    if (
      receiptRequiredMethods.has(paymentMethod) &&
      (!paymentDetails.receiptFileName ||
        !receiptTypes.includes(paymentDetails.receiptFileType) ||
        paymentDetails.receiptFileSize <= 0 ||
        paymentDetails.receiptFileSize > maxReceiptSize)
    ) {
      next.receiptFileName = "Choose a valid JPG, PNG, WEBP, or PDF receipt up to 10 MB.";
    }
    return next;
  };

  const continueToPayment = () => {
    if (isSubmitting) return;
    const nextErrors = { ...validateGuest(), ...validatePayment() };
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) {
      focusFirstError(nextErrors);
      return;
    }
    setIsSubmitting(true);
    const nextBooking = persist({ guestInfo, paymentMethod });
    router.push(`${localizedPath(nextBooking, "/booking/payment")}?${bookingQuery(nextBooking)}`);
  };

  const continueToVerification = () => {
    if (isSubmitting) return;
    const nextErrors = validatePayment();
    if (!houseRules) nextErrors.houseRules = "Accept the house rules to continue.";
    if (!termsAccepted) nextErrors.termsAccepted = "Accept the terms to continue.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) {
      focusFirstError(nextErrors);
      return;
    }
    setIsSubmitting(true);
    const nextBooking = persist({
      guestInfo,
      paymentMethod,
      paymentDetails: {
        ...paymentDetails,
        houseRules,
        termsAccepted,
      },
    });
    router.push(`${localizedPath(nextBooking, "/checkout")}?${bookingQuery(nextBooking)}`);
  };

  const selectPaymentMethod = (value: string) => {
    setPaymentMethod(value);
    setErrors((current) => ({ ...current, paymentMethod: "" }));
    writeBooking({ ...booking, guestInfo, paymentMethod: value, paymentDetails, promoCode, promoDiscount, promoStatus, total });
  };

  const updatePolicy = (key: "houseRules" | "termsAccepted", value: boolean) => {
    if (key === "houseRules") setHouseRules(value);
    else setTermsAccepted(value);
    setErrors((current) => ({ ...current, [key]: "" }));
    const nextDetails = { ...paymentDetails, [key]: value };
    setPaymentDetails(nextDetails);
    writeBooking({ ...booking, guestInfo, paymentMethod, paymentDetails: nextDetails, promoCode, promoDiscount, promoStatus, total });
  };

  const applyPromo = () => {
    if (promoCode.trim().toUpperCase() === "DAR10") {
      const nextDiscount = Math.round(booking.subtotal * 0.1);
      setPromoStatus("applied");
      setPromoDiscount(nextDiscount);
      writeBooking({ ...booking, guestInfo, paymentMethod, paymentDetails, promoCode: "DAR10", promoStatus: "applied", promoDiscount: nextDiscount, total: booking.subtotal + booking.cleaningFee + booking.serviceFee - booking.discount - nextDiscount });
      return;
    }
    setPromoStatus("invalid");
    setPromoDiscount(0);
    writeBooking({ ...booking, guestInfo, paymentMethod, paymentDetails, promoCode, promoStatus: "invalid", promoDiscount: 0, total: booking.subtotal + booking.cleaningFee + booking.serviceFee - booking.discount });
  };

  return (
    <main className="min-h-screen bg-[#FBFCFF] text-[#080B32]">
      <BookingHeader />
      <div className="mx-auto grid max-w-[1840px] grid-cols-[minmax(0,1fr)] gap-8 px-4 py-6 sm:px-8 xl:grid-cols-[minmax(0,1fr)_540px]">
        <section className="min-w-0">
          <Breadcrumb booking={booking} />
          <h1 className="mt-5 text-[32px] font-bold leading-tight tracking-[0]">Complete your booking</h1>
          <p className="mt-2 text-[15px] font-medium text-[#59637C]">Secure your stay in a few simple steps.</p>
          <Progress step={step} booking={booking} />
          <StayStrip booking={booking} />

          <div className="space-y-3">
            {step === "guest" ? (
              <>
                <GuestInformation guestInfo={guestInfo} updateGuest={updateGuest} errors={errors} />
                <div id="payment-method" ref={paymentSectionRef}>
                  <GuestPaymentMethod
                    paymentMethod={paymentMethod}
                    setPaymentMethod={selectPaymentMethod}
                    paymentDetails={paymentDetails}
                    updatePayment={updatePayment}
                    errors={errors}
                    guestInfo={guestInfo}
                  />
                </div>
              </>
            ) : (
              <>
                <PaymentDetails paymentMethod={paymentMethod} guestInfo={guestInfo} booking={booking} paymentDetails={paymentDetails} updatePayment={updatePayment} errors={errors} />
                <Policies
                  houseRules={houseRules}
                  termsAccepted={termsAccepted}
                  setHouseRules={(value) => updatePolicy("houseRules", value)}
                  setTermsAccepted={(value) => updatePolicy("termsAccepted", value)}
                  errors={errors}
                />
              </>
            )}
          </div>

          <div className="mt-4 flex items-center justify-between gap-4">
            <Link
              href={localizedPath(booking, `/properties/${booking.propertyId}`)}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-[7px] border border-[#DCE3EF] bg-white px-8 text-[14px] font-bold text-[#111735] transition-shadow duration-200 hover:shadow-[0_6px_18px_rgba(15,23,42,.1)] focus-visible:outline-2 focus-visible:outline-[#5F36E9]"
            >
              <span aria-hidden="true">←</span>
              Back to property
            </Link>
            <button
              type="button"
              onClick={step === "guest" ? continueToPayment : continueToVerification}
              disabled={
                isSubmitting
              }
              className="inline-flex h-12 w-[290px] items-center justify-center gap-2 rounded-[7px] bg-[#5F36E9] text-[15px] font-bold text-white shadow-[0_12px_24px_rgba(95,54,233,0.23)] transition-shadow duration-200 hover:shadow-[0_16px_30px_rgba(95,54,233,0.3)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5F36E9] disabled:cursor-not-allowed disabled:bg-[#B8AAF4] disabled:hover:shadow-[0_12px_24px_rgba(95,54,233,0.23)]"
            >
              <Icon name="lock" className="h-4 w-4" />
              {isSubmitting ? "Processing…" : step === "guest" ? "Continue to payment" : "Confirm and reserve"}
            </button>
          </div>
        </section>

        <aside className="xl:sticky xl:top-6 xl:self-start">
          <SummaryCard
            booking={booking}
            total={total}
            paymentMethod={paymentMethod}
            showPayment
            promoCode={promoCode}
            setPromoCode={(value) => { setPromoCode(value); setPromoStatus("idle"); }}
            promoStatus={promoStatus}
            promoDiscount={promoDiscount}
            applyPromo={applyPromo}
            onPaymentChange={() => {
              if (step === "payment") {
                const nextBooking = persist({});
                router.push(`${localizedPath(nextBooking, "/booking")}?${bookingQuery(nextBooking)}#payment-method`);
                return;
              }
              paymentSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
              paymentSectionRef.current?.querySelector<HTMLElement>("[role='radiogroup']")?.focus();
            }}
          />
          <TrustCard variant={step} />
        </aside>
      </div>
    </main>
  );
}

function BookingHeader() {
  return (
    <header className="border-b border-[#E5EAF3] bg-white">
      <div className="mx-auto flex h-[72px] max-w-[1840px] items-center justify-between px-8">
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
        <nav className="hidden items-center gap-12 text-[15px] font-semibold text-[#080B32] lg:flex">
          <Link href={shortPath("/rent", "en")}>Stays</Link>
          <Link href={shortPath("/hotels", "en")}>Hotels</Link>
          <Link href={shortPath("/new-projects", "en")}>Become a host</Link>
          <Link href={shortPath("/", "en")}>About us</Link>
          <Link href={shortPath("/help", "en")}>Help</Link>
        </nav>
        <div className="flex items-center gap-5 text-[14px] font-semibold">
          <button className="hidden items-center gap-2 lg:inline-flex">
            <Icon name="globe" className="h-5 w-5" />
            English / EGP
            <Icon name="chevronDown" className="h-4 w-4" />
          </button>
          <Link href={shortPath("/login", "en")} className="inline-flex h-11 items-center rounded-[8px] border border-[#5F36E9] px-7 text-[#5F36E9] transition-shadow hover:shadow-[0_6px_18px_rgba(15,23,42,.12)] focus-visible:outline-2 focus-visible:outline-[#5F36E9]">
            Sign in
          </Link>
        </div>
      </div>
    </header>
  );
}

function Breadcrumb({ booking }: { booking: BookingPayload }) {
  return (
    <nav className="flex items-center gap-3 text-[13px] font-medium text-[#64708B]">
      <Link href={localizedPath(booking, "/")}>Home</Link>
      <span>/</span>
      <span>Madinty</span>
      <span>/</span>
      <Link href={localizedPath(booking, `/properties/${booking.propertyId}`)}>{booking.title}</Link>
      <span>/</span>
      <span>Booking</span>
    </nav>
  );
}

function Progress({ step, booking }: { step: FlowStep; booking: BookingPayload }) {
  const active = step === "guest" ? 2 : 3;
  const steps = [
    ["1", "Trip details"],
    ["2", "Guest information"],
    ["3", "Payment"],
    ["4", "Confirmation"],
  ];

  return (
    <div className="mx-auto mt-5 max-w-[990px] px-10">
      <div className="grid grid-cols-[48px_1fr_48px_1fr_48px_1fr_48px] items-center">
        {steps.map(([number, label], index) => {
          const marker = <div className="text-center">
            <span className={cn("mx-auto grid h-10 w-10 place-items-center rounded-full border text-[17px] font-bold", index === 0 ? "border-[#F3AF2D] bg-[#F3AF2D] text-white" : index + 1 === active ? "border-[#5F36E9] bg-[#5F36E9] text-white" : "border-[#C9D2E3] bg-white text-[#080B32]")}>{index === 0 ? <Icon name="check" className="h-5 w-5" /> : number}</span>
            <p className={cn("mt-3 whitespace-nowrap text-[12px] font-medium", index + 1 === active ? "text-[#5F36E9]" : "text-[#34405A]")}>{label}</p>
          </div>;
          const backHref = index === 0 ? `${localizedPath(booking, `/properties/${booking.propertyId}`)}?${bookingQuery(booking)}` : index === 1 && step === "payment" ? `${localizedPath(booking, "/booking")}?${bookingQuery(booking)}` : null;
          return <div key={number} className={cn(index > 0 && "contents")}>
            {index > 0 ? (
              <div
                className={cn(
                  "h-px",
                  index + 1 <= active ? "bg-[#5F36E9]" : index === 1 ? "bg-[#E0A425]" : "bg-[#D7DEEA]",
                )}
              />
            ) : null}
            {backHref ? <Link href={backHref} aria-label={`Go back to ${label}`} className="rounded focus-visible:outline-2 focus-visible:outline-[#5F36E9]">{marker}</Link> : marker}
          </div>
        })}
      </div>
    </div>
  );
}

function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <section className={cn("rounded-[10px] border border-[#DDE4EF] bg-white shadow-[0_8px_24px_rgba(15,23,42,0.035)]", className)}>
      {children}
    </section>
  );
}

function StepTitle({ number, title }: { number: number; title: string }) {
  return (
    <h2 className="flex items-center gap-3 text-[18px] font-bold text-[#111735]">
      <span className="grid h-7 w-7 place-items-center rounded-full bg-[#5F36E9] text-[14px] font-bold text-white">
        {number}
      </span>
      {title}
    </h2>
  );
}

function StayStrip({ booking }: { booking: BookingPayload }) {
  return (
    <Card className="mt-5 p-4">
      <div className="grid gap-4 lg:grid-cols-[250px_minmax(210px,1fr)_170px_170px_150px_80px] lg:items-center">
        <div className="relative h-[94px] overflow-hidden rounded-[8px] bg-[#EEF2F8]">
          <Image src={booking.image} alt={booking.title} fill className="object-cover" />
        </div>
        <div>
          <h2 className="text-[17px] font-bold">{booking.title}</h2>
          <p className="mt-2 text-[13px] font-medium text-[#59637C]">{booking.location}</p>
        </div>
        <Detail label="Check-in" value={formatDate(booking.checkIn)} />
        <Detail label="Check-out" value={formatDate(booking.checkOut)} />
        <Detail label="Guests" value={`${booking.guests} guests`} />
        <Link href={`${localizedPath(booking, `/properties/${booking.propertyId}`)}?${bookingQuery(booking)}`} className="text-right text-[13px] font-bold text-[#5F36E9] focus-visible:outline-2 focus-visible:outline-[#5F36E9]">Change</Link>
      </div>
    </Card>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-[#DDE4EF] lg:border-l lg:pl-8">
      <p className="text-[12px] font-medium text-[#667085]">{label}</p>
      <p className="mt-2 text-[14px] font-bold">{value}</p>
    </div>
  );
}

function GuestInformation({
  guestInfo,
  updateGuest,
  errors,
}: {
  guestInfo: GuestInfo;
  updateGuest: (key: keyof GuestInfo, value: string | boolean) => void;
  errors: ValidationErrors;
}) {
  return (
    <Card className="p-4">
      <StepTitle number={2} title="Guest information" />
      <div className="mt-4 grid gap-4 md:grid-cols-3">
        <Field field="fullName" label="Full name" value={guestInfo.fullName} onChange={(value) => updateGuest("fullName", value)} error={errors.fullName} />
        <Field field="email" label="Email address" type="email" value={guestInfo.email} onChange={(value) => updateGuest("email", value)} error={errors.email} />
        <div>
          <label className="text-[12px] font-medium text-[#34405A]">Phone number</label>
          <div className="mt-2 grid grid-cols-[92px_1fr] gap-2">
            <select aria-label="Phone country code" data-booking-field="phoneCountryCode" value={guestInfo.phoneCountryCode} onChange={(event) => updateGuest("phoneCountryCode", event.target.value)} className="h-10 rounded-[6px] border border-[#DCE3EF] bg-white px-2 text-[13px] font-semibold outline-none focus:border-[#8D6BFF]">
              <option value="+20">EG +20</option>
              <option value="+971">AE +971</option>
              <option value="+966">SA +966</option>
            </select>
            <input
              aria-label="Phone number"
              inputMode="numeric"
              data-booking-field="phone"
              value={guestInfo.phone}
              onChange={(event) => updateGuest("phone", event.target.value.replace(/[^\d\s-]/g, ""))}
              className={cn("h-10 rounded-[6px] border px-3 text-[13px] font-semibold outline-none focus:border-[#8D6BFF]", errors.phone ? "border-[#E5484D]" : "border-[#DCE3EF]")}
            />
          </div>
          {errors.phoneCountryCode || errors.phone ? <p role="alert" className="mt-1 text-[11px] text-[#D92D20]">{errors.phoneCountryCode || errors.phone}</p> : null}
        </div>
        <label className="block">
          <span className="text-[12px] font-medium text-[#34405A]">Nationality</span>
          <select
            value={guestInfo.nationality}
            data-booking-field="nationality"
            onChange={(event) => updateGuest("nationality", event.target.value)}
            className="mt-2 h-10 w-full rounded-[6px] border border-[#DCE3EF] bg-white px-3 text-[13px] font-semibold outline-none focus:border-[#8D6BFF]"
          >
            <option value="Egypt">Egypt</option>
            <option value="United Arab Emirates">United Arab Emirates</option>
            <option value="Saudi Arabia">Saudi Arabia</option>
          </select>
          {errors.nationality ? <p role="alert" className="mt-1 text-[11px] text-[#D92D20]">{errors.nationality}</p> : null}
        </label>
        <Field
          label="ID / Passport number *"
          field="documentId"
          value={guestInfo.documentId}
          onChange={(value) => updateGuest("documentId", value)}
          error={errors.documentId}
        />
      </div>
      <label className="mt-4 block">
        <span className="text-[12px] font-medium text-[#34405A]">Special requests (optional)</span>
        <textarea
          value={guestInfo.requests}
          maxLength={500}
          onChange={(event) => updateGuest("requests", event.target.value)}
          placeholder="Tell the owner anything they should know"
          className="mt-2 h-[54px] w-full resize-none rounded-[6px] border border-[#DCE3EF] px-3 py-2 text-[13px] outline-none focus:border-[#8D6BFF]"
        />
      </label>
      <label className="mt-3 flex items-center gap-2 text-[13px] font-medium text-[#34405A]">
        <input
          type="checkbox"
          data-booking-field="shareWithOwner"
          checked={guestInfo.shareWithOwner}
          onChange={(event) => updateGuest("shareWithOwner", event.target.checked)}
          className="h-4 w-4 accent-[#5F36E9]"
        />
        I agree to share my booking details with the verified owner.
      </label>
      {errors.shareWithOwner ? <p role="alert" className="mt-1 text-[11px] text-[#D92D20]">{errors.shareWithOwner}</p> : null}
    </Card>
  );
}

function Field({ label, value, onChange, field, error, type = "text", inputMode }: { label: string; value: string; onChange: (value: string) => void; field?: string; error?: string; type?: string; inputMode?: "numeric" | "text" }) {
  return (
    <label className="block">
      <span className="text-[12px] font-medium text-[#34405A]">{label}</span>
      <input
        type={type}
        inputMode={inputMode}
        data-booking-field={field}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={cn("mt-2 h-10 w-full rounded-[6px] border px-3 text-[13px] font-semibold outline-none focus:border-[#8D6BFF]", error ? "border-[#E5484D]" : "border-[#DCE3EF]")}
      />
      {error ? <span role="alert" className="mt-1 block text-[11px] text-[#D92D20]">{error}</span> : null}
    </label>
  );
}

const paymentOptions = [
  { id: "card", label: "Credit / Debit Card", logo: "VISA  MC" },
  { id: "meeza", label: "Meeza Card", logo: "meeza" },
  { id: "vodafone", label: "Vodafone Cash", logo: "Vodafone", badge: "Popular" },
  { id: "instapay", label: "InstaPay", logo: "instaPay", badge: "Fast" },
  { id: "fawry", label: "Fawry", logo: "Fawry", badge: "Cash collection" },
  { id: "paymob", label: "Paymob / Accept", logo: "paymob" },
  { id: "bank", label: "Bank transfer", logo: "Bank" },
  { id: "arrival", label: "Pay on arrival", logo: "Cash" },
];

function GuestPaymentMethod({
  paymentMethod,
  setPaymentMethod,
  paymentDetails,
  updatePayment,
  errors,
  guestInfo,
}: {
  paymentMethod: string;
  setPaymentMethod: (value: string) => void;
  paymentDetails: PaymentDetailsState;
  updatePayment: (key: keyof PaymentDetailsState, value: string | number) => void;
  errors: ValidationErrors;
  guestInfo: GuestInfo;
}) {
  return (
    <Card className="p-4">
      <StepTitle number={3} title="Choose payment method" />
      <div role="radiogroup" aria-label="Payment method" tabIndex={-1} data-booking-field="paymentMethod" className="mt-4 grid gap-3 md:grid-cols-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5F36E9]">
        {paymentOptions.map((option) => (
          <PaymentOption
            key={option.id}
            option={option}
            selected={paymentMethod === option.id}
            onSelect={() => setPaymentMethod(option.id)}
          />
        ))}
      </div>
      {errors.paymentMethod ? <p role="alert" className="mt-2 text-[11px] text-[#D92D20]">{errors.paymentMethod}</p> : null}
      <PaymentMethodFields paymentMethod={paymentMethod} guestInfo={guestInfo} paymentDetails={paymentDetails} updatePayment={updatePayment} errors={errors} compact />
      <div className="mt-3 rounded-[7px] border border-[#DCE3EF] bg-white px-4 py-3 text-[13px] font-bold">
        Or pay with card <span className="ml-8 text-[#1D4ED8]">VISA</span> <span className="ml-3 text-[#D99011]">MC</span>{" "}
        <span className="ml-3 text-[#5F36E9]">meeza</span>
      </div>
      <p className="mt-3 flex items-center gap-2 text-[12px] font-medium text-[#64708B]">
        <Icon name="lock" className="h-4 w-4" />
        All payments are secure and encrypted.
      </p>
    </Card>
  );
}

function PaymentOption({
  option,
  selected,
  onSelect,
}: {
  option: { id: string; label: string; logo: string; badge?: string };
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onSelect}
      className={cn(
        "flex min-h-[74px] items-center gap-3 rounded-[8px] border bg-white px-4 text-left hover:border-[#9B7AFF]",
        selected ? "border-[#744BFF] shadow-[0_0_0_1px_rgba(95,54,233,0.35)]" : "border-[#DCE3EF]",
      )}
    >
      <span className={cn("h-4 w-4 rounded-full border", selected ? "border-[#5F36E9] bg-[#5F36E9]" : "border-[#B8C3D7]")} />
        <span className="min-w-0 flex-1">
          <span className="block text-[14px] font-bold">{option.label}</span>
          <span className="mt-1 inline-flex items-center gap-2 text-[12px] font-black text-[#5F36E9]">
          {option.id === "instapay" ? <Image src="/brands/instapay.svg" alt="InstaPay" width={82} height={24} className="h-5 w-auto object-contain" /> : option.id === "vodafone" ? <><Image src="/brands/vodafone.svg" alt="" width={20} height={20} className="size-5 object-contain" /><span>Vodafone Cash</span></> : option.logo}
          {option.badge ? (
            <span className="rounded-full bg-[#EAF7EF] px-2 py-0.5 text-[10px] font-bold text-[#168B4B]">
              {option.badge}
            </span>
          ) : null}
        </span>
      </span>
    </button>
  );
}

function VodafonePanel({ paymentDetails, updatePayment, errors, receiptError, setReceiptError }: { paymentDetails: PaymentDetailsState; updatePayment: (key: keyof PaymentDetailsState, value: string | number) => void; errors: ValidationErrors; receiptError: string; setReceiptError: (value: string) => void }) {
  return (
    <div className="mt-3 rounded-[8px] border border-[#CFC0FF] bg-[#FCFAFF] p-4">
      <div className="grid gap-4 md:grid-cols-3">
        <Field field="vodafoneNumber" label="Vodafone Cash number" inputMode="numeric" value={paymentDetails.vodafoneNumber} onChange={(value) => updatePayment("vodafoneNumber", value.replace(/[^\d\s-]/g, ""))} error={errors.vodafoneNumber} />
        <div>
          <label className="text-[12px] font-medium text-[#34405A]">Sender phone number</label>
          <div className="mt-2 grid grid-cols-[86px_1fr] gap-2">
            <select aria-label="Sender phone country code" value={paymentDetails.phoneCountryCode} onChange={(event) => updatePayment("phoneCountryCode", event.target.value)} className="h-10 rounded-[6px] border border-[#DCE3EF] bg-white px-2 text-[13px] font-semibold"><option value="+20">+20</option><option value="+971">+971</option><option value="+966">+966</option></select>
            <input aria-label="Sender phone number" inputMode="numeric" data-booking-field="senderPhone" value={paymentDetails.senderPhone} onChange={(event) => updatePayment("senderPhone", event.target.value.replace(/[^\d\s-]/g, ""))} className={cn("h-10 rounded-[6px] border px-3 text-[13px] font-semibold outline-none focus:border-[#8D6BFF]", errors.senderPhone ? "border-[#E5484D]" : "border-[#DCE3EF]")} />
          </div>
          {errors.senderPhone ? <p role="alert" className="mt-1 text-[11px] text-[#D92D20]">{errors.senderPhone}</p> : null}
        </div>
        <div>
          <label className="text-[12px] font-medium text-[#34405A]">Upload receipt</label>
          <div className="mt-2 flex min-h-10 items-center gap-3">
            <label className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-[6px] border border-[#DCE3EF] bg-white px-4 text-[13px] font-bold text-[#5F36E9] transition-shadow duration-200 hover:shadow-[0_6px_18px_rgba(15,23,42,.1)] focus-within:outline-2 focus-within:outline-[#5F36E9]">
              <Icon name="upload" className="h-4 w-4" />
              Choose file
              <ReceiptInput updatePayment={updatePayment} setError={setReceiptError} />
            </label>
            <span className="min-w-0 truncate text-[12px] font-medium text-[#64708B]">{paymentDetails.receiptFileName || "No file chosen"}</span>
          </div>
          {receiptError || errors.receiptFileName ? <p role="alert" aria-live="polite" className="mt-1 text-[11px] text-[#D92D20]">{receiptError || errors.receiptFileName}</p> : null}
        </div>
      </div>
      <p className="mt-3 flex items-center gap-2 text-[12px] font-medium text-[#59637C]">
        <Icon name="info" className="h-4 w-4 text-[#5F36E9]" />
        Payment confirmation: DAR will verify the payment before confirming the booking.
      </p>
    </div>
  );
}
function ReceiptInput({ updatePayment, setError }: { updatePayment: (key: keyof PaymentDetailsState, value: string | number) => void; setError: (value: string) => void }) {
  const clearReceipt = () => {
    updatePayment("receiptFileName", "");
    updatePayment("receiptFileType", "");
    updatePayment("receiptFileSize", 0);
  };
  const handleFile = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!receiptTypes.includes(file.type)) {
      clearReceipt();
      setError("Choose a JPG, PNG, WEBP, or PDF file.");
      event.target.value = "";
      return;
    }
    if (file.size > maxReceiptSize) {
      clearReceipt();
      setError("Receipt files must be 10 MB or smaller.");
      event.target.value = "";
      return;
    }
    setError("");
    updatePayment("receiptFileName", file.name);
    updatePayment("receiptFileType", file.type);
    updatePayment("receiptFileSize", file.size);
  };
  return <input type="file" accept="image/jpeg,image/png,image/webp,application/pdf" data-booking-field="receiptFileName" className="sr-only" onChange={handleFile} />;
}
function PaymentMethodFields({ paymentMethod, guestInfo, paymentDetails, updatePayment, errors, compact = false }: { paymentMethod: string; guestInfo: GuestInfo; paymentDetails: PaymentDetailsState; updatePayment: (key: keyof PaymentDetailsState, value: string | number) => void; errors: ValidationErrors; compact?: boolean }) {
  const [receiptError, setReceiptError] = useState("");
  if (["card", "meeza", "paymob"].includes(paymentMethod)) {
    return <div className={cn("rounded-[8px] border border-[#DCE3EF] bg-white p-4", compact ? "mt-3" : "p-5")}>
      <Field field="cardNumber" label="Card number" inputMode="numeric" value={paymentDetails.cardNumber} onChange={(value) => updatePayment("cardNumber", value.replace(/[^\d\s]/g, ""))} error={errors.cardNumber} />
      <div className="mt-3 grid gap-4 md:grid-cols-2"><Field field="cardExpiry" label="Expiry date" value={paymentDetails.cardExpiry} onChange={(value) => updatePayment("cardExpiry", value)} error={errors.cardExpiry} /><Field field="cardCvv" label="CVV" inputMode="numeric" value={paymentDetails.cardCvv} onChange={(value) => updatePayment("cardCvv", value.replace(/\D/g, "").slice(0, 4))} error={errors.cardCvv} /></div>
      <div className="mt-3"><Field field="cardName" label="Name on card" value={paymentDetails.cardName || guestInfo.fullName} onChange={(value) => updatePayment("cardName", value)} error={errors.cardName} /></div>
      <p className="mt-3 text-[11px] text-[#64708B]">Demo entry only. No card is charged in this frontend flow.</p>
    </div>;
  }
  if (paymentMethod === "vodafone") return <VodafonePanel paymentDetails={paymentDetails} updatePayment={updatePayment} errors={errors} receiptError={receiptError} setReceiptError={setReceiptError} />;
  if (paymentMethod === "arrival") return <div className="mt-3 rounded-[8px] border border-[#DCE3EF] bg-white p-5"><h3 className="text-[15px] font-bold">Pay on arrival</h3><p className="mt-2 text-[13px] leading-6 text-[#59637C]">Payment is collected at check-in after the owner approves the booking request.</p></div>;

  const config = paymentMethod === "instapay"
    ? { title: "Send with InstaPay", destinationLabel: "DAR payment alias", destination: "dar.payments@instapay", fieldLabel: "Sender InstaPay alias", field: "instapayAlias" as const }
    : paymentMethod === "bank"
      ? { title: "Bank transfer instructions", destinationLabel: "Bank account", destination: "DAR Rentals - EG820030...", fieldLabel: "Transaction reference", field: "transferReference" as const }
      : { title: "Fawry payment instructions", destinationLabel: "Fawry code", destination: "DAR-58291", fieldLabel: "Fawry reference", field: "transferReference" as const };
  return <div className="mt-3 rounded-[8px] border border-[#CFC0FF] bg-[#FCFAFF] p-5">
    <h3 className="text-[15px] font-bold">{config.title}</h3>
    <div className="mt-4 grid gap-4 md:grid-cols-3"><div><p className="text-[12px] font-medium text-[#59637C]">{config.destinationLabel}</p><p className="mt-2 text-[15px] font-bold">{config.destination}</p></div><Field field={config.field} label={config.fieldLabel} value={paymentDetails[config.field]} onChange={(value) => updatePayment(config.field, value)} error={errors[config.field]} />{paymentMethod === "instapay" ? <Field field="transferReference" label="Transfer reference" value={paymentDetails.transferReference} onChange={(value) => updatePayment("transferReference", value)} error={errors.transferReference} /> : null}</div>
    <div className="mt-4 flex flex-wrap items-center gap-3">
      <label className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-[6px] border border-[#DCE3EF] bg-white px-4 text-[13px] font-bold text-[#5F36E9] transition-shadow duration-200 hover:shadow-[0_6px_18px_rgba(15,23,42,.1)] focus-within:outline-2 focus-within:outline-[#5F36E9]"><Icon name="upload" className="h-4 w-4"/>Choose receipt<ReceiptInput updatePayment={updatePayment} setError={setReceiptError}/></label>
      <span className="min-w-0 truncate text-[12px] font-medium text-[#64708B]">{paymentDetails.receiptFileName || "No file chosen"}</span>
    </div>
    {receiptError || errors.receiptFileName ? <p role="alert" aria-live="polite" className="mt-1 text-[11px] text-[#D92D20]">{receiptError || errors.receiptFileName}</p> : null}
    <p className="mt-3 text-[11px] text-[#64708B]">Local verification details only. No transfer is processed or uploaded to a backend.</p>
  </div>;
}

function PaymentDetails({
  paymentMethod,
  guestInfo,
  booking,
  paymentDetails,
  updatePayment,
  errors,
}: {
  paymentMethod: string;
  guestInfo: GuestInfo;
  booking: BookingPayload;
  paymentDetails: PaymentDetailsState;
  updatePayment: (key: keyof PaymentDetailsState, value: string | number) => void;
  errors: ValidationErrors;
}) {
  const selectedOption = paymentOptions.find((option) => option.id === paymentMethod);

  return (
    <Card className="p-4">
      <div className="flex items-start justify-between gap-4">
        <StepTitle number={3} title={`${selectedOption?.label ?? "Payment"} details`} />
        <Link href={`${localizedPath(booking, "/booking")}?${bookingQuery(booking)}#payment-method`} className="rounded text-[13px] font-bold text-[#5F36E9] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5F36E9]">
          Change method
        </Link>
      </div>
      <div className="mt-4">
        <PaymentMethodFields paymentMethod={paymentMethod} guestInfo={guestInfo} paymentDetails={paymentDetails} updatePayment={updatePayment} errors={errors} />
      </div>
      <p className="mt-3 flex items-center gap-2 text-[12px] font-medium text-[#64708B]">
        <Icon name="lock" className="h-4 w-4" />
        Your payment details are secure and encrypted.
      </p>
    </Card>
  );
}

function Policies({
  houseRules,
  termsAccepted,
  setHouseRules,
  setTermsAccepted,
  errors,
}: {
  houseRules: boolean;
  termsAccepted: boolean;
  setHouseRules: (value: boolean) => void;
  setTermsAccepted: (value: boolean) => void;
  errors: ValidationErrors;
}) {
  return (
    <Card className="p-4">
      <StepTitle number={4} title="Policies" />
      <div className="mt-4 grid gap-8 md:grid-cols-[430px_1fr]">
        <div className="flex items-center gap-4 rounded-[8px] border border-[#DCE3EF] bg-white p-4">
          <Icon name="calendar" className="h-6 w-6 text-[#5F36E9]" />
          <div className="flex-1">
            <p className="text-[13px] font-bold">Cancellation</p>
            <p className="mt-1 text-[12px] text-[#64708B]">Flexible cancellation before May 18, 2026.</p>
          </div>
          <Link href="/legal/cancellation" className="rounded text-[12px] font-bold text-[#5F36E9] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5F36E9]">View policy</Link>
        </div>
        <div className="space-y-4">
          <label className="flex items-center gap-3 text-[13px] font-medium text-[#34405A]">
            <input data-booking-field="houseRules" type="checkbox" checked={houseRules} onChange={(event) => setHouseRules(event.target.checked)} className="h-4 w-4 accent-[#5F36E9]" />
            I agree to the house rules of this property.
          </label>
          {errors.houseRules ? <p role="alert" className="text-[11px] text-[#D92D20]">{errors.houseRules}</p> : null}
          <div className="flex items-center gap-3 text-[13px] font-medium text-[#34405A]">
            <input id="booking-terms" data-booking-field="termsAccepted" type="checkbox" checked={termsAccepted} onChange={(event) => setTermsAccepted(event.target.checked)} className="h-4 w-4 accent-[#5F36E9]" />
            <p>
              <label htmlFor="booking-terms">I accept the </label>
              <Link href="/legal/terms" className="rounded text-[#5F36E9] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5F36E9]">Terms of Service</Link>{" "}
              and <Link href="/legal/privacy" className="rounded text-[#5F36E9] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5F36E9]">Privacy Policy</Link>.
            </p>
          </div>
          {errors.termsAccepted ? <p role="alert" className="text-[11px] text-[#D92D20]">{errors.termsAccepted}</p> : null}
        </div>
      </div>
    </Card>
  );
}

function SummaryCard({
  booking,
  total,
  paymentMethod,
  showPayment,
  promoCode,
  setPromoCode,
  promoStatus,
  promoDiscount,
  applyPromo,
  onPaymentChange,
}: {
  booking: BookingPayload;
  total: number;
  paymentMethod: string;
  showPayment: boolean;
  promoCode: string;
  setPromoCode: (value: string) => void;
  promoStatus: PromoStatus;
  promoDiscount: number;
  applyPromo: () => void;
  onPaymentChange: () => void;
}) {
  return (
    <Card className="p-5">
      <div className="flex gap-5 border-b border-[#E6EBF3] pb-5">
        <div className="relative h-[126px] w-[190px] shrink-0 overflow-hidden rounded-[8px] bg-[#EEF2F8]">
          <Image src={booking.image} alt={booking.title} fill className="object-cover" />
        </div>
        <div>
          <h2 className="text-[17px] font-bold">{booking.title}</h2>
          <p className="mt-2 flex items-center gap-1 text-[13px] font-bold">
            <Icon name="star" className="h-4 w-4 text-[#D99011]" filled />
            4.9 <span className="font-medium text-[#64708B]">(32 reviews)</span>
          </p>
          <p className="mt-3 flex items-center gap-2 text-[13px] text-[#34405A]">
            <Icon name="shield" className="h-4 w-4 text-[#5F36E9]" />
            Verified property
          </p>
          {showPayment ? (
            <span className="mt-4 inline-flex rounded-[6px] bg-[#FFF2DE] px-3 py-1 text-[12px] font-semibold text-[#A15C08]">
              Pending payment confirmation
            </span>
          ) : null}
        </div>
      </div>
      <div className="space-y-3 border-b border-[#E6EBF3] py-4 text-[15px] text-[#34405A]">
        <PriceLine label={`${formatEgp(booking.pricePerNight)} x ${booking.nights} nights`} value={formatEgp(booking.subtotal)} />
        <PriceLine label="Cleaning fee" value={formatEgp(booking.cleaningFee)} />
        <PriceLine label="Service fee" value={formatEgp(booking.serviceFee)} />
        <PriceLine label="Discount" value={`-${formatEgp(booking.discount + promoDiscount)}`} discount />
      </div>
      <div className="flex items-center justify-between py-4 text-[18px] font-bold">
        <span>Total</span>
        <span>{formatEgp(total)}</span>
      </div>
      <div className="flex h-11 overflow-hidden rounded-[7px] border border-[#DCE3EF]">
        <label className="flex min-w-0 flex-1 items-center gap-3 px-4 text-[13px] text-[#64708B]">
          <Icon name="tag" className="h-5 w-5" />
          <input aria-label="Promo code" value={promoCode} onChange={(event) => setPromoCode(event.target.value)} placeholder="Have a promo code?" className="min-w-0 flex-1 bg-transparent outline-none" />
        </label>
        <button type="button" onClick={applyPromo} className="w-78 border-l border-[#DCE3EF] px-5 text-[13px] font-bold text-[#5F36E9] transition-shadow hover:shadow-[0_4px_12px_rgba(15,23,42,.1)]">Apply</button>
      </div>
      {promoStatus !== "idle" ? <p aria-live="polite" className={cn("mt-2 text-[11px]", promoStatus === "applied" ? "text-[#168B4B]" : "text-[#D92D20]")}>{promoStatus === "applied" ? `DAR10 applied: ${formatEgp(promoDiscount)} local demo discount.` : "This promo code is not available."}</p> : null}
      <div className="mt-4 rounded-[8px] border border-[#DCE3EF] bg-[#FBFCFF] p-4">
        <div className="grid grid-cols-2 border-b border-[#E6EBF3] pb-4">
          <Detail label="Check-in" value={formatDate(booking.checkIn)} />
          <Detail label="Check-out" value={formatDate(booking.checkOut)} />
        </div>
        <div className="pt-4">
          <Detail label="Guests" value={`${booking.guests} guests`} />
        </div>
        {showPayment ? (
          <div className="mt-4 flex items-center justify-between border-t border-[#E6EBF3] pt-4">
            <div className="flex items-center gap-3">
              <span className="grid h-8 w-8 place-items-center rounded-full bg-[#FEE2E2] text-[#E60000]">
                <Icon name="wallet" className="h-5 w-5" />
              </span>
              <div>
                <p className="text-[11px] font-bold">Payment method</p>
                <p className="text-[13px] font-medium">{paymentLabel(paymentMethod)}</p>
              </div>
            </div>
            <button type="button" onClick={onPaymentChange} className="text-[12px] font-bold text-[#5F36E9] focus-visible:outline-2 focus-visible:outline-[#5F36E9]">Change</button>
          </div>
        ) : null}
      </div>
    </Card>
  );
}

function paymentLabel(method: string) {
  return paymentOptions.find((option) => option.id === method)?.label ?? "Vodafone Cash";
}

function PriceLine({ label, value, discount = false }: { label: string; value: string; discount?: boolean }) {
  return (
    <div className="flex justify-between gap-4">
      <span>{label}</span>
      <span className={cn("font-semibold text-[#111735]", discount && "text-[#168B4B]")}>{value}</span>
    </div>
  );
}

function TrustCard({ variant }: { variant: FlowStep }) {
  const rows =
    variant === "guest"
      ? [
          ["Secure booking", "Your data is protected"],
          ["Verified property", "All properties are quality checked"],
          ["Egyptian payment methods", "Pay easily with local and trusted options"],
          ["Support available", "We're here 24/7 to help"],
        ]
      : [
          ["Secure booking", "Your data is protected"],
          ["Verified property", "All properties are quality checked"],
          ["Support available", "We're here 24/7 to help"],
        ];

  return (
    <Card className="mt-5 p-5">
      <div className="divide-y divide-[#E6EBF3]">
        {rows.map(([title, body]) => (
          <div key={title} className="flex gap-4 py-3 first:pt-0 last:pb-0">
            <Icon name={title.includes("Support") ? "headset" : title.includes("payment") ? "card" : "shield"} className="h-6 w-6 shrink-0 text-[#5F36E9]" />
            <div>
              <p className="text-[13px] font-bold">{title}</p>
              <p className="mt-1 text-[12px] text-[#64708B]">{body}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-5 rounded-[8px] border border-[#DCE3EF] p-4">
        <p className="text-[13px] font-bold">Need help?</p>
        <p className="mt-1 text-[12px] text-[#64708B]">Contact DAR support for any assistance.</p>
        <Link href="/help" className="mt-4 inline-flex items-center gap-2 text-[13px] font-bold text-[#5F36E9] focus-visible:outline-2 focus-visible:outline-[#5F36E9]">
          <Icon name="headset" className="h-5 w-5" />
          Contact support
        </Link>
      </div>
    </Card>
  );
}
