"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowRightIcon } from "@/components/ui";
import { marketplaceImages } from "../assets";
import { DestinationCard } from "./DestinationCard";

const destinations = [
  {
    imagePosition: "object-[40%_48%]",
    imageSrc: marketplaceImages.hero,
    price: "From EGP 600 / night",
    title: "Madinaty",
  },
  {
    imagePosition: "object-[56%_48%]",
    imageSrc: marketplaceImages.modernApartment,
    price: "From EGP 1,000 / night",
    title: "New Capital",
  },
  {
    imagePosition: "object-[72%_48%]",
    imageSrc: marketplaceImages.servicedWorkspace,
    price: "From EGP 650 / night",
    title: "Noor City",
  },
];

export function PopularDestinationsSection() {
  const [offset, setOffset] = useState(0);
  const visibleDestinations = useMemo(
    () => [...destinations.slice(offset), ...destinations.slice(0, offset)],
    [offset],
  );

  return (
    <section className="bg-white px-5 py-9 sm:px-8 lg:px-12 xl:px-8 xl:py-8 2xl:px-9">
      <div className="mx-auto max-w-[1500px]">
        <div className="mb-6 flex items-center justify-between gap-6">
          <h2 className="text-[26px] font-bold leading-tight text-[#0F172A]">
            Popular destinations
          </h2>
          <div className="flex items-center gap-4">
            <Link
              className="text-[13px] font-semibold text-[#0F172A] underline decoration-[#0F172A]/40 underline-offset-4 transition hover:text-[#6C3DFF]"
              href="/search"
            >
              View all
            </Link>
            <div className="hidden items-center gap-2 sm:flex">
              <button
                aria-label="Previous destinations"
                className="flex size-10 items-center justify-center rounded-full border border-[#E5E7EB] bg-white text-[#0F172A] transition hover:border-[#D8CCFF] hover:text-[#6C3DFF]"
                onClick={() => setOffset((current) => (current + destinations.length - 1) % destinations.length)}
                type="button"
              >
                <ArrowRightIcon className="size-4 rotate-180" />
              </button>
              <button
                aria-label="Next destinations"
                className="flex size-10 items-center justify-center rounded-full border border-[#E5E7EB] bg-white text-[#0F172A] transition hover:border-[#D8CCFF] hover:text-[#6C3DFF]"
                onClick={() => setOffset((current) => (current + 1) % destinations.length)}
                type="button"
              >
                <ArrowRightIcon className="size-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {visibleDestinations.map((destination) => (
            <DestinationCard key={destination.title} {...destination} />
          ))}
        </div>
      </div>
    </section>
  );
}
