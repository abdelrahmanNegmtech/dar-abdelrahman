"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { featuredHotel, getHotelBySlug, type HotelListing, type HotelRoom } from "./hotel-room-data";
import { compactBookingQuery, readSearchParam, shortPath } from "@/app/routing";

type BookingPayload = {
  propertyId: string;
  title: string;
  location: string;
  image: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  rooms?: number;
  nights: number;
  pricePerNight: number;
  cleaningFee: number;
  serviceFee: number;
  discount: number;
  subtotal: number;
  total: number;
  currency: "EGP";
  locale: string;
  listingType?: "hotel" | "apartment";
  hotelId?: string;
  selectedRoomId?: string;
  roomName?: string;
  roomPricePerNight?: number;
  roomCapacity?: number;
  roomBedType?: string;
  roomAmenities?: string[];
  cancellationPolicy?: string;
};

type IconName =
  | "bed"
  | "calendar"
  | "check"
  | "chevronDown"
  | "chevronLeft"
  | "chevronRight"
  | "headset"
  | "lock"
  | "location"
  | "menu"
  | "parking"
  | "pool"
  | "restaurant"
  | "shield"
  | "spa"
  | "star"
  | "tv"
  | "user"
  | "wifi";

const storageKey = "dar-pending-booking";

function iconPath(name: IconName) {
  const paths: Record<IconName, string> = {
    bed: "M4 12V7a2 2 0 0 1 2-2h5a3 3 0 0 1 3 3v4M4 12h16a2 2 0 0 1 2 2v5M4 12v7M7 16h.01M17 16h.01",
    calendar:
      "M7 3v3M17 3v3M4.5 8.5h15M6 5h12a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z",
    check: "m5 12 4.2 4.2L19 6.5",
    chevronDown: "m7 9 5 5 5-5",
    chevronLeft: "M14.5 5 8.5 11l6 6",
    chevronRight: "m9 6 6 6-6 6",
    headset:
      "M4 13a8 8 0 0 1 16 0v3a2 2 0 0 1-2 2h-2v-6h4M4 16a2 2 0 0 0 2 2h2v-6H4v4Zm8 5h2a4 4 0 0 0 4-4",
    lock: "M7 10V8a5 5 0 0 1 10 0v2M6 10h12v10H6V10Zm6 4v2.5",
    location:
      "M12 21s7-4.4 7-11a7 7 0 1 0-14 0c0 6.6 7 11 7 11Zm0-8.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z",
    menu: "M4 7h16M4 12h16M4 17h16",
    parking: "M7 20V4h6a4 4 0 0 1 0 8H7",
    pool: "M4 16c1.3 1 2.7 1 4 0s2.7-1 4 0 2.7 1 4 0 2.7-1 4 0M4 20c1.3 1 2.7 1 4 0s2.7-1 4 0 2.7 1 4 0 2.7-1 4 0M7 13l5-9 5 9",
    restaurant: "M7 3v8M4 3v8M10 3v8M4 8h6M7 11v10M17 3v18M14 3h6v8h-6",
    shield: "M12 3 19 6v5c0 4.8-2.9 8-7 10-4.1-2-7-5.2-7-10V6l7-3Z",
    spa: "M12 21c0-5 3-8 8-8-1.2 4.8-4.5 7.2-8 8Zm0 0c0-5-3-8-8-8 1.2 4.8 4.5 7.2 8 8Zm0-6c-3-2.2-3-6 0-10 3 4 3 7.8 0 10Z",
    star: "m12 2.8 2.8 5.7 6.3.9-4.5 4.4 1.1 6.2L12 17.7 6.4 20.6l1.1-6.2L3 10l6.3-.9L12 2.8Z",
    tv: "M4 6h16v11H4V6Zm5 15h6M12 17v4",
    user: "M20 21a8 8 0 0 0-16 0M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10Z",
    wifi: "M5 10a10 10 0 0 1 14 0M8.5 13.5a5 5 0 0 1 7 0M12 18h.01",
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

function dateAtNoon(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) ? new Date(`${value}T12:00:00`) : new Date(value);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-GB", { weekday: "short", day: "numeric", month: "long", year: "numeric" }).format(dateAtNoon(value));
}

function nightsBetween(checkIn: string, checkOut: string) {
  const ms = dateAtNoon(checkOut).getTime() - dateAtNoon(checkIn).getTime();
  return Math.max(1, Math.round(ms / 86_400_000));
}

function defaultBooking(hotel: HotelListing): BookingPayload {
  const checkIn = "2026-05-20";
  const checkOut = "2026-05-22";
  const nights = nightsBetween(checkIn, checkOut);
  const room = hotel.rooms[0];
  const subtotal = room.pricePerNight * nights;
  return {
    propertyId: hotel.slug,
    hotelId: hotel.slug,
    listingType: "hotel",
    title: hotel.title,
    location: hotel.location,
    image: hotel.image,
    checkIn,
    checkOut,
    guests: 2,
    rooms: 1,
    nights,
    pricePerNight: room.pricePerNight,
    cleaningFee: 0,
    serviceFee: 0,
    discount: 0,
    subtotal,
    total: subtotal,
    currency: "EGP",
    locale: "en",
  };
}

function queryOverrides(params: URLSearchParams | null): Partial<Pick<BookingPayload, "checkIn" | "checkOut" | "guests" | "nights" | "locale">> {
  if (!params) {
    return {};
  }
  const checkIn = readSearchParam(params, "in", "checkIn") ?? undefined;
  const checkOut = readSearchParam(params, "out", "checkOut") ?? undefined;
  const guests = Number(readSearchParam(params, "g", "guests") ?? "");
  const nights = Number(readSearchParam(params, "n", "nights") ?? "");
  const locale = params.get("locale") ?? undefined;
  const overrides: Partial<Pick<BookingPayload, "checkIn" | "checkOut" | "guests" | "nights" | "locale">> = {};
  if (checkIn) overrides.checkIn = checkIn;
  if (checkOut) overrides.checkOut = checkOut;
  if (Number.isFinite(guests) && guests > 0) overrides.guests = guests;
  if (Number.isFinite(nights) && nights > 0) overrides.nights = nights;
  if (locale) overrides.locale = locale;
  return overrides;
}

function readBooking(hotel: HotelListing, params: URLSearchParams | null): BookingPayload {
  const overrides = queryOverrides(params);
  if (typeof window === "undefined") {
    return { ...defaultBooking(hotel), ...overrides };
  }

  try {
    const raw = window.sessionStorage.getItem(storageKey);
    if (!raw) {
      return { ...defaultBooking(hotel), ...overrides };
    }

    const parsed = JSON.parse(raw) as Partial<BookingPayload>;
    const checkIn = overrides.checkIn ?? parsed.checkIn ?? "2026-05-20";
    const checkOut = overrides.checkOut ?? parsed.checkOut ?? "2026-05-22";
    const nights = overrides.nights ?? parsed.nights ?? nightsBetween(checkIn, checkOut);
    return {
      ...defaultBooking(hotel),
      ...parsed,
      ...overrides,
      propertyId: parsed.hotelId ?? parsed.propertyId ?? hotel.slug,
      hotelId: parsed.hotelId ?? parsed.propertyId ?? hotel.slug,
      listingType: "hotel",
      title: parsed.title ?? hotel.title,
      location: parsed.location ?? hotel.location,
      image: parsed.image ?? hotel.image,
      checkIn,
      checkOut,
      guests: overrides.guests ?? parsed.guests ?? 2,
      rooms: parsed.rooms ?? 1,
      nights,
    };
  } catch {
    return { ...defaultBooking(hotel), ...overrides };
  }
}

function writeBooking(booking: BookingPayload) {
  window.sessionStorage.setItem(storageKey, JSON.stringify(booking));
}

function bookingQuery(booking: BookingPayload) {
  return compactBookingQuery({
    property: booking.propertyId,
    hotel: booking.hotelId ?? booking.propertyId,
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

export default function HotelRoomSelectionPage() {
  const router = useRouter();
  const urlParams = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;
  const requestedHotel = urlParams?.get("hotel") ?? urlParams?.get("property") ?? null;
  const hotel = getHotelBySlug(requestedHotel) ?? featuredHotel;
  const [booking, setBooking] = useState(() => readBooking(hotel, urlParams));
  const [selectedRoomId, setSelectedRoomId] = useState(booking.selectedRoomId ?? "");
  const [expandedRoomId, setExpandedRoomId] = useState<string | null>(null);
  const [imageIndexes, setImageIndexes] = useState<Record<string, number>>({});
  const bookingForRoom = (room: HotelRoom): BookingPayload => {
    const subtotal = room.pricePerNight * booking.nights;
    return {
      ...booking,
      propertyId: hotel.slug,
      hotelId: hotel.slug,
      listingType: "hotel",
      title: hotel.title,
      location: hotel.location,
      image: room.images[0] ?? hotel.image,
      selectedRoomId: room.id,
      roomName: room.name,
      roomPricePerNight: room.pricePerNight,
      roomCapacity: room.capacity,
      roomBedType: room.bedType,
      roomAmenities: room.amenities,
      cancellationPolicy: room.cancellationPolicy,
      pricePerNight: room.pricePerNight,
      cleaningFee: 0,
      serviceFee: 0,
      discount: 0,
      subtotal,
      total: subtotal,
    };
  };

  const selectRoom = (room: HotelRoom) => {
    if (!room.available) {
      return;
    }
    setSelectedRoomId(room.id);
    const nextBooking = bookingForRoom(room);
    setBooking(nextBooking);
    writeBooking(nextBooking);
    router.push(`${localizedPath(nextBooking, "/booking/hotel/guest")}?${bookingQuery(nextBooking)}`);
  };

  const cycleImage = (room: HotelRoom, direction: -1 | 1) => {
    setImageIndexes((current) => {
      const currentIndex = current[room.id] ?? 0;
      const nextIndex = (currentIndex + direction + room.images.length) % room.images.length;
      return { ...current, [room.id]: nextIndex };
    });
  };

  const editDates = () => {
    const nextBooking = { ...booking, hotelId: hotel.slug, listingType: "hotel" as const };
    writeBooking(nextBooking);
    router.push(`${localizedPath(nextBooking, hotel.detailsPath)}?${bookingQuery(nextBooking)}&edit=dates`);
  };

  return (
    <main className="min-h-screen bg-[#F8FAFC] p-4 text-[#080B32]">
      <div className="mx-auto max-w-[1440px] overflow-hidden rounded-[28px] border border-[#DFE6F1] bg-white shadow-[0_24px_70px_rgba(15,23,42,0.06)]">
        <Header booking={booking} />
        <div className="px-5 pb-5 lg:px-8">
          <Progress />
          <HotelSummary hotel={hotel} booking={booking} onEdit={editDates} />
          <section className="mt-7">
            <h1 className="text-[26px] font-black leading-tight lg:text-[28px]">Choose your room</h1>
            <p className="mt-1 text-[15px] font-medium text-[#59637C]">Select the perfect room for your stay</p>
            <DemandNotice />
            <div className="mt-5 overflow-hidden rounded-[10px] border border-[#E1E7F0] bg-white">
              {hotel.rooms.map((room) => (
                <RoomCard
                  key={room.id}
                  room={room}
                  nights={booking.nights}
                  selected={selectedRoomId === room.id}
                  expanded={expandedRoomId === room.id}
                  imageIndex={imageIndexes[room.id] ?? 0}
                  onCycle={cycleImage}
                  onSelect={selectRoom}
                  onToggleDetails={() => setExpandedRoomId((current) => (current === room.id ? null : room.id))}
                />
              ))}
            </div>
          </section>
          <footer className="flex flex-col items-center justify-center gap-3 border-t border-[#E6EBF3] py-7 text-center text-[#34405A] lg:flex-row">
            <Icon name="shield" className="text-[#6B7894]" />
            <div>
              <p className="text-[16px] font-black text-[#111735]">Secure booking</p>
              <p className="text-[14px]">Your booking is safe and protected</p>
            </div>
          </footer>
        </div>
      </div>
    </main>
  );
}

function Header({ booking }: { booking: BookingPayload }) {
  return (
    <header className="grid h-[76px] grid-cols-[44px_minmax(0,1fr)_44px] items-center px-5 lg:flex lg:justify-between lg:px-8">
      <button type="button" aria-label="Open menu" className="grid h-10 w-10 place-items-center rounded-full hover:bg-[#F5F2FF] lg:hidden">
        <Icon name="menu" className="h-6 w-6" />
      </button>
      <Link href={localizedPath(booking, "/")} aria-label="DAR home" className="justify-self-center lg:justify-self-auto">
        <Image src="/dar-logo-purple-header.png" alt="DAR" width={320} height={142} className="h-[42px] w-auto object-contain lg:h-[50px]" priority />
      </Link>
      <div className="flex items-center gap-7">
        <a href="mailto:support@dar.example?subject=Room%20selection%20support" className="hidden items-center gap-2 text-[15px] font-bold lg:inline-flex">
          <Icon name="headset" className="h-5 w-5" />
          Need help?
        </a>
        <a href="mailto:support@dar.example?subject=Room%20selection%20support" aria-label="Need help" className="grid h-10 w-10 place-items-center rounded-full hover:bg-[#F5F2FF] lg:hidden">
          <Icon name="headset" className="h-6 w-6" />
        </a>
        <button type="button" aria-label="Open menu" className="hidden h-10 w-10 place-items-center rounded-full hover:bg-[#F5F2FF] lg:grid">
          <Icon name="menu" className="h-6 w-6" />
        </button>
      </div>
    </header>
  );
}

function Progress() {
  const steps = ["Room selection", "Guest details", "Payment", "Confirmation"];
  return (
    <nav aria-label="Booking progress" className="mx-auto mb-7 mt-1 max-w-[760px]">
      <ol className="grid grid-cols-4 items-start gap-0">
        {steps.map((step, index) => (
          <li key={step} className="relative flex flex-col items-center gap-2 text-center">
            {index > 0 ? <span className="absolute right-1/2 top-[13px] h-px w-full bg-[#D9E0EC]" /> : null}
            <span className={cn("relative z-10 grid h-[28px] w-[28px] place-items-center rounded-full border text-[14px] font-black", index === 0 ? "border-[#5F36E9] bg-[#5F36E9] text-white" : "border-[#BEC8D8] bg-[#F8FAFC] text-[#7A8499]")}>
              {index + 1}
            </span>
            <span className={cn("hidden text-[13px] font-bold sm:block", index === 0 ? "text-[#111735]" : "text-[#59637C]")}>{step}</span>
            <span className={cn("text-[13px] font-bold sm:hidden", index === 0 ? "text-[#5F36E9]" : "text-[#59637C]")}>{["Rooms", "Details", "Payment", "Confirm"][index]}</span>
          </li>
        ))}
      </ol>
    </nav>
  );
}

function HotelSummary({ hotel, booking, onEdit }: { hotel: HotelListing; booking: BookingPayload; onEdit: () => void }) {
  return (
    <section className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_300px] lg:gap-5 lg:rounded-[14px] lg:border lg:border-[#E0E6F0] lg:bg-white lg:p-4 lg:shadow-[0_12px_32px_rgba(15,23,42,0.05)]">
      <div className="flex gap-4 rounded-[12px] border border-[#E0E6F0] bg-white p-3 shadow-[0_12px_30px_rgba(15,23,42,0.06)] lg:rounded-none lg:border-0 lg:p-0 lg:shadow-none">
        <div className="relative h-[116px] w-[130px] shrink-0 overflow-hidden rounded-[8px] bg-[#EEF2F8] md:h-[176px] md:w-[350px]">
          <Image src={hotel.image} alt={hotel.title} fill className="object-cover" priority />
        </div>
        <div className="min-w-0 py-1 lg:py-2">
          <h2 className="text-[20px] font-black leading-tight lg:text-[24px]">{hotel.title}</h2>
          <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-[14px] lg:mt-4 lg:text-[15px]">
            <span className="inline-flex items-center gap-2 font-bold"><Icon name="star" filled className="h-5 w-5 text-[#20A948]" /> {hotel.rating} <span className="font-medium text-[#34405A]">({hotel.reviews} reviews)</span></span>
            <span className="inline-flex items-center gap-2 text-[#34405A]"><Icon name="location" /> {hotel.location}</span>
          </div>
          <div className="mt-7 hidden flex-wrap gap-5 text-[14px] font-bold lg:flex">
            {hotel.amenities.map((amenity) => (
              <span key={amenity} className="inline-flex items-center gap-2">
                <Icon name={amenityIcon(amenity)} className="h-4 w-4" /> {amenity}
              </span>
            ))}
          </div>
          <Link href={`${localizedPath(booking, hotel.detailsPath)}?${bookingQuery(booking)}`} className="mt-5 hidden h-10 items-center justify-center rounded-[7px] border border-[#8D6BFF] px-5 text-[14px] font-bold text-[#5F36E9] hover:bg-[#F7F4FF] lg:inline-flex">
            View hotel details
          </Link>
        </div>
      </div>
      <BookingSummary booking={booking} onEdit={onEdit} />
    </section>
  );
}

function BookingSummary({ booking, onEdit }: { booking: BookingPayload; onEdit: () => void }) {
  return (
    <aside className="rounded-[10px] border border-[#E1E7F0] bg-white p-5">
      <div className="flex items-center justify-between">
        <h3 className="text-[17px] font-black">Your booking</h3>
        <button type="button" onClick={onEdit} className="text-[14px] font-bold text-[#5F36E9] hover:underline">
          Edit
        </button>
      </div>
      <div className="mt-5 grid grid-cols-2 gap-5 text-[14px]">
        <SummaryItem label="Check-in" value={formatDate(booking.checkIn)} />
        <SummaryItem label="Check-out" value={formatDate(booking.checkOut)} />
      </div>
      <div className="mt-5 grid grid-cols-2 gap-5 border-t border-[#E6EBF3] pt-5 text-[14px]">
        <p className="font-bold">{booking.nights} nights</p>
        <p className="font-bold">{booking.guests} guests, {booking.rooms ?? 1} room</p>
      </div>
    </aside>
  );
}

function SummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[13px] font-medium text-[#59637C]">{label}</p>
      <p className="mt-2 font-bold">{value}</p>
    </div>
  );
}

function DemandNotice() {
  return (
    <div className="mt-4 flex items-start gap-4 rounded-[10px] bg-[#F3EEFF] px-5 py-4">
      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-[#8D6BFF] text-[#5F36E9]">
        <Icon name="headset" className="h-5 w-5" />
      </span>
      <div className="text-[14px] leading-6">
        <p className="font-black">Almost there! 3 other people are viewing rooms at this property</p>
        <p className="font-medium text-[#34405A]">Your selected dates are in high demand. Book now to secure the best price.</p>
      </div>
    </div>
  );
}

function RoomCard({
  room,
  nights,
  selected,
  expanded,
  imageIndex,
  onCycle,
  onSelect,
  onToggleDetails,
}: {
  room: HotelRoom;
  nights: number;
  selected: boolean;
  expanded: boolean;
  imageIndex: number;
  onCycle: (room: HotelRoom, direction: -1 | 1) => void;
  onSelect: (room: HotelRoom) => void;
  onToggleDetails: () => void;
}) {
  const total = room.pricePerNight * nights;
  return (
    <>
      <article className={cn("grid gap-3 border-b border-[#E6EBF3] bg-white p-3 last:border-b-0 lg:hidden", selected && "bg-[#FBFAFF]", !room.available && "opacity-70")}>
        <div className="grid grid-cols-[128px_minmax(0,1fr)] gap-3">
          <RoomImage room={room} imageIndex={imageIndex} onCycle={onCycle} mobile />
          <div className="min-w-0">
            <h2 className="text-[16px] font-black leading-tight">{room.name}</h2>
            <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-[11px] font-bold text-[#34405A]">
              <span className="inline-flex items-center gap-1"><Icon name="tv" className="h-3.5 w-3.5" /> {room.size} m²</span>
              <span className="inline-flex items-center gap-1"><Icon name="user" className="h-3.5 w-3.5" /> {room.capacity} guests</span>
              <span className="inline-flex items-center gap-1"><Icon name="bed" className="h-3.5 w-3.5" /> {room.bedType}</span>
            </div>
            <p className="mt-5 text-[18px] font-black">{formatEgp(room.pricePerNight)} <span className="text-[13px] font-medium text-[#34405A]">/ night</span></p>
          </div>
        </div>
        {expanded ? (
          <div className="rounded-[8px] bg-[#F8FAFC] p-3 text-[13px] leading-6 text-[#34405A]">
            <p>{room.description}</p>
            <p className={cn("mt-2 font-black", room.available ? "text-[#16A34A]" : "text-[#D92D20]")}>{room.available ? room.cancellationPolicy : "Unavailable for selected dates"}</p>
          </div>
        ) : null}
        <div className="grid grid-cols-[minmax(0,1fr)_48px] gap-2">
          <button
            type="button"
            onClick={() => onSelect(room)}
            disabled={!room.available}
            className={cn("h-[46px] rounded-[7px] bg-[#5F36E9] text-[15px] font-bold text-white shadow-[0_12px_22px_rgba(95,54,233,0.2)]", !room.available && "cursor-not-allowed bg-[#C6CCD8] shadow-none")}
          >
            {room.available ? "Select" : "Unavailable"}
          </button>
          <button type="button" aria-label={`Toggle ${room.name} details`} onClick={onToggleDetails} className="grid h-[46px] place-items-center rounded-[7px] border border-[#CDBEFF] text-[#5F36E9]">
            <Icon name="chevronDown" className={cn("h-5 w-5 transition-transform duration-200", expanded && "rotate-180")} />
          </button>
        </div>
      </article>

      <article className={cn("hidden gap-5 border-b border-[#E6EBF3] p-4 last:border-b-0 lg:grid lg:grid-cols-[360px_minmax(0,1fr)_210px]", selected && "bg-[#FBFAFF]", !room.available && "opacity-70")}>
      <RoomImage room={room} imageIndex={imageIndex} onCycle={onCycle} />
      <div className="min-w-0 py-1">
        <h2 className="text-[20px] font-black leading-tight">{room.name}</h2>
        <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-[14px] font-bold text-[#34405A]">
          <span className="inline-flex items-center gap-2"><Icon name="tv" className="h-4 w-4" /> {room.size} m²</span>
          <span className="inline-flex items-center gap-2"><Icon name="user" className="h-4 w-4" /> {room.capacity} guests</span>
          <span className="inline-flex items-center gap-2"><Icon name="bed" className="h-4 w-4" /> {room.bedType}</span>
        </div>
        <p className="mt-4 text-[14px] leading-6 text-[#34405A]">{room.description}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {room.amenities.map((amenity) => (
            <span key={amenity} className="inline-flex h-7 items-center gap-1 rounded-[5px] border border-[#DCE3EF] px-2 text-[12px] font-bold">
              <Icon name={amenityIcon(amenity)} className="h-3.5 w-3.5" />
              {amenity}
            </span>
          ))}
        </div>
        <p className={cn("mt-6 text-[14px] font-black", room.available ? "text-[#16A34A]" : "text-[#D92D20]")}>
          {room.available ? room.cancellationPolicy : "Unavailable for selected dates"}
        </p>
        {expanded ? (
          <ul className="mt-4 grid gap-2 rounded-[8px] bg-[#F8FAFC] p-4 text-[14px] text-[#34405A] md:grid-cols-3">
            {room.highlights.map((highlight) => (
              <li key={highlight} className="flex gap-2">
                <Icon name="check" className="h-4 w-4 shrink-0 text-[#16A34A]" />
                <span>{highlight}</span>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
      <div className="flex flex-col justify-between gap-4 py-1 lg:items-end">
        <div className="text-left lg:text-right">
          <p className="text-[20px] font-black">{formatEgp(room.pricePerNight)} <span className="text-[14px] font-medium text-[#34405A]">/ night</span></p>
          <p className="mt-2 text-[13px] font-medium text-[#34405A]">Total {formatEgp(total)} for {nights} nights</p>
          <p className="mt-1 text-[12px] text-[#7A8499]">Includes taxes and fees</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-[1fr_auto] lg:w-full lg:grid-cols-1">
          <button
            type="button"
            onClick={() => onSelect(room)}
            disabled={!room.available}
            className={cn(
              "h-12 rounded-[7px] border text-[15px] font-bold transition",
              selected
                ? "border-[#5F36E9] bg-[#5F36E9] text-white shadow-[0_12px_24px_rgba(95,54,233,0.2)]"
                : "border-[#8D6BFF] bg-white text-[#5F36E9] hover:bg-[#F7F4FF]",
              !room.available && "cursor-not-allowed border-[#DCE3EF] bg-[#F1F5F9] text-[#7A8499]",
            )}
          >
            {room.available ? (selected ? "Selected" : "Select room") : "Unavailable"}
          </button>
          <button type="button" onClick={onToggleDetails} className="inline-flex h-10 items-center justify-center gap-2 text-[14px] font-bold text-[#5F36E9]">
            View details <Icon name="chevronDown" className={cn("h-4 w-4 transition-transform duration-200", expanded && "rotate-180")} />
          </button>
        </div>
      </div>
    </article>
    </>
  );
}

function RoomImage({ room, imageIndex, onCycle, mobile = false }: { room: HotelRoom; imageIndex: number; onCycle: (room: HotelRoom, direction: -1 | 1) => void; mobile?: boolean }) {
  return (
    <div className={cn("relative overflow-hidden rounded-[8px] bg-[#EEF2F8]", mobile ? "h-[150px]" : "h-[186px]")}>
      <Image src={room.images[imageIndex] ?? room.images[0]} alt={room.name} fill className="object-cover" />
      {room.badge ? <span className={cn("absolute left-2 top-2 rounded-[7px] bg-[#5F36E9] font-bold text-white", mobile ? "px-2 py-1 text-[11px]" : "px-3 py-1 text-[13px]")}>{room.badge}</span> : null}
      <button type="button" aria-label={`Previous ${room.name} photo`} onClick={() => onCycle(room, -1)} className={cn("absolute left-2 top-1/2 grid -translate-y-1/2 place-items-center rounded-full bg-white text-[#5F36E9] shadow-[0_8px_20px_rgba(15,23,42,0.16)]", mobile ? "h-7 w-7" : "h-9 w-9")}>
        <Icon name="chevronLeft" className="h-5 w-5" />
      </button>
      <button type="button" aria-label={`Next ${room.name} photo`} onClick={() => onCycle(room, 1)} className={cn("absolute right-2 top-1/2 grid -translate-y-1/2 place-items-center rounded-full bg-white text-[#5F36E9] shadow-[0_8px_20px_rgba(15,23,42,0.16)]", mobile ? "hidden" : "h-9 w-9")}>
        <Icon name="chevronRight" className="h-5 w-5" />
      </button>
      <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1">
        {room.images.map((image, index) => (
          <span key={image} className={cn("h-1.5 w-1.5 rounded-full bg-white/70", index === imageIndex && "w-4 bg-white")} />
        ))}
      </div>
    </div>
  );
}

function amenityIcon(label: string): IconName {
  const value = label.toLowerCase();
  if (value.includes("wi-fi")) return "wifi";
  if (value.includes("pool")) return "pool";
  if (value.includes("spa")) return "spa";
  if (value.includes("restaurant")) return "restaurant";
  if (value.includes("parking")) return "parking";
  if (value.includes("bed")) return "bed";
  if (value.includes("tv")) return "tv";
  return "check";
}
