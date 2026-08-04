"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  CalendarIcon,
  GlobeIcon,
  SearchIcon,
  UserIcon,
} from "@/components/ui";

const suggestions = ["Madinaty", "New Capital", "Noor City", "New Cairo"];

export function HeroSearchCard() {
  const router = useRouter();
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [destination, setDestination] = useState("Any location");
  const [guests, setGuests] = useState(2);

  const searchItems = [
    { icon: GlobeIcon, label: "Where to?", value: destination },
    { icon: CalendarIcon, label: "Check-in", value: "May 20, 2026" },
    { icon: CalendarIcon, label: "Check-out", value: "May 26, 2026" },
    { icon: UserIcon, label: "Guests", value: `${guests} guests` },
  ];

  function handleSearch() {
    const params = new URLSearchParams({
      destination,
      guests: String(guests),
    });
    router.push(`/search?${params.toString()}`);
  }

  return (
    <section className="rounded-[24px] border border-white/26 bg-white p-3 shadow-[0_28px_80px_rgba(2,6,23,0.24)] xl:rounded-2xl xl:p-2">
      <div className="grid gap-2 lg:grid-cols-[repeat(4,minmax(0,1fr))_auto]">
        {searchItems.map((item) => {
          const Icon = item.icon;

          return (
            <div className="relative" key={item.label}>
              <button
                aria-expanded={openMenu === item.label}
                className="flex min-h-[72px] w-full items-center gap-3 rounded-2xl px-4 text-left transition hover:bg-[#F8FAFC] xl:min-h-[54px] xl:gap-2 xl:rounded-xl xl:px-2.5 2xl:min-h-[60px] 2xl:px-3"
                onClick={() => setOpenMenu((current) => (current === item.label ? null : item.label))}
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

              {openMenu === item.label ? (
                <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-20 rounded-xl border border-[#E5E7EB] bg-white p-3 text-[#0F172A] shadow-[0_18px_45px_rgba(15,23,42,0.18)]">
                  {item.label === "Where to?" ? (
                    <div className="grid gap-1">
                      {suggestions.map((city) => (
                        <button className="rounded-lg px-3 py-2 text-left text-[13px] font-semibold hover:bg-[#F7F5FF]" key={city} onClick={() => { setDestination(city); setOpenMenu(null); }} type="button">
                          {city}
                        </button>
                      ))}
                    </div>
                  ) : item.label === "Guests" ? (
                    <div className="flex items-center justify-between">
                      <span className="text-[13px] font-semibold">Guests</span>
                      <div className="flex items-center gap-3">
                        <button className="size-8 rounded-full border border-[#E5E7EB]" onClick={() => setGuests((current) => Math.max(1, current - 1))} type="button">-</button>
                        <strong>{guests}</strong>
                        <button className="size-8 rounded-full border border-[#E5E7EB]" onClick={() => setGuests((current) => current + 1)} type="button">+</button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-[13px] font-semibold text-[#64748B]">Date picker preview. Full calendar comes next.</p>
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
    </section>
  );
}
