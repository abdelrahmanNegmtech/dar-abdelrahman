import Image from "next/image";
import { marketplaceImages } from "../../assets";
import type { PublicPropertyDetail } from "@/features/properties/data/public-property-queries";
import { ShieldIcon } from "../icons";

type HostSummaryBarProps = {
  property: PublicPropertyDetail;
};

export function HostSummaryBar({ property }: HostSummaryBarProps) {
  return (
    <section className="mt-4 rounded-xl border border-[#E5E7EB] bg-white p-4 shadow-[0_12px_30px_rgba(15,23,42,0.05)]">
      <div className="grid gap-4 lg:grid-cols-[minmax(260px,1.5fr)_repeat(5,1fr)] lg:items-center lg:divide-x lg:divide-[#E5E7EB]">
        <div className="flex items-center gap-4">
          <Image
            alt="Host avatar"
            className="size-14 rounded-full object-cover"
            height={56}
            src={marketplaceImages.host}
            width={56}
          />
          <div>
            <h2 className="flex items-center gap-2 text-[16px] font-bold">
              Hosted by DAR Verified Owner
              <ShieldIcon className="size-5 text-[#5A30E8]" />
            </h2>
            <p className="mt-1 text-[13px] text-[#64748B]">
              Usually responds within 20 minutes
            </p>
            <p className="mt-1 inline-flex items-center gap-1 text-[13px] text-[#0F9F6E]">
              <ShieldIcon className="size-4" />
              Owner verified
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5 lg:contents">
          {property.facts.map((fact) => {
            return (
              <div className="flex items-center gap-3 rounded-lg bg-[#F8FAFC] p-3 lg:justify-center lg:bg-white lg:p-0" key={fact.label}>
                <span>
                  <strong className="block text-[15px]">{fact.value}</strong>
                  <span className="text-[12px] text-[#475569]">{fact.label}</span>
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
