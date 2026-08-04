"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useSyncExternalStore } from "react";
import { allProperties } from "@/app/properties/[slug]/property-data";
import { shortPath } from "@/app/routing";

const savedPropertyEvent = "dar-saved-property-change";

function subscribe(onChange: () => void) {
  window.addEventListener("storage", onChange);
  window.addEventListener(savedPropertyEvent, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(savedPropertyEvent, onChange);
  };
}

function snapshot() {
  return allProperties
    .filter((property) => window.localStorage.getItem(`dar-saved-${property.slug}`) === "true")
    .map((property) => property.slug)
    .join("|");
}

function formatEgp(value: number) {
  return `EGP ${new Intl.NumberFormat("en-EG", { maximumFractionDigits: 0 }).format(value)}`;
}

export default function SavedPropertiesPage() {
  const savedSnapshot = useSyncExternalStore(subscribe, snapshot, () => "");
  const saved = useMemo(
    () => allProperties.filter((property) => savedSnapshot.split("|").includes(property.slug)),
    [savedSnapshot],
  );

  return (
    <main className="min-h-screen bg-[#F8FAFC] p-4 text-[#090B32]">
      <div className="mx-auto min-h-[calc(100vh-32px)] max-w-[1180px] rounded-[28px] border border-[#DFE6F1] bg-white shadow-[0_28px_80px_rgba(15,23,42,0.06)]">
        <header className="flex h-[76px] items-center justify-between border-b border-[#E6EBF3] px-6 lg:px-8">
          <Link href={shortPath("/", "en")} aria-label="DAR home">
            <Image src="/dar-logo-purple-header.png" alt="DAR" width={320} height={142} className="h-[48px] w-auto object-contain" priority />
          </Link>
          <nav className="hidden items-center gap-8 text-[14px] font-bold lg:flex">
            <Link href={shortPath("/rent", "en")}>Rent</Link>
            <Link href={shortPath("/buy", "en")}>Buy</Link>
            <Link href={shortPath("/hotels", "en")}>Hotels</Link>
            <Link href={shortPath("/new-projects", "en")}>New projects</Link>
          </nav>
        </header>
        <section className="px-6 py-8 lg:px-10">
          <Link href="/" className="text-[15px] font-bold text-[#5F36E9]">← Back home</Link>
          <h1 className="mt-5 text-[34px] font-black">Saved properties</h1>
          <p className="mt-2 text-[15px] text-[#59647D]">Every stay you save appears here and opens directly to its details page.</p>

          {saved.length === 0 ? (
            <div className="mt-8 rounded-[16px] border border-[#E1E7F0] bg-[#FBFCFF] p-8 text-center">
              <p className="text-[22px] font-black">No saved properties yet</p>
              <p className="mx-auto mt-2 max-w-[420px] text-[15px] leading-7 text-[#59647D]">Tap the heart on any property page to keep it here for later.</p>
              <Link href={`${shortPath("/", "en")}#results`} className="mt-6 inline-flex h-12 items-center justify-center rounded-[8px] bg-[#5F36E9] px-8 text-[15px] font-bold text-white">Browse stays</Link>
            </div>
          ) : (
            <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {saved.map((property) => (
                <Link key={property.slug} href={shortPath(`/properties/${property.slug}`, "en")} className="overflow-hidden rounded-[14px] border border-[#E0E5EF] bg-white shadow-[0_16px_36px_rgba(15,23,42,0.06)]">
                  <div className="relative h-56 bg-slate-100">
                    <Image src={property.images[0].src} alt={property.title} fill className="object-cover" />
                  </div>
                  <div className="p-5">
                    <h2 className="text-[18px] font-black">{property.title}</h2>
                    <p className="mt-2 text-[14px] font-semibold text-[#59647D]">{property.location}</p>
                    <p className="mt-4 text-[15px]"><span className="font-black">{formatEgp(property.pricePerNight)}</span> / night</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
