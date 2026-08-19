"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  CalendarIcon,
  GlobeIcon,
  MapPinIcon,
  SearchIcon,
  UserIcon,
} from "@/components/ui";
import { properties } from "@/features/public-marketplace/search/data";

const topLocations = Array.from(
  new Map(
    properties.map((property) => [
      property.location,
      { name: property.location, secondary: property.area },
    ]),
  ).values(),
);

const MAX_GUESTS = 16;
const DEFAULT_CHECK_IN = "2026-05-20";
const DEFAULT_CHECK_OUT = "2026-05-26";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
    year: "numeric",
  }).format(new Date(`${value}T00:00:00Z`));
}

type HeroSearchCardProps = {
  propertyType: string;
};

export function HeroSearchCard({ propertyType }: HeroSearchCardProps) {
  const router = useRouter();
  const cardRef = useRef<HTMLElement>(null);
  const locationMenuRef = useRef<HTMLDivElement>(null);
  const locationTriggerRef = useRef<HTMLButtonElement>(null);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [destination, setDestination] = useState("Any location");
  const [locationQuery, setLocationQuery] = useState("");
  const [locationMenuPosition, setLocationMenuPosition] = useState({ left: 0, top: 0, width: 390 });
  const [checkIn, setCheckIn] = useState(DEFAULT_CHECK_IN);
  const [checkOut, setCheckOut] = useState(DEFAULT_CHECK_OUT);
  const [guests, setGuests] = useState(2);

  useEffect(() => {
    function dismissMenu(event: MouseEvent) {
      const target = event.target as Node;
      if (!cardRef.current?.contains(target) && !locationMenuRef.current?.contains(target)) {
        setOpenMenu(null);
      }
    }

    function dismissWithEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setOpenMenu(null);
    }

    document.addEventListener("pointerdown", dismissMenu);
    document.addEventListener("keydown", dismissWithEscape);
    return () => {
      document.removeEventListener("pointerdown", dismissMenu);
      document.removeEventListener("keydown", dismissWithEscape);
    };
  }, []);

  useEffect(() => {
    if (openMenu !== "Where to?") return;

    function updatePosition() {
      const rect = locationTriggerRef.current?.getBoundingClientRect();
      if (!rect) return;
      const viewportWidth = document.documentElement.clientWidth;
      const width = Math.min(390, viewportWidth - 24);
      setLocationMenuPosition({
        left: Math.max(12, Math.min(rect.left + window.scrollX, viewportWidth - width - 12 + window.scrollX)),
        top: rect.bottom + window.scrollY + 8,
        width,
      });
    }

    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [openMenu]);

  const searchItems = [
    { icon: GlobeIcon, label: "Where to?", value: destination },
    { icon: CalendarIcon, label: "Check-in", value: formatDate(checkIn) },
    { icon: CalendarIcon, label: "Check-out", value: formatDate(checkOut) },
    { icon: UserIcon, label: "Guests", value: `${guests} guests` },
  ];

  function handleSearch() {
    const params = new URLSearchParams({
      destination,
      checkIn,
      checkOut,
      guests: String(guests),
      type: propertyType,
    });
    router.push(`/search?${params.toString()}`);
  }

  function openLocationMenu() {
    setLocationQuery(destination === "Any location" ? "" : destination);
    setOpenMenu("Where to?");
  }

  const normalizedLocationQuery = locationQuery.trim().toLowerCase();
  const matchingLocations = topLocations.filter(({ name, secondary }) =>
    `${name} ${secondary}`.toLowerCase().includes(normalizedLocationQuery),
  );
  const matchingProperties = properties
    .filter((property) =>
      `${property.title} ${property.location} ${property.area}`
        .toLowerCase()
        .includes(normalizedLocationQuery),
    )
    .slice(0, 3);

  const locationDropdown = openMenu === "Where to?" && typeof document !== "undefined"
    ? createPortal(
        <div
          aria-label="Location suggestions"
          className="absolute z-[100] max-h-[min(520px,calc(100vh-24px))] overflow-y-auto rounded-xl border border-[#E5E7EB] bg-white text-[#0F172A] shadow-[0_18px_45px_rgba(15,23,42,0.18)]"
          onPointerDown={(event) => event.stopPropagation()}
          ref={locationMenuRef}
          role="dialog"
          style={locationMenuPosition}
        >
          <div className="border-b border-[#E5E7EB] p-3">
            <label className="sr-only" htmlFor="hero-location-query">Search destinations</label>
            <div className="flex items-center gap-2 rounded-lg border border-[#D8D4E8] px-3 focus-within:border-[#6C3DFF] focus-within:ring-2 focus-within:ring-[#6C3DFF]/15">
              <MapPinIcon className="size-4 shrink-0 text-[#6C3DFF]" />
              <input
                autoFocus
                className="min-w-0 flex-1 bg-transparent py-2.5 text-[13px] font-semibold outline-none placeholder:text-[#94A3B8]"
                id="hero-location-query"
                onChange={(event) => setLocationQuery(event.target.value)}
                placeholder="Search destinations"
                value={locationQuery}
              />
            </div>
          </div>

          {matchingLocations.length ? (
            <div className="border-b border-[#E5E7EB] p-3">
              <p className="px-2 pb-1.5 text-[10px] font-bold uppercase tracking-[0.08em] text-[#64748B]">Top locations</p>
              <div className="grid gap-0.5">
                {matchingLocations.map((location) => (
                  <button
                    className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left transition hover:bg-[#F7F5FF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6C3DFF]/40"
                    key={location.name}
                    onClick={() => {
                      setDestination(location.name);
                      setLocationQuery(location.name);
                      setOpenMenu(null);
                    }}
                    type="button"
                  >
                    <MapPinIcon className="size-4 shrink-0 text-[#64748B]" />
                    <span className="min-w-0 flex-1">
                      <span className="block text-[13px] font-semibold">{location.name}</span>
                      {location.secondary !== location.name ? (
                        <span className="block truncate text-[11px] text-[#64748B]">{location.secondary}</span>
                      ) : null}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          {matchingProperties.length ? (
            <div className="border-b border-[#E5E7EB] p-3">
              <p className="px-2 pb-1.5 text-[10px] font-bold uppercase tracking-[0.08em] text-[#64748B]">Properties</p>
              <div className="grid gap-1">
                {matchingProperties.map((property) => (
                  <Link
                    className="flex items-center gap-3 rounded-lg px-2 py-2 transition hover:bg-[#F7F5FF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6C3DFF]/40"
                    href={`/stays/${property.slug}`}
                    key={property.slug}
                    onClick={() => setOpenMenu(null)}
                  >
                    <span className="relative h-11 w-14 shrink-0 overflow-hidden rounded-md bg-[#E2E8F0]">
                      <Image
                        alt=""
                        className={`object-cover ${property.imagePosition}`}
                        fill
                        sizes="56px"
                        src={property.imageSrc}
                      />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[12px] font-bold">{property.title}</span>
                      <span className="block truncate text-[11px] text-[#64748B]">{property.location}</span>
                    </span>
                    <span className="shrink-0 text-[11px] font-semibold text-[#334155]">{property.price} / night</span>
                  </Link>
                ))}
              </div>
            </div>
          ) : null}

          <button
            className="flex w-full items-center gap-2 px-5 py-3 text-left text-[13px] font-bold text-[#6C3DFF] transition hover:bg-[#F7F5FF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#6C3DFF]/40"
            onClick={() => {
              const query = locationQuery.trim() || destination;
              const params = new URLSearchParams({
                destination: query,
                checkIn,
                checkOut,
                guests: String(guests),
                type: propertyType,
              });
              setDestination(query);
              setOpenMenu(null);
              router.push(`/search?${params.toString()}`);
            }}
            type="button"
          >
            <SearchIcon className="size-4" />
            {locationQuery.trim() ? `Search for “${locationQuery.trim()}”` : "Search all locations"}
          </button>
        </div>,
        document.body,
      )
    : null;

  return (
    <section ref={cardRef} className="relative z-20 rounded-[24px] border border-white/26 bg-white p-3 shadow-[0_28px_80px_rgba(2,6,23,0.24)] xl:rounded-2xl xl:p-2">
      <div className="grid gap-2 lg:grid-cols-[repeat(4,minmax(0,1fr))_auto]">
        {searchItems.map((item) => {
          const Icon = item.icon;

          return (
            <div className="relative" key={item.label}>
              <button
                aria-expanded={openMenu === item.label}
                aria-haspopup={item.label === "Where to?" ? "dialog" : "menu"}
                className="flex min-h-[72px] w-full items-center gap-3 rounded-2xl px-4 text-left transition hover:bg-[#F8FAFC] xl:min-h-[54px] xl:gap-2 xl:rounded-xl xl:px-2.5 2xl:min-h-[60px] 2xl:px-3"
                onClick={() => {
                  if (item.label === "Where to?") openLocationMenu();
                  else setOpenMenu((current) => (current === item.label ? null : item.label));
                }}
                onFocus={item.label === "Where to?" ? openLocationMenu : undefined}
                ref={item.label === "Where to?" ? locationTriggerRef : undefined}
                type="button"
              >
                <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#F4F1FF] text-[#6C3DFF] xl:size-8 2xl:size-9">
                  <Icon className="size-5 xl:size-4" />
                </span>
                <span>
                  <span className="block text-xs font-semibold uppercase tracking-[0.08em] text-[#64748B] xl:text-[9px]">
                    {item.label}
                  </span>
                  <span className="mt-1 block text-[15px] font-bold text-[#0F172A] xl:text-[11px] 2xl:text-[13px]">
                    {item.value}
                  </span>
                </span>
              </button>

              {openMenu === item.label && item.label !== "Where to?" ? (
                <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-20 rounded-xl border border-[#E5E7EB] bg-white p-3 text-[#0F172A] shadow-[0_18px_45px_rgba(15,23,42,0.18)]">
                  {item.label === "Guests" ? (
                    <div className="flex items-center justify-between">
                      <span className="text-[13px] font-semibold">Guests</span>
                      <div className="flex items-center gap-3">
                        <button className="size-8 rounded-full border border-[#E5E7EB]" onClick={() => setGuests((current) => Math.max(1, current - 1))} type="button">-</button>
                        <strong>{guests}</strong>
                        <button aria-disabled={guests >= MAX_GUESTS} className="size-8 rounded-full border border-[#E5E7EB] disabled:cursor-not-allowed disabled:opacity-50" disabled={guests >= MAX_GUESTS} onClick={() => setGuests((current) => Math.min(MAX_GUESTS, current + 1))} type="button">+</button>
                      </div>
                    </div>
                  ) : (
                    <label className="block text-[13px] font-semibold text-[#64748B]">
                      {item.label}
                      <input
                        aria-label={item.label}
                        className="mt-2 block w-full rounded-lg border border-[#E5E7EB] bg-white px-3 py-2 text-[13px] font-semibold text-[#0F172A] outline-none focus:border-[#6C3DFF] focus:ring-2 focus:ring-[#6C3DFF]/20"
                        min={item.label === "Check-out" ? checkIn : undefined}
                        onInput={(event) => {
                          const value = event.currentTarget.value;
                          if (!value) return;
                          if (item.label === "Check-in") {
                            setCheckIn(value);
                            if (checkOut < value) setCheckOut(value);
                          } else {
                            setCheckOut(value < checkIn ? checkIn : value);
                          }
                        }}
                        type="date"
                        value={item.label === "Check-in" ? checkIn : checkOut}
                      />
                    </label>
                  )}
                </div>
              ) : null}
            </div>
          );
        })}

        <button
          className="inline-flex min-h-[72px] items-center justify-center gap-3 rounded-2xl bg-[linear-gradient(180deg,#7443FF_0%,#5E2FE5_100%)] px-8 text-base font-bold text-white shadow-[0_16px_30px_rgba(108,61,255,0.3)] transition hover:brightness-95 xl:min-h-[54px] xl:rounded-xl xl:px-5 xl:text-sm 2xl:min-h-[60px]"
          onClick={handleSearch}
          type="button"
        >
          <SearchIcon className="size-5" />
          Search
        </button>
      </div>
      {locationDropdown}
    </section>
  );
}
