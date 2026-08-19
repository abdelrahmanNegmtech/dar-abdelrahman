"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import {
  ChevronDownIcon,
  CloseIcon,
  HouseIcon,
  SearchIcon,
  UserIcon,
} from "../icons";
import { properties } from "../data";
import { filterAndSortProperties } from "../searchPipeline";

type FiltersModalProps = {
  onClose: () => void;
  open: boolean;
};

const propertyTypes = ["All types", "Studios & Apartments", "Hotels"];
const amenities = ["Wi-Fi", "Air conditioning", "Kitchen", "Parking", "Pool", "Workspace"];

export function FiltersModal({ onClose, open }: FiltersModalProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const titleId = useId();
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);
  const [destination, setDestination] = useState(searchParams.get("destination") ?? "Madinaty");
  const [checkIn, setCheckIn] = useState(searchParams.get("checkIn") ?? "");
  const [checkOut, setCheckOut] = useState(searchParams.get("checkOut") ?? "");
  const [guests, setGuests] = useState(searchParams.get("guests") ?? "2");
  const [selectedType, setSelectedType] = useState(searchParams.get("type") ?? "Studios & Apartments");
  const [selectedAmenities, setSelectedAmenities] = useState<Set<string>>(new Set((searchParams.get("amenities") ?? "").split(",").filter(Boolean)));
  const [showAllAmenities, setShowAllAmenities] = useState(() => amenities.slice(4).some((amenity) => selectedAmenities.has(amenity)));
  const [instantBook, setInstantBook] = useState(searchParams.get("instant") === "true");
  const [freeCancel, setFreeCancel] = useState(searchParams.get("freeCancellation") === "true");
  const count = useMemo(() => {
    const params = buildParams(searchParams, { checkIn, checkOut, destination, freeCancel, guests, instantBook, selectedAmenities, selectedType });
    return filterAndSortProperties(properties, params).length;
  }, [checkIn, checkOut, destination, freeCancel, guests, instantBook, searchParams, selectedAmenities, selectedType]);

  function toggleAmenity(amenity: string) {
    setSelectedAmenities((current) => {
      const next = new Set(current);
      if (next.has(amenity)) next.delete(amenity);
      else next.add(amenity);
      return next;
    });
  }

  function applyFilters() {
    const params = buildParams(searchParams, { checkIn, checkOut, destination, freeCancel, guests, instantBook, selectedAmenities, selectedType });
    params.delete("page");
    router.push(`/search?${params.toString()}`);
    onClose();
  }

  useEffect(() => {
    if (!open) return;
    returnFocusRef.current = document.activeElement as HTMLElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
      if (event.key !== "Tab") return;

      const focusable = dialogRef.current?.querySelectorAll<HTMLElement>(
        'button:not([disabled]), input:not([disabled]), select:not([disabled]), [href], [tabindex]:not([tabindex="-1"])',
      );
      if (!focusable?.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
      returnFocusRef.current?.focus();
    };
  }, [onClose, open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[#0F172A]/45 backdrop-blur-sm" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <div
        aria-labelledby={titleId}
        aria-modal="true"
        className="absolute inset-x-0 bottom-0 max-h-[92dvh] overflow-y-auto rounded-t-[28px] bg-white p-6 shadow-[0_-18px_60px_rgba(15,23,42,0.18)] lg:left-1/2 lg:top-1/2 lg:bottom-auto lg:max-h-[88dvh] lg:w-[700px] lg:-translate-x-1/2 lg:-translate-y-1/2 lg:rounded-2xl lg:p-9"
        ref={dialogRef}
        role="dialog"
      >
        <div className="mx-auto mb-5 h-1 w-12 rounded-full bg-[#CBD5E1] lg:hidden" />
        <div className="flex items-center justify-between">
          <h2 className="text-[26px] font-bold" id={titleId}>Search filters</h2>
          <button
            aria-label="Close search filters"
            className="flex size-10 items-center justify-center rounded-full hover:bg-[#F8FAFC]"
            onClick={onClose}
            ref={closeButtonRef}
            type="button"
          >
            <CloseIcon className="size-6" />
          </button>
        </div>

        <div className="mt-6 space-y-6 pb-24">
          <ModalSection title="Location">
            <div className="flex h-[52px] items-center gap-3 rounded-lg border border-[#E5E7EB] px-4">
              <SearchIcon className="size-5 text-[#64748B]" />
              <select aria-label="Destination" className="min-w-0 flex-1 bg-transparent text-[15px] outline-none" onChange={(event) => setDestination(event.target.value)} value={destination}>
                {["Madinaty", "New Capital", "Noor City", "New Cairo", "Cairo East"].map((city) => <option key={city}>{city}</option>)}
              </select>
            </div>
            <p className="mt-4 flex flex-wrap gap-4 text-[14px]">
              <span className="text-[#64748B]">Popular:</span>
              {["Madinaty", "New Capital", "Noor City"].map((city) => (
                <button className="font-semibold text-[#5A30E8]" key={city} onClick={() => setDestination(city)} type="button">
                  {city}
                </button>
              ))}
            </p>
          </ModalSection>

          <div className="grid gap-5 md:grid-cols-2">
            <ModalSection title="Dates">
              <div className="grid grid-cols-2 gap-2"><input aria-label="Check in" className="h-12 min-w-0 rounded-lg border border-[#E5E7EB] px-3 text-[13px]" onInput={(event) => { setCheckIn(event.currentTarget.value); if (checkOut && checkOut <= event.currentTarget.value) setCheckOut(""); }} type="date" value={checkIn} /><input aria-label="Check out" className="h-12 min-w-0 rounded-lg border border-[#E5E7EB] px-3 text-[13px]" min={checkIn ? nextDate(checkIn) : undefined} onInput={(event) => setCheckOut(event.currentTarget.value)} type="date" value={checkOut} /></div>
            </ModalSection>
            <ModalSection title="Guests">
              <label className="flex h-12 items-center gap-3 rounded-lg border border-[#E5E7EB] px-4"><UserIcon className="size-5" /><select aria-label="Guests" className="min-w-0 flex-1 bg-transparent text-[15px]" onChange={(event) => setGuests(event.target.value)} value={guests}>{[1,2,3,4,5,6].map((value) => <option key={value} value={value}>{value} {value === 1 ? "guest" : "guests"}</option>)}</select></label>
            </ModalSection>
          </div>

          <ModalSection title="Property type">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
              {propertyTypes.map((type) => (
                <button
                  className={`flex h-[92px] flex-col items-center justify-center gap-2 rounded-xl border text-[13px] font-semibold ${
                    selectedType === type
                      ? "border-[#6C3DFF] bg-[#FAF8FF] text-[#5A30E8]"
                      : "border-[#E5E7EB] bg-white text-[#0F172A]"
                  }`}
                  key={type}
                  onClick={() => setSelectedType(type)}
                  type="button"
                >
                  <HouseIcon className="size-6" />
                  {type}
                </button>
              ))}
            </div>
          </ModalSection>

          <ModalSection title="Price range (per night)">
            <div className="relative mt-5 h-2 rounded-full bg-[#E9E5FF]">
              <div className="absolute inset-y-0 left-[1%] right-[30%] rounded-full bg-[#5A30E8]" />
              <span className="absolute left-0 top-1/2 size-5 -translate-y-1/2 rounded-full border-2 border-[#5A30E8] bg-white" />
              <span className="absolute right-[29%] top-1/2 size-5 -translate-y-1/2 rounded-full border-2 border-[#5A30E8] bg-white" />
            </div>
            <div className="mt-4 flex justify-between text-[14px] text-[#334155]">
              <span>EGP 250</span>
              <span>EGP 5,000+</span>
            </div>
          </ModalSection>

          <ModalSection title="Amenities">
            <div className="flex flex-wrap gap-3">
              {amenities.slice(0, showAllAmenities ? undefined : 4).map((amenity) => (
                <button className={`h-9 rounded-lg border px-4 text-[13px] font-semibold ${selectedAmenities.has(amenity) ? "border-[#5A30E8] bg-[#F7F5FF] text-[#5A30E8]" : "border-[#E5E7EB]"}`} key={amenity} onClick={() => toggleAmenity(amenity)} type="button">
                  {amenity}
                </button>
              ))}
              <button className="inline-flex h-9 items-center gap-2 px-3 text-[13px] font-bold text-[#5A30E8]" onClick={() => setShowAllAmenities((current) => !current)} type="button">
                {showAllAmenities ? "Show less" : "Show more"}
                <ChevronDownIcon className="size-4" />
              </button>
            </div>
          </ModalSection>

          <ModalSection title="More options">
            <div className="grid gap-3 md:grid-cols-2">
              {["Instant book", "Free cancellation"].map((option, index) => {
                const active = index === 0 ? instantBook : freeCancel;
                return (
                <div className="flex items-center justify-between rounded-lg border border-[#E5E7EB] p-4" key={option}>
                  <span>
                    <strong className="block text-[14px]">{option}</strong>
                    <span className="text-[12px] text-[#64748B]">
                      {index === 0 ? "Book without waiting for host" : "Cancel without fees"}
                    </span>
                  </span>
                  <button aria-pressed={active} className={`h-6 w-11 rounded-full p-1 ${active ? "bg-[#5A30E8]" : "bg-[#CBD5E1]"}`} onClick={() => (index === 0 ? setInstantBook((current) => !current) : setFreeCancel((current) => !current))} type="button">
                    <span className={`block size-4 rounded-full bg-white ${active ? "ml-auto" : ""}`} />
                  </button>
                </div>
              )})}
            </div>
          </ModalSection>
        </div>

        <div className="sticky bottom-0 mt-7 grid grid-cols-[150px_minmax(0,1fr)] gap-4 bg-white pt-4">
          <button className="h-12 rounded-lg border border-[#E5E7EB] font-bold" onClick={() => { setSelectedType("All types"); setSelectedAmenities(new Set()); setInstantBook(false); setFreeCancel(false); }} type="button">
            Clear all
          </button>
          <button
            className="h-12 rounded-lg bg-[linear-gradient(180deg,#6C3DFF_0%,#5527D8_100%)] font-bold text-white"
            onClick={applyFilters}
            type="button"
          >
            Show {count} {count === 1 ? "place" : "places"}
          </button>
        </div>
      </div>
    </div>
  );
}

function ModalSection({ children, title }: { children: React.ReactNode; title: string }) {
  return (
    <section className="border-b border-[#E5E7EB] pb-6 last:border-b-0">
      <h3 className="mb-3 text-[15px] font-bold">{title}</h3>
      {children}
    </section>
  );
}

function nextDate(value: string) {
  const date = new Date(`${value}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + 1);
  return date.toISOString().slice(0, 10);
}

function buildParams(
  current: Pick<URLSearchParams, "toString">,
  values: { checkIn: string; checkOut: string; destination: string; freeCancel: boolean; guests: string; instantBook: boolean; selectedAmenities: Set<string>; selectedType: string },
) {
  const params = new URLSearchParams(current.toString());
  params.set("destination", values.destination);
  params.set("guests", values.guests);
  if (values.checkIn) params.set("checkIn", values.checkIn); else params.delete("checkIn");
  if (values.checkOut) params.set("checkOut", values.checkOut); else params.delete("checkOut");
  if (values.selectedType === "All types") params.set("type", "All types"); else params.set("type", values.selectedType);
  if (values.selectedAmenities.size) params.set("amenities", Array.from(values.selectedAmenities).join(",")); else params.delete("amenities");
  if (values.instantBook) params.set("instant", "true"); else params.delete("instant");
  if (values.freeCancel) params.set("freeCancellation", "true"); else params.delete("freeCancellation");
  return params;
}
