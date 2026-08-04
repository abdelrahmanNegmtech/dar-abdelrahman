"use client";

import { useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import {
  CalendarIcon,
  ChevronDownIcon,
  CloseIcon,
  HouseIcon,
  SearchIcon,
  UserIcon,
} from "../icons";

type FiltersModalProps = {
  onClose: () => void;
  open: boolean;
};

const propertyTypes = ["All types", "Apartments", "Studios", "Hotels", "Villas"];
const amenities = [
  "Wi-Fi",
  "Air conditioning",
  "Kitchen",
  "TV",
  "Washing machine",
  "Pool",
  "Free parking",
  "Elevator",
];

export function FiltersModal({ onClose, open }: FiltersModalProps) {
  const router = useRouter();
  const titleId = useId();
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const [selectedType, setSelectedType] = useState("All types");
  const [selectedAmenities, setSelectedAmenities] = useState<Set<string>>(new Set(["Wi-Fi"]));
  const [instantBook, setInstantBook] = useState(true);
  const [freeCancel, setFreeCancel] = useState(false);

  function toggleAmenity(amenity: string) {
    setSelectedAmenities((current) => {
      const next = new Set(current);
      if (next.has(amenity)) next.delete(amenity);
      else next.add(amenity);
      return next;
    });
  }

  function applyFilters() {
    const params = new URLSearchParams({
      type: selectedType,
      amenities: Array.from(selectedAmenities).join(","),
    });
    if (instantBook) params.set("instant", "true");
    if (freeCancel) params.set("freeCancellation", "true");
    router.push(`/search?${params.toString()}`);
    onClose();
  }

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose, open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[#0F172A]/45 backdrop-blur-sm">
      <div
        aria-labelledby={titleId}
        aria-modal="true"
        className="absolute inset-x-0 bottom-0 max-h-[92dvh] overflow-y-auto rounded-t-[28px] bg-white p-6 shadow-[0_-18px_60px_rgba(15,23,42,0.18)] lg:left-1/2 lg:top-1/2 lg:bottom-auto lg:max-h-[88dvh] lg:w-[700px] lg:-translate-x-1/2 lg:-translate-y-1/2 lg:rounded-2xl lg:p-9"
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
              <span className="text-[15px] text-[#64748B]">Where are you going?</span>
            </div>
            <p className="mt-4 flex flex-wrap gap-4 text-[14px]">
              <span className="text-[#64748B]">Popular:</span>
              {["Cairo", "Giza", "Alexandria", "Hurghada", "Sharm El Sheikh"].map((city) => (
                <button className="font-semibold text-[#5A30E8]" key={city} type="button">
                  {city}
                </button>
              ))}
            </p>
          </ModalSection>

          <div className="grid gap-5 md:grid-cols-2">
            <ModalSection title="Dates">
              <Picker icon={CalendarIcon} text="Check in - Check out" />
            </ModalSection>
            <ModalSection title="Guests">
              <Picker icon={UserIcon} text="Add guests" />
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
              {amenities.map((amenity) => (
                <button className={`h-9 rounded-lg border px-4 text-[13px] font-semibold ${selectedAmenities.has(amenity) ? "border-[#5A30E8] bg-[#F7F5FF] text-[#5A30E8]" : "border-[#E5E7EB]"}`} key={amenity} onClick={() => toggleAmenity(amenity)} type="button">
                  {amenity}
                </button>
              ))}
              <button className="inline-flex h-9 items-center gap-2 px-3 text-[13px] font-bold text-[#5A30E8]" type="button">
                Show more
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
            Show 1,234 places
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

function Picker({ icon: Icon, text }: { icon: typeof CalendarIcon; text: string }) {
  return (
    <button className="flex h-12 w-full items-center justify-between rounded-lg border border-[#E5E7EB] px-4 text-[15px] text-[#64748B]" type="button">
      <span className="inline-flex items-center gap-3">
        <Icon className="size-5" />
        {text}
      </span>
      <ChevronDownIcon className="size-4 -rotate-90" />
    </button>
  );
}
