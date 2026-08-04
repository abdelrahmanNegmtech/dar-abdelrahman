import Image from "next/image";
import { MapPinIcon, ShieldIcon, StarIcon } from "@/components/ui";
import { marketplaceImages } from "../../assets";

export function PropertySummaryCard() {
  return (
    <section className="border-b border-[#E5E7EB] pb-7">
      <h2 className="text-[20px] font-bold text-[#0B1020]">Luxury Studio in Madinaty</h2>
      <p className="mt-4 flex items-center gap-2 text-[13px] text-[#64748B]">
        <MapPinIcon className="size-4 text-[#64748B]" />
        B6, Madinaty, Cairo, Egypt
      </p>
      <div className="mt-4 flex flex-wrap items-center gap-4 text-[13px] font-semibold">
        <span className="inline-flex items-center gap-1 text-[#1F2937]">
          <StarIcon className="size-5 fill-[#F4B744] text-[#F4B744]" />
          4.9 <span className="font-normal text-[#64748B]">(32 reviews)</span>
        </span>
        <span className="inline-flex items-center gap-2 text-[#5E2FE5]">
          <ShieldIcon className="size-5 fill-[#5E2FE5]" />
          Verified property
        </span>
      </div>

      <div className="mt-5 flex items-center gap-4 rounded-lg border border-[#E5E7EB] bg-white p-3">
        <div className="relative size-11 overflow-hidden rounded-full bg-[#F1F5F9]">
          <Image alt="Ahmed Hassan" className="object-cover object-left" fill sizes="44px" src={marketplaceImages.host} />
        </div>
        <div className="min-w-0">
          <p className="text-[13px] font-bold text-[#0B1020]">Ahmed Hassan</p>
          <p className="mt-1 inline-flex items-center gap-2 text-[12px] text-[#64748B]">
            Verified Owner <ShieldIcon className="size-4 fill-[#5E2FE5] text-[#5E2FE5]" />
          </p>
        </div>
      </div>

      <p className="mt-4 text-[14px] leading-6 text-[#64748B]">Real photos reviewed by DAR.</p>
    </section>
  );
}
