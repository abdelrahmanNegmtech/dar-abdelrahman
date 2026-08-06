"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { MouseEvent } from "react";
import type { PublicPropertyCard } from "@/features/properties/data/public-property-queries";
import { useFavorites } from "../../favorites/useFavorites";
import { HeartIcon, ShieldIcon, StarIcon } from "../icons";

type SearchPropertyCardProps = {
  compact?: boolean;
  property: PublicPropertyCard;
};

export function SearchPropertyCard({ compact = false, property }: SearchPropertyCardProps) {
  const router = useRouter();
  const { isFavorite, toggleFavorite } = useFavorites();
  const saved = isFavorite(property.slug);

  function toggleSaved(event: MouseEvent<HTMLButtonElement>) {
    event.stopPropagation();
    toggleFavorite(property.slug);
  }

  return (
    <article
      className={`h-full cursor-pointer overflow-hidden rounded-xl border bg-white shadow-[0_10px_28px_rgba(15,23,42,0.05)] transition hover:border-[#C4B5FD] ${
        compact ? "grid grid-cols-[minmax(150px,190px)_minmax(0,1fr)] border-[#A78BFA]" : "flex flex-col border-[#E5E7EB]"
      }`}
      onClick={() => router.push(`/stays/${property.slug}`)}
    >
      <div className={`relative overflow-hidden ${compact ? "h-full min-h-[168px]" : "aspect-[16/9] min-h-[168px]"}`}>
        <Image
          alt={property.title}
          className={`absolute inset-0 size-full object-cover ${property.imagePosition}`}
          fill
          sizes="(min-width: 1280px) 28vw, 100vw"
          src={property.imageSrc}
        />
        <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-md bg-black/72 px-2 py-1 text-[11px] font-bold text-white">
          <ShieldIcon className="size-3 fill-[#5A30E8]" />
          Verified
        </span>
        <button
          aria-label={`Save ${property.title}`}
          aria-pressed={saved}
          className={`absolute right-3 top-3 drop-shadow ${saved ? "text-[#5A30E8]" : "text-white"}`}
          onClick={toggleSaved}
          type="button"
        >
          <HeartIcon className={`size-8 ${saved ? "fill-[#5A30E8]" : ""}`} />
        </button>
        <span className="absolute bottom-3 right-3 rounded-md bg-black/72 px-2 py-1 text-[12px] font-bold text-white">
          {property.photos}
        </span>
      </div>

      <div className="flex min-w-0 flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="line-clamp-2 text-[16px] font-bold leading-5 xl:text-[17px]">
              {property.title}
            </h2>
            <p className="mt-1 truncate text-[13px] text-[#64748B]">
              {property.area}, {property.location}
            </p>
          </div>
          <span className="inline-flex shrink-0 items-center gap-1 text-[13px] text-[#334155]">
            <StarIcon className="size-4 fill-[#F4B744] text-[#F4B744]" />
            {property.rating}
          </span>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          {property.tags.map((tag) => (
            <span className="rounded-md bg-[#F1F5F9] px-2 py-1 text-[11px] text-[#475569]" key={tag}>
              {tag}
            </span>
          ))}
        </div>

        <p className="mt-3 line-clamp-1 text-[13px] text-[#475569]">
          {property.description}
        </p>

        <div className="mt-auto flex items-center justify-between gap-4 pt-4">
          <p className="min-w-0 truncate text-[17px] font-bold">
            {property.price} <span className="font-normal text-[#475569]">/ night</span>
          </p>
          <button
            className="h-9 shrink-0 rounded-lg border border-[#A78BFA] px-4 text-[13px] font-bold text-[#5A30E8]"
            onClick={(event) => {
              event.stopPropagation();
              router.push(`/stays/${property.slug}`);
            }}
            type="button"
          >
            View details
          </button>
        </div>
      </div>
    </article>
  );
}
