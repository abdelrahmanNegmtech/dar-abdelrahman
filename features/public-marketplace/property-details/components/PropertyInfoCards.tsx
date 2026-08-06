"use client";

import { useState } from "react";
import type { PublicPropertyDetail } from "@/features/properties/data/public-property-queries";
import { AmenitiesGrid } from "./AmenitiesGrid";
import { BedIcon, CalendarIcon, CheckIcon, ShieldIcon } from "../icons";

type PropertyInfoCardsProps = {
  property: PublicPropertyDetail;
};

const HOUSE_RULES = [
  "Check-in after 2:00 PM",
  "Check-out before 11:00 AM",
  "No smoking",
  "No parties",
  "ID required",
];

export function PropertyInfoCards({ property }: PropertyInfoCardsProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <section className="mt-4 grid gap-3 lg:grid-cols-2">
      <InfoCard className="lg:min-h-[124px]" title="About this stay">
        <p className="text-[14px] leading-6 text-[#334155]">
          {property.about}
          {expanded ? " Public photo delivery is currently using DAR fallback imagery while the local seed has no accessible binary objects for signed delivery." : ""}
        </p>
        <button className="mt-3 text-[13px] font-bold text-[#5A30E8]" onClick={() => setExpanded((current) => !current)} type="button">
          {expanded ? "Show less" : "Read more"}
        </button>
      </InfoCard>

      <InfoCard className="lg:min-h-[124px]" title="What this place offers">
        <AmenitiesGrid />
      </InfoCard>

      <InfoCard title="Sleeping arrangement">
        <div className="flex items-start gap-4">
          <BedIcon className="size-8" />
          <div>
            <h3 className="text-[14px] font-bold">
              {property.bedroomsCount === 1 ? "Bedroom 1" : `${property.bedroomsCount} bedrooms`}
            </h3>
            <p className="mt-1 text-[13px] text-[#475569]">
              {property.bedsCount} {property.bedsCount === 1 ? "bed" : "beds"}
            </p>
          </div>
        </div>
      </InfoCard>

      <InfoCard title="House rules">
        <div className="flex items-start gap-4">
          <ShieldIcon className="size-8" />
          <ul className="space-y-1 text-[13px] text-[#334155]">
            {HOUSE_RULES.map((rule) => (
              <li className="flex items-center gap-2" key={rule}>
                <CheckIcon className="size-4 text-[#16A34A]" />
                {rule}
              </li>
            ))}
          </ul>
        </div>
      </InfoCard>

      <InfoCard title="Cancellation policy">
        <div className="flex items-start gap-4">
          <CalendarIcon className="size-8" />
          <div>
            <h3 className="text-[14px] font-bold">Flexible cancellation.</h3>
            <p className="mt-2 text-[13px] leading-5 text-[#334155]">
              Cancel up to 24 hours before check-in for a full refund.
            </p>
          </div>
        </div>
      </InfoCard>
    </section>
  );
}

function InfoCard({
  children,
  className = "",
  title,
}: {
  children: React.ReactNode;
  className?: string;
  title: string;
}) {
  return (
    <article className={`rounded-xl border border-[#E5E7EB] bg-white p-5 shadow-[0_10px_26px_rgba(15,23,42,0.04)] ${className}`}>
      <h2 className="mb-4 text-[16px] font-bold">{title}</h2>
      {children}
    </article>
  );
}
