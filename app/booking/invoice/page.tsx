"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
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
  pricePerNight?: number;
  cleaningFee?: number;
  serviceFee?: number;
  discount?: number;
  subtotal?: number;
  total?: number;
  currency?: "EGP";
  locale?: string;
  guestInfo?: GuestInfo;
  paymentMethod?: string;
  paymentId?: string;
  confirmationNumber?: string;
};

type IconName =
  | "calendar"
  | "card"
  | "check"
  | "chevronDown"
  | "download"
  | "eye"
  | "file"
  | "globe"
  | "headset"
  | "help"
  | "home"
  | "info"
  | "location"
  | "mail"
  | "phone"
  | "print"
  | "refresh"
  | "shield"
  | "upload"
  | "user"
  | "wallet";

const storageKey = "dar-pending-booking";
const invoiceNumber = "INV-2026-58291";
const receiptNumber = "RCP-58291";
const bookingReference = "DAR-MAD-58291";

function iconPath(name: IconName) {
  const paths: Record<IconName, string> = {
    calendar:
      "M7 3v3M17 3v3M4.5 8.5h15M6 5h12a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z",
    card: "M4 7.5h16v9A2.5 2.5 0 0 1 17.5 19h-11A2.5 2.5 0 0 1 4 16.5v-9ZM4 10h16M7 15h4",
    check: "m5 12 4.2 4.2L19 6.5",
    chevronDown: "m7 9 5 5 5-5",
    download: "M12 4v10m0 0 4-4m-4 4-4-4M5 18h14",
    eye: "M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Zm9.5 3a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z",
    file: "M7 3h7l4 4v14H7V3Zm7 0v5h5",
    globe:
      "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM3.6 9h16.8M3.6 15h16.8M12 3c2.2 2.3 3.4 5.3 3.4 9S14.2 18.7 12 21c-2.2-2.3-3.4-5.3-3.4-9S9.8 5.3 12 3Z",
    headset:
      "M4 13a8 8 0 0 1 16 0v3a2 2 0 0 1-2 2h-2v-6h4M4 16a2 2 0 0 0 2 2h2v-6H4v4Zm8 5h2a4 4 0 0 0 4-4",
    help: "M12 18h.01M9.5 9a2.7 2.7 0 1 1 4.3 2.2c-.9.6-1.8 1.3-1.8 2.8M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Z",
    home: "M3.5 11.5 12 4l8.5 7.5M5.5 10.5V20h13v-9.5M9.5 20v-6h5v6",
    info: "M12 17v-6M12 7h.01M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Z",
    location:
      "M12 21s7-4.4 7-11a7 7 0 1 0-14 0c0 6.6 7 11 7 11Zm0-8.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z",
    mail: "M4 6h16v12H4V6Zm0 1 8 6 8-6",
    phone: "M6.6 3.5 10 7l-2 2c1 2.2 2.8 4 5 5l2-2 3.5 3.4-1.2 3.1c-.3.8-1.1 1.3-2 1.1C9.1 18.4 5.6 14.9 4.4 8.7c-.2-.9.3-1.7 1.1-2l1.1-3.2Z",
    print: "M7 8V3h10v5M7 17H5a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-2M7 14h10v7H7v-7Zm11-2h.01",
    refresh: "M20 12a8 8 0 0 1-14.8 4.2M4 12A8 8 0 0 1 18.8 7.8M18 3v5h-5M6 21v-5h5",
    shield: "M12 3 19 6v5c0 4.8-2.9 8-7 10-4.1-2-7-5.2-7-10V6l7-3Z",
    upload: "M12 16V6m0 0L8 10m4-4 4 4M5 17v1.5A2.5 2.5 0 0 0 7.5 21h9a2.5 2.5 0 0 0 2.5-2.5V17",
    user: "M20 21a8 8 0 0 0-16 0M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10Z",
    wallet: "M4 7h15a2 2 0 0 1 2 2v9H6a3 3 0 0 1-3-3V6a3 3 0 0 0 3 3h15M16 14h.01",
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

function formatDate(value?: string, withWeekday = false) {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return value ?? "May 16, 2026";
  }
  return new Intl.DateTimeFormat("en-GB", {
    weekday: withWeekday ? "short" : undefined,
    month: "long",
    day: "numeric",
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

function readBooking(): Required<Pick<BookingPayload, "title" | "location" | "image" | "checkIn" | "checkOut" | "guests" | "nights" | "pricePerNight" | "cleaningFee" | "serviceFee" | "discount" | "subtotal" | "total" | "locale">> &
  BookingPayload {
  const subtotal = 1200 * 5;
  const fallback = {
    propertyId: featuredProperty.slug,
    title: "Luxury Studio in Madinty",
    location: "B6, Madinty, Cairo, Egypt",
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
    currency: "EGP" as const,
    locale: "en",
    guestInfo: {
      fullName: "Ismail Negm",
      email: "ismail.negm@example.com",
      phone: "+20 100 123 4567",
    },
    paymentMethod: "instapay",
    paymentId: "IP-739201",
    confirmationNumber: bookingReference,
  };

  if (typeof window === "undefined") {
    return fallback;
  }

  try {
    const parsed = JSON.parse(window.sessionStorage.getItem(storageKey) ?? "{}") as BookingPayload;
    const nextSubtotal =
      parsed.subtotal ?? (parsed.pricePerNight ?? fallback.pricePerNight) * (parsed.nights ?? fallback.nights);
    const cleaningFee = parsed.cleaningFee ?? fallback.cleaningFee;
    const serviceFee = parsed.serviceFee ?? fallback.serviceFee;
    const discount = parsed.discount ?? fallback.discount;
    return {
      ...fallback,
      ...parsed,
      location: parsed.location ?? fallback.location,
      guestInfo: { ...fallback.guestInfo, ...parsed.guestInfo },
      subtotal: nextSubtotal,
      cleaningFee,
      serviceFee,
      discount,
      total: parsed.total ?? nextSubtotal + cleaningFee + serviceFee - discount,
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

function pdfBytes(title: string, lines: string[]) {
  const escape = (value: string) => value.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
  const text = [`BT /F1 18 Tf 72 760 Td (${escape(title)}) Tj`, "/F1 11 Tf 0 -34 Td"].concat(
    lines.map((line) => `(${escape(line)}) Tj 0 -18 Td`),
    ["ET"],
  );
  const stream = text.join("\n");
  const objects = [
    "1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj",
    "2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj",
    "3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >> endobj",
    "4 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj",
    `5 0 obj << /Length ${stream.length} >> stream\n${stream}\nendstream endobj`,
  ];
  let offset = 9;
  const xref = ["0000000000 65535 f "];
  const body = objects
    .map((object) => {
      const current = offset;
      offset += object.length + 1;
      xref.push(String(current).padStart(10, "0") + " 00000 n ");
      return object;
    })
    .join("\n");
  const trailer = `xref\n0 ${xref.length}\n${xref.join("\n")}\ntrailer << /Size ${xref.length} /Root 1 0 R >>\nstartxref\n${offset}\n%%EOF`;
  return `%PDF-1.4\n${body}\n${trailer}`;
}

function downloadBlob(filename: string, content: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function invoiceLines(booking: BookingPayload) {
  return [
    `Invoice number: ${invoiceNumber}`,
    `Receipt number: ${receiptNumber}`,
    `Booking reference: ${bookingReference}`,
    `Guest: ${booking.guestInfo?.fullName ?? "Guest"}`,
    `Property: ${booking.title ?? featuredProperty.title}`,
    `Stay: ${formatDate(booking.checkIn)} - ${formatDate(booking.checkOut)}`,
    `Payment method: ${paymentLabel(booking.paymentMethod)}`,
    `Transaction ID: ${booking.paymentId ?? "IP-739201"}`,
    `Total paid: ${formatEgp(booking.total ?? 0)}`,
    "Status: Paid and verified by DAR",
  ];
}

export default function InvoicePage() {
  const router = useRouter();
  const [booking] = useState(readBooking);
  const guest = booking.guestInfo ?? {};

  useEffect(() => {
    const redirect = requiredRedirectForStep("invoice");
    if (redirect) router.replace(redirect);
  }, [router]);

  const downloadPdf = () => {
    downloadBlob(`${invoiceNumber}.pdf`, pdfBytes("DAR Invoice & Receipt", invoiceLines(booking)), "application/pdf");
  };

  const downloadReceipt = () => {
    downloadBlob(`${receiptNumber}.pdf`, pdfBytes("DAR Payment Receipt", invoiceLines(booking)), "application/pdf");
  };

  const downloadDocument = (name: string) => {
    downloadBlob(`${name}.pdf`, pdfBytes(name.replaceAll("-", " "), invoiceLines(booking)), "application/pdf");
  };

  const saveToWallet = () => {
    const walletPass = JSON.stringify(
      {
        organizationName: "DAR",
        description: "DAR booking receipt",
        serialNumber: invoiceNumber,
        bookingReference,
        totalPaid: booking.total,
      },
      null,
      2,
    );
    downloadBlob(`${bookingReference}.pkpass`, walletPass, "application/vnd.apple.pkpass");
  };

  return (
    <main className="min-h-screen bg-[#F8FAFC] text-[#080B32]">
      <Header booking={booking} />
      <div className="mx-auto grid max-w-[1840px] gap-8 px-5 py-6 lg:px-10 xl:grid-cols-[minmax(0,1fr)_470px]">
        <section className="min-w-0 space-y-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="text-[34px] font-black leading-tight">Invoice & receipt</h1>
              <p className="mt-2 text-[15px] font-medium text-[#34405A]">Payment confirmation and downloadable receipt for your booking.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <ActionButton primary icon="download" onClick={downloadPdf}>Download PDF</ActionButton>
              <ActionButton icon="print" onClick={() => window.print()}>Print</ActionButton>
              <a href={`mailto:${guest.email ?? ""}?subject=DAR%20invoice%20${invoiceNumber}`} className="inline-flex h-11 items-center justify-center gap-2 rounded-[8px] border border-[#D9E0EC] bg-white px-5 text-[14px] font-bold shadow-[0_5px_14px_rgba(15,23,42,0.04)]">
                <Icon name="mail" className="h-5 w-5" />
                Send by email
              </a>
            </div>
          </div>

          <InvoiceStatusCard booking={booking} onDownloadReceipt={downloadReceipt} />
          <PartiesCard guest={guest} />
          <StayCard booking={booking} />
          <ChargesCard booking={booking} />
          <PaymentDetails booking={booking} />
          <NotesPolicies />
          <RelatedDocuments onDownload={downloadDocument} />
        </section>

        <aside className="min-w-0 space-y-4 xl:sticky xl:top-6 xl:self-start">
          <BookingSummary booking={booking} />
          <ReceiptActions
            booking={booking}
            onDownloadPdf={downloadPdf}
            onSaveWallet={saveToWallet}
          />
          <InvoiceTimeline />
          <BillingSupport />
          <VerifyInvoice />
        </aside>
      </div>
    </main>
  );
}

function Header({ booking }: { booking: BookingPayload }) {
  return (
    <header className="border-b border-[#E4EAF3] bg-white">
      <div className="mx-auto flex h-[76px] max-w-[1840px] items-center justify-between px-5 lg:px-10">
        <div className="flex items-center gap-10">
          <Link href={localizedPath(booking, "/")} aria-label="DAR home">
            <Image src="/dar-logo-purple-header.png" alt="DAR" width={320} height={142} className="h-[54px] w-auto object-contain" priority />
          </Link>
          <nav className="hidden items-center gap-4 text-[16px] font-semibold text-[#34405A] md:flex">
            <Link href={localizedPath(booking, "/bookings")}>My Bookings</Link>
            <span>/</span>
            <Link href={localizedPath(booking, "/bookings")}>{bookingReference}</Link>
            <span>/</span>
            <span className="font-bold text-[#5F36E9]">Invoice</span>
          </nav>
        </div>
        <div className="flex items-center gap-6 text-[15px] font-semibold">
          <button className="hidden items-center gap-2 lg:inline-flex"><Icon name="globe" /> English / EGP</button>
          <button className="hidden items-center gap-2 md:inline-flex"><Icon name="help" /> Help</button>
          <div className="hidden items-center gap-3 md:flex">
            <div className="relative h-10 w-10 overflow-hidden rounded-full">
              <Image src="/properties/madinty-bedroom.png" alt="" fill className="object-cover" />
            </div>
            Ismail Negm
            <Icon name="chevronDown" className="h-4 w-4" />
          </div>
        </div>
      </div>
    </header>
  );
}

function Card({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <section className={cn("rounded-[12px] border border-[#DFE6F1] bg-white p-5 shadow-[0_14px_34px_rgba(15,23,42,0.06)]", className)}>
      {children}
    </section>
  );
}

function ActionButton({ children, icon, onClick, primary = false }: { children: ReactNode; icon: IconName; onClick: () => void; primary?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex h-11 items-center justify-center gap-2 rounded-[8px] px-5 text-[14px] font-bold shadow-[0_5px_14px_rgba(15,23,42,0.04)]",
        primary ? "bg-[#5F36E9] text-white shadow-[0_12px_24px_rgba(95,54,233,0.22)]" : "border border-[#D9E0EC] bg-white text-[#080B32]",
      )}
    >
      <Icon name={icon} className="h-5 w-5" />
      {children}
    </button>
  );
}

function InvoiceStatusCard({ booking, onDownloadReceipt }: { booking: BookingPayload; onDownloadReceipt: () => void }) {
  const stats = [
    ["Invoice number", invoiceNumber],
    ["Receipt number", receiptNumber],
    ["Booking reference", bookingReference],
  ];
  const bottom = [
    ["Issue date", "May 16, 2026", "calendar"],
    ["Payment date", "May 16, 2026", "calendar"],
    ["Payment method", paymentLabel(booking.paymentMethod), "card"],
  ] as const;
  return (
    <Card className="grid gap-0 p-0 md:grid-cols-[150px_minmax(0,1fr)]">
      <div className="grid min-h-[132px] place-items-center border-b border-[#E5EAF3] p-3 md:border-b-0 md:border-r md:border-[#DDE5F0]">
        <div className="grid h-[106px] w-[106px] place-items-center rounded-full bg-[#E9FAF0] text-center">
          <div>
            <span className="mx-auto grid h-7 w-7 place-items-center rounded-full border border-[#20A75A] text-[#168A43]">
              <Icon name="check" className="h-4 w-4" />
            </span>
            <p className="mt-2 text-[21px] font-black leading-none">Paid</p>
            <p className="mt-1 text-[11px] text-[#59637C]">Thank you!</p>
          </div>
        </div>
      </div>
      <div className="px-4 py-4">
        <div className="grid gap-4 border-b border-[#E5EAF3] pb-4 md:grid-cols-3">
          {stats.map(([label, value], index) => (
            <div key={label} className={cn(index > 0 ? "md:border-l md:border-[#DDE5F0] md:pl-9" : "md:pl-8")}>
              <p className="text-[11px] font-medium text-[#59637C]">{label}</p>
              <p className="mt-1.5 text-[16px] font-black leading-none">{value}</p>
            </div>
          ))}
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-[1fr_1fr_1fr_auto] md:items-center">
          {bottom.map(([label, value, icon]) => (
            <div key={label} className="flex gap-3">
              <Icon name={icon} className="mt-3 h-4 w-4 text-[#34405A]" />
              <div>
                <p className="text-[11px] font-medium text-[#59637C]">{label}</p>
                <p className="mt-1.5 text-[14px] font-bold leading-none">{value}</p>
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={onDownloadReceipt}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-[7px] border border-[#D9E0EC] bg-white px-4 text-[13px] font-bold text-[#080B32] shadow-[0_5px_14px_rgba(15,23,42,0.04)]"
          >
            <Icon name="download" className="h-4 w-4" />
            Download receipt
          </button>
        </div>
      </div>
    </Card>
  );
}

function PartiesCard({ guest }: { guest: GuestInfo }) {
  return (
    <Card className="grid gap-6 md:grid-cols-2">
      <div className="flex gap-5 md:border-r md:pr-8">
        <div className="grid h-[86px] w-[86px] shrink-0 place-items-center rounded-full bg-[#080B32]">
          <Image src="/dar-logo-purple-header.png" alt="" width={120} height={54} className="h-10 w-auto object-contain brightness-0 invert" />
        </div>
        <div>
          <p className="text-[13px] font-bold">From:</p>
          <p className="mt-4 text-[16px] font-bold">DAR Booking Platform</p>
          <p className="mt-1 text-[14px] leading-6 text-[#34405A]">Cairo, Egypt<br />billing@dar.example<br />Tax ID: EG-DAR-49218</p>
        </div>
      </div>
      <div className="flex items-center gap-5">
        <span className="grid h-[86px] w-[86px] shrink-0 place-items-center rounded-full bg-[#E7DDFF] text-[#080B32]">
          <Icon name="user" className="h-9 w-9" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[13px] font-bold">To:</p>
              <p className="mt-4 text-[16px] font-bold">{guest.fullName ?? "Ismail Negm"}</p>
              <p className="mt-1 text-[14px] leading-6 text-[#34405A]">{guest.email ?? "ismail.negm@example.com"}<br />Berlin, Germany<br />Customer ID: CUS-100245</p>
            </div>
            <span className="rounded-full bg-[#EEE8FF] px-4 py-2 text-[13px] font-bold text-[#5F36E9]">Personal invoice</span>
          </div>
        </div>
      </div>
    </Card>
  );
}

function StayCard({ booking }: { booking: BookingPayload }) {
  return (
    <Card className="grid gap-6 md:grid-cols-[260px_minmax(0,1fr)_minmax(0,1.1fr)]">
      <div className="relative h-[170px] overflow-hidden rounded-[8px]">
        <Image src={booking.image ?? featuredProperty.images[0].src} alt={booking.title ?? featuredProperty.title} fill className="object-cover" />
      </div>
      <div className="min-w-0">
        <h2 className="text-[18px] font-bold">{booking.title}</h2>
        <p className="mt-4 flex items-center gap-2 text-[14px] text-[#34405A]"><Icon name="location" /> {booking.location}</p>
        <p className="mt-8 text-[14px]"><span className="font-bold">Host:</span> Ahmed Hassan <span className="ml-2 text-[#5F36E9]">Verified Owner</span></p>
      </div>
      <div className="grid gap-4 border-t border-[#E5EAF3] pt-5 md:border-l md:border-t-0 md:pl-8 md:pt-0">
        <InfoLine icon="calendar" label="Stay dates" value={`${formatDate(booking.checkIn)} - ${formatDate(booking.checkOut)}`} />
        <InfoLine icon="calendar" label="Check-in / Check-out" value="After 2:00 PM / Before 11:00 AM" />
        <div className="grid grid-cols-2 gap-4">
          <InfoLine icon="user" label="Guests" value={`${booking.guests} guests`} />
          <InfoLine icon="home" label="Property type" value={booking.bedrooms && booking.bedrooms > 1 ? "Apartment" : "Studio"} />
        </div>
      </div>
    </Card>
  );
}

function ChargesCard({ booking }: { booking: BookingPayload }) {
  const nights = booking.nights ?? 0;
  const pricePerNight = booking.pricePerNight ?? 0;
  const subtotal = booking.subtotal ?? pricePerNight * nights;
  const cleaningFee = booking.cleaningFee ?? 0;
  const serviceFee = booking.serviceFee ?? 0;
  const discount = booking.discount ?? 0;
  const total = booking.total ?? subtotal + cleaningFee + serviceFee - discount;
  const rows = [
    ["Nightly stay", String(nights), formatEgp(pricePerNight), formatEgp(subtotal)],
    ["Cleaning fee", "1", formatEgp(cleaningFee), formatEgp(cleaningFee)],
    ["DAR service fee", "1", formatEgp(serviceFee), formatEgp(serviceFee)],
    ["Launch discount", "1", `-${formatEgp(discount)}`, `-${formatEgp(discount)}`],
  ];
  return (
    <Card className="p-0">
      <h2 className="px-5 pt-4 text-[18px] font-bold">Charges</h2>
      <div className="grid gap-5 p-5 lg:grid-cols-[minmax(0,1fr)_360px]">
        <table className="w-full text-left text-[14px]">
          <thead className="bg-[#F8FAFC] text-[#34405A]">
            <tr>
              <th className="rounded-l-[6px] px-4 py-3">Description</th>
              <th className="px-4 py-3">Qty</th>
              <th className="px-4 py-3">Unit price</th>
              <th className="rounded-r-[6px] px-4 py-3 text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(([description, qty, unit, total]) => (
              <tr key={description} className="border-b border-[#E6EBF3] last:border-0">
                <td className="px-4 py-3">{description}</td>
                <td className="px-4 py-3">{qty}</td>
                <td className="px-4 py-3">{unit}</td>
                <td className={cn("px-4 py-3 text-right font-semibold", description.includes("discount") ? "text-red-500" : "")}>{total}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="border-t border-[#E6EBF3] pt-5 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-6">
          <PriceLine label="Subtotal" value={formatEgp(total)} />
          <PriceLine label="VAT / tax" value="Included" />
          <div className="mt-8 flex items-end justify-between border-t border-[#DDE4F0] pt-5">
            <span className="text-[20px] font-bold">Grand total</span>
            <span className="text-[30px] font-black text-[#5F36E9]">{formatEgp(total)}</span>
          </div>
        </div>
      </div>
    </Card>
  );
}

function PaymentDetails({ booking }: { booking: BookingPayload }) {
  return (
    <Card className="grid gap-5 md:grid-cols-[1fr_1fr_1fr_230px] md:items-center">
      <div className="space-y-5 md:border-r md:pr-6">
        <InfoLine icon="card" label="Payment method" value={paymentLabel(booking.paymentMethod)} accent />
        <InfoLine icon="info" label="Transaction ID" value={booking.paymentId ?? "IP-739201"} />
      </div>
      <div className="space-y-5 md:border-r md:pr-6">
        <InfoLine icon="shield" label="Verification status" value="Verified" green />
        <InfoLine icon="upload" label="Receipt uploaded" value="Yes" green />
      </div>
      <div className="space-y-5">
        <InfoLine icon="user" label="Paid by" value={booking.guestInfo?.fullName ?? "Ismail Negm"} />
        <InfoLine icon="wallet" label="Currency" value="EGP" />
      </div>
      <div className="rounded-[10px] border border-[#CDEFD8] bg-[#F0FFF5] p-4 text-[13px] leading-5 text-[#34405A]">
        <Icon name="shield" className="mb-2 h-6 w-6 text-[#168A43]" />
        This payment was manually verified by DAR.
      </div>
    </Card>
  );
}

function NotesPolicies() {
  const items = [
    ["Cancellation policy", "Free cancellation until May 18, 2026 11:59 PM EET.", "refresh"],
    ["Refunds", "Refunds, if approved, will be sent back using the original payment method when possible.", "wallet"],
    ["Support", "Contact DAR support for any billing or invoice related questions.", "headset"],
  ] as const;
  return (
    <Card>
      <h2 className="mb-5 text-[18px] font-bold">Notes and policies</h2>
      <div className="grid gap-5 md:grid-cols-3">
        {items.map(([title, body, icon], index) => (
          <div key={title} className={cn("flex gap-4", index > 0 ? "md:border-l md:pl-7" : "")}>
            <Icon name={icon} className="h-8 w-8 shrink-0" />
            <div>
              <p className="font-bold">{title}</p>
              <p className="mt-1 text-[13px] leading-5 text-[#34405A]">{body}</p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

function RelatedDocuments({ onDownload }: { onDownload: (name: string) => void }) {
  const docs = [
    ["Booking confirmation", "PDF - 124 KB", "booking-confirmation"],
    ["Payment receipt", "PDF - 98 KB", "payment-receipt"],
    ["Cancellation policy", "PDF - 78 KB", "cancellation-policy"],
    ["Host details", "PDF - 65 KB", "host-details"],
  ];
  return (
    <Card>
      <h2 className="mb-4 text-[18px] font-bold">Related documents</h2>
      <div className="grid gap-4 md:grid-cols-4">
        {docs.map(([title, meta, file]) => (
          <button key={title} onClick={() => onDownload(file)} className="flex items-center justify-between rounded-[8px] border border-[#DDE4F0] p-4 text-left hover:bg-[#F8FAFC]">
            <span className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-[7px] bg-[#5F36E9] text-white"><Icon name="file" /></span>
              <span><span className="block text-[13px] font-bold">{title}</span><span className="text-[12px] text-[#59637C]">{meta}</span></span>
            </span>
            <Icon name="download" className="h-5 w-5 text-[#34405A]" />
          </button>
        ))}
      </div>
    </Card>
  );
}

function BookingSummary({ booking }: { booking: BookingPayload }) {
  const total = booking.total ?? 0;
  return (
    <Card>
      <h2 className="text-[18px] font-bold">Booking summary</h2>
      <div className="mt-5 flex gap-4">
        <div className="relative h-[118px] w-[132px] shrink-0 overflow-hidden rounded-[8px]">
          <Image src={booking.image ?? featuredProperty.images[0].src} alt={booking.title ?? featuredProperty.title} fill className="object-cover" />
        </div>
        <div>
          <h3 className="text-[17px] font-bold">{booking.title}</h3>
          <p className="mt-2 flex items-center gap-1 text-[13px]"><span className="text-[#F5A400]">★</span> 4.9 (32 reviews)</p>
          <span className="mt-2 inline-block rounded-[6px] bg-[#DDF7E8] px-3 py-1 text-[12px] font-bold text-[#168A43]">Verified property</span>
        </div>
      </div>
      <div className="mt-5 space-y-4 border-y border-[#E6EBF3] py-5 text-[14px] text-[#34405A]">
        <p className="flex items-center gap-3"><Icon name="calendar" /> {formatDate(booking.checkIn)} - {formatDate(booking.checkOut)} ({booking.nights} nights)</p>
        <p className="flex items-center gap-3"><Icon name="user" /> {booking.guests} guests • 1 studio</p>
      </div>
      <div className="mt-4 flex items-center justify-between text-[17px] font-bold">
        <span>Total paid</span>
        <span className="text-[25px] text-[#5F36E9]">{formatEgp(total)}</span>
      </div>
    </Card>
  );
}

function ReceiptActions({
  booking,
  onDownloadPdf,
  onSaveWallet,
}: {
  booking: BookingPayload;
  onDownloadPdf: () => void;
  onSaveWallet: () => void;
}) {
  return (
    <Card>
      <h2 className="text-[18px] font-bold">Receipt actions</h2>
      <div className="mt-5 space-y-3">
        <button
          type="button"
          onClick={onDownloadPdf}
          className="flex h-11 w-full items-center justify-center gap-3 rounded-[7px] bg-[#5F36E9] text-[14px] font-bold text-white shadow-[0_10px_22px_rgba(95,54,233,0.22)]"
        >
          <Icon name="download" className="h-5 w-5" />
          Download PDF
        </button>
        <button
          type="button"
          onClick={() => window.print()}
          className="flex h-11 w-full items-center justify-center gap-3 rounded-[7px] border border-[#D9E0EC] bg-white text-[14px] font-bold text-[#080B32]"
        >
          <Icon name="print" className="h-5 w-5" />
          Print receipt
        </button>
        <a
          href={`mailto:${booking.guestInfo?.email ?? ""}?subject=DAR%20receipt%20${receiptNumber}`}
          className="flex h-11 w-full items-center justify-center gap-3 rounded-[7px] border border-[#D9E0EC] bg-white text-[14px] font-bold text-[#080B32]"
        >
          <Icon name="mail" className="h-5 w-5" />
          Email receipt
        </a>
        <button
          type="button"
          onClick={onSaveWallet}
          className="flex h-11 w-full items-center justify-center gap-3 rounded-[7px] border border-[#D9E0EC] bg-white text-[14px] font-bold text-[#080B32]"
        >
          <Icon name="wallet" className="h-5 w-5" />
          Save to wallet
        </button>
        <Link
          href={localizedPath(booking, "/bookings")}
          className="flex h-11 w-full items-center justify-center gap-3 rounded-[7px] border border-[#8D6BFF] bg-white text-[14px] font-bold text-[#5F36E9]"
        >
          <Icon name="eye" className="h-5 w-5" />
          View booking
        </Link>
      </div>
    </Card>
  );
}

function InvoiceTimeline() {
  const rows = [
    ["Booking confirmed", "May 10, 2026 10:15 AM", true],
    ["Payment submitted", "May 10, 2026 10:16 AM", true],
    ["Payment verified", "May 10, 2026 10:18 AM", true],
    ["Invoice issued", "May 16, 2026 09:00 AM", "active"],
    ["Stay upcoming", "May 20, 2026 02:00 PM", false],
  ] as const;
  return (
    <section className="rounded-[12px] border border-[#DFE6F1] bg-white px-4 py-4 shadow-[0_14px_34px_rgba(15,23,42,0.06)]">
      <h2 className="text-[14px] font-black leading-none tracking-[0] text-[#080B32]">Invoice status timeline</h2>
      <div className="relative mt-4 space-y-[15px]">
        <span className="absolute bottom-[8px] left-[8px] top-[8px] w-px bg-[#C9D2E1]" aria-hidden="true" />
        {rows.map(([label, date, state]) => (
          <div key={label} className="relative grid grid-cols-[18px_minmax(0,1fr)_138px] items-center gap-3">
            <span
              className={cn(
                "relative z-10 grid h-4 w-4 place-items-center rounded-full border",
                state === true
                  ? "border-[#24A95A] bg-[#24A95A] text-white"
                  : state === "active"
                    ? "border-[#5F36E9] bg-[#5F36E9]"
                    : "border-[#C7D3E3] bg-white",
              )}
            >
              {state === true ? <Icon name="check" className="h-2.5 w-2.5" /> : null}
            </span>
            <span className={cn("text-[12px] font-medium leading-none text-[#34405A]", state === "active" ? "font-black text-[#5F36E9]" : "")}>
              {label}
            </span>
            <span className="text-right text-[12px] font-medium leading-none text-[#4A5874]">{date}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

function BillingSupport() {
  return (
    <Card>
      <h2 className="text-[18px] font-bold">Billing support</h2>
      <div className="mt-5 space-y-3">
        <a href="mailto:support@dar.example?subject=Billing%20support" className="flex h-11 items-center justify-center gap-2 rounded-[7px] border border-[#8D6BFF] text-[14px] font-bold text-[#5F36E9]"><Icon name="headset" /> Contact support</a>
        <a href="mailto:billing@dar.example?subject=Open%20billing%20ticket" className="flex h-11 items-center justify-center gap-2 rounded-[7px] border border-[#8D6BFF] text-[14px] font-bold text-[#5F36E9]"><Icon name="file" /> Open billing ticket</a>
        <a href="https://wa.me/201001234567" target="_blank" rel="noreferrer" className="flex h-11 items-center justify-center gap-2 rounded-[7px] border border-[#21A85B] text-[14px] font-bold text-[#168A43]">WhatsApp support</a>
      </div>
    </Card>
  );
}

function VerifyInvoice() {
  return (
    <Card>
      <h2 className="text-[18px] font-bold">Verify this invoice</h2>
      <div className="mt-5 flex gap-5">
        <div className="grid h-[150px] w-[150px] shrink-0 grid-cols-7 gap-1 bg-white p-2">
          {Array.from({ length: 49 }).map((_, index) => (
            <span key={index} className={cn("rounded-[1px]", [0, 1, 2, 4, 6, 7, 9, 12, 14, 16, 18, 21, 24, 25, 27, 30, 32, 35, 36, 39, 42, 44, 45, 47, 48].includes(index) ? "bg-[#080B32]" : "bg-[#F2EEFF]")} />
          ))}
        </div>
        <div className="text-[15px] leading-6">
          <p>Scan to verify invoice authenticity.</p>
          <p className="mt-6">Reference:</p>
          <a href={`/booking/invoice?verify=${invoiceNumber}`} className="text-[18px] font-black text-[#5F36E9]">{invoiceNumber}</a>
        </div>
      </div>
    </Card>
  );
}

function InfoLine({ icon, label, value, green = false, accent = false }: { icon: IconName; label: string; value: string; green?: boolean; accent?: boolean }) {
  return (
    <div className="flex gap-3">
      <Icon name={icon} className="mt-1 h-5 w-5 shrink-0" />
      <div>
        <p className="text-[13px] font-medium text-[#59637C]">{label}</p>
        <p className={cn("mt-1 text-[15px] font-bold", green ? "text-[#168A43]" : accent ? "text-[#5F36E9]" : "")}>{value}</p>
      </div>
    </div>
  );
}

function PriceLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between py-3 text-[16px]">
      <span>{label}</span>
      <span className="font-semibold">{value}</span>
    </div>
  );
}
