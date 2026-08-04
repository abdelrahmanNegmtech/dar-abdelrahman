"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { featuredProperty } from "@/app/properties/[slug]/property-data";
import { requiredRedirectForStep } from "@/app/booking/flow-guards";
import { compactBookingQuery, shortPath } from "@/app/routing";
import { cn } from "@/lib/utils";

type FlowStep = "guest" | "payment";

type BookingPayload = {
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
  paymentDetails?: Record<string, string | boolean>;
};

type GuestInfo = {
  fullName: string;
  email: string;
  phone: string;
  nationality: string;
  documentId: string;
  requests: string;
  shareWithOwner: boolean;
};

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

const defaultGuestInfo: GuestInfo = {
  fullName: "Ahmed Mohamed",
  email: "ahmed.mo@example.com",
  phone: "10 1234 5678",
  nationality: "Egypt",
  documentId: "A12345678",
  requests: "",
  shareWithOwner: true,
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

export function BookingFlowPage({ step }: { step: FlowStep }) {
  const router = useRouter();
  const [booking, setBooking] = useState(readBooking);
  const [guestInfo, setGuestInfo] = useState<GuestInfo>(booking.guestInfo ?? defaultGuestInfo);
  const [paymentMethod, setPaymentMethod] = useState(booking.paymentMethod ?? (step === "payment" ? "card" : "vodafone"));
  const [houseRules, setHouseRules] = useState(step === "guest");
  const [termsAccepted, setTermsAccepted] = useState(step === "guest");
  const [toastOpen, setToastOpen] = useState(true);

  useEffect(() => {
    const redirect = requiredRedirectForStep(step === "payment" ? "payment-method" : "guest");
    if (redirect) router.replace(redirect);
  }, [router, step]);

  const total = useMemo(
    () => booking.subtotal + booking.cleaningFee + booking.serviceFee - booking.discount,
    [booking],
  );

  const updateGuest = (key: keyof GuestInfo, value: string | boolean) => {
    setGuestInfo((current) => ({ ...current, [key]: value }));
  };

  const persist = (extra: Partial<BookingPayload>) => {
    const nextBooking = {
      ...booking,
      ...extra,
      guestInfo,
      paymentMethod,
      total,
    };
    setBooking(nextBooking);
    writeBooking(nextBooking);
    return nextBooking;
  };

  const continueToPayment = () => {
    const nextBooking = persist({ guestInfo, paymentMethod });
    router.push(`${localizedPath(nextBooking, "/booking/payment")}?${bookingQuery(nextBooking)}`);
  };

  const continueToVerification = () => {
    const nextBooking = persist({
      guestInfo,
      paymentMethod,
      paymentDetails: {
        houseRules,
        termsAccepted,
        cardLast4: paymentMethod === "card" ? "3456" : "",
      },
    });
    router.push(`${localizedPath(nextBooking, "/checkout")}?${bookingQuery(nextBooking)}`);
  };

  return (
    <main className="min-h-screen bg-[#FBFCFF] text-[#080B32]">
      <BookingHeader />
      <div className="mx-auto grid max-w-[1840px] gap-8 px-8 py-6 xl:grid-cols-[minmax(0,1fr)_540px]">
        <section className="min-w-0">
          <Breadcrumb booking={booking} />
          <h1 className="mt-5 text-[32px] font-bold leading-tight tracking-[0]">Complete your booking</h1>
          <p className="mt-2 text-[15px] font-medium text-[#59637C]">Secure your stay in a few simple steps.</p>
          <Progress step={step} />
          <StayStrip booking={booking} />

          <div className="space-y-3">
            {step === "guest" ? (
              <>
                <GuestInformation guestInfo={guestInfo} updateGuest={updateGuest} />
              <GuestPaymentMethod paymentMethod={paymentMethod} setPaymentMethod={setPaymentMethod} />
              </>
            ) : (
              <>
                <PaymentDetails paymentMethod={paymentMethod} guestInfo={guestInfo} booking={booking} total={total} />
                <Policies
                  houseRules={houseRules}
                  termsAccepted={termsAccepted}
                  setHouseRules={setHouseRules}
                  setTermsAccepted={setTermsAccepted}
                />
              </>
            )}
          </div>

          <div className="mt-4 flex items-center justify-between gap-4">
            <Link
              href={localizedPath(booking, `/properties/${booking.propertyId}`)}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-[7px] border border-[#DCE3EF] bg-white px-8 text-[14px] font-bold text-[#111735] hover:bg-[#F8FAFC]"
            >
              <span aria-hidden="true">←</span>
              Back to property
            </Link>
            <button
              type="button"
              onClick={step === "guest" ? continueToPayment : continueToVerification}
              disabled={
                !guestInfo.fullName ||
                !guestInfo.email ||
                !guestInfo.phone ||
                !guestInfo.documentId ||
                (step === "payment" && (!houseRules || !termsAccepted))
              }
              className="inline-flex h-12 w-[290px] items-center justify-center gap-2 rounded-[7px] bg-[#5F36E9] text-[15px] font-bold text-white shadow-[0_12px_24px_rgba(95,54,233,0.23)] hover:bg-[#5130D8] disabled:cursor-not-allowed disabled:bg-[#B8AAF4]"
            >
              <Icon name="lock" className="h-4 w-4" />
              {step === "guest" ? "Continue to payment" : "Confirm and reserve"}
            </button>
          </div>
        </section>

        <aside className="xl:sticky xl:top-6 xl:self-start">
          <SummaryCard
            booking={booking}
            total={total}
            paymentMethod={paymentMethod}
            showPayment={step === "guest"}
          />
          <TrustCard variant={step} />
          {toastOpen ? (
            <StatusToast step={step} onClose={() => setToastOpen(false)} />
          ) : null}
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
          <Link href={shortPath("/messages", "en")}>Help</Link>
        </nav>
        <div className="flex items-center gap-5 text-[14px] font-semibold">
          <button className="hidden items-center gap-2 lg:inline-flex">
            <Icon name="globe" className="h-5 w-5" />
            English / EGP
            <Icon name="chevronDown" className="h-4 w-4" />
          </button>
          <button className="h-11 rounded-[8px] border border-[#5F36E9] px-7 text-[#5F36E9] hover:bg-[#F5F2FF]">
            Sign in
          </button>
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

function Progress({ step }: { step: FlowStep }) {
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
        {steps.map(([number, label], index) => (
          <div key={number} className={cn(index > 0 && "contents")}>
            {index > 0 ? (
              <div
                className={cn(
                  "h-px",
                  index + 1 <= active ? "bg-[#5F36E9]" : index === 1 ? "bg-[#E0A425]" : "bg-[#D7DEEA]",
                )}
              />
            ) : null}
            <div className="text-center">
              <span
                className={cn(
                  "mx-auto grid h-10 w-10 place-items-center rounded-full border text-[17px] font-bold",
                  index === 0
                    ? "border-[#F3AF2D] bg-[#F3AF2D] text-white"
                    : index + 1 === active
                      ? "border-[#5F36E9] bg-[#5F36E9] text-white"
                      : "border-[#C9D2E3] bg-white text-[#080B32]",
                )}
              >
                {index === 0 ? <Icon name="check" className="h-5 w-5" /> : number}
              </span>
              <p
                className={cn(
                  "mt-3 whitespace-nowrap text-[12px] font-medium",
                  index + 1 === active ? "text-[#5F36E9]" : "text-[#34405A]",
                )}
              >
                {label}
              </p>
            </div>
          </div>
        ))}
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
        <button className="text-right text-[13px] font-bold text-[#5F36E9]">Change</button>
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
}: {
  guestInfo: GuestInfo;
  updateGuest: (key: keyof GuestInfo, value: string | boolean) => void;
}) {
  return (
    <Card className="p-4">
      <StepTitle number={2} title="Guest information" />
      <div className="mt-4 grid gap-4 md:grid-cols-3">
        <Field label="Full name" value={guestInfo.fullName} onChange={(value) => updateGuest("fullName", value)} />
        <Field label="Email address" value={guestInfo.email} onChange={(value) => updateGuest("email", value)} />
        <div>
          <label className="text-[12px] font-medium text-[#34405A]">Phone number</label>
          <div className="mt-2 grid grid-cols-[92px_1fr] gap-2">
            <button className="flex h-10 items-center justify-center gap-2 rounded-[6px] border border-[#DCE3EF] bg-white text-[13px] font-semibold">
              EG <span className="text-[#34405A]">+20</span>
              <Icon name="chevronDown" className="h-3.5 w-3.5" />
            </button>
            <input
              value={guestInfo.phone}
              onChange={(event) => updateGuest("phone", event.target.value)}
              className="h-10 rounded-[6px] border border-[#DCE3EF] px-3 text-[13px] font-semibold outline-none focus:border-[#8D6BFF]"
            />
          </div>
        </div>
        <label className="block">
          <span className="text-[12px] font-medium text-[#34405A]">Nationality</span>
          <select
            value={guestInfo.nationality}
            onChange={(event) => updateGuest("nationality", event.target.value)}
            className="mt-2 h-10 w-full rounded-[6px] border border-[#DCE3EF] bg-white px-3 text-[13px] font-semibold outline-none focus:border-[#8D6BFF]"
          >
            <option>Egypt</option>
          </select>
        </label>
        <Field
          label="ID / Passport number *"
          value={guestInfo.documentId}
          onChange={(value) => updateGuest("documentId", value)}
        />
      </div>
      <label className="mt-4 block">
        <span className="text-[12px] font-medium text-[#34405A]">Special requests (optional)</span>
        <textarea
          value={guestInfo.requests}
          onChange={(event) => updateGuest("requests", event.target.value)}
          placeholder="Tell the owner anything they should know"
          className="mt-2 h-[54px] w-full resize-none rounded-[6px] border border-[#DCE3EF] px-3 py-2 text-[13px] outline-none focus:border-[#8D6BFF]"
        />
      </label>
      <label className="mt-3 flex items-center gap-2 text-[13px] font-medium text-[#34405A]">
        <input
          type="checkbox"
          checked={guestInfo.shareWithOwner}
          onChange={(event) => updateGuest("shareWithOwner", event.target.checked)}
          className="h-4 w-4 accent-[#5F36E9]"
        />
        I agree to share my booking details with the verified owner.
      </label>
    </Card>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="block">
      <span className="text-[12px] font-medium text-[#34405A]">{label}</span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 h-10 w-full rounded-[6px] border border-[#DCE3EF] px-3 text-[13px] font-semibold outline-none focus:border-[#8D6BFF]"
      />
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
}: {
  paymentMethod: string;
  setPaymentMethod: (value: string) => void;
}) {
  return (
    <Card className="p-4">
      <StepTitle number={3} title="Choose payment method" />
      <div className="mt-4 grid gap-3 md:grid-cols-4">
        {paymentOptions.map((option) => (
          <PaymentOption
            key={option.id}
            option={option}
            selected={paymentMethod === option.id}
            onSelect={() => setPaymentMethod(option.id)}
          />
        ))}
      </div>
      {paymentMethod === "vodafone" ? <VodafonePanel /> : null}
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
      onClick={onSelect}
      className={cn(
        "flex min-h-[74px] items-center gap-3 rounded-[8px] border bg-white px-4 text-left hover:border-[#9B7AFF]",
        selected ? "border-[#744BFF] shadow-[0_0_0_1px_rgba(95,54,233,0.35)]" : "border-[#DCE3EF]",
      )}
    >
      <span className={cn("h-4 w-4 rounded-full border", selected ? "border-[#5F36E9] bg-[#5F36E9]" : "border-[#B8C3D7]")} />
      <span className="min-w-0">
        <span className="block text-[14px] font-bold">{option.label}</span>
        <span className="mt-1 inline-flex items-center gap-2 text-[12px] font-black text-[#5F36E9]">
          {option.logo}
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

function VodafonePanel() {
  return (
    <div className="mt-3 rounded-[8px] border border-[#CFC0FF] bg-[#FCFAFF] p-4">
      <div className="grid gap-4 md:grid-cols-3">
        <Field label="Vodafone Cash number" value="010 1234 5678" onChange={() => undefined} />
        <div>
          <label className="text-[12px] font-medium text-[#34405A]">Sender phone number</label>
          <div className="mt-2 grid grid-cols-[86px_1fr] gap-2">
            <button className="h-10 rounded-[6px] border border-[#DCE3EF] bg-white text-[13px] font-semibold">+20</button>
            <input className="h-10 rounded-[6px] border border-[#DCE3EF] px-3 text-[13px] font-semibold" defaultValue="10 1234 5678" />
          </div>
        </div>
        <div>
          <label className="text-[12px] font-medium text-[#34405A]">Upload receipt (optional)</label>
          <div className="mt-2 flex h-10 items-center gap-3">
            <button className="inline-flex h-10 items-center gap-2 rounded-[6px] border border-[#DCE3EF] bg-white px-4 text-[13px] font-bold text-[#5F36E9]">
              <Icon name="upload" className="h-4 w-4" />
              Choose file
            </button>
            <span className="text-[12px] text-[#64708B]">No file chosen</span>
          </div>
        </div>
      </div>
      <p className="mt-3 flex items-center gap-2 text-[12px] font-medium text-[#59637C]">
        <Icon name="info" className="h-4 w-4 text-[#5F36E9]" />
        Payment confirmation: DAR will verify the payment before confirming the booking.
      </p>
    </div>
  );
}

function PaymentDetails({
  paymentMethod,
  guestInfo,
  booking,
  total,
}: {
  paymentMethod: string;
  guestInfo: GuestInfo;
  booking: BookingPayload;
  total: number;
}) {
  const selectedOption = paymentOptions.find((option) => option.id === paymentMethod);

  return (
    <Card className="p-4">
      <div className="flex items-start justify-between gap-4">
        <StepTitle number={3} title={`${selectedOption?.label ?? "Payment"} details`} />
        <Link href={`${localizedPath(booking, "/booking")}?${bookingQuery(booking)}`} className="text-[13px] font-bold text-[#5F36E9]">
          Change method
        </Link>
      </div>
      <div className="mt-4">
        {["card", "meeza", "paymob"].includes(paymentMethod) ? (
        <div className="rounded-[8px] border border-[#DCE3EF] bg-white p-5">
          <Field label="Card number" value="1234 5678 9012 3456" onChange={() => undefined} />
          <div className="mt-3 grid gap-4 md:grid-cols-2">
            <Field label="Expiry date" value="MM / YY" onChange={() => undefined} />
            <Field label="CVV" value="123" onChange={() => undefined} />
          </div>
          <div className="mt-3">
            <Field label="Name on card" value={guestInfo.fullName || "John Doe"} onChange={() => undefined} />
          </div>
        </div>
        ) : paymentMethod === "vodafone" ? (
          <VodafonePanel />
        ) : paymentMethod === "instapay" ? (
          <ManualPaymentPanel
            title="Send with InstaPay"
            destinationLabel="DAR payment alias"
            destination="dar.payments@instapay"
            amount={total}
            reference="DAR-MAD-58291"
          />
        ) : paymentMethod === "bank" ? (
          <ManualPaymentPanel
            title="Bank transfer instructions"
            destinationLabel="Bank account"
            destination="DAR Rentals - EG820030..."
            amount={total}
            reference="DAR-MAD-58291"
          />
        ) : paymentMethod === "fawry" ? (
          <ManualPaymentPanel
            title="Fawry payment instructions"
            destinationLabel="Fawry code"
            destination="DAR-58291"
            amount={total}
            reference="DAR-MAD-58291"
          />
        ) : (
          <div className="rounded-[8px] border border-[#DCE3EF] bg-white p-5">
            <h3 className="text-[15px] font-bold">Pay on arrival</h3>
            <p className="mt-2 text-[13px] leading-6 text-[#59637C]">
              The property owner will review your request. Payment is collected at check-in after approval.
            </p>
            <p className="mt-4 text-[14px] font-bold">Estimated total: {formatEgp(booking.total)}</p>
          </div>
        )}
      </div>
      <p className="mt-3 flex items-center gap-2 text-[12px] font-medium text-[#64708B]">
        <Icon name="lock" className="h-4 w-4" />
        Your payment details are secure and encrypted.
      </p>
    </Card>
  );
}

function ManualPaymentPanel({
  title,
  destinationLabel,
  destination,
  amount,
  reference,
}: {
  title: string;
  destinationLabel: string;
  destination: string;
  amount: number;
  reference: string;
}) {
  return (
    <div className="rounded-[8px] border border-[#CFC0FF] bg-[#FCFAFF] p-5">
      <h3 className="text-[15px] font-bold">{title}</h3>
      <div className="mt-4 grid gap-4 md:grid-cols-3">
        <div>
          <p className="text-[12px] font-medium text-[#59637C]">{destinationLabel}</p>
          <p className="mt-2 text-[15px] font-bold">{destination}</p>
        </div>
        <div>
          <p className="text-[12px] font-medium text-[#59637C]">Amount to send</p>
          <p className="mt-2 text-[15px] font-bold text-[#5F36E9]">{formatEgp(amount)}</p>
        </div>
        <div>
          <p className="text-[12px] font-medium text-[#59637C]">Reference</p>
          <p className="mt-2 text-[15px] font-bold">{reference}</p>
        </div>
      </div>
      <div className="mt-5 rounded-[8px] border border-dashed border-[#9B7AFF] bg-white p-5 text-center">
        <Icon name="upload" className="mx-auto h-8 w-8 text-[#5F36E9]" />
        <p className="mt-3 text-[13px] font-bold">Upload payment receipt</p>
        <p className="mt-1 text-[12px] text-[#59637C]">PNG, JPG or PDF up to 10MB</p>
      </div>
    </div>
  );
}

function Policies({
  houseRules,
  termsAccepted,
  setHouseRules,
  setTermsAccepted,
}: {
  houseRules: boolean;
  termsAccepted: boolean;
  setHouseRules: (value: boolean) => void;
  setTermsAccepted: (value: boolean) => void;
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
          <button className="text-[12px] font-bold text-[#5F36E9]">View policy</button>
        </div>
        <div className="space-y-4">
          <label className="flex items-center gap-3 text-[13px] font-medium text-[#34405A]">
            <input type="checkbox" checked={houseRules} onChange={(event) => setHouseRules(event.target.checked)} className="h-4 w-4 accent-[#5F36E9]" />
            I agree to the house rules of this property.
          </label>
          <label className="flex items-center gap-3 text-[13px] font-medium text-[#34405A]">
            <input type="checkbox" checked={termsAccepted} onChange={(event) => setTermsAccepted(event.target.checked)} className="h-4 w-4 accent-[#5F36E9]" />
            I accept the <span className="text-[#5F36E9]">Terms of Service</span> and{" "}
            <span className="text-[#5F36E9]">Privacy Policy</span>.
          </label>
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
}: {
  booking: BookingPayload;
  total: number;
  paymentMethod: string;
  showPayment: boolean;
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
        <PriceLine label="Discount" value={`-${formatEgp(booking.discount)}`} discount />
      </div>
      <div className="flex items-center justify-between py-4 text-[18px] font-bold">
        <span>Total</span>
        <span>{formatEgp(total)}</span>
      </div>
      <div className="flex h-11 overflow-hidden rounded-[7px] border border-[#DCE3EF]">
        <div className="flex min-w-0 flex-1 items-center gap-3 px-4 text-[13px] text-[#64708B]">
          <Icon name="tag" className="h-5 w-5" />
          Have a promo code?
        </div>
        <button className="w-78 border-l border-[#DCE3EF] px-5 text-[13px] font-bold text-[#5F36E9]">Apply</button>
      </div>
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
            <button className="text-[12px] font-bold text-[#5F36E9]">Change</button>
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
        <button className="mt-4 inline-flex items-center gap-2 text-[13px] font-bold text-[#5F36E9]">
          <Icon name="headset" className="h-5 w-5" />
          Contact support
        </button>
      </div>
    </Card>
  );
}

function StatusToast({ step, onClose }: { step: FlowStep; onClose: () => void }) {
  return (
    <div className="mt-5 rounded-[10px] border border-[#22A354] bg-[#F6FFF9] p-7 shadow-[0_12px_32px_rgba(15,23,42,0.05)]">
      <button className="float-right text-[#64708B]" aria-label="Close notification" onClick={onClose}>
        <Icon name="close" className="h-5 w-5" />
      </button>
      <div className="flex items-center gap-5">
        <span className="grid h-14 w-14 place-items-center rounded-full bg-[#088B24] text-white">
          <Icon name="check" className="h-8 w-8" />
        </span>
        <div>
          <h2 className="text-[20px] font-bold">
            {step === "guest" ? "Payment received" : "Booking request sent"}
          </h2>
          <p className="mt-2 text-[14px] text-[#59637C]">
            {step === "guest"
              ? "Your booking request is waiting for owner approval."
              : "The owner will confirm your stay shortly."}
          </p>
          <button className="mt-5 h-11 rounded-[7px] border border-[#5F36E9] px-12 text-[14px] font-bold text-[#5F36E9]">
            View booking
          </button>
        </div>
      </div>
    </div>
  );
}
