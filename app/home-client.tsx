"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { resultProperties } from "@/app/properties/[slug]/property-data";
import { FullDateInput } from "@/app/components/full-date-input";
import { compactBookingQuery, shortPath } from "@/app/routing";

function formatEgp(value: number) {
  return new Intl.NumberFormat("en-EG", {
    style: "currency",
    currency: "EGP",
    maximumFractionDigits: 0,
  }).format(value);
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

function addDays(date: string, days: number) {
  const next = new Date(`${date}T12:00:00`);
  next.setDate(next.getDate() + days);
  return next.toISOString().slice(0, 10);
}

function formatDateLabel(value: string) {
  if (!value) {
    return "Select date";
  }
  return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric" }).format(new Date(`${value}T12:00:00`));
}

const allowedCities = ["Madinty", "Madina Nour", "New Administrative Capital"];

export function HomeClient() {
  const router = useRouter();
  const [city, setCity] = useState("All");
  const [checkIn, setCheckIn] = useState("2026-07-08");
  const [checkOut, setCheckOut] = useState("2026-07-12");
  const [guests, setGuests] = useState(2);
  const minDate = today();
  const filteredProperties = useMemo(
    () => resultProperties.filter((property) => city === "All" || property.location === city),
    [city],
  );

  const updateCheckIn = (value: string) => {
    const nextCheckIn = value < minDate ? minDate : value;
    setCheckIn(nextCheckIn);
    if (!checkOut || checkOut <= nextCheckIn) {
      setCheckOut(addDays(nextCheckIn, 1));
    }
  };

  const search = () => {
    const params = compactBookingQuery({
      city,
      checkIn,
      checkOut,
      guests: String(guests),
      locale: "en",
    });
    router.push(`${shortPath("/", "en")}?${params}#results`);
  };

  return (
    <main className="min-h-screen bg-[#F8FAFC] text-[#090B32]">
      <div className="mx-auto min-h-screen max-w-[1440px] bg-white shadow-[0_28px_80px_rgba(15,23,42,0.06)] xl:my-4 xl:rounded-[28px]">
        <header className="border-b border-slate-100 bg-white/95 px-5 py-4 sm:px-8 lg:px-10 xl:rounded-t-[28px]">
          <div className="flex h-12 items-center justify-between">
            <Link href={shortPath("/", "en")} className="block w-[104px]" aria-label="DAR home">
              <Image src="/dar-logo-purple-header.png" alt="DAR" width={320} height={142} priority className="h-auto w-[104px] object-contain" />
            </Link>
            <nav className="hidden items-center gap-10 text-[14px] font-bold text-[#090B32] lg:flex">
              <Link href={shortPath("/rent", "en")}>Rent</Link>
              <Link href={shortPath("/buy", "en")}>Buy</Link>
              <Link href={shortPath("/hotels", "en")}>Hotels</Link>
              <Link href={`${shortPath("/rent", "en")}?stay=short`}>Short stays</Link>
              <Link href={shortPath("/new-projects", "en")}>New projects</Link>
            </nav>
            <div className="flex items-center gap-3 text-[14px] font-bold">
              <Link href={shortPath("/saved", "en")} className="hidden sm:inline">Saved</Link>
              <Link href={shortPath("/messages", "en")} aria-label="Messages" className="hidden h-9 w-9 items-center justify-center rounded-lg hover:bg-[#F5F2FF] sm:inline-flex">
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8">
                  <path d="M5 6.5h14v9H9l-4 3v-12Z" />
                </svg>
              </Link>
              <Link href={shortPath("/bookings", "en")} aria-label="My bookings" className="h-9 w-9 rounded-full bg-[#ECE8FF]" />
            </div>
          </div>
        </header>

        <section className="px-5 py-8 sm:px-8 lg:px-10">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-[14px] font-bold text-[#5F36E9]">DAR curated stays</p>
              <h1 className="mt-2 max-w-3xl text-[34px] font-black leading-tight tracking-normal sm:text-[44px]">
                Premium homes across Egypt&apos;s new communities
              </h1>
              <p className="mt-4 max-w-2xl text-[16px] font-medium leading-7 text-[#59647D]">
                Browse polished stays exclusively in Madinty, Madina Nour, and the New Administrative Capital.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {["All", ...allowedCities].map((nextCity) => (
                <button
                  key={nextCity}
                  type="button"
                  onClick={() => setCity(nextCity)}
                  className={`rounded-full border px-4 py-2 text-[13px] font-bold ${city === nextCity ? "border-[#5F36E9] bg-[#5F36E9] text-white" : "border-[#DEDDF8] bg-[#F6F4FF] text-[#5F36E9]"}`}
                >
                  {nextCity}
                </button>
              ))}
            </div>
          </div>

          <section aria-label="Search stays" className="mt-8 grid gap-3 rounded-[16px] border border-[#E0E5EF] bg-white p-4 shadow-[0_16px_36px_rgba(15,23,42,0.06)] lg:grid-cols-[1fr_1fr_170px_150px]">
            <div className="block text-[12px] font-bold text-[#59647D]">
              Check-in
              <FullDateInput value={checkIn} min={minDate} onChange={updateCheckIn} ariaLabel="Check-in" className="mt-2 flex h-12 w-full items-center rounded-[8px] border border-[#DCE3EF] px-3 text-[14px] font-bold text-[#090B32] hover:border-[#C8D0E0]">
                {formatDateLabel(checkIn)}
              </FullDateInput>
            </div>
            <div className="block text-[12px] font-bold text-[#59647D]">
              Check-out
              <FullDateInput value={checkOut} min={addDays(checkIn || minDate, 1)} onChange={setCheckOut} ariaLabel="Check-out" className="mt-2 flex h-12 w-full items-center rounded-[8px] border border-[#DCE3EF] px-3 text-[14px] font-bold text-[#090B32] hover:border-[#C8D0E0]">
                {formatDateLabel(checkOut)}
              </FullDateInput>
            </div>
            <div className="text-[12px] font-bold text-[#59647D]">
              Guests
              <div className="mt-2 flex h-12 items-center justify-between rounded-[8px] border border-[#DCE3EF] px-3">
                <button type="button" aria-label="Decrease guests" onClick={() => setGuests((current) => Math.max(1, current - 1))} className="grid h-8 w-8 place-items-center rounded-[6px] border border-[#DCE3EF]">-</button>
                <span className="text-[14px] font-black text-[#090B32]">{guests}</span>
                <button type="button" aria-label="Increase guests" onClick={() => setGuests((current) => Math.min(8, current + 1))} className="grid h-8 w-8 place-items-center rounded-[6px] border border-[#DCE3EF]">+</button>
              </div>
            </div>
            <button type="button" onClick={search} className="mt-5 h-12 rounded-[8px] bg-[#5F36E9] text-[14px] font-bold text-white shadow-[0_12px_24px_rgba(95,54,233,0.22)] lg:mt-[22px]">
              Search
            </button>
          </section>

          <div id="results" className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {filteredProperties.map((property) => {
              const params = compactBookingQuery({ checkIn, checkOut, guests: String(guests), locale: "en" });
              return (
                <Link
                  href={`${shortPath(`/properties/${property.slug}`, "en")}?${params}`}
                  key={property.slug}
                  className="group overflow-hidden rounded-[14px] border border-[#E0E5EF] bg-white shadow-[0_16px_36px_rgba(15,23,42,0.06)] transition hover:-translate-y-1 hover:shadow-[0_22px_48px_rgba(15,23,42,0.1)] focus:outline-none focus:ring-2 focus:ring-[#5F36E9]/30"
                >
                  <div className="relative h-56 overflow-hidden bg-slate-100">
                    <Image src={property.image} alt={property.title} fill sizes="(min-width: 1280px) 25vw, (min-width: 768px) 50vw, 100vw" className="object-cover transition duration-500 group-hover:scale-105" />
                    <span className="absolute left-4 top-4 rounded-[8px] bg-[#5F36E9] px-3 py-1.5 text-[12px] font-bold text-white shadow-lg shadow-[#5F36E9]/25">Featured</span>
                  </div>
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h2 className="text-[17px] font-black leading-tight">{property.title}</h2>
                        <p className="mt-2 text-[14px] font-semibold text-[#59647D]">{property.location}</p>
                      </div>
                      <span className="inline-flex items-center gap-1 text-[13px] font-black">
                        <svg viewBox="0 0 24 24" className="h-4 w-4 text-[#5F36E9]" fill="currentColor"><path d="m12 2.8 2.8 5.7 6.3.9-4.5 4.4 1.1 6.2L12 17.7 6.4 20.6l1.1-6.2L3 10l6.3-.9L12 2.8Z" /></svg>
                        {property.rating}
                      </span>
                    </div>
                    <div className="mt-4 grid grid-cols-4 rounded-[9px] border border-[#E0E5EF] text-center text-[12px] font-semibold text-[#59647D]">
                      <span className="py-3">{property.bedrooms} bed</span>
                      <span className="border-l border-[#E0E5EF] py-3">{property.bathrooms} bath</span>
                      <span className="border-l border-[#E0E5EF] py-3">{property.guests} guests</span>
                      <span className="border-l border-[#E0E5EF] py-3">{property.area} m²</span>
                    </div>
                    <p className="mt-4 text-[15px] text-[#59647D]">
                      <span className="font-black text-[#090B32]">{formatEgp(property.pricePerNight)}</span> / night
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
