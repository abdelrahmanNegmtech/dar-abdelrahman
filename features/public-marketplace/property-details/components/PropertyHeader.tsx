"use client";

import Link from "next/link";
import {
  ChevronDownIcon,
  HeartIcon,
  MapPinIcon,
  ShareIcon,
  ShieldIcon,
  StarIcon,
} from "../icons";
import { marketplaceImages } from "../../assets";
import { ShareModal, useShareModal } from "../../share";
import { useFavorites } from "../../favorites/useFavorites";

const PROPERTY_SLUG = "luxury-studio-in-madinaty";

export function PropertyHeader() {
  const { isFavorite, toggleFavorite } = useFavorites();
  const saved = isFavorite(PROPERTY_SLUG);
  const { closeShare, open, openShare, state, triggerRef } = useShareModal();

  return (
    <section className="mb-4">
      <nav className="mb-3 flex flex-wrap items-center gap-3 text-[13px] font-medium text-[#475569]">
        <Link href="/">Home</Link>
        <ChevronDownIcon className="size-4 -rotate-90 text-[#94A3B8]" />
        <Link href="/search?destination=Madinaty">Madinaty</Link>
        <ChevronDownIcon className="size-4 -rotate-90 text-[#94A3B8]" />
        <span className="text-[#0F172A]">Luxury Studio in Madinaty</span>
      </nav>

      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-[28px] font-bold leading-tight text-[#0F172A] sm:text-[32px]">
            Luxury Studio in Madinaty
          </h1>
          <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-[14px] text-[#0F172A]">
            <span className="inline-flex items-center gap-2">
              <MapPinIcon className="size-5" />
              B6, Madinaty, Cairo, Egypt
            </span>
            <span className="inline-flex items-center gap-1 font-semibold text-[#5A30E8]">
              <StarIcon className="size-4 fill-[#F4B744] text-[#F4B744]" />
              4.9 (32 reviews)
            </span>
            <span className="hidden h-4 w-px bg-[#E5E7EB] sm:block" />
            <span className="inline-flex items-center gap-2">
              <ShieldIcon className="size-5 text-[#5A30E8]" />
              Verified property
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button className="inline-flex h-10 items-center gap-2 rounded-lg border border-[#E5E7EB] bg-white px-5 text-[13px] font-bold shadow-[0_8px_20px_rgba(15,23,42,0.04)]" onClick={() => toggleFavorite(PROPERTY_SLUG)} type="button">
            <HeartIcon className={`size-5 ${saved ? "fill-[#5A30E8] text-[#5A30E8]" : ""}`} />
            {saved ? "Saved" : "Save"}
          </button>
          <button className="inline-flex h-10 items-center gap-2 rounded-lg border border-[#E5E7EB] bg-white px-5 text-[13px] font-bold shadow-[0_8px_20px_rgba(15,23,42,0.04)]" onClick={openShare} ref={triggerRef} type="button">
            <ShareIcon className="size-5" />
            Share
          </button>
        </div>
      </div>
      <ShareModal
        onClose={closeShare}
        open={open}
        property={{
          image: marketplaceImages.studio,
          location: "B6, Madinaty, Cairo, Egypt",
          price: "EGP 1,200 / night",
          rating: "4.9 (32)",
          title: "Luxury Studio in Madinaty",
          url: "/stays/luxury-studio-in-madinaty",
          verified: true,
        }}
        state={state}
      />
    </section>
  );
}
