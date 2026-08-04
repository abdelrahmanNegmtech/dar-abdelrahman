"use client";

import Image from "next/image";
import { CheckIcon, InfoIcon, ShieldIcon } from "@/components/ui";
import { marketplaceImages } from "../../assets";
import { LegalSearch } from "./LegalSearch";

type LegalHeroProps = {
  onSearchChange: (value: string) => void;
  searchValue: string;
};

export function LegalHero({ onSearchChange, searchValue }: LegalHeroProps) {
  return (
    <section className="relative overflow-hidden border-b border-[#E5E7EB] bg-[#F8FAFF]">
      <div className="absolute inset-y-0 right-0 hidden w-[48%] lg:block">
        <Image
          alt=""
          className="h-full w-full object-cover"
          height={360}
          priority
          src={marketplaceImages.host}
          width={900}
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,#F8FAFF_0%,rgba(248,250,255,0.72)_28%,rgba(248,250,255,0.12)_58%,rgba(248,250,255,0.38)_100%)]" />
        <div className="absolute right-[18%] top-1/2 grid size-28 -translate-y-1/2 place-items-center rounded-[34px] border border-[#6C3DFF]/25 bg-white/70 text-[#5E2FE5] shadow-[0_24px_60px_rgba(76,29,149,0.18)] backdrop-blur-md">
          <ShieldIcon className="size-20" />
          <CheckIcon className="absolute size-9" />
        </div>
      </div>

      <div className="relative mx-auto max-w-[1760px] px-5 py-8 sm:px-8 lg:px-11 lg:py-9">
        <div className="max-w-[730px]">
          <h1 className="text-[34px] font-black leading-[1.08] tracking-normal text-[#080B1F] sm:text-[42px] lg:text-[48px]">
            Policies and legal information.
          </h1>
          <p className="mt-3 text-[16px] font-medium leading-7 text-[#334155]">
            Understand how DAR protects guests, owners and bookings across Egypt.
          </p>
          <div className="mt-7">
            <LegalSearch onChange={onSearchChange} value={searchValue} />
          </div>
          <p className="mt-5 inline-flex items-center gap-2 text-[13px] font-semibold text-[#334155]">
            <InfoIcon className="size-4 text-[#0F172A]" />
            Last updated June 2026
          </p>
        </div>
      </div>
    </section>
  );
}
