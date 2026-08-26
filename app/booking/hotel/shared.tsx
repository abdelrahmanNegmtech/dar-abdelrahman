"use client";

import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { featuredHotel, getHotelBySlug, type HotelListing, type HotelRoom } from "@/app/booking/rooms/hotel-room-data";
import { compactBookingQuery, shortPath } from "@/app/routing";

export type HotelGuestInfo = {
  fullName: string;
  email: string;
  countryCode: string;
  phone: string;
  nationality: string;
  documentId: string;
  travelingForWork: boolean;
  arrivalTime: string;
  visitPurpose: string;
  requests: string;
};

export type HotelBookingPayload = {
  propertyId: string;
  hotelId?: string;
  listingType?: "hotel" | "apartment";
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
  selectedRoomId?: string;
  roomName?: string;
  roomPricePerNight?: number;
  roomCapacity?: number;
  roomBedType?: string;
  roomAmenities?: string[];
  cancellationPolicy?: string;
  guestInfo?: HotelGuestInfo;
  paymentMethod?: string;
  paymentDetails?: Record<string, string | boolean>;
  bookingStatus?: string;
  bookingId?: string;
};

export type IconName =
  | "bank"
  | "bed"
  | "bell"
  | "calendar"
  | "card"
  | "check"
  | "chevronLeft"
  | "chevronRight"
  | "close"
  | "dots"
  | "edit"
  | "headset"
  | "home"
  | "location"
  | "lock"
  | "menu"
  | "message"
  | "moon"
  | "shield"
  | "star"
  | "user"
  | "wallet";

const storageKey = "dar-pending-booking";

export const defaultGuestInfo: HotelGuestInfo = {
  fullName: "",
  email: "",
  countryCode: "+20 Egypt",
  phone: "10 1234 5678",
  nationality: "",
  documentId: "",
  travelingForWork: false,
  arrivalTime: "",
  visitPurpose: "",
  requests: "",
};

export const countryDialCodes = [
  "+93 Afghanistan", "+355 Albania", "+213 Algeria", "+1 American Samoa", "+376 Andorra", "+244 Angola", "+1 Anguilla", "+1 Antigua and Barbuda", "+54 Argentina", "+374 Armenia", "+297 Aruba", "+61 Australia", "+43 Austria", "+994 Azerbaijan",
  "+1 Bahamas", "+973 Bahrain", "+880 Bangladesh", "+1 Barbados", "+375 Belarus", "+32 Belgium", "+501 Belize", "+229 Benin", "+1 Bermuda", "+975 Bhutan", "+591 Bolivia", "+387 Bosnia and Herzegovina", "+267 Botswana", "+55 Brazil", "+246 British Indian Ocean Territory", "+1 British Virgin Islands", "+673 Brunei", "+359 Bulgaria", "+226 Burkina Faso", "+257 Burundi",
  "+855 Cambodia", "+237 Cameroon", "+1 Canada", "+238 Cape Verde", "+1 Cayman Islands", "+236 Central African Republic", "+235 Chad", "+56 Chile", "+86 China", "+57 Colombia", "+269 Comoros", "+242 Congo", "+243 Congo DR", "+682 Cook Islands", "+506 Costa Rica", "+225 Cote d'Ivoire", "+385 Croatia", "+53 Cuba", "+357 Cyprus", "+420 Czech Republic",
  "+45 Denmark", "+253 Djibouti", "+1 Dominica", "+1 Dominican Republic", "+593 Ecuador", "+20 Egypt", "+503 El Salvador", "+240 Equatorial Guinea", "+291 Eritrea", "+372 Estonia", "+251 Ethiopia",
  "+500 Falkland Islands", "+298 Faroe Islands", "+679 Fiji", "+358 Finland", "+33 France", "+594 French Guiana", "+689 French Polynesia",
  "+241 Gabon", "+220 Gambia", "+995 Georgia", "+49 Germany", "+233 Ghana", "+350 Gibraltar", "+30 Greece", "+299 Greenland", "+1 Grenada", "+590 Guadeloupe", "+1 Guam", "+502 Guatemala", "+224 Guinea", "+245 Guinea-Bissau", "+592 Guyana",
  "+509 Haiti", "+504 Honduras", "+852 Hong Kong", "+36 Hungary",
  "+354 Iceland", "+91 India", "+62 Indonesia", "+98 Iran", "+964 Iraq", "+353 Ireland", "+972 Israel", "+39 Italy",
  "+1 Jamaica", "+81 Japan", "+962 Jordan", "+7 Kazakhstan", "+254 Kenya", "+686 Kiribati", "+965 Kuwait", "+996 Kyrgyzstan",
  "+856 Laos", "+371 Latvia", "+961 Lebanon", "+266 Lesotho", "+231 Liberia", "+218 Libya", "+423 Liechtenstein", "+370 Lithuania", "+352 Luxembourg",
  "+853 Macau", "+389 North Macedonia", "+261 Madagascar", "+265 Malawi", "+60 Malaysia", "+960 Maldives", "+223 Mali", "+356 Malta", "+692 Marshall Islands", "+596 Martinique", "+222 Mauritania", "+230 Mauritius", "+52 Mexico", "+691 Micronesia", "+373 Moldova", "+377 Monaco", "+976 Mongolia", "+382 Montenegro", "+1 Montserrat", "+212 Morocco", "+258 Mozambique", "+95 Myanmar",
  "+264 Namibia", "+674 Nauru", "+977 Nepal", "+31 Netherlands", "+687 New Caledonia", "+64 New Zealand", "+505 Nicaragua", "+227 Niger", "+234 Nigeria", "+683 Niue", "+850 North Korea", "+47 Norway",
  "+968 Oman", "+92 Pakistan", "+680 Palau", "+970 Palestine", "+507 Panama", "+675 Papua New Guinea", "+595 Paraguay", "+51 Peru", "+63 Philippines", "+48 Poland", "+351 Portugal", "+1 Puerto Rico",
  "+974 Qatar", "+262 Reunion", "+40 Romania", "+7 Russia", "+250 Rwanda",
  "+590 Saint Barthelemy", "+290 Saint Helena", "+1 Saint Kitts and Nevis", "+1 Saint Lucia", "+508 Saint Pierre and Miquelon", "+1 Saint Vincent and the Grenadines", "+685 Samoa", "+378 San Marino", "+239 Sao Tome and Principe", "+966 Saudi Arabia", "+221 Senegal", "+381 Serbia", "+248 Seychelles", "+232 Sierra Leone", "+65 Singapore", "+421 Slovakia", "+386 Slovenia", "+677 Solomon Islands", "+252 Somalia", "+27 South Africa", "+82 South Korea", "+211 South Sudan", "+34 Spain", "+94 Sri Lanka", "+249 Sudan", "+597 Suriname", "+268 Eswatini", "+46 Sweden", "+41 Switzerland", "+963 Syria",
  "+886 Taiwan", "+992 Tajikistan", "+255 Tanzania", "+66 Thailand", "+670 Timor-Leste", "+228 Togo", "+690 Tokelau", "+676 Tonga", "+1 Trinidad and Tobago", "+216 Tunisia", "+90 Turkiye", "+993 Turkmenistan", "+1 Turks and Caicos", "+688 Tuvalu",
  "+256 Uganda", "+380 Ukraine", "+971 United Arab Emirates", "+44 United Kingdom", "+1 United States", "+598 Uruguay", "+998 Uzbekistan",
  "+678 Vanuatu", "+379 Vatican City", "+58 Venezuela", "+84 Vietnam", "+681 Wallis and Futuna", "+967 Yemen", "+260 Zambia", "+263 Zimbabwe",
];

export const nationalities = countryDialCodes.map((entry) => entry.replace(/^\+\d+\s*/, "")).sort((a, b) => a.localeCompare(b));

function iconPath(name: IconName) {
  const paths: Record<IconName, string> = {
    bank: "M4 19h16M6 17V9m4 8V9m4 8V9m4 8V9M3 7l9-4 9 4H3Z",
    bed: "M4 12V7a2 2 0 0 1 2-2h5a3 3 0 0 1 3 3v4M4 12h16a2 2 0 0 1 2 2v5M4 12v7M7 16h.01M17 16h.01",
    bell: "M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9ZM13.7 21a2 2 0 0 1-3.4 0",
    calendar: "M7 3v3M17 3v3M4.5 8.5h15M6 5h12a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z",
    card: "M4 7.5h16v9A2.5 2.5 0 0 1 17.5 19h-11A2.5 2.5 0 0 1 4 16.5v-9ZM4 10h16M7 15h4",
    check: "m5 12 4.2 4.2L19 6.5",
    chevronLeft: "M14.5 5 8.5 11l6 6",
    chevronRight: "m9 6 6 6-6 6",
    close: "M6 6l12 12M18 6 6 18",
    dots: "M5 12h.01M12 12h.01M19 12h.01",
    edit: "M4 20h4l10.5-10.5a2.8 2.8 0 0 0-4-4L4 16v4Z",
    headset: "M4 13a8 8 0 0 1 16 0v3a2 2 0 0 1-2 2h-2v-6h4M4 16a2 2 0 0 0 2 2h2v-6H4v4Zm8 5h2a4 4 0 0 0 4-4",
    home: "M3.5 11.5 12 4l8.5 7.5M5.5 10.5V20h13v-9.5M9.5 20v-6h5v6",
    location: "M12 21s7-4.4 7-11a7 7 0 1 0-14 0c0 6.6 7 11 7 11Zm0-8.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z",
    lock: "M7 10V8a5 5 0 0 1 10 0v2M6 10h12v10H6V10Zm6 4v2.5",
    menu: "M4 7h16M4 12h16M4 17h16",
    message: "M5 6.5h14v9H9l-4 3v-12Z",
    moon: "M21 14.8A8.5 8.5 0 0 1 9.2 3 7 7 0 1 0 21 14.8Z",
    shield: "M12 3 19 6v5c0 4.8-2.9 8-7 10-4.1-2-7-5.2-7-10V6l7-3Z",
    star: "m12 2.8 2.8 5.7 6.3.9-4.5 4.4 1.1 6.2L12 17.7 6.4 20.6l1.1-6.2L3 10l6.3-.9L12 2.8Z",
    user: "M20 21a8 8 0 0 0-16 0M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10Z",
    wallet: "M4 7h15a2 2 0 0 1 2 2v9H6a3 3 0 0 1-3-3V6a3 3 0 0 0 3 3h15M16 14h.01",
  };
  return paths[name];
}

export function Icon({ name, className, filled = false }: { name: IconName; className?: string; filled?: boolean }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className={cn("h-5 w-5", className)} fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8">
      <path d={iconPath(name)} />
    </svg>
  );
}

export function formatEgp(value: number) {
  return `EGP ${new Intl.NumberFormat("en-EG", { maximumFractionDigits: 0 }).format(value)}`;
}

export function dateAtNoon(value?: string) {
  const fallback = "2026-05-20";
  const source = value || fallback;
  return /^\d{4}-\d{2}-\d{2}$/.test(source) ? new Date(`${source}T12:00:00`) : new Date(source);
}

export function formatDate(value?: string) {
  return new Intl.DateTimeFormat("en-GB", { weekday: "short", day: "numeric", month: "long", year: "numeric" }).format(dateAtNoon(value));
}

export function formatShortDate(value?: string) {
  return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric" }).format(dateAtNoon(value));
}

export function nightsBetween(checkIn: string, checkOut: string) {
  const ms = dateAtNoon(checkOut).getTime() - dateAtNoon(checkIn).getTime();
  return Math.max(1, Math.round(ms / 86_400_000));
}

export function bookingQuery(booking: HotelBookingPayload) {
  return compactBookingQuery({
    hotel: booking.hotelId ?? booking.propertyId,
    property: booking.propertyId,
    checkIn: booking.checkIn,
    checkOut: booking.checkOut,
    guests: String(booking.guests),
    nights: String(booking.nights),
    locale: booking.locale,
  });
}

export function localizedPath(booking: HotelBookingPayload, path: string) {
  return shortPath(path, booking.locale);
}

export function paymentLabel(method?: string) {
  const labels: Record<string, string> = {
    card: "Credit / debit card",
    meeza: "Meeza Card",
    wallet: "Wallets",
    bank: "Bank Transfer",
    hotel: "Pay at hotel",
    instapay: "InstaPay",
    vodafone: "Vodafone Cash",
    fawry: "Fawry",
    paymob: "Paymob / Accept",
    arrival: "Pay on arrival",
  };
  return labels[method ?? "card"] ?? "Credit / debit card";
}

export function getBookingFallback(): { booking: HotelBookingPayload; hotel: HotelListing; room: HotelRoom } {
  const hotel = featuredHotel;
  const room = hotel.rooms[0];
  const fallbackSubtotal = room.pricePerNight * 2;
  const fallback: HotelBookingPayload = {
    propertyId: hotel.slug,
    hotelId: hotel.slug,
    listingType: "hotel",
    title: hotel.title,
    location: hotel.location,
    image: room.images[0] ?? hotel.image,
    checkIn: "2026-05-20",
    checkOut: "2026-05-22",
    guests: 2,
    rooms: 1,
    nights: 2,
    pricePerNight: room.pricePerNight,
    cleaningFee: 0,
    serviceFee: 800,
    discount: 0,
    subtotal: fallbackSubtotal,
    total: fallbackSubtotal + 800,
    currency: "EGP",
    locale: "en",
    selectedRoomId: room.id,
    roomName: room.name,
    roomPricePerNight: room.pricePerNight,
    roomCapacity: room.capacity,
    roomBedType: room.bedType,
    roomAmenities: room.amenities,
    cancellationPolicy: room.cancellationPolicy,
    guestInfo: defaultGuestInfo,
  };
  return { booking: fallback, hotel, room };
}

export function readHotelBooking(): { booking: HotelBookingPayload; hotel: HotelListing; room: HotelRoom } {
  const fallback = getBookingFallback();

  if (typeof window === "undefined") {
    return fallback;
  }

  try {
    const parsed = JSON.parse(window.sessionStorage.getItem(storageKey) ?? "{}") as Partial<HotelBookingPayload>;
    const activeHotel = getHotelBySlug(parsed.hotelId ?? parsed.propertyId) ?? fallback.hotel;
    const activeRoom = activeHotel.rooms.find((candidate) => candidate.id === parsed.selectedRoomId) ?? activeHotel.rooms[0];
    const nights = parsed.nights ?? nightsBetween(parsed.checkIn ?? fallback.booking.checkIn, parsed.checkOut ?? fallback.booking.checkOut);
    const price = parsed.pricePerNight ?? parsed.roomPricePerNight ?? activeRoom.pricePerNight;
    const subtotal = parsed.subtotal ?? price * nights;
    const serviceFee = parsed.serviceFee ?? Math.round(subtotal * activeHotel.taxRate);
    const booking: HotelBookingPayload = {
      ...fallback.booking,
      ...parsed,
      propertyId: activeHotel.slug,
      hotelId: activeHotel.slug,
      listingType: "hotel",
      title: parsed.title ?? activeHotel.title,
      location: parsed.location ?? activeHotel.location,
      image: parsed.image ?? activeRoom.images[0] ?? activeHotel.image,
      nights,
      pricePerNight: price,
      roomPricePerNight: price,
      selectedRoomId: parsed.selectedRoomId ?? activeRoom.id,
      roomName: parsed.roomName ?? activeRoom.name,
      roomCapacity: parsed.roomCapacity ?? activeRoom.capacity,
      roomBedType: parsed.roomBedType ?? activeRoom.bedType,
      roomAmenities: parsed.roomAmenities ?? activeRoom.amenities,
      cancellationPolicy: parsed.cancellationPolicy ?? activeRoom.cancellationPolicy,
      serviceFee,
      subtotal,
      total: parsed.total ?? subtotal + serviceFee - (parsed.discount ?? 0),
      guestInfo: { ...defaultGuestInfo, ...parsed.guestInfo },
    };
    return { booking, hotel: activeHotel, room: activeRoom };
  } catch {
    return fallback;
  }
}

export function writeHotelBooking(booking: HotelBookingPayload) {
  window.sessionStorage.setItem(storageKey, JSON.stringify(booking));
}

export function HotelFlowHeader() {
  return (
    <header className="grid h-[76px] grid-cols-[44px_minmax(0,1fr)_44px] items-center px-5 lg:flex lg:justify-between lg:px-8">
      <Link href="/" aria-label="DAR home" className="justify-self-center lg:justify-self-auto">
        <Image src="/dar-logo-purple-header.png" alt="DAR" width={320} height={142} className="h-[42px] w-auto object-contain lg:h-[50px]" priority />
      </Link>
      <div className="flex items-center gap-7 justify-self-end">
        <a href="mailto:support@dar.example?subject=Hotel%20booking%20support" className="hidden items-center gap-2 text-[15px] font-bold lg:inline-flex">
          <Icon name="headset" className="h-5 w-5" />
          Need help?
        </a>
      </div>
    </header>
  );
}

export function Stepper({ current }: { current: 1 | 2 | 3 | 4 }) {
  const steps = ["Room selection", "Guest details", "Payment", "Confirmation"];
  return (
    <nav aria-label="Booking progress" className="mx-auto mb-9 mt-1 max-w-[760px]">
      <ol className="grid grid-cols-4 items-start gap-0">
        {steps.map((step, index) => {
          const number = index + 1;
          const done = number < current;
          const active = number === current;
          return (
            <li key={step} className="relative flex flex-col items-center gap-2 text-center">
              {index > 0 ? <span className="absolute right-1/2 top-[13px] h-px w-full bg-[#D9E0EC]" /> : null}
              <span className={cn("relative z-10 grid h-[30px] w-[30px] place-items-center rounded-full border text-[14px] font-black", active || done ? "border-[#5F36E9] bg-[#5F36E9] text-white" : "border-[#BEC8D8] bg-[#F8FAFC] text-[#7A8499]")}>
                {done ? <Icon name="check" className="h-4 w-4" /> : number}
              </span>
              <span className={cn("hidden text-[13px] font-bold sm:block", active ? "text-[#111735]" : done ? "text-[#34405A]" : "text-[#59637C]")}>{step}</span>
              <span className={cn("text-[13px] font-bold sm:hidden", active ? "text-[#5F36E9]" : "text-[#59637C]")}>{["Rooms", "Details", "Payment", "Confirm"][index]}</span>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export function BookingSummaryCard({ booking, compact = false, helper = "Almost there!" }: { booking: HotelBookingPayload; compact?: boolean; helper?: string }) {
  return (
    <aside className={cn("rounded-[14px] border border-[#E1E7F0] bg-white shadow-[0_16px_38px_rgba(15,23,42,0.07)]", compact ? "p-4" : "p-6")}>
      <div className="flex items-center justify-between">
        <h2 className="text-[20px] font-black">Your booking</h2>
        <Link href={`${localizedPath(booking, "/booking/rooms")}?${bookingQuery(booking)}`} className="text-[14px] font-bold text-[#5F36E9]">Edit</Link>
      </div>
      <div className="mt-5 flex gap-4">
        <div className="relative h-[96px] w-[132px] shrink-0 overflow-hidden rounded-[8px] bg-[#EEF2F8]">
          <Image src={booking.image} alt={booking.title} fill className="object-cover" />
        </div>
        <div>
          <h3 className="text-[17px] font-black leading-6">{booking.title}</h3>
          <p className="mt-4 flex items-center gap-2 text-[14px] text-[#34405A]"><Icon name="location" /> {booking.location}</p>
        </div>
      </div>
      <div className="mt-6 space-y-5 border-t border-[#E6EBF3] pt-5 text-[14px] text-[#34405A]">
        <p className="flex items-center gap-4"><Icon name="calendar" /> {formatDate(booking.checkIn)} <span>-</span> {formatDate(booking.checkOut)}<br /></p>
        <p className="flex items-center gap-4"><Icon name="user" /> {booking.guests} guests, {booking.rooms ?? 1} room</p>
      </div>
      <div className="mt-6 border-t border-[#E6EBF3] pt-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-[15px] font-black">Room details</h3>
            <p className="mt-3 text-[15px] font-black">{booking.roomName}</p>
            <p className="mt-2 flex flex-wrap gap-3 text-[13px] text-[#34405A]">
              <span>{booking.roomCapacity ? `${booking.roomCapacity} guests` : `${booking.guests} guests`}</span>
              <span>{booking.roomBedType}</span>
            </p>
          </div>
          <p className="text-right text-[17px] font-black">{formatEgp(booking.pricePerNight)} <span className="text-[13px] font-medium text-[#34405A]">/ night</span></p>
        </div>
        <p className="mt-4 text-[14px] font-black text-[#168A43]">{booking.cancellationPolicy ?? "Free cancellation until 18 May 2024"}</p>
      </div>
      <div className="mt-6 space-y-4 border-t border-[#E6EBF3] pt-5 text-[14px]">
        <Row label={`${formatEgp(booking.pricePerNight)} × ${booking.nights} nights`} value={formatEgp(booking.subtotal)} />
        <Row label="Taxes and fees" value={formatEgp(booking.serviceFee)} />
      </div>
      <div className="mt-5 flex items-start justify-between border-t border-[#E6EBF3] pt-5">
        <p className="text-[15px] font-black">Total</p>
        <div className="text-right">
          <p className="text-[21px] font-black">{formatEgp(booking.total)}</p>
          <p className="text-[12px] text-[#59637C]">Inclusive of VAT</p>
        </div>
      </div>
      {!compact ? (
        <>
          <div className="mt-7 rounded-[10px] bg-[#F5F1FF] p-4">
            <p className="text-[15px] font-black">{helper}</p>
            <p className="mt-1 text-[13px] leading-6 text-[#34405A]">Just a few more details and you&apos;re all set.</p>
          </div>
          <div className="mt-6">
            <p className="text-[13px] text-[#59637C]">We accept</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {["VISA", "MC", "Meeza", "Cash"].map((method) => <span key={method} className="rounded-[6px] border border-[#E1E7F0] px-3 py-2 text-[12px] font-black">{method}</span>)}
            </div>
          </div>
        </>
      ) : null}
    </aside>
  );
}

export function Row({ label, value }: { label: string; value: string }) {
  return <div className="flex items-center justify-between gap-4"><span className="text-[#34405A]">{label}</span><span className="font-semibold">{value}</span></div>;
}
