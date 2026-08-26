"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { FullDateInput } from "@/app/components/full-date-input";
import type { HotelListing, HotelRoom } from "@/app/booking/rooms/hotel-room-data";
import { compactBookingQuery, shortPath } from "@/app/routing";

type InitialQuery = {
  checkIn: string;
  checkOut: string;
  guests: string;
  nights: string;
  locale: string;
};

type IconName =
  | "bed"
  | "building"
  | "bag"
  | "calendar"
  | "card"
  | "check"
  | "chevronDown"
  | "child"
  | "clock"
  | "close"
  | "grid"
  | "gym"
  | "heart"
  | "home"
  | "idCard"
  | "info"
  | "location"
  | "lock"
  | "mail"
  | "map"
  | "parking"
  | "pet"
  | "plane"
  | "pool"
  | "restaurant"
  | "shield"
  | "spa"
  | "star"
  | "tent"
  | "transfer"
  | "user"
  | "wifi";

const storageKey = "dar-pending-booking";

function iconPath(name: IconName) {
  const paths: Record<IconName, string> = {
    bed: "M4 12V7a2 2 0 0 1 2-2h5a3 3 0 0 1 3 3v4M4 12h16a2 2 0 0 1 2 2v5M4 12v7M7 16h.01M17 16h.01",
    calendar: "M7 3v3M17 3v3M4.5 8.5h15M6 5h12a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z",
    card: "M4 7.5h16v9A2.5 2.5 0 0 1 17.5 19h-11A2.5 2.5 0 0 1 4 16.5v-9ZM4 10h16M7 15h4",
    check: "m5 12 4.2 4.2L19 6.5",
    chevronDown: "m7 9 5 5 5-5",
    close: "M6 6l12 12M18 6 6 18",
    grid: "M4 4h7v7H4V4Zm9 0h7v7h-7V4ZM4 13h7v7H4v-7Zm9 0h7v7h-7v-7Z",
    gym: "M6 7v10M18 7v10M3 10v4M21 10v4M6 12h12",
    heart: "M12 20.2s-6.8-4.4-9.4-8.3C.3 8.4 2.3 4.5 6.2 4.5c2 0 3.5 1 4.4 2.3.9-1.3 2.4-2.3 4.4-2.3 3.9 0 5.9 3.9 3.6 7.4-2.6 3.9-9.4 8.3-9.4 8.3Z",
    home: "M3.5 11.5 12 4l8.5 7.5M5.5 10.5V20h13v-9.5M9.5 20v-6h5v6",
    info: "M12 17v-6M12 7h.01M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Z",
    location: "M12 21s7-4.4 7-11a7 7 0 1 0-14 0c0 6.6 7 11 7 11Zm0-8.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z",
    lock: "M7 10V8a5 5 0 0 1 10 0v2M6 10h12v10H6V10Zm6 4v2.5",
    mail: "M4 6h16v12H4V6Zm0 1 8 6 8-6",
    map: "M9 18 3 21V6l6-3 6 3 6-3v15l-6 3-6-3Zm0 0V3m6 18V6",
    parking: "M7 20V4h6a4 4 0 0 1 0 8H7",
    pool: "M4 16c1.3 1 2.7 1 4 0s2.7-1 4 0 2.7 1 4 0 2.7-1 4 0M4 20c1.3 1 2.7 1 4 0s2.7-1 4 0 2.7 1 4 0 2.7-1 4 0M7 13l5-9 5 9",
    restaurant: "M7 3v8M4 3v8M10 3v8M4 8h6M7 11v10M17 3v18M14 3h6v8h-6",
    shield: "M12 3 19 6v5c0 4.8-2.9 8-7 10-4.1-2-7-5.2-7-10V6l7-3Z",
    spa: "M12 21c0-5 3-8 8-8-1.2 4.8-4.5 7.2-8 8Zm0 0c0-5-3-8-8-8 1.2 4.8 4.5 7.2 8 8Zm0-6c-3-2.2-3-6 0-10 3 4 3 7.8 0 10Z",
    building: "M5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16M9 21v-4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v4M5 9h14M5 13h14M5 17h14",
    bag: "M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4zM3 6h18M16 10a4 4 0 0 1-8 0",
    idCard: "M4 4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4ZM8 11h8M8 15h5",
    pet: "M10 5.172C10 3.782 8.423 2.679 6.5 3c-2.823.47-4.113 6.006-4 7 .08.703 1.725 1.722 3.656 1 1.261-.472 1.96-1.45 2.344-2.5M14 5.172c0-1.39 1.577-2.493 3.5-2.172 2.823.47 4.113 6.006 4 7-.08.703-1.725 1.722-3.656 1-1.261-.472-1.96-1.45-2.344-2.5M18 17.5c0 1.38-1.567 2.5-3.5 2.5-2.823-.47-4.113-6.006-4-7 .08-.703 1.725-1.722 3.656-1 1.261.472 1.96 1.45 2.344 2.5ZM8 17.5c0 1.38 1.567 2.5 3.5 2.5 2.823-.47 4.113-6.006 4-7-.08-.703-1.725-1.722-3.656-1-1.261.472-1.96 1.45-2.344 2.5Z",
    child: "M9 12a2 2 0 1 0 0-4 2 2 0 0 0 0 4ZM9 14c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4Zm7-2v6M14 17h6",
    clock: "M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10ZM12 6v6l4 2",
    plane: "M17.8 19.2L16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z",
    tent: "M3.5 21L12 3l8.5 18M7.5 21V14M16.5 21V14M3.5 21h17",
    star: "m12 2.8 2.8 5.7 6.3.9-4.5 4.4 1.1 6.2L12 17.7 6.4 20.6l1.1-6.2L3 10l6.3-.9L12 2.8Z",
    transfer: "M4 7h11l3 4h2v6h-2M6 17h8M7 20a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm9 0a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z",
    user: "M20 21a8 8 0 0 0-16 0M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10Z",
    wifi: "M5 10a10 10 0 0 1 14 0M8.5 13.5a5 5 0 0 1 7 0M12 18h.01",
  };
  return paths[name];
}

function Icon({ name, className, filled = false }: { name: IconName; className?: string; filled?: boolean }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className={cn("h-5 w-5", className)} fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8">
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
  return new Intl.DateTimeFormat("en-GB", { month: "short", day: "numeric", year: "numeric" }).format(dateAtNoon(value));
}

function formatDateField(value: string) {
  return new Intl.DateTimeFormat("en-GB", { month: "short", day: "numeric", year: "numeric" }).format(dateAtNoon(value));
}

function addDays(value: string, days: number) {
  const next = dateAtNoon(value);
  next.setDate(next.getDate() + days);
  return next.toISOString().slice(0, 10);
}

function nightsBetween(checkIn: string, checkOut: string) {
  const ms = dateAtNoon(checkOut).getTime() - dateAtNoon(checkIn).getTime();
  return Math.max(1, Math.round(ms / 86_400_000));
}

function amenityIcon(label: string): IconName {
  const value = label.toLowerCase();
  if (value.includes("pool")) return "pool";
  if (value.includes("gym")) return "gym";
  if (value.includes("spa")) return "spa";
  if (value.includes("restaurant") || value.includes("breakfast")) return "restaurant";
  if (value.includes("parking")) return "parking";
  if (value.includes("wi-fi") || value.includes("wifi")) return "wifi";
  if (value.includes("airport")) return "transfer";
  if (value.includes("room")) return "bed";
  return "check";
}

function attractionIcon(label: string): IconName {
  const value = label.toLowerCase();
  if (value.includes("airport") || value.includes("airplane")) return "plane";
  if (value.includes("mall") || value.includes("shop")) return "bag";
  if (value.includes("convention") || value.includes("center")) return "tent";
  return "building";
}

export function HotelDetailsClient({ hotel, initialQuery }: { hotel: HotelListing; initialQuery: InitialQuery }) {
  const router = useRouter();
  const [activePhoto, setActivePhoto] = useState(0);
  const [allPhotosOpen, setAllPhotosOpen] = useState(false);
  const [amenitiesOpen, setAmenitiesOpen] = useState(false);
  const [roomModal, setRoomModal] = useState<HotelRoom | null>(null);
  const [checkIn, setCheckIn] = useState(initialQuery.checkIn);
  const [checkOut, setCheckOut] = useState(initialQuery.checkOut);
  const [guests, setGuests] = useState(Number(initialQuery.guests) || 2);
  const [selectedRoomId, setSelectedRoomId] = useState(hotel.rooms.find((room) => room.available)?.id ?? hotel.rooms[0]?.id);

  const selectedRoom = hotel.rooms.find((room) => room.id === selectedRoomId) ?? hotel.rooms[0];
  const nights = useMemo(() => nightsBetween(checkIn, checkOut), [checkIn, checkOut]);
  const subtotal = selectedRoom.pricePerNight * nights;
  const taxes = Math.round(subtotal * hotel.taxRate);
  const total = subtotal + taxes;
  const roomSelectionUrl = `${shortPath("/booking/rooms", initialQuery.locale)}?${compactBookingQuery({
    hotel: hotel.slug,
    checkIn,
    checkOut,
    guests: String(guests),
    nights: String(nights),
    locale: initialQuery.locale,
  })}`;

  const persistHotelBooking = (room: HotelRoom) => {
    window.sessionStorage.setItem(
      storageKey,
      JSON.stringify({
        propertyId: hotel.slug,
        hotelId: hotel.slug,
        listingType: "hotel",
        title: hotel.title,
        location: hotel.location,
        image: room.images[0] ?? hotel.image,
        checkIn,
        checkOut,
        guests,
        rooms: 1,
        nights,
        pricePerNight: room.pricePerNight,
        roomPricePerNight: room.pricePerNight,
        selectedRoomId: room.id,
        roomName: room.name,
        roomCapacity: room.capacity,
        roomBedType: room.bedType,
        roomAmenities: room.amenities,
        cancellationPolicy: room.cancellationPolicy,
        cleaningFee: 0,
        serviceFee: taxes,
        discount: 0,
        subtotal,
        total,
        currency: "EGP",
        locale: initialQuery.locale,
      }),
    );
  };

  const reserve = (room = selectedRoom) => {
    persistHotelBooking(room);
    router.push(`${roomSelectionUrl}&preferredRoom=${room.id}`);
  };

  return (
    <main className="min-h-screen bg-[#F8FAFC] text-[#080B32]">
      <Header />
      <div className="mx-auto grid max-w-[1840px] gap-6 px-5 py-6 lg:grid-cols-[minmax(0,1fr)_430px] lg:px-9">
        <section className="min-w-0">
          <Gallery hotel={hotel} activePhoto={activePhoto} setActivePhoto={setActivePhoto} onViewAll={() => setAllPhotosOpen(true)} />
          <Hero hotel={hotel} />
          <InfoBand hotel={hotel} />
          <Amenities hotel={hotel} expanded={amenitiesOpen} onToggle={() => setAmenitiesOpen((current) => !current)} />
          <RoomsPreview hotel={hotel} checkIn={checkIn} checkOut={checkOut} guests={guests} selectedRoomId={selectedRoomId} setSelectedRoomId={setSelectedRoomId} onRoomDetails={setRoomModal} onSelect={reserve} />
          <Policies hotel={hotel} />
          <Reviews hotel={hotel} />
          <LocationSection hotel={hotel} />
        </section>
        <aside className="lg:sticky lg:top-6 lg:self-start">
          <ReserveCard hotel={hotel} selectedRoom={selectedRoom} checkIn={checkIn} checkOut={checkOut} guests={guests} nights={nights} subtotal={subtotal} taxes={taxes} total={total} setCheckIn={setCheckIn} setCheckOut={setCheckOut} setGuests={setGuests} setSelectedRoomId={setSelectedRoomId} onReserve={() => reserve()} />
          <TrustCard />
        </aside>
      </div>
      {allPhotosOpen ? <PhotosModal hotel={hotel} onClose={() => setAllPhotosOpen(false)} /> : null}
      {roomModal ? <RoomModal room={roomModal} onClose={() => setRoomModal(null)} onSelect={() => reserve(roomModal)} /> : null}
    </main>
  );
}

function Header() {
  return (
    <header className="border-b border-[#E6EBF3] bg-white">
      <div className="mx-auto flex h-[66px] max-w-[1840px] items-center justify-between px-5 lg:px-9">
        <Link href={shortPath("/", "en")} aria-label="DAR home">
          <Image src="/dar-logo-purple-header.png" alt="DAR" width={320} height={142} className="h-[42px] w-auto object-contain" priority />
        </Link>
        <nav className="hidden items-center gap-10 text-[14px] font-semibold lg:flex">
          <Link href={shortPath("/rent", "en")}>Stays</Link>
          <Link href={shortPath("/hotels", "en")} className="text-[#5F36E9]">Hotels</Link>
          <Link href={shortPath("/new-projects", "en")}>Become a host</Link>
          <Link href={shortPath("/", "en")}>About us</Link>
          <Link href={shortPath("/messages", "en")}>Help</Link>
        </nav>
        <div className="flex items-center gap-5 text-[14px] font-semibold">
          <Icon name="heart" className="hidden h-5 w-5 sm:block" />
          <span className="hidden items-center gap-2 sm:flex">English / EGP</span>
          <Link href={shortPath("/", "en")} className="hidden rounded-[8px] border border-[#DCE3EF] px-5 py-2.5 sm:inline-flex">Sign in</Link>
        </div>
      </div>
    </header>
  );
}

function Gallery({ hotel, activePhoto, setActivePhoto, onViewAll }: { hotel: HotelListing; activePhoto: number; setActivePhoto: (index: number) => void; onViewAll: () => void }) {
  const photos = hotel.gallery.length ? hotel.gallery : [hotel.image];
  return (
    <section className="grid h-auto gap-2 md:h-[330px] md:grid-cols-[1.2fr_1.8fr]">
      <button type="button" onClick={() => setActivePhoto(0)} className="relative min-h-[260px] overflow-hidden rounded-[10px] bg-[#E9EEF6] text-left md:min-h-0">
        <Image src={photos[0]} alt={`${hotel.title} main photo`} fill className="object-cover" priority />
      </button>
      <div className="grid grid-cols-2 gap-2">
        {photos.slice(1, 5).map((photo, index) => (
          <button key={photo} type="button" onClick={() => (index === 3 ? onViewAll() : setActivePhoto(index + 1))} className={cn("relative min-h-[155px] overflow-hidden rounded-[8px] bg-[#E9EEF6]", activePhoto === index + 1 && "ring-2 ring-[#5F36E9]")}>
            <Image src={photo} alt={`${hotel.title} gallery ${index + 2}`} fill className="object-cover" />
            {index === 3 ? (
              <span className="absolute inset-x-4 bottom-4 inline-flex h-11 items-center justify-center gap-2 rounded-[8px] bg-[#111735]/85 text-[14px] font-bold text-white">
                <Icon name="grid" className="h-4 w-4" />
                View all photos
              </span>
            ) : null}
          </button>
        ))}
        <button type="button" onClick={onViewAll} className="sr-only">View all photos</button>
      </div>
      <button type="button" onClick={onViewAll} className="mt-2 inline-flex h-10 items-center justify-center gap-2 rounded-[8px] border border-[#DCE3EF] bg-white px-4 text-[14px] font-bold md:hidden">
        <Icon name="grid" className="h-4 w-4" /> View all photos
      </button>
    </section>
  );
}

function Hero({ hotel }: { hotel: HotelListing }) {
  return (
    <section className="mt-5 grid gap-5 lg:grid-cols-[390px_minmax(0,1fr)]">
      <div>
        <div className="flex items-center gap-1 text-[#F5A400]">
          {Array.from({ length: 5 }).map((_, index) => <Icon key={index} name="star" filled className="h-5 w-5" />)}
          <span className="ml-4 rounded-full border border-[#D8CEF8] bg-[#F7F4FF] px-3 py-1 text-[13px] font-bold text-[#5F36E9]">Verified hotel</span>
        </div>
        <h1 className="mt-3 text-[34px] font-black leading-tight">{hotel.title}</h1>
        <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-[14px] font-medium text-[#34405A]">
          <span className="inline-flex items-center gap-2"><Icon name="location" /> {hotel.address}</span>
          <span className="inline-flex items-center gap-2"><Icon name="star" filled className="text-[#F5A400]" /> {hotel.rating} ({hotel.reviews} reviews)</span>
        </div>
        <p className="mt-6 text-[15px] leading-7 text-[#34405A]">{hotel.description.split(". ")[0]}.</p>
      </div>
      <div className="rounded-[12px] border border-[#E1E7F0] bg-white p-4 shadow-[0_10px_28px_rgba(15,23,42,0.04)]">
        <h2 className="text-[15px] font-black">About this hotel</h2>
        <p className="mt-2 text-[13px] leading-6 text-[#34405A]">{hotel.description}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {hotel.services.slice(0, 9).map((service) => (
            <span key={service.label} className="inline-flex h-9 items-center gap-2 rounded-[7px] border border-[#DCE3EF] px-3 text-[12px] font-semibold text-[#34405A]">
              <Icon name={amenityIcon(service.label)} className="h-4 w-4 text-[#5F36E9]" /> {service.label}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

function InfoBand({ hotel }: { hotel: HotelListing }) {
  const items = [
    ["calendar", "Check-in", hotel.checkInTime],
    ["calendar", "Check-out", hotel.checkOutTime],
    ["bed", `${hotel.roomCount}`, "rooms"],
    ["bed", `${hotel.roomTypeCount}`, "room types"],
    ["check", hotel.confirmationType, ""],
  ] as const;
  return (
    <section className="mt-5 grid overflow-hidden rounded-[10px] border border-[#E1E7F0] bg-white md:grid-cols-5">
      {items.map(([icon, label, value]) => (
        <div key={`${label}-${value}`} className="flex items-center gap-3 border-b border-[#E1E7F0] px-5 py-4 last:border-b-0 md:border-b-0 md:border-r md:last:border-r-0">
          <Icon name={icon} className="text-[#34405A]" />
          <div>
            <p className="text-[12px] font-medium text-[#59637C]">{label}</p>
            <p className="text-[13px] font-bold">{value}</p>
          </div>
        </div>
      ))}
    </section>
  );
}

function Amenities({ hotel, expanded, onToggle }: { hotel: HotelListing; expanded: boolean; onToggle: () => void }) {
  const visible = expanded ? hotel.amenities : hotel.amenities.slice(0, 10);
  return (
    <section className="mt-9">
      <h2 className="text-[22px] font-black">Hotel amenities & services</h2>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {visible.map((amenity) => (
          <div key={amenity} className="flex h-[58px] items-center gap-3 rounded-[8px] border border-[#E1E7F0] bg-white px-5 text-[13px] font-semibold">
            <Icon name={amenityIcon(amenity)} className="text-[#5F36E9]" /> {amenity}
          </div>
        ))}
      </div>
      {hotel.amenities.length > 10 ? (
        <button type="button" onClick={onToggle} className="mt-4 inline-flex items-center gap-2 text-[14px] font-bold text-[#5F36E9]">
          {expanded ? "Show fewer amenities" : "View all amenities"} <Icon name="chevronDown" className={cn("h-4 w-4 transition", expanded && "rotate-180")} />
        </button>
      ) : null}
    </section>
  );
}

function RoomsPreview({ hotel, checkIn, checkOut, guests, selectedRoomId, setSelectedRoomId, onRoomDetails, onSelect }: { hotel: HotelListing; checkIn: string; checkOut: string; guests: number; selectedRoomId: string; setSelectedRoomId: (id: string) => void; onRoomDetails: (room: HotelRoom) => void; onSelect: (room: HotelRoom) => void }) {
  return (
    <section className="mt-9">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h2 className="text-[22px] font-black">Choose your room</h2>
        <div className="grid overflow-hidden rounded-[8px] border border-[#E1E7F0] bg-white text-[13px] font-semibold text-[#34405A] md:grid-cols-[220px_140px_88px]">
          <span className="flex h-10 items-center gap-2 px-4"><Icon name="calendar" className="h-4 w-4" /> {formatDate(checkIn)} - {formatDate(checkOut)}</span>
          <span className="flex h-10 items-center gap-2 border-t border-[#E1E7F0] px-4 md:border-l md:border-t-0"><Icon name="user" className="h-4 w-4" /> {guests} guests</span>
          <Link href={`${shortPath("/booking/rooms", "en")}?${compactBookingQuery({ hotel: hotel.slug, checkIn, checkOut, guests })}`} className="flex h-10 items-center justify-center border-t border-[#E1E7F0] text-[#5F36E9] md:border-l md:border-t-0">Change</Link>
        </div>
      </div>
      <div className="mt-4 overflow-hidden rounded-[10px] border border-[#E1E7F0] bg-white">
        {hotel.rooms.map((room) => (
          <article key={room.id} className={cn("grid gap-4 border-b border-[#E1E7F0] p-3 last:border-b-0 md:grid-cols-[180px_minmax(0,1fr)_150px_320px]", selectedRoomId === room.id && "bg-[#FBFAFF]")}>
            <button type="button" onClick={() => onRoomDetails(room)} className="relative h-[92px] overflow-hidden rounded-[8px] bg-[#EEF2F8]">
              <Image src={room.images[0]} alt={room.name} fill className="object-cover" />
            </button>
            <div>
              <h3 className="text-[16px] font-black">{room.name}</h3>
              <p className="mt-2 text-[12px] font-medium text-[#59637C]">{room.bedType} · {room.size} m² · City view · {room.capacity} guests</p>
              <div className="mt-3 flex flex-wrap gap-3 text-[12px] font-bold">
                {(room.included ?? room.highlights).slice(0, 2).map((item) => (
                  <span key={item} className={item.toLowerCase().includes("non") ? "text-[#D97706]" : "text-[#168A43]"}>{item}</span>
                ))}
              </div>
            </div>
            <div className="text-left md:text-right">
              <p className={cn("text-[12px] font-bold", (room.roomsLeft ?? 0) <= 1 ? "text-[#D92D20]" : "text-[#168A43]")}>{room.roomsLeft} room{room.roomsLeft === 1 ? "" : "s"} left</p>
              <p className="mt-3 text-[16px] font-black">{formatEgp(room.pricePerNight)}</p>
              <p className="text-[11px] text-[#59637C]">per night</p>
            </div>
            <div className="grid gap-3 md:grid-cols-2 md:items-center">
              <button type="button" onClick={() => onRoomDetails(room)} className="h-10 rounded-[7px] border border-[#8D6BFF] text-[13px] font-bold text-[#5F36E9]">View room details</button>
              <button type="button" onClick={() => { setSelectedRoomId(room.id); onSelect(room); }} disabled={!room.available} className="h-10 rounded-[7px] bg-[#5F36E9] text-[13px] font-bold text-white disabled:bg-[#AEB7C8]">Select room</button>
            </div>
          </article>
        ))}
      </div>
      <Link href={`${shortPath("/booking/rooms", "en")}?${compactBookingQuery({ hotel: hotel.slug, checkIn, checkOut, guests })}`} className="mt-4 inline-flex text-[14px] font-bold text-[#5F36E9]">View all {hotel.roomTypeCount} room types</Link>
    </section>
  );
}

function policyIcon(title: string): { name: IconName; color: string; bg: string; stroke: string } {
  const lower = title.toLowerCase();
  if (lower.includes("cancel")) return { name: "clock", color: "text-[#16A34A]", bg: "bg-[#E8F5E9]", stroke: "text-[#16A34A]" };
  if (lower.includes("child") || lower.includes("children")) return { name: "child", color: "text-[#5F36E9]", bg: "bg-[#F3EEFF]", stroke: "text-[#5F36E9]" };
  if (lower.includes("id") || lower.includes("passport")) return { name: "idCard", color: "text-[#5F36E9]", bg: "bg-[#F3EEFF]", stroke: "text-[#5F36E9]" };
  if (lower.includes("pet")) return { name: "pet", color: "text-[#EF4444]", bg: "bg-[#FEE2E2]", stroke: "text-[#EF4444]" };
  return { name: "info", color: "text-[#5F36E9]", bg: "bg-[#F3EEFF]", stroke: "text-[#5F36E9]" };
}

function Policies({ hotel }: { hotel: HotelListing }) {
  return (
    <section className="mt-7 rounded-[10px] border border-[#E1E7F0] bg-white p-4">
      <h2 className="text-[18px] font-black">Hotel policies</h2>
      <div className="mt-4 grid gap-4 md:grid-cols-4">
        {hotel.policies.map((policy) => {
          const icon = policyIcon(policy.title);
          return (
            <div key={policy.title} className="rounded-[8px] border border-[#E1E7F0] p-4">
              <div className={cn("grid h-10 w-10 place-items-center rounded-full", icon.bg)}>
                <Icon name={icon.name} className={cn("h-5 w-5", icon.color)} />
              </div>
              <h3 className="mt-2 text-[13px] font-black">{policy.title}</h3>
              <p className="mt-1 text-[12px] leading-5 text-[#59637C]">{policy.description}</p>
            </div>
          );
        })}
      </div>
      <p className="mt-4 text-[12px] text-[#59637C]">We accept major payment methods in Egypt including cards, Meeza, InstaPay, and Fawry.</p>
    </section>
  );
}

function Reviews({ hotel }: { hotel: HotelListing }) {
  return (
    <section id="reviews" className="mt-7">
      <h2 className="text-[18px] font-black">Guest reviews</h2>
      <div className="mt-4 grid gap-4 lg:grid-cols-[150px_1fr_1.7fr]">
        <div className="rounded-[10px] border border-[#E1E7F0] bg-white p-5 text-center">
          <p className="text-[30px] font-black">{hotel.reviewsSummary.score}</p>
          <p className="text-[15px] font-bold text-[#F5A400]">★★★★★</p>
          <p className="mt-1 text-[12px] text-[#59637C]">{hotel.reviews} reviews</p>
        </div>
        <div className="rounded-[10px] border border-[#E1E7F0] bg-white p-5">
          {hotel.reviewsSummary.categories.map((category) => (
            <div key={category.label} className="mb-3 grid grid-cols-[100px_1fr_34px] items-center gap-3 text-[12px] last:mb-0">
              <span>{category.label}</span>
              <span className="h-1.5 rounded-full bg-[#E7E3FF]"><span className="block h-full rounded-full bg-[#5F36E9]" style={{ width: `${(category.value / 5) * 100}%` }} /></span>
              <span>{category.value}</span>
            </div>
          ))}
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {hotel.reviewsSummary.comments.map((comment) => (
            <div key={comment.name} className="rounded-[10px] border border-[#E1E7F0] bg-white p-4">
              <p className="text-[13px] font-black">{comment.name}</p>
              <p className="text-[11px] text-[#59637C]">{comment.location}</p>
              <p className="mt-2 text-[12px] font-bold text-[#F5A400]">★★★★★</p>
              <p className="mt-2 text-[12px] leading-5 text-[#34405A]">{comment.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function LocationSection({ hotel }: { hotel: HotelListing }) {
  const mapHref = `https://www.google.com/maps/search/?api=1&query=${hotel.coordinates.lat},${hotel.coordinates.lng}`;
  return (
    <section className="mt-7">
      <h2 className="text-[18px] font-black">Location & nearby attractions</h2>
      <div className="mt-4 grid overflow-hidden rounded-[10px] border border-[#E1E7F0] bg-white lg:grid-cols-[320px_minmax(0,1fr)]">
        <div className="divide-y divide-[#E1E7F0]">
          {hotel.attractions.map((attraction) => (
            <div key={attraction.label} className="flex items-center justify-between px-4 py-3 text-[12px]">
              <span className="inline-flex items-center gap-2"><Icon name={attractionIcon(attraction.label)} className="h-4 w-4" /> {attraction.label}</span>
              <span className="text-[#59637C]">{attraction.distance}</span>
            </div>
          ))}
        </div>
        <div className="relative min-h-[150px] bg-[#F4EFE7]">
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(95,54,233,0.08)_1px,transparent_1px),linear-gradient(0deg,rgba(95,54,233,0.08)_1px,transparent_1px)] bg-[size:34px_34px]" />
          <div className="absolute left-1/2 top-1/2 grid -translate-x-1/2 -translate-y-1/2 place-items-center text-center">
            <span className="grid h-12 w-12 place-items-center rounded-full bg-[#5F36E9] text-white shadow-[0_10px_22px_rgba(95,54,233,0.3)]"><Icon name="location" /></span>
            <p className="mt-2 text-[18px] font-black">{hotel.coordinates.label}</p>
          </div>
          <a href={mapHref} target="_blank" rel="noreferrer" className="absolute right-4 top-4 rounded-[6px] bg-white px-4 py-2 text-[12px] font-bold shadow">View larger map</a>
        </div>
      </div>
    </section>
  );
}

function ReserveCard({ hotel, selectedRoom, checkIn, checkOut, guests, nights, subtotal, taxes, total, setCheckIn, setCheckOut, setGuests, setSelectedRoomId, onReserve }: { hotel: HotelListing; selectedRoom: HotelRoom; checkIn: string; checkOut: string; guests: number; nights: number; subtotal: number; taxes: number; total: number; setCheckIn: (value: string) => void; setCheckOut: (value: string) => void; setGuests: (value: number) => void; setSelectedRoomId: (value: string) => void; onReserve: () => void }) {
  const updateCheckIn = (value: string) => {
    setCheckIn(value);
    if (!checkOut || checkOut <= value) {
      setCheckOut(addDays(value, 1));
    }
  };

  return (
    <section className="rounded-[14px] border border-[#E1E7F0] bg-white p-6 shadow-[0_18px_44px_rgba(15,23,42,0.08)]">
      <h2 className="text-[22px] font-black">Reserve your stay</h2>
      <div className="mt-5 grid grid-cols-2 overflow-hidden rounded-[8px] border border-[#DCE3EF]">
        <FullDateInput value={checkIn} onChange={updateCheckIn} ariaLabel="Check-in" className="border-r border-[#DCE3EF] p-3 text-[12px] font-medium text-[#59637C]">
          <span className="block">Check-in</span>
          <span className="mt-1 block text-[13px] font-bold text-[#111735]">{formatDateField(checkIn)}</span>
        </FullDateInput>
        <FullDateInput value={checkOut} min={addDays(checkIn, 1)} onChange={setCheckOut} ariaLabel="Check-out" className="p-3 text-[12px] font-medium text-[#59637C]">
          <span className="block">Check-out</span>
          <span className="mt-1 block text-[13px] font-bold text-[#111735]">{formatDateField(checkOut)}</span>
        </FullDateInput>
      </div>
      <label className="mt-4 block rounded-[8px] border border-[#DCE3EF] p-3 text-[12px] font-medium text-[#59637C]">Guests<input type="number" min={1} max={selectedRoom.capacity} value={guests} onChange={(event) => setGuests(Number(event.target.value))} className="mt-1 w-full text-[13px] font-bold text-[#111735] outline-none" /></label>
      <label className="mt-4 block rounded-[8px] border border-[#DCE3EF] p-3 text-[12px] font-medium text-[#59637C]">Room type<select value={selectedRoom.id} onChange={(event) => setSelectedRoomId(event.target.value)} className="mt-1 w-full text-[13px] font-bold text-[#111735] outline-none">{hotel.rooms.filter((room) => room.available).map((room) => <option key={room.id} value={room.id}>{room.name}</option>)}</select></label>
      <div className="mt-5 flex gap-4 rounded-[8px] border border-[#E1E7F0] p-3">
        <div className="relative h-[78px] w-[96px] shrink-0 overflow-hidden rounded-[7px]"><Image src={selectedRoom.images[0]} alt={selectedRoom.name} fill className="object-cover" /></div>
        <div>
          <h3 className="text-[14px] font-black">{selectedRoom.name}</h3>
          <p className="mt-1 text-[12px] text-[#59637C]">{selectedRoom.bedType} · {selectedRoom.size} m² · City view</p>
          <p className="mt-1 text-[12px] text-[#168A43]">{selectedRoom.cancellationPolicy}</p>
        </div>
      </div>
      <div className="mt-6 space-y-4 border-t border-[#E1E7F0] pt-5 text-[14px]">
        <Row label={`${formatEgp(selectedRoom.pricePerNight)} × ${nights} nights`} value={formatEgp(subtotal)} />
        <Row label="Taxes and fees" value={formatEgp(taxes)} />
      </div>
      <div className="mt-5 flex items-end justify-between border-t border-[#E1E7F0] pt-5">
        <div><p className="text-[16px] font-black">Total</p><p className="text-[12px] text-[#59637C]">Includes taxes and fees</p></div>
        <p className="text-[24px] font-black">{formatEgp(total)}</p>
      </div>
      <div className="mt-5">
        <p className="text-[12px] text-[#59637C]">Secure payment methods</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {["VISA", "Mastercard", "meeza", "InstaPay", "fawry"].map((method) => <span key={method} className="rounded-[5px] border border-[#E1E7F0] px-3 py-1.5 text-[11px] font-black">{method}</span>)}
        </div>
      </div>
      <button type="button" onClick={onReserve} className="mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-[8px] bg-[#5F36E9] text-[15px] font-bold text-white shadow-[0_12px_24px_rgba(95,54,233,0.24)]"><Icon name="lock" className="h-4 w-4" /> Reserve now</button>
      <a href={`mailto:hotel@dar.example?subject=${encodeURIComponent(`Question about ${hotel.title}`)}`} className="mt-3 flex h-12 w-full items-center justify-center rounded-[8px] border border-[#8D6BFF] text-[15px] font-bold text-[#5F36E9]">Contact hotel</a>
      <p className="mt-5 text-[12px] text-[#59637C]">You will choose a room type before checkout.</p>
    </section>
  );
}

function TrustCard() {
  const items = [
    ["shield", "Verified hotel", "This property is verified and trusted"],
    ["lock", "Secure payment", "Your payment is safe and encrypted"],
    ["calendar", "Free cancellation", "Available on selected rooms"],
  ] as const;
  return (
    <section className="mt-6 rounded-[14px] border border-[#E1E7F0] bg-white p-6">
      <h2 className="text-[18px] font-black">Why book with DAR?</h2>
      <div className="mt-5 space-y-6">
        {items.map(([icon, title, copy]) => (
          <div key={title} className="flex gap-4">
            <Icon name={icon} className="h-8 w-8 text-[#5F36E9]" />
            <div><p className="text-[14px] font-black">{title}</p><p className="mt-1 text-[12px] text-[#59637C]">{copy}</p></div>
          </div>
        ))}
      </div>
    </section>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return <div className="flex items-center justify-between gap-4"><span className="text-[#34405A]">{label}</span><span className="font-semibold">{value}</span></div>;
}

function PhotosModal({ hotel, onClose }: { hotel: HotelListing; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#080B32]/65 p-5">
      <section className="mx-auto max-w-[980px] rounded-[18px] bg-white p-5">
        <div className="flex items-center justify-between"><h2 className="text-[22px] font-black">All photos</h2><button onClick={onClose} aria-label="Close photos"><Icon name="close" /></button></div>
        <div className="mt-5 grid gap-3 md:grid-cols-2">
          {hotel.gallery.map((photo) => <div key={photo} className="relative h-[260px] overflow-hidden rounded-[10px]"><Image src={photo} alt={hotel.title} fill className="object-cover" /></div>)}
        </div>
      </section>
    </div>
  );
}

function RoomModal({ room, onClose, onSelect }: { room: HotelRoom; onClose: () => void; onSelect: () => void }) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-[#080B32]/55 p-5">
      <section className="w-full max-w-[720px] rounded-[18px] bg-white p-5">
        <div className="flex items-center justify-between"><h2 className="text-[22px] font-black">{room.name}</h2><button onClick={onClose} aria-label="Close room details"><Icon name="close" /></button></div>
        <div className="relative mt-5 h-[280px] overflow-hidden rounded-[12px]"><Image src={room.images[0]} alt={room.name} fill className="object-cover" /></div>
        <p className="mt-5 text-[14px] leading-7 text-[#34405A]">{room.description}</p>
        <div className="mt-4 flex flex-wrap gap-2">{room.highlights.map((highlight) => <span key={highlight} className="rounded-[6px] border border-[#DCE3EF] px-3 py-2 text-[12px] font-bold">{highlight}</span>)}</div>
        <button onClick={onSelect} className="mt-6 h-12 w-full rounded-[8px] bg-[#5F36E9] text-[15px] font-bold text-white">Select room</button>
      </section>
    </div>
  );
}
