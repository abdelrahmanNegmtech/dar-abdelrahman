"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
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

export function SearchHeader({ onOpenFilters }: SearchHeaderProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [openItem, setOpenItem] = useState<string | null>(null);
  const [values, setValues] = useState<Record<string, string>>({
    "Check-in": "May 20, 2026",
    "Check-out": "May 25, 2026",
    Destination: searchParams.get("destination") ?? "Madinaty",
    Guests: searchParams.get("guests") ? `${searchParams.get("guests")} guests` : "2 guests",
    Type: searchParams.get("type") ?? "Studios & Apartments",
  });

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
    router.push(`/search?${params.toString()}`);
  }

  return (
    <section className="border-b border-[#E5E7EB] bg-white/95 backdrop-blur-xl">
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
                      {(item.label === "Destination" ? ["Madinaty", "New Capital", "Noor City"] : item.label === "Guests" ? ["1 guest", "2 guests", "3 guests", "4 guests"] : item.label === "Type" ? ["Studios & Apartments", "Hotels", "Villas"] : ["May 20, 2026", "May 25, 2026", "Flexible dates"]).map((option) => (
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
