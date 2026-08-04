"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  type RefObject,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { cn } from "@/lib/utils";
import { FullDateInput } from "@/app/components/full-date-input";
import { compactBookingQuery, shortPath } from "@/app/routing";
import type { Property } from "./property-data";

type PropertyDetailsProps = {
  property: Property;
};

type Notice = {
  tone: "success" | "neutral";
  title: string;
  body: string;
  action?: string;
};

const MS_PER_DAY = 24 * 60 * 60 * 1000;
const savedPropertyEvent = "dar-saved-property-change";

function getTodayDate() {
  return new Date().toISOString().slice(0, 10);
}

function addDays(date: string, days: number) {
  if (!date) {
    return "";
  }

  const nextDate = new Date(dateToUtc(date) + days * MS_PER_DAY);
  return nextDate.toISOString().slice(0, 10);
}

function formatEgp(value: number) {
  return new Intl.NumberFormat("en-EG", {
    style: "currency",
    currency: "EGP",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatShortDate(value: string) {
  if (!value) {
    return "Select";
  }

  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
  }).format(new Date(`${value}T12:00:00`));
}

function formatConflictDate(value: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(`${value}T12:00:00`));
}

function dateToUtc(date: string) {
  const [year, month, day] = date.split("-").map(Number);
  return Date.UTC(year, month - 1, day);
}

function getNightCount(checkIn: string, checkOut: string) {
  if (!checkIn || !checkOut) {
    return 0;
  }

  return Math.max(
    0,
    Math.round((dateToUtc(checkOut) - dateToUtc(checkIn)) / MS_PER_DAY),
  );
}

function getDatesBetween(checkIn: string, checkOut: string) {
  const nights = getNightCount(checkIn, checkOut);
  const start = dateToUtc(checkIn);

  return Array.from({ length: nights }, (_, index) => {
    const date = new Date(start + index * MS_PER_DAY);
    return date.toISOString().slice(0, 10);
  });
}

function getConflictRange(selectedDates: string[], unavailableDates: string[]) {
  const conflicts = selectedDates
    .filter((date) => unavailableDates.includes(date))
    .sort();

  if (conflicts.length === 0) {
    return null;
  }

  return {
    start: conflicts[0],
    end: addDays(conflicts[conflicts.length - 1], 1),
  };
}

function iconPath(name: string) {
  const paths = {
    air: "M4 7h10a3 3 0 1 0-3-3M4 12h14a3 3 0 1 1-3 3M4 17h8",
    area: "M5 19h14V5M5 19V5h14M8 16l8-8M11 16h-3v-3M13 8h3v3",
    bath: "M7 12V6a3 3 0 0 1 6 0M5 12h14v3a4 4 0 0 1-4 4H9a4 4 0 0 1-4-4v-3Z",
    bed: "M4 18v-7a2 2 0 0 1 2-2h5a3 3 0 0 1 3 3v1h3a3 3 0 0 1 3 3v2M4 14h16M7 9V6h5v4",
    calendar: "M7 3v3M17 3v3M4.5 8.5h15M6 5h12a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z",
    car: "M6 17h12M7 17a2 2 0 1 1-4 0 2 2 0 0 1 4 0Zm14 0a2 2 0 1 1-4 0 2 2 0 0 1 4 0ZM5 15l1.8-5.1A3 3 0 0 1 9.6 8h4.8a3 3 0 0 1 2.8 1.9L19 15M4 15h16",
    chat: "M5 6.5h14v9H9l-4 3v-12Z",
    check: "m5 12 4.2 4.2L19 6.5",
    chevronDown: "m7 9 5 5 5-5",
    chevronLeft: "M14.5 5 8.5 11l6 6",
    chevronRight: "m9.5 5 6 6-6 6",
    close: "M6 6l12 12M18 6 6 18",
    elevator: "M7 3h10v18H7V3Zm3 4h4M10 11l2-2 2 2M10 15l2 2 2-2",
    heart: "M12 20.2s-6.8-4.4-9.4-8.3C.3 8.4 2.3 4.5 6.2 4.5c2 0 3.5 1 4.4 2.3.9-1.3 2.4-2.3 4.4-2.3 3.9 0 5.9 3.9 3.6 7.4-2.6 3.9-9.4 8.3-9.4 8.3Z",
    home: "M3.5 11.5 12 4l8.5 7.5M5.5 10.5V20h13v-9.5M9.5 20v-6h5v6",
    kitchen: "M6 3v18M10 3v18M15 4h4v16h-4V4ZM5 8h6",
    location: "M12 21s7-4.4 7-11a7 7 0 1 0-14 0c0 6.6 7 11 7 11Zm0-8.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z",
    pool: "M4 16c1.5 0 1.5-1 3-1s1.5 1 3 1 1.5-1 3-1 1.5 1 3 1 1.5-1 3-1M4 20c1.5 0 1.5-1 3-1s1.5 1 3 1 1.5-1 3-1 1.5 1 3 1 1.5-1 3-1M12 4v8m0-8 4 4m-4-4-4 4",
    share: "M16 8a3 3 0 1 0-2.8-4H13a3 3 0 0 0 .2 1L7.9 8.1a3 3 0 1 0 0 3.8l5.3 3.1A3 3 0 1 0 14 13.7L8.7 10.6a3.4 3.4 0 0 0 0-1.2L14 6.3A3 3 0 0 0 16 8Z",
    shield: "M12 3 19 6v5c0 4.8-2.9 8-7 10-4.1-2-7-5.2-7-10V6l7-3Z",
    star: "m12 2.8 2.8 5.7 6.3.9-4.5 4.4 1.1 6.2L12 17.7 6.4 20.6l1.1-6.2L3 10l6.3-.9L12 2.8Z",
    users: "M16 19c0-2.2-1.8-4-4-4s-4 1.8-4 4M12 12a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM20 19c0-1.7-1-3.1-2.5-3.7M16.5 6.4a2.5 2.5 0 0 1 0 4.8",
    washer: "M6 4h12v16H6V4Zm3 3h.1M12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z",
    wifi: "M4.5 9.5a11 11 0 0 1 15 0M7.5 12.5a6.8 6.8 0 0 1 9 0M10.5 15.5a2.8 2.8 0 0 1 3 0M12 18h.01",
  } as const;

  return paths[name as keyof typeof paths];
}

function Icon({
  name,
  className,
  filled = false,
}: {
  name: string;
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

function subscribeToSavedProperties(onStoreChange: () => void) {
  window.addEventListener("storage", onStoreChange);
  window.addEventListener(savedPropertyEvent, onStoreChange);

  return () => {
    window.removeEventListener("storage", onStoreChange);
    window.removeEventListener(savedPropertyEvent, onStoreChange);
  };
}

function useSavedProperty(slug: string) {
  return useSyncExternalStore(
    subscribeToSavedProperties,
    () => window.localStorage.getItem(`dar-saved-${slug}`) === "true",
    () => false,
  );
}

const amenityIcons: Record<string, string> = {
  "Fast Wi-Fi": "wifi",
  "Air conditioning": "air",
  "Equipped kitchen": "kitchen",
  Washer: "washer",
  "Garden view": "pool",
  Elevator: "elevator",
  "Free parking": "car",
  Workspace: "home",
};

export function PropertyDetails({ property }: PropertyDetailsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeImage, setActiveImage] = useState(0);
  const isSaved = useSavedProperty(property.slug);
  const [notice, setNotice] = useState<Notice | null>(null);
  const [checkIn, setCheckIn] = useState(searchParams.get("in") ?? searchParams.get("checkIn") ?? "2026-07-08");
  const [checkOut, setCheckOut] = useState(searchParams.get("out") ?? searchParams.get("checkOut") ?? "2026-07-12");
  const [guests, setGuests] = useState(Number(searchParams.get("g") ?? searchParams.get("guests") ?? "2"));
  const [hasCheckedAvailability, setHasCheckedAvailability] = useState(false);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [isAboutExpanded, setIsAboutExpanded] = useState(false);
  const [areAmenitiesExpanded, setAreAmenitiesExpanded] = useState(false);
  const [isGuestMenuOpen, setIsGuestMenuOpen] = useState(false);
  const [dismissedConflictKey, setDismissedConflictKey] = useState<string | null>(
    null,
  );
  const checkInInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!notice) {
      return;
    }

    const timeout = window.setTimeout(() => setNotice(null), 4600);
    return () => window.clearTimeout(timeout);
  }, [notice]);

  const nights = useMemo(() => getNightCount(checkIn, checkOut), [checkIn, checkOut]);
  const requestedDates = useMemo(
    () => getDatesBetween(checkIn, checkOut),
    [checkIn, checkOut],
  );
  const unavailableHit = requestedDates.find((date) =>
    property.unavailableDates.includes(date),
  );
  const conflictRange = useMemo(
    () => getConflictRange(requestedDates, property.unavailableDates),
    [requestedDates, property.unavailableDates],
  );
  const subtotal = property.pricePerNight * nights;
  const total = subtotal;
  const isDateRangeValid = Boolean(checkIn && checkOut && nights > 0);
  const isGuestCountValid = guests <= property.maxGuests;
  const isAvailable = isDateRangeValid && isGuestCountValid && !unavailableHit;
  const visibleAbout = isAboutExpanded
    ? property.about
    : `${property.about.slice(0, 154)}...`;
  const conflictKey = conflictRange
    ? `${conflictRange.start}:${conflictRange.end}`
    : null;
  const isDateConflictOpen = Boolean(
    conflictRange && isDateRangeValid && conflictKey !== dismissedConflictKey,
  );

  const moveImage = (direction: -1 | 1) => {
    setActiveImage((current) =>
      (current + direction + property.images.length) % property.images.length,
    );
  };

  const updateCheckIn = (value: string) => {
    const today = getTodayDate();
    const nextCheckIn = value < today ? today : value;
    const minimumCheckOut = addDays(nextCheckIn, 1);

    setCheckIn(nextCheckIn);
    setHasCheckedAvailability(false);
    setDismissedConflictKey(null);

    if (!checkOut || checkOut <= nextCheckIn) {
      setCheckOut(minimumCheckOut);
    }
  };

  const updateCheckOut = (value: string) => {
    const minimumCheckOut = addDays(checkIn || getTodayDate(), 1);
    setCheckOut(value < minimumCheckOut ? minimumCheckOut : value);
    setHasCheckedAvailability(false);
    setDismissedConflictKey(null);
  };

  const toggleSaved = () => {
    const nextSaved = !isSaved;
    window.localStorage.setItem(`dar-saved-${property.slug}`, String(nextSaved));
    window.dispatchEvent(new Event(savedPropertyEvent));
    setNotice({
      tone: nextSaved ? "success" : "neutral",
      title: nextSaved ? "Saved to your favorites" : "Removed from your favorites",
      body: nextSaved
        ? "You can view it anytime in your saved properties."
        : "You can add it back anytime.",
      action: nextSaved ? "View saved" : "Undo",
    });
  };

  const handleNoticeAction = () => {
    if (notice?.action === "View saved") {
      router.push(shortPath("/saved", "en"));
      return;
    }
    toggleSaved();
  };

  const shareProperty = async () => {
    const shareUrl = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({
          title: property.title,
          text: `Take a look at ${property.title} on DAR.`,
          url: shareUrl,
        });
      } else {
        await navigator.clipboard.writeText(shareUrl);
        setNotice({
          tone: "success",
          title: "Link copied",
          body: "The property link is ready to share.",
        });
      }
    } catch {
      setNotice({
        tone: "neutral",
        title: "Share cancelled",
        body: "No changes were made.",
      });
    }
  };

  const openMessages = () => {
    setNotice({
      tone: "neutral",
      title: "Messages",
      body: "Your DAR host conversation will appear here.",
    });
  };

  const checkAvailability = () => {
    setHasCheckedAvailability(true);
    if (conflictRange) {
      setDismissedConflictKey(null);
      return;
    }

    setNotice({
      tone: isAvailable ? "success" : "neutral",
      title: isAvailable ? "This stay is available" : "Dates need another look",
      body: isAvailable
        ? `${nights} nights for ${guests} guest${guests > 1 ? "s" : ""} total ${formatEgp(total)}.`
        : unavailableHit
          ? "One or more selected nights are already booked."
          : "Choose valid dates and guests within the property limit.",
    });
  };

  const reserve = () => {
    if (conflictRange) {
      setHasCheckedAvailability(true);
      setDismissedConflictKey(null);
      return;
    }

    if (!isAvailable) {
      checkAvailability();
      return;
    }

    const locale =
      typeof document !== "undefined"
        ? document.documentElement.lang || "en"
        : "en";
    const serviceFee = Math.round(subtotal * property.serviceFeeRate);
    const checkoutPayload = {
      propertyId: property.slug,
      title: property.title,
      location: property.location,
      image: property.images[0]?.src,
      checkIn,
      checkOut,
      guests,
      nights,
      pricePerNight: property.pricePerNight,
      cleaningFee: property.cleaningFee,
      serviceFee,
      subtotal,
      total: subtotal + property.cleaningFee + serviceFee,
      currency: "EGP",
      locale,
      createdAt: new Date().toISOString(),
    };

    window.sessionStorage.setItem(
      "dar-pending-booking",
      JSON.stringify(checkoutPayload),
    );
    setHasCheckedAvailability(true);

    const checkoutPath = shortPath("/booking", locale);
    const params = compactBookingQuery({
      property: property.slug,
      checkIn,
      checkOut,
      guests: String(guests),
      nights: String(nights),
      locale,
    });

    router.push(`${checkoutPath}?${params}`);
  };

  const changeDatesFromConflict = () => {
    if (conflictKey) {
      setDismissedConflictKey(conflictKey);
    }
    window.setTimeout(() => checkInInputRef.current?.focus(), 0);
  };

  const seeSimilarPlaces = () => {
    if (conflictKey) {
      setDismissedConflictKey(conflictKey);
    }
    router.push(`${shortPath("/", "en")}#results`);
  };

  return (
    <main className="min-h-screen bg-[#F8FAFC] text-[#090B32]">
      <div className="mx-auto min-h-screen max-w-[1440px] bg-white shadow-[0_28px_80px_rgba(15,23,42,0.06)] xl:my-4 xl:rounded-[28px]">
        <Header
          isSaved={isSaved}
          onShare={shareProperty}
          onMessages={openMessages}
          onToggleSaved={toggleSaved}
        />

        <div className="px-5 pb-8 pt-5 sm:px-8 lg:px-10">
          <Link
            href="/"
            className="mb-4 inline-flex items-center gap-2 text-[15px] font-semibold text-[#4E2DEF]"
          >
            <Icon name="chevronLeft" className="h-4 w-4" />
            Back to results
          </Link>

          <section className="grid items-start gap-10 lg:grid-cols-[minmax(0,740px)_minmax(360px,1fr)]">
            <div className="min-w-0">
              <Gallery
                property={property}
                activeImage={activeImage}
                isSaved={isSaved}
                onImageChange={setActiveImage}
                onMoveImage={moveImage}
                onOpenGallery={() => setIsGalleryOpen(true)}
                onToggleSaved={toggleSaved}
              />

              <AboutAndAmenities
                property={property}
                visibleAbout={visibleAbout}
                isAboutExpanded={isAboutExpanded}
                onToggleAbout={() => setIsAboutExpanded((current) => !current)}
                areAmenitiesExpanded={areAmenitiesExpanded}
                onToggleAmenities={() => setAreAmenitiesExpanded((current) => !current)}
              />
            </div>

            <aside className="pt-6">
              <PropertySummary
                property={property}
                guests={guests}
              />
              <BookingCard
                property={property}
                checkIn={checkIn}
                setCheckIn={updateCheckIn}
                checkInInputRef={checkInInputRef}
                checkOut={checkOut}
                setCheckOut={updateCheckOut}
                guests={guests}
                setGuests={setGuests}
                nights={nights}
                total={total}
                isAvailable={isAvailable}
                hasCheckedAvailability={hasCheckedAvailability}
                unavailableHit={unavailableHit}
                isGuestMenuOpen={isGuestMenuOpen}
                setIsGuestMenuOpen={setIsGuestMenuOpen}
                onReserve={reserve}
              />
            </aside>
          </section>

          <SimilarProperties property={property} />
        </div>
      </div>

      {notice ? (
        <NoticeToast
          notice={notice}
          isSaved={isSaved}
          onClose={() => setNotice(null)}
          onAction={handleNoticeAction}
        />
      ) : null}

      {isGalleryOpen ? (
        <GalleryOverlay
          property={property}
          activeImage={activeImage}
          onClose={() => setIsGalleryOpen(false)}
          onMoveImage={moveImage}
        />
      ) : null}

      {isDateConflictOpen && conflictRange ? (
        <DateConflictModal
          conflictRange={conflictRange}
          onChangeDates={changeDatesFromConflict}
          onClose={() => {
            if (conflictKey) {
              setDismissedConflictKey(conflictKey);
            }
          }}
          onSeeSimilarPlaces={seeSimilarPlaces}
        />
      ) : null}
    </main>
  );
}

function Header({
  isSaved,
  onShare,
  onMessages,
  onToggleSaved,
}: {
  isSaved: boolean;
  onShare: () => void;
  onMessages: () => void;
  onToggleSaved: () => void;
}) {
  return (
    <header className="border-b border-slate-100 bg-white/95 px-5 py-4 sm:px-8 lg:px-10 xl:rounded-t-[28px]">
      <div className="flex h-12 items-center justify-between">
        <Link href={shortPath("/", "en")} className="block w-[104px]" aria-label="DAR home">
          <Image
            src="/dar-logo-purple-header.png"
            alt="DAR"
            width={320}
            height={142}
            priority
            className="h-auto w-[104px] object-contain"
          />
        </Link>

        <nav className="hidden items-center gap-10 text-[14px] font-bold text-[#090B32] lg:flex">
          <Link href={shortPath("/rent", "en")}>Rent</Link>
          <Link href={shortPath("/buy", "en")}>Buy</Link>
          <Link href={shortPath("/hotels", "en")}>Hotels</Link>
          <Link href={`${shortPath("/rent", "en")}?stay=short`}>Short stays</Link>
          <Link href={shortPath("/new-projects", "en")}>New projects</Link>
        </nav>

        <div className="flex items-center gap-6">
          <Link
            href={shortPath("/saved", "en")}
            className="hidden items-center gap-2 rounded-lg px-2 py-2 text-[14px] font-bold text-[#090B32] transition hover:bg-[#F4F1FF] focus:outline-none focus:ring-2 focus:ring-[#5F36E9]/25 sm:inline-flex"
          >
            <Icon
              name="heart"
              className={cn("h-5 w-5", isSaved && "text-[#5F36E9]")}
              filled={isSaved}
            />
            Saved
          </Link>
          <button
            className="hidden h-9 w-9 items-center justify-center rounded-lg text-[#090B32] transition hover:bg-[#F4F1FF] focus:outline-none focus:ring-2 focus:ring-[#5F36E9]/25 sm:inline-flex"
            onClick={onMessages}
            aria-label="Messages"
            title="Messages"
          >
            <Icon name="chat" className="h-5 w-5" />
          </button>
          <div className="hidden items-center gap-3 sm:flex">
            <div className="h-9 w-9 overflow-hidden rounded-full bg-slate-200">
              <img
                src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80"
                alt="Ahmed"
                className="h-full w-full object-cover"
              />
            </div>
            <span className="text-[14px] font-bold text-[#090B32]">Ahmed</span>
            <Icon name="chevronDown" className="h-4 w-4" />
          </div>
          <div className="flex items-center gap-2 sm:hidden">
            <button
              className="grid h-10 w-10 place-items-center rounded-lg border border-slate-200 text-[#090B32] transition hover:bg-[#F4F1FF] focus:outline-none focus:ring-2 focus:ring-[#5F36E9]/25"
              onClick={onMessages}
              aria-label="Messages"
              title="Messages"
            >
              <Icon name="chat" className="h-5 w-5" />
            </button>
            <button
              className="grid h-10 w-10 place-items-center rounded-lg border border-slate-200 text-[#090B32] transition hover:bg-[#F4F1FF] focus:outline-none focus:ring-2 focus:ring-[#5F36E9]/25"
              onClick={onShare}
              aria-label="Share property"
              title="Share property"
            >
              <Icon name="share" className="h-4 w-4" />
            </button>
            <button
              className="grid h-10 w-10 place-items-center rounded-lg bg-[#F0EDFF]"
              onClick={onToggleSaved}
              aria-label={isSaved ? "Remove saved property" : "Save property"}
            >
              <Icon
                name="heart"
                className="h-5 w-5 text-[#5F36E9]"
                filled={isSaved}
              />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

function Gallery({
  property,
  activeImage,
  isSaved,
  onImageChange,
  onMoveImage,
  onOpenGallery,
  onToggleSaved,
}: {
  property: Property;
  activeImage: number;
  isSaved: boolean;
  onImageChange: (index: number) => void;
  onMoveImage: (direction: -1 | 1) => void;
  onOpenGallery: () => void;
  onToggleSaved: () => void;
}) {
  return (
    <div>
      <div className="relative h-[292px] overflow-hidden rounded-[11px] bg-slate-100 shadow-[0_20px_45px_rgba(15,23,42,0.08)] sm:aspect-[740/430] sm:h-auto sm:max-h-[430px]">
        <img
          src={property.images[activeImage].src}
          alt={property.images[activeImage].alt}
          className="h-full w-full object-cover"
        />
        <span className="absolute left-5 top-5 rounded-[8px] bg-[#5F36E9] px-3 py-1.5 text-[13px] font-bold text-white shadow-lg shadow-[#5F36E9]/25">
          Featured
        </span>
        <button
          className="absolute right-5 top-5 grid h-[62px] w-[62px] place-items-center rounded-full bg-white text-[#5F36E9] shadow-[0_12px_30px_rgba(15,23,42,0.16)] transition hover:scale-105"
          onClick={onToggleSaved}
          aria-label={isSaved ? "Remove saved property" : "Save property"}
        >
          <Icon name="heart" className="h-8 w-8" filled={isSaved} />
        </button>
        <button
          className="absolute left-4 top-1/2 grid h-[52px] w-[52px] -translate-y-1/2 place-items-center rounded-full bg-white/95 text-[#10163A] shadow-[0_10px_26px_rgba(15,23,42,0.18)]"
          onClick={() => onMoveImage(-1)}
          aria-label="Previous image"
        >
          <Icon name="chevronLeft" className="h-5 w-5" />
        </button>
        <button
          className="absolute right-4 top-1/2 grid h-[52px] w-[52px] -translate-y-1/2 place-items-center rounded-full bg-white/95 text-[#10163A] shadow-[0_10px_26px_rgba(15,23,42,0.18)]"
          onClick={() => onMoveImage(1)}
          aria-label="Next image"
        >
          <Icon name="chevronRight" className="h-5 w-5" />
        </button>
        <button
          className="absolute bottom-5 right-5 rounded-[8px] border border-white/80 bg-[#211A18]/70 px-3 py-2 text-[13px] font-bold text-white backdrop-blur"
          onClick={onOpenGallery}
        >
          {activeImage + 1}/{property.images.length} photos
        </button>
      </div>

      <div className="mt-4 flex w-full max-w-full gap-3 overflow-x-auto pb-1">
        {property.images.map((image, index) => (
          <button
            key={image.src}
            className={cn(
              "h-[68px] min-w-[118px] overflow-hidden rounded-[8px] border-2 bg-slate-100 transition sm:h-[86px] sm:min-w-[132px]",
              activeImage === index
                ? "border-[#5F36E9]"
                : "border-transparent hover:border-slate-300",
            )}
            onClick={() => onImageChange(index)}
            aria-label={`Show photo ${index + 1}`}
          >
            <img
              src={image.src}
              alt={image.alt}
              className="h-full w-full object-cover"
            />
          </button>
        ))}
        <button
          className="grid h-[68px] min-w-[56px] place-items-center rounded-[8px] bg-white text-[#5F36E9] shadow-[0_8px_22px_rgba(15,23,42,0.08)] sm:h-[86px]"
          onClick={() => onMoveImage(1)}
          aria-label="More photos"
        >
          <Icon name="chevronRight" className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}

function PropertySummary({
  property,
  guests,
}: {
  property: Property;
  guests: number;
}) {
  const details = [
    { icon: "bed", value: `${property.bedrooms} bedrooms` },
    { icon: "bath", value: `${property.bathrooms} bathrooms` },
    { icon: "users", value: `${guests} guests` },
    { icon: "area", value: `${property.area} m²` },
  ];

  return (
    <div className="max-w-[510px]">
      <div className="flex items-center gap-2">
        <h1 className="text-[24px] font-black leading-[1.16] tracking-normal text-[#090B32] xl:text-[25px]">
          {property.title}
        </h1>
        <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-[12px] font-semibold text-emerald-700">
          <Icon name="shield" className="h-4 w-4 fill-emerald-600 stroke-white" />
          Verified
        </span>
      </div>

      <p className="mt-4 inline-flex items-center gap-2 text-[15px] font-medium text-[#35405F]">
        <Icon name="location" className="h-5 w-5 text-[#3E3572]" />
        {property.location}
      </p>

      <div className="mt-5 flex flex-wrap items-center gap-5 text-[15px] text-[#35405F]">
        <span className="inline-flex items-center gap-2 font-semibold text-[#10163A]">
          <Icon name="star" className="h-5 w-5 text-[#5F36E9]" filled />
          {property.rating.toFixed(1)} ({property.reviews} reviews)
        </span>
        <span className="h-6 w-px bg-slate-200" />
        <span className="inline-flex items-center gap-2">
          <Icon name="shield" className="h-5 w-5 text-[#3E3572]" />
          {property.hostType}
        </span>
      </div>

      <div className="mt-6">
        <p className="text-[27px] font-black tracking-normal text-[#090B32]">
          {formatEgp(property.pricePerNight)}
          <span className="text-[16px] font-semibold text-[#35405F]"> / night</span>
        </p>
        <p className="mt-2 text-[15px] font-medium text-[#3F4968]">
          Total before taxes and fees
        </p>
      </div>

      <div className="mt-6 grid min-h-[72px] grid-cols-2 items-center rounded-[9px] border border-[#D9DEEA] bg-white px-5 sm:grid-cols-4">
        {details.map((detail, index) => (
          <div
            key={detail.value}
            className={cn(
              "flex items-center justify-center gap-2 py-4 text-[14px] font-medium text-[#303A60]",
              index > 0 && "sm:border-l sm:border-slate-200",
            )}
          >
            <Icon name={detail.icon} className="h-5 w-5 text-[#3E3572]" />
            {detail.value}
          </div>
        ))}
      </div>
    </div>
  );
}

function BookingCard({
  property,
  checkIn,
  setCheckIn,
  checkInInputRef,
  checkOut,
  setCheckOut,
  guests,
  setGuests,
  nights,
  total,
  isAvailable,
  hasCheckedAvailability,
  unavailableHit,
  isGuestMenuOpen,
  setIsGuestMenuOpen,
  onReserve,
}: {
  property: Property;
  checkIn: string;
  setCheckIn: (value: string) => void;
  checkInInputRef: RefObject<HTMLInputElement | null>;
  checkOut: string;
  setCheckOut: (value: string) => void;
  guests: number;
  setGuests: (value: number) => void;
  nights: number;
  total: number;
  isAvailable: boolean;
  hasCheckedAvailability: boolean;
  unavailableHit?: string;
  isGuestMenuOpen: boolean;
  setIsGuestMenuOpen: (value: boolean) => void;
  onReserve: () => void;
}) {
  const today = getTodayDate();
  const checkoutMin = addDays(checkIn || today, 1);

  return (
    <div className="mt-7 w-full max-w-[402px] rounded-[14px] border border-[#E0E5EF] bg-white p-5 shadow-[0_22px_48px_rgba(15,23,42,0.09)] sm:p-6">
      <p className="text-[27px] font-black tracking-normal text-[#090B32]">
        {formatEgp(property.pricePerNight)}
        <span className="text-[16px] font-semibold text-[#35405F]"> / night</span>
      </p>

      <div className="mt-5 grid grid-cols-2 overflow-hidden rounded-[10px] border border-[#E0E5EF]">
        <DateField
          label="Check in"
          value={checkIn}
          min={today}
          onChange={setCheckIn}
          inputRef={checkInInputRef}
          className="border-r border-[#E0E5EF]"
        />
        <DateField
          label="Check out"
          value={checkOut}
          min={checkoutMin}
          onChange={setCheckOut}
        />
      </div>

      <div className="relative mt-3">
        <button
          className="flex h-[64px] w-full items-center justify-between rounded-[10px] border border-[#E0E5EF] bg-white px-4 text-left"
          onClick={() => setIsGuestMenuOpen(!isGuestMenuOpen)}
          aria-expanded={isGuestMenuOpen}
        >
          <span>
            <span className="block text-[12px] font-medium text-[#69728B]">Guests</span>
            <span className="mt-1 block text-[15px] font-bold text-[#090B32]">
              {guests} guest{guests > 1 ? "s" : ""}
            </span>
          </span>
          <Icon name="chevronDown" className="h-5 w-5 text-[#090B32]" />
        </button>
        {isGuestMenuOpen ? (
          <div className="absolute left-0 right-0 top-[70px] z-20 rounded-[10px] border border-[#E0E5EF] bg-white p-4 shadow-[0_18px_42px_rgba(15,23,42,0.14)]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-[#090B32]">Guests</p>
                <p className="text-xs text-[#69728B]">Maximum {property.maxGuests}</p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  className="grid h-9 w-9 place-items-center rounded-lg border border-[#E0E5EF] text-lg font-bold"
                  onClick={() => setGuests(Math.max(1, guests - 1))}
                  aria-label="Decrease guests"
                >
                  -
                </button>
                <span className="w-5 text-center text-sm font-black">{guests}</span>
                <button
                  className="grid h-9 w-9 place-items-center rounded-lg border border-[#E0E5EF] text-lg font-bold"
                  onClick={() => setGuests(Math.min(property.maxGuests, guests + 1))}
                  aria-label="Increase guests"
                >
                  +
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </div>

      <button
        className="mt-4 h-[54px] w-full rounded-[8px] bg-[#5F36E9] text-[16px] font-bold text-white shadow-[0_12px_24px_rgba(95,54,233,0.25)] transition hover:bg-[#5430d8]"
        onClick={onReserve}
      >
        Reserve
      </button>

      {hasCheckedAvailability ? (
        <div
          className={cn(
            "mt-4 rounded-[10px] border px-4 py-3 text-[13px] font-semibold",
            isAvailable
              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
              : "border-amber-200 bg-amber-50 text-amber-900",
          )}
        >
          {isAvailable
            ? `${nights} nights available. Estimated total ${formatEgp(total)}.`
            : unavailableHit
              ? "Those dates overlap with an existing booking."
              : "Select a valid date range and guest count."}
        </div>
      ) : null}

      <button
        className="mt-5 flex w-full items-center gap-4 rounded-[10px] border border-[#E0E5EF] bg-[#FBFCFF] px-4 py-4 text-left"
        onClick={onReserve}
      >
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-emerald-50 text-emerald-700">
          <Icon name="shield" className="h-5 w-5" />
        </span>
        <span>
          <span className="block text-[13px] font-bold text-[#090B32]">
            Free cancellation before 18 May
          </span>
          <span className="mt-1 block text-[13px] font-medium text-[#35405F]">
            You&apos;ll receive a full refund.
          </span>
        </span>
      </button>
    </div>
  );
}

function DateField({
  label,
  value,
  min,
  onChange,
  inputRef,
  className,
}: {
  label: string;
  value: string;
  min: string;
  onChange: (value: string) => void;
  inputRef?: RefObject<HTMLInputElement | null>;
  className?: string;
}) {
  return (
    <FullDateInput
      value={value}
      min={min}
      onChange={onChange}
      inputRef={inputRef}
      ariaLabel={label}
      className={cn("block h-[72px] px-4 py-3", className)}
    >
      <span className="block text-[12px] font-medium text-[#69728B]">{label}</span>
      <span className="mt-2 block text-[15px] font-bold text-[#090B32]">
        {formatShortDate(value)}
      </span>
    </FullDateInput>
  );
}

function AboutAndAmenities({
  property,
  visibleAbout,
  isAboutExpanded,
  onToggleAbout,
  areAmenitiesExpanded,
  onToggleAmenities,
}: {
  property: Property;
  visibleAbout: string;
  isAboutExpanded: boolean;
  onToggleAbout: () => void;
  areAmenitiesExpanded: boolean;
  onToggleAmenities: () => void;
}) {
  const visibleAmenities = areAmenitiesExpanded ? property.amenities : property.amenities.slice(0, 7);

  return (
    <div className="pt-10">
      <section>
        <h2 className="text-[24px] font-black leading-none text-[#090B32]">
          About this place
        </h2>
        <p className="mt-5 max-w-[700px] text-[16px] font-medium leading-8 text-[#35405F]">
          {visibleAbout}
        </p>
        <button
          className="mt-4 inline-flex items-center gap-2 text-[16px] font-bold text-[#4E2DEF]"
          onClick={onToggleAbout}
        >
          {isAboutExpanded ? "Show less" : "Show more"}
          <Icon name="chevronDown" className="h-4 w-4" />
        </button>
      </section>

      <section className="mt-12">
        <h2 className="text-[24px] font-black leading-none text-[#090B32]">
          Amenities
        </h2>
        <div className="mt-6 flex flex-wrap gap-4">
          {visibleAmenities.map((amenity) => (
            <button
              key={amenity.label}
              type="button"
              className="flex h-[62px] w-[74px] flex-col items-center justify-center gap-2 rounded-[8px] border border-[#DDE3EF] bg-white text-[#4E2DEF] shadow-[0_8px_20px_rgba(15,23,42,0.04)] sm:w-[82px]"
            >
              <Icon
                name={amenityIcons[amenity.label] ?? "home"}
                className="h-6 w-6"
              />
              <span className="max-w-[76px] text-center text-[12px] font-medium leading-tight text-[#303A60]">
                {amenity.label.replace("Equipped ", "")}
              </span>
            </button>
          ))}
          <button
            type="button"
            onClick={onToggleAmenities}
            aria-expanded={areAmenitiesExpanded}
            className="h-[62px] min-w-[94px] rounded-[8px] border border-[#DDE3EF] bg-white px-4 text-[14px] font-bold text-[#4E2DEF] shadow-[0_8px_20px_rgba(15,23,42,0.04)]"
          >
            {areAmenitiesExpanded ? "Show less" : "Show all"}
          </button>
        </div>
      </section>
    </div>
  );
}

function SimilarProperties({ property }: { property: Property }) {
  const query =
    typeof window !== "undefined" && window.location.search
      ? window.location.search
      : "";

  return (
    <section className="mt-14 border-t border-slate-100 pt-9">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 className="text-[24px] font-black text-[#090B32]">Similar properties</h2>
          <p className="mt-2 text-[15px] font-medium text-[#59647D]">
            More DAR stays with the same calm, central feel.
          </p>
        </div>
      </div>
      <div className="mt-6 grid gap-5 md:grid-cols-3">
        {property.similar.map((similar) => (
          <Link
            key={similar.title}
            href={`${shortPath(`/properties/${similar.slug}`, "en")}${query}`}
            className="overflow-hidden rounded-[12px] border border-[#E0E5EF] bg-white shadow-[0_16px_36px_rgba(15,23,42,0.06)]"
          >
            <img
              src={similar.image}
              alt={similar.title}
              className="h-48 w-full object-cover"
            />
            <div className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-[16px] font-black text-[#090B32]">
                    {similar.title}
                  </h3>
                  <p className="mt-1 text-[14px] font-medium text-[#59647D]">
                    {similar.location}
                  </p>
                </div>
                <span className="inline-flex items-center gap-1 text-[14px] font-bold">
                  <Icon name="star" className="h-4 w-4 text-[#5F36E9]" filled />
                  {similar.rating}
                </span>
              </div>
              <p className="mt-4 text-[14px] text-[#59647D]">
                <span className="font-black text-[#090B32]">
                  {formatEgp(similar.pricePerNight)}
                </span>{" "}
                / night
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

function NoticeToast({
  notice,
  isSaved,
  onClose,
  onAction,
}: {
  notice: Notice;
  isSaved: boolean;
  onClose: () => void;
  onAction: () => void;
}) {
  return (
    <>
      <div className="fixed left-1/2 top-[92px] z-50 hidden w-[560px] -translate-x-1/2 rounded-[18px] border border-slate-100 bg-white px-5 py-4 shadow-[0_22px_55px_rgba(15,23,42,0.14)] md:flex">
        <ToastContent
          notice={notice}
          isSaved={isSaved}
          onClose={onClose}
          onAction={onAction}
        />
      </div>
      <div className="fixed bottom-6 left-1/2 z-50 w-[calc(100%-2rem)] max-w-[620px] -translate-x-1/2 rounded-[14px] border border-slate-100 bg-white px-5 py-4 shadow-[0_22px_55px_rgba(15,23,42,0.14)] md:bottom-8 md:left-[470px] md:translate-x-0">
        <ToastContent
          notice={notice}
          isSaved={isSaved}
          onClose={onClose}
          onAction={onAction}
        />
      </div>
    </>
  );
}

function ToastContent({
  notice,
  isSaved,
  onClose,
  onAction,
}: {
  notice: Notice;
  isSaved: boolean;
  onClose: () => void;
  onAction: () => void;
}) {
  return (
    <div className="flex w-full items-center gap-4">
      <span
        className={cn(
          "grid h-12 w-12 shrink-0 place-items-center rounded-full",
          notice.tone === "success"
            ? "bg-emerald-50 text-emerald-700"
            : "bg-emerald-50 text-emerald-700",
        )}
      >
        <Icon name={isSaved ? "check" : "heart"} className="h-6 w-6" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[15px] font-black text-[#090B32]">
          {notice.title}
        </span>
        <span className="mt-1 block text-[14px] font-medium text-[#35405F]">
          {notice.body}
        </span>
      </span>
      {notice.action ? (
        <button
          className="shrink-0 text-[14px] font-bold text-[#4E2DEF]"
          onClick={onAction}
        >
          {notice.action}
        </button>
      ) : null}
      <button
        className="shrink-0 text-[#090B32]"
        onClick={onClose}
        aria-label="Dismiss message"
      >
        <Icon name="close" className="h-5 w-5" />
      </button>
    </div>
  );
}

function DateConflictModal({
  conflictRange,
  onChangeDates,
  onClose,
  onSeeSimilarPlaces,
}: {
  conflictRange: { start: string; end: string };
  onChangeDates: () => void;
  onClose: () => void;
  onSeeSimilarPlaces: () => void;
}) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key !== "Tab" || !dialogRef.current) {
        return;
      }

      const focusableElements = Array.from(
        dialogRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        ),
      ).filter((element) => !element.hasAttribute("disabled"));

      if (focusableElements.length === 0) {
        return;
      }

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[70] flex items-end justify-center bg-[#080B18]/55 px-0 backdrop-blur-[2px] sm:items-center sm:px-6"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="date-conflict-title"
        className="relative w-full rounded-t-[18px] bg-white px-6 pb-7 pt-8 text-[#090B32] shadow-[0_26px_80px_rgba(8,11,24,0.28)] sm:max-w-[628px] sm:rounded-[20px] sm:px-9 sm:pb-8 sm:pt-9"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <button
          ref={closeButtonRef}
          className="absolute right-5 top-5 grid h-8 w-8 place-items-center rounded-full text-[#090B32] transition hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-[#5F36E9]/25 sm:right-7 sm:top-6"
          onClick={onClose}
          aria-label="Close dates not available modal"
        >
          <Icon name="close" className="h-5 w-5" />
        </button>

        <div className="flex items-start gap-4 sm:block sm:text-center">
          <div className="relative mx-0 mt-1 grid h-12 w-12 shrink-0 place-items-center text-[#F43F4C] sm:mx-auto sm:mt-0 sm:h-[62px] sm:w-[62px]">
            <Icon name="calendar" className="h-10 w-10 sm:h-12 sm:w-12" />
            <span className="absolute -bottom-1 -right-1 grid h-7 w-7 place-items-center rounded-full bg-[#F43F4C] text-[17px] font-black leading-none text-white shadow-[0_6px_16px_rgba(244,63,76,0.32)]">
              !
            </span>
          </div>
          <div className="min-w-0 flex-1 sm:mt-3">
            <h2
              id="date-conflict-title"
              className="text-[22px] font-black leading-tight tracking-normal sm:text-[28px]"
            >
              Dates not available
            </h2>
            <p className="mt-5 text-center text-[14px] font-medium leading-6 text-[#263153] sm:mt-5 sm:text-[16px] sm:leading-7">
              The dates you selected are not available.
              <br />
              This property is already booked for part of your stay.
            </p>
          </div>
        </div>

        <div className="mt-7 rounded-[10px] border border-[#FFC8CF] bg-[#FFF3F4] px-5 py-5 shadow-[inset_0_0_38px_rgba(244,63,76,0.03)] sm:mt-7 sm:px-6">
          <p className="text-[15px] font-black text-[#F43F4C]">Date conflict</p>
          <p className="mt-2 text-[14px] font-medium leading-6 text-[#F43F4C]">
            This property is already booked for the following dates:
          </p>
          <p className="mt-2 text-[16px] font-black text-[#F43F4C] sm:text-[17px]">
            {formatConflictDate(conflictRange.start)}
            <span className="px-3">–</span>
            {formatConflictDate(conflictRange.end)}
          </p>
        </div>

        <button
          className="mt-4 flex w-full items-center gap-4 rounded-[10px] border border-[#E3E7EF] bg-white px-5 py-4 text-left shadow-[0_8px_22px_rgba(15,23,42,0.04)] transition hover:border-[#CFC7FF] focus:outline-none focus:ring-2 focus:ring-[#5F36E9]/25 sm:mt-4"
          onClick={onChangeDates}
        >
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#F1EDFF] text-[#5F36E9]">
            <Icon name="calendar" className="h-6 w-6" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[15px] font-black text-[#090B32]">
              Try these options
            </span>
            <span className="mt-1 block text-[13px] font-medium leading-5 text-[#263153] sm:text-[14px]">
              Change your dates or choose similar properties that are available.
            </span>
          </span>
          <Icon name="chevronRight" className="h-5 w-5 shrink-0 text-[#090B32]" />
        </button>

        <div className="mt-7 grid gap-3 sm:grid-cols-2">
          <button
            className="h-12 rounded-[8px] border border-[#6C4CF1] bg-white px-5 text-[15px] font-bold text-[#5F36E9] transition hover:bg-[#F7F5FF] focus:outline-none focus:ring-2 focus:ring-[#5F36E9]/25 sm:h-[48px]"
            onClick={onChangeDates}
          >
            Change dates
          </button>
          <button
            className="h-12 rounded-[8px] bg-[#5F36E9] px-5 text-[15px] font-bold text-white shadow-[0_12px_24px_rgba(95,54,233,0.28)] transition hover:bg-[#5430D8] focus:outline-none focus:ring-2 focus:ring-[#5F36E9]/25 sm:h-[48px]"
            onClick={onSeeSimilarPlaces}
          >
            See similar places
          </button>
        </div>
      </div>
    </div>
  );
}

function GalleryOverlay({
  property,
  activeImage,
  onClose,
  onMoveImage,
}: {
  property: Property;
  activeImage: number;
  onClose: () => void;
  onMoveImage: (direction: -1 | 1) => void;
}) {
  return (
    <div className="fixed inset-0 z-[60] bg-[#090B32] text-white">
      <div className="flex h-16 items-center justify-between border-b border-white/10 px-5">
        <p className="text-sm font-bold">
          {activeImage + 1} / {property.images.length}
        </p>
        <button
          className="grid h-10 w-10 place-items-center rounded-full hover:bg-white/10"
          onClick={onClose}
          aria-label="Close gallery"
        >
          <Icon name="close" />
        </button>
      </div>
      <div className="relative grid h-[calc(100vh-4rem)] place-items-center px-5 py-6">
        <img
          src={property.images[activeImage].src}
          alt={property.images[activeImage].alt}
          className="max-h-full max-w-full rounded-[12px] object-contain"
        />
        <button
          className="absolute left-5 top-1/2 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full bg-white/10 hover:bg-white/20"
          onClick={() => onMoveImage(-1)}
          aria-label="Previous image"
        >
          <Icon name="chevronLeft" />
        </button>
        <button
          className="absolute right-5 top-1/2 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full bg-white/10 hover:bg-white/20"
          onClick={() => onMoveImage(1)}
          aria-label="Next image"
        >
          <Icon name="chevronRight" />
        </button>
      </div>
    </div>
  );
}
