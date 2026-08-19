"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  CalendarIcon,
  BuildingIcon,
  ChevronDownIcon,
  MapPinIcon,
  SearchIcon,
  SlidersIcon,
  UserIcon,
} from "../icons";

type SearchHeaderProps = {
  onOpenFilters: () => void;
};

const searchItems = [
  { icon: MapPinIcon, label: "Destination", value: "Madinaty" },
  { icon: CalendarIcon, label: "Check-in", value: "May 20, 2026" },
  { icon: CalendarIcon, label: "Check-out", value: "May 25, 2026" },
  { icon: UserIcon, label: "Guests", value: "2 guests" },
  { icon: BuildingIcon, label: "Type", value: "Studios & Apartments" },
];

function formatSearchDate(value: string | null, fallback: string) {
  if (!value) return fallback;
  const parsed = new Date(`${value}T00:00:00Z`);
  if (Number.isNaN(parsed.getTime())) return fallback;
  return new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
    year: "numeric",
  }).format(parsed);
}

export function SearchHeader({ onOpenFilters }: SearchHeaderProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const headerRef = useRef<HTMLElement>(null);
  const [openItem, setOpenItem] = useState<string | null>(null);
  const [dates, setDates] = useState({ checkIn: searchParams.get("checkIn") ?? "", checkOut: searchParams.get("checkOut") ?? "" });
  const [values, setValues] = useState<Record<string, string>>({
    "Check-in": formatSearchDate(searchParams.get("checkIn"), "May 20, 2026"),
    "Check-out": formatSearchDate(searchParams.get("checkOut"), "May 25, 2026"),
    Destination: searchParams.get("destination") ?? "Madinaty",
    Guests: searchParams.get("guests") ? `${searchParams.get("guests")} guests` : "2 guests",
    Type: searchParams.get("type") ?? "Studios & Apartments",
  });

  useEffect(() => {
    function dismissDropdown(event: PointerEvent) {
      if (!headerRef.current?.contains(event.target as Node)) setOpenItem(null);
    }

    function dismissWithEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setOpenItem(null);
    }

    document.addEventListener("pointerdown", dismissDropdown);
    document.addEventListener("keydown", dismissWithEscape);
    return () => {
      document.removeEventListener("pointerdown", dismissDropdown);
      document.removeEventListener("keydown", dismissWithEscape);
    };
  }, []);

  function updateSearch(label: string, value: string) {
    setValues((current) => ({ ...current, [label]: value }));
    setOpenItem(null);
  }

  function submitSearch() {
    const params = new URLSearchParams({
      destination: values.Destination,
      guests: values.Guests,
      type: values.Type,
    });
    const guestCount = Number.parseInt(values.Guests, 10);
    params.set("guests", String(Math.min(6, Math.max(1, guestCount || 1))));
    if (dates.checkIn) params.set("checkIn", dates.checkIn);
    if (dates.checkOut) params.set("checkOut", dates.checkOut);
    router.push(`/search?${params.toString()}`);
  }

  return (
    <section ref={headerRef} className="relative z-30 border-b border-[#E5E7EB] bg-white/95 backdrop-blur-xl">
      <div className="mx-auto max-w-[1760px] px-5 py-4 sm:px-8 lg:px-8 2xl:px-11">
        <div className="rounded-xl border border-[#E5E7EB] bg-white shadow-[0_18px_45px_rgba(15,23,42,0.05)]">
          <div className="grid items-center divide-y divide-[#E5E7EB] lg:grid-cols-[repeat(5,minmax(0,1fr))_154px_90px] lg:divide-x lg:divide-y-0">
            {searchItems.map((item) => {
              const Icon = item.icon;

              return (
                <div className="relative" key={item.label}>
                  <button
                    aria-expanded={openItem === item.label}
                    className="flex min-h-[82px] w-full items-center gap-4 px-6 text-left"
                    onClick={() => setOpenItem((current) => (current === item.label ? null : item.label))}
                    type="button"
                  >
                    <Icon className="size-6 shrink-0 text-[#0F172A]" />
                    <span className="min-w-0 flex-1">
                      <span className="block text-[12px] font-semibold text-[#64748B]">{item.label}</span>
                      <span className="mt-1 block truncate text-[15px] font-bold text-[#0F172A]">
                        {values[item.label] ?? item.value}
                      </span>
                    </span>
                    <ChevronDownIcon className="size-4 text-[#64748B]" />
                  </button>
                  {openItem === item.label ? (
                    <div className="absolute left-3 right-3 top-[calc(100%-8px)] z-40 rounded-xl border border-[#E5E7EB] bg-white p-3 shadow-[0_18px_45px_rgba(15,23,42,0.15)]">
                      {item.label === "Check-in" || item.label === "Check-out" ? (
                        <label className="block text-[12px] font-semibold text-[#475569]">
                          Select {item.label.toLowerCase()}
                          <input
                            className="mt-2 h-10 w-full rounded-lg border border-[#CBD5E1] px-3 text-[13px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6C3DFF]"
                            min={item.label === "Check-out" && dates.checkIn ? nextDate(dates.checkIn) : undefined}
                            onInput={(event) => {
                              const key = item.label === "Check-in" ? "checkIn" : "checkOut";
                              const value = event.currentTarget.value;
                              const nextDates = { ...dates, [key]: value };
                              if (key === "checkIn" && nextDates.checkOut && nextDates.checkOut <= value) nextDates.checkOut = "";
                              setDates(nextDates);
                              setValues((current) => ({ ...current, [item.label]: formatSearchDate(value, current[item.label]), ...(key === "checkIn" && !nextDates.checkOut ? { "Check-out": "Add dates" } : {}) }));
                            }}
                            type="date"
                            value={item.label === "Check-in" ? dates.checkIn : dates.checkOut}
                          />
                        </label>
                      ) : (item.label === "Destination" ? ["Madinaty", "New Capital", "Noor City", "New Cairo", "Cairo East"] : item.label === "Guests" ? ["1 guest", "2 guests", "3 guests", "4 guests", "5 guests", "6 guests"] : ["Studios & Apartments", "Hotels"]).map((option) => (
                        <button className="block w-full rounded-lg px-3 py-2 text-left text-[13px] font-semibold hover:bg-[#F7F5FF]" key={option} onClick={() => updateSearch(item.label, option)} type="button">
                          {option}
                        </button>
                      ))}
                    </div>
                  ) : null}
                </div>
              );
            })}

            <button
              className="m-3 inline-flex h-[56px] items-center justify-center rounded-lg bg-[linear-gradient(180deg,#6C3DFF_0%,#5527D8_100%)] text-[17px] font-bold text-white shadow-[0_14px_28px_rgba(108,61,255,0.28)]"
              onClick={submitSearch}
              type="button"
            >
              <SearchIcon className="mr-2 hidden size-5 lg:block" />
              Search
            </button>

            <button
              className="hidden text-[15px] font-semibold text-[#5A30E8] underline underline-offset-4 lg:block"
              onClick={() => {
                setValues({
                  "Check-in": "May 20, 2026",
                  "Check-out": "May 25, 2026",
                  Destination: "Madinaty",
                  Guests: "2 guests",
                  Type: "Studios & Apartments",
                });
                setDates({ checkIn: "", checkOut: "" });
                router.push("/search");
              }}
              type="button"
            >
              Reset
            </button>
          </div>
          <button
            className="m-3 inline-flex h-[48px] items-center justify-center gap-2 rounded-lg border border-[#E5E7EB] text-[14px] font-bold text-[#0F172A] lg:hidden"
            onClick={onOpenFilters}
            type="button"
          >
            <SlidersIcon className="size-5" />
            Filters
          </button>
        </div>
      </div>
    </section>
  );
}

function nextDate(value: string) {
  const date = new Date(`${value}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + 1);
  return date.toISOString().slice(0, 10);
}
