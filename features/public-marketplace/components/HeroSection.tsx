"use client";

import Image from "next/image";
import { useState } from "react";
import { HeroFeatureBadges } from "./HeroFeatureBadges";
import { HeroSearchCard } from "./HeroSearchCard";
import { MarketplaceNavbar } from "./MarketplaceNavbar";
import { PropertyTypeSelector } from "./PropertyTypeSelector";
import { marketplaceImages } from "../assets";

export function HeroSection() {
  const [propertyType, setPropertyType] = useState("Studios & Apartments");

  return (
    <section className="overflow-x-hidden bg-white p-3 sm:p-4 lg:p-5 xl:p-0">
      <div className="relative min-h-[680px] w-full overflow-hidden rounded-[32px] bg-[#050B18] shadow-[0_30px_90px_rgba(2,6,23,0.2)] sm:min-h-[660px] lg:rounded-[32px] xl:min-h-[455px] xl:rounded-none xl:rounded-br-[18px]">
        <Image
          alt="Premium apartment balcony overlooking the Nile in Cairo"
          className="absolute inset-0 size-full object-cover object-center brightness-[0.9] contrast-[1.08] saturate-[1.12]"
          fill
          priority
          sizes="100vw"
          src={marketplaceImages.hero}
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(3,8,28,0.92)_0%,rgba(8,16,42,0.72)_45%,rgba(5,10,25,0.48)_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_72%_22%,rgba(108,61,255,0.22),transparent_34%),linear-gradient(180deg,rgba(2,6,23,0.36)_0%,rgba(2,6,23,0.78)_100%)]" />

        <MarketplaceNavbar />

        <div className="relative z-10 px-6 pb-8 pt-6 sm:px-8 lg:px-12 lg:pb-10 lg:pt-8 xl:px-8 xl:pb-7 xl:pt-5 2xl:px-9">
          <div className="max-w-[760px]">
            <span className="inline-flex rounded-full border border-white/18 bg-white/12 px-4 py-2 text-sm font-semibold text-white shadow-[0_14px_35px_rgba(2,6,23,0.18)] backdrop-blur-xl">
              Premium stays in Egypt
            </span>

            <h1 className="mt-5 max-w-[620px] text-[44px] font-bold leading-[1.05] tracking-normal text-white sm:text-[54px] lg:text-[56px] xl:mt-4 xl:text-[43px] 2xl:text-[49px]">
              Find your perfect
              <br />
              stay in <span className="text-[#F4B744]">Egypt</span>
            </h1>

            <p className="mt-4 max-w-[520px] text-[17px] leading-7 text-white/84 sm:text-[18px] xl:max-w-[430px] xl:text-[14px] xl:leading-6 2xl:text-[15px]">
              Premium studios, furnished apartments and hotels in the best
              locations.
            </p>
          </div>

          <div className="mt-7 max-w-[690px] xl:mt-5">
            <PropertyTypeSelector activeType={propertyType} onChange={setPropertyType} />
          </div>

          <div className="mt-5 max-w-[1120px] xl:mt-4">
            <HeroSearchCard propertyType={propertyType} />
          </div>

          <div className="mt-5 max-w-[1120px] xl:mt-4">
            <HeroFeatureBadges />
          </div>
        </div>
      </div>
    </section>
  );
}
