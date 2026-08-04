"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { MouseEvent } from "react";
import { HeartIcon, StarIcon } from "@/components/ui";
import { useFavorites } from "../favorites/useFavorites";

type PropertyStayCardProps = {
  imagePosition: string;
  imageSrc: string;
  location: string;
  price: string;
  rating: string;
  slug?: string;
  title: string;
};

export function PropertyStayCard({
  imagePosition,
  imageSrc,
  location,
  price,
  rating,
  slug = "luxury-studio-in-madinaty",
  title,
}: PropertyStayCardProps) {
  const router = useRouter();
  const { isFavorite, toggleFavorite } = useFavorites();
  const saved = isFavorite(slug);

  function toggleSaved(event: MouseEvent<HTMLButtonElement>) {
    event.stopPropagation();
    toggleFavorite(slug);
  }

  return (
    <article
      className="cursor-pointer overflow-hidden rounded-xl border border-[#E5E7EB] bg-white shadow-[0_12px_32px_rgba(15,23,42,0.07)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_18px_42px_rgba(15,23,42,0.1)]"
      onClick={() => router.push(`/stays/${slug}`)}
    >
      <div className="relative h-[178px] overflow-hidden">
        <Image
          alt={title}
          className={`absolute inset-0 size-full object-cover ${imagePosition}`}
          fill
          sizes="(min-width: 1280px) 25vw, (min-width: 768px) 50vw, 100vw"
          src={imageSrc}
        />
        <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-md bg-white px-2.5 py-1 text-[11px] font-bold text-[#0F172A] shadow-[0_8px_18px_rgba(15,23,42,0.16)]">
          <span className="size-2 rounded-full bg-[#F4B744]" />
          Superhost
        </span>
        <button
          aria-label={`${saved ? "Unsave" : "Save"} ${title}`}
          aria-pressed={saved}
          className={`absolute right-3 top-3 flex size-9 items-center justify-center rounded-full backdrop-blur-md transition ${saved ? "bg-white text-[#5A30E8]" : "bg-white/18 text-white hover:bg-white/28"}`}
          onClick={toggleSaved}
          type="button"
        >
          <HeartIcon className={`size-5 ${saved ? "fill-[#5A30E8]" : ""}`} />
        </button>
      </div>

      <div className="p-4">
        <h3 className="line-clamp-1 text-[15px] font-bold text-[#0F172A]">
          {title}
        </h3>
        <div className="mt-2 flex items-center justify-between gap-3 text-[13px] text-[#64748B]">
          <span>{location}</span>
          <span className="inline-flex items-center gap-1 text-[#334155]">
            <StarIcon className="size-3.5 fill-[#F4B744] text-[#F4B744]" />
            {rating}
          </span>
        </div>
        <p className="mt-4 text-[16px] font-bold text-[#0F172A]">{price}</p>
      </div>
    </article>
  );
}
