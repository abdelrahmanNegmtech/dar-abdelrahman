"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowRightIcon } from "@/components/ui";
import { properties } from "../search/data";
import { PropertyStayCard } from "./PropertyStayCard";

const apartmentStays = properties.filter((property) => property.slug !== "premium-hotel-room");
const hotelStays = properties.filter((property) => property.slug === "premium-hotel-room");

export function PopularStaysSection() {
  const [activeTab, setActiveTab] = useState("Studios & Apartments");
  const [offset, setOffset] = useState(0);
  const visibleStays = useMemo(() => {
    const stays = activeTab === "Hotels" ? hotelStays : apartmentStays;
    const rotated = [...stays.slice(offset), ...stays.slice(0, offset)];
    return rotated.slice(0, 4);
  }, [activeTab, offset]);

  const activeStays = activeTab === "Hotels" ? hotelStays : apartmentStays;

  return (
    <section className="bg-white px-5 pb-12 sm:px-8 lg:px-12 xl:px-8 xl:pb-10 2xl:px-9">
      <div className="mx-auto max-w-[1500px]">
        <div className="mb-6 flex items-start justify-between gap-6">
          <div>
            <h2 className="text-[26px] font-bold leading-tight text-[#0F172A]">Popular stays</h2>
            <div className="mt-5 flex items-center gap-10 text-[14px] font-semibold">
              <button className={`${activeTab === "Studios & Apartments" ? "border-b-2 border-[#6C3DFF] text-[#5E2FE5]" : "text-[#64748B]"} pb-2 transition hover:text-[#0F172A]`} onClick={() => { setActiveTab("Studios & Apartments"); setOffset(0); }} type="button">
                Studios & Apartments
              </button>
              <button className={`${activeTab === "Hotels" ? "border-b-2 border-[#6C3DFF] text-[#5E2FE5]" : "text-[#64748B]"} pb-2 transition hover:text-[#0F172A]`} onClick={() => { setActiveTab("Hotels"); setOffset(0); }} type="button">
                Hotels
              </button>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Link
              className="mt-1 text-[13px] font-semibold text-[#0F172A] underline decoration-[#0F172A]/40 underline-offset-4 transition hover:text-[#6C3DFF]"
              href={activeTab === "Hotels" ? "/search?type=Hotels" : "/search?type=Studios+%26+Apartments"}
            >
              View all
            </Link>
            <div className="hidden items-center gap-2 sm:flex">
              <button
                aria-label="Previous stays"
                className="flex size-10 items-center justify-center rounded-full border border-[#E5E7EB] bg-white text-[#0F172A] transition hover:border-[#D8CCFF] hover:text-[#6C3DFF]"
                onClick={() => setOffset((current) => (current + activeStays.length - 1) % activeStays.length)}
                type="button"
              >
                <ArrowRightIcon className="size-4 rotate-180" />
              </button>
              <button
                aria-label="Next stays"
                className="flex size-10 items-center justify-center rounded-full border border-[#E5E7EB] bg-white text-[#0F172A] transition hover:border-[#D8CCFF] hover:text-[#6C3DFF]"
                onClick={() => setOffset((current) => (current + 1) % activeStays.length)}
                type="button"
              >
                <ArrowRightIcon className="size-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {visibleStays.map((stay) => (
            <PropertyStayCard
              imagePosition={stay.imagePosition}
              imageSrc={stay.imageSrc}
              key={stay.slug}
              location={`${stay.location} · ${stay.area}`}
              price={`${stay.price} / night`}
              rating={stay.rating}
              slug={stay.slug}
              title={stay.title}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
