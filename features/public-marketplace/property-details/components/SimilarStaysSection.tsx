"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { similarStays } from "../data";
import { HeartIcon, StarIcon } from "../icons";

type SimilarStaysSectionProps = {
  mobile?: boolean;
};

export function SimilarStaysSection({ mobile = false }: SimilarStaysSectionProps) {
  const [saved, setSaved] = useState<Set<string>>(new Set());
  function toggleSaved(title: string) {
    setSaved((current) => {
      const next = new Set(current);
      if (next.has(title)) next.delete(title);
      else next.add(title);
      return next;
    });
  }

  return (
    <section className={mobile ? "mt-8" : "mt-8"}>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-[18px] font-bold">Similar stays in Madinaty</h2>
        <Link className="text-[14px] font-bold text-[#5A30E8]" href="/search">
          View all
        </Link>
      </div>

      <div
        className={
          mobile
            ? "flex snap-x gap-4 overflow-x-auto pb-2"
            : "grid gap-4"
        }
      >
        {similarStays.map(({ imagePosition, imageSrc, location, price, rating, title }) => (
          <Link
            className={`overflow-hidden rounded-xl border border-[#E5E7EB] bg-white shadow-[0_10px_26px_rgba(15,23,42,0.04)] ${
              mobile ? "w-[260px] shrink-0 snap-start" : "grid grid-cols-[150px_minmax(0,1fr)]"
            }`}
            href="/stays/luxury-studio-in-madinaty"
            key={title}
          >
            <div className={mobile ? "relative h-[130px]" : "relative min-h-[132px]"}>
              <Image
                alt={title}
                className={`absolute inset-0 size-full object-cover ${imagePosition}`}
                fill
                sizes="300px"
                src={imageSrc}
              />
              <button aria-label={`${saved.has(title) ? "Remove" : "Save"} ${title}`} className="absolute right-3 top-3 text-white drop-shadow" onClick={(event) => { event.preventDefault(); toggleSaved(title); }} type="button">
                <HeartIcon className={`size-7 ${saved.has(title) ? "fill-[#5A30E8] text-[#5A30E8]" : ""}`} />
              </button>
            </div>
            <div className="p-3">
              <h3 className="line-clamp-2 min-h-[38px] text-[13px] font-bold">{title}</h3>
              <p className="mt-1 text-[12px] text-[#64748B]">{location}</p>
              <p className="mt-2 flex items-center gap-1 text-[12px] text-[#475569]">
                <StarIcon className="size-3.5 fill-[#F4B744] text-[#F4B744]" />
                {rating}
              </p>
              <p className="mt-2 text-[14px] font-bold">{price}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
