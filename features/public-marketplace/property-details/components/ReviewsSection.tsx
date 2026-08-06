"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { marketplaceImages } from "../../assets";
import type { PublicPropertyDetail } from "@/features/properties/data/public-property-queries";
import { ArrowRightIcon, StarIcon } from "../icons";

type ReviewsSectionProps = {
  property: PublicPropertyDetail;
};

export function ReviewsSection({ property }: ReviewsSectionProps) {
  const [offset, setOffset] = useState(0);
  const visibleReviews = useMemo(
    () => [...property.reviews.slice(offset), ...property.reviews.slice(0, offset)],
    [offset, property.reviews],
  );

  if (!property.reviews.length) {
    return (
      <section className="mt-5">
        <h2 className="mb-3 text-[18px] font-bold">Guest reviews</h2>
        <article className="rounded-xl border border-[#E5E7EB] bg-white p-5 text-[14px] text-[#64748B] shadow-[0_10px_26px_rgba(15,23,42,0.04)]">
          No public reviews are available for this stay yet.
        </article>
      </section>
    );
  }

  return (
    <section className="mt-5">
      <h2 className="mb-3 text-[18px] font-bold">Guest reviews</h2>
      <div className="grid gap-4 xl:grid-cols-[160px_300px_minmax(0,1fr)]">
        <article className="rounded-xl border border-[#E5E7EB] bg-white p-5 text-center shadow-[0_10px_26px_rgba(15,23,42,0.04)]">
          <p className="text-[42px] font-bold leading-none">{property.rating.toFixed(1)}</p>
          <div className="mt-3 flex justify-center gap-1 text-[#F59E0B]">
            {Array.from({ length: 5 }).map((_, index) => (
              <StarIcon className="size-4 fill-current" key={index} />
            ))}
          </div>
          <p className="mt-2 text-[13px] text-[#0F172A]">{property.reviewsCount} reviews</p>
        </article>

        <article className="rounded-xl border border-[#E5E7EB] bg-white p-5 shadow-[0_10px_26px_rgba(15,23,42,0.04)]">
          <div className="space-y-2">
            {property.ratingBreakdown.map(([label, value, width]) => (
              <div className="grid grid-cols-[90px_minmax(0,1fr)_28px] items-center gap-3 text-[12px]" key={label}>
                <span>{label}</span>
                <span className="h-1.5 rounded-full bg-[#E9E5FF]">
                  <span className={`block h-full rounded-full bg-[#5A30E8] ${width}`} />
                </span>
                <span>{value}</span>
              </div>
            ))}
          </div>
        </article>

        <div className="grid gap-4 md:grid-cols-2">
          {visibleReviews.map((review, index) => (
            <article className="rounded-xl border border-[#E5E7EB] bg-white p-5 shadow-[0_10px_26px_rgba(15,23,42,0.04)]" key={review.author}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <Image
                    alt={`${review.author} avatar`}
                    className="size-12 rounded-full object-cover"
                    height={48}
                    src={index === 0 ? marketplaceImages.studio : marketplaceImages.modernApartment}
                    width={48}
                  />
                  <span>
                    <strong className="block text-[14px]">{review.author}</strong>
                    <span className="text-[12px] text-[#64748B]">{review.date}</span>
                  </span>
                </div>
                <span className="flex gap-0.5 text-[#F59E0B]">
                  {Array.from({ length: Math.max(1, Math.round(review.rating)) }).map((_, starIndex) => (
                    <StarIcon className="size-3.5 fill-current" key={starIndex} />
                  ))}
                </span>
              </div>
              <p className="mt-4 text-[13px] leading-5 text-[#334155]">{review.body}</p>
              {index === property.reviews.length - 1 ? (
                <div className="mt-3 flex justify-end gap-2">
                  <button className="flex size-8 items-center justify-center rounded-full border border-[#E5E7EB]" onClick={() => setOffset((current) => (current + property.reviews.length - 1) % property.reviews.length)} type="button">
                    <ArrowRightIcon className="size-4 rotate-180" />
                  </button>
                  <button className="flex size-8 items-center justify-center rounded-full border border-[#E5E7EB]" onClick={() => setOffset((current) => (current + 1) % property.reviews.length)} type="button">
                    <ArrowRightIcon className="size-4" />
                  </button>
                </div>
              ) : null}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
