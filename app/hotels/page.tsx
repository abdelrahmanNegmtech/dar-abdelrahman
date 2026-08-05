import Image from "next/image";
import Link from "next/link";
import { hotelListings } from "@/app/booking/rooms/hotel-room-data";
import { compactBookingQuery, readParam, shortPath } from "@/app/routing";

type HotelsPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function formatEgp(value: number) {
  return `EGP ${new Intl.NumberFormat("en-EG", { maximumFractionDigits: 0 }).format(value)}`;
}

function bookingQuery(params: Record<string, string | string[] | undefined>) {
  return compactBookingQuery({
    checkIn: readParam(params, "in", "checkIn") ?? "2026-05-20",
    checkOut: readParam(params, "out", "checkOut") ?? "2026-05-22",
    guests: readParam(params, "g", "guests") ?? "2",
    nights: readParam(params, "n", "nights") ?? "2",
    locale: readParam(params, "locale", "locale") ?? "en",
  });
}

export default async function HotelsPage({ searchParams }: HotelsPageProps) {
  const params = (await searchParams) ?? {};
  const query = bookingQuery(params);
  const locale = readParam(params, "locale", "locale") ?? "en";

  return (
    <main className="min-h-screen bg-[#F8FAFC] text-[#090B32]">
      <div className="mx-auto min-h-screen max-w-[1440px] bg-white shadow-[0_28px_80px_rgba(15,23,42,0.06)] xl:my-4 xl:rounded-[28px]">
        <header className="border-b border-slate-100 bg-white/95 px-5 py-4 sm:px-8 lg:px-10 xl:rounded-t-[28px]">
          <div className="flex h-12 items-center justify-between">
            <Link href={shortPath("/", locale)} className="block w-[104px]" aria-label="DAR home">
              <Image src="/dar-logo-purple-header.png" alt="DAR" width={320} height={142} priority className="h-auto w-[104px] object-contain" />
            </Link>
            <nav className="hidden items-center gap-10 text-[14px] font-bold text-[#090B32] lg:flex">
              <Link href={shortPath("/rent", locale)}>Rent</Link>
              <Link href={shortPath("/buy", locale)}>Buy</Link>
              <Link href={shortPath("/hotels", locale)} aria-current="page" className="text-[#5F36E9]">Hotels</Link>
              <Link href={shortPath("/rent", locale)}>Short stays</Link>
              <Link href={shortPath("/new-projects", locale)}>New projects</Link>
            </nav>
            <div className="flex items-center gap-3 text-[14px] font-bold">
              <span className="hidden sm:inline">Saved</span>
              <span className="hidden h-9 w-9 items-center justify-center rounded-lg sm:inline-flex">
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8">
                  <path d="M5 6.5h14v9H9l-4 3v-12Z" />
                </svg>
              </span>
              <div className="h-9 w-9 rounded-full bg-[#ECE8FF]" />
            </div>
          </div>
        </header>

        <section className="px-5 py-8 sm:px-8 lg:px-10">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-[14px] font-bold text-[#5F36E9]">DAR hotel stays</p>
              <h1 className="mt-2 max-w-3xl text-[34px] font-black leading-tight tracking-normal sm:text-[44px]">
                Hotel stays with room-by-room choice
              </h1>
              <p className="mt-4 max-w-2xl text-[16px] font-medium leading-7 text-[#59647D]">
                Browse verified hotels, review room options, then choose the exact room type before booking.
              </p>
            </div>
            <Link href={`${shortPath(hotelListings[0].detailsPath, locale)}?${query}`} className="inline-flex h-12 items-center justify-center rounded-[8px] bg-[#5F36E9] px-6 text-[14px] font-bold text-white shadow-[0_12px_24px_rgba(95,54,233,0.22)]">
              View featured hotel
            </Link>
          </div>

          <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {hotelListings.map((hotel, index) => {
              const lowestRoom = hotel.rooms.filter((room) => room.available).sort((a, b) => a.pricePerNight - b.pricePerNight)[0] ?? hotel.rooms[0];
              return (
                <Link
                  href={`${shortPath(hotel.detailsPath, locale)}?${query}`}
                  key={hotel.slug}
                  className="group overflow-hidden rounded-[14px] border border-[#E0E5EF] bg-white shadow-[0_16px_36px_rgba(15,23,42,0.06)] transition hover:-translate-y-1 hover:shadow-[0_22px_48px_rgba(15,23,42,0.1)]"
                >
                  <div className="relative h-64 overflow-hidden bg-slate-100">
                    <Image src={hotel.image} alt={hotel.title} fill sizes="(min-width: 1280px) 33vw, (min-width: 768px) 50vw, 100vw" loading={index === 0 ? "eager" : "lazy"} className="object-cover transition duration-500 group-hover:scale-105" />
                    <span className="absolute left-4 top-4 rounded-[8px] bg-[#5F36E9] px-3 py-1.5 text-[12px] font-bold text-white shadow-lg shadow-[#5F36E9]/25">
                      Hotel
                    </span>
                  </div>
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h2 className="text-[20px] font-black leading-tight">{hotel.title}</h2>
                        <p className="mt-2 text-[14px] font-semibold text-[#59647D]">{hotel.location}</p>
                      </div>
                      <span className="inline-flex items-center gap-1 text-[13px] font-black">
                        <svg viewBox="0 0 24 24" className="h-4 w-4 text-[#20A948]" fill="currentColor">
                          <path d="m12 2.8 2.8 5.7 6.3.9-4.5 4.4 1.1 6.2L12 17.7 6.4 20.6l1.1-6.2L3 10l6.3-.9L12 2.8Z" />
                        </svg>
                        {hotel.rating}
                      </span>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {hotel.amenities.slice(0, 5).map((amenity) => (
                        <span key={amenity} className="rounded-[7px] border border-[#E0E5EF] px-3 py-2 text-[12px] font-bold text-[#59647D]">
                          {amenity}
                        </span>
                      ))}
                    </div>
                    <p className="mt-5 text-[15px] text-[#59647D]">
                      From <span className="font-black text-[#090B32]">{formatEgp(lowestRoom.pricePerNight)}</span> / night
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      </div>
    </main>
  );
}
