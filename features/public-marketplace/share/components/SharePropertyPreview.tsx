import Image from "next/image";
import { MapPinIcon, ShieldIcon, StarIcon } from "@/components/ui";
import type { SharePropertyData } from "../types";

type SharePropertyPreviewProps = {
  property: SharePropertyData;
};

export function SharePropertyPreview({ property }: SharePropertyPreviewProps) {
  return (
    <article className="grid grid-cols-[92px_minmax(0,1fr)] gap-4 rounded-2xl border border-[#E5E7EB] bg-[#FCFCFD] p-3 shadow-[0_10px_24px_rgba(15,23,42,0.04)] sm:grid-cols-[112px_minmax(0,1fr)] sm:p-4">
      <div className="relative h-[92px] overflow-hidden rounded-xl bg-[#E5E7EB] sm:h-[104px]">
        <Image
          alt={property.title}
          className="absolute inset-0 size-full object-cover object-[46%_50%]"
          fill
          sizes="120px"
          src={property.image}
        />
      </div>
      <div className="min-w-0 py-1">
        <div className="flex items-start justify-between gap-3">
          <h3 className="line-clamp-2 text-[16px] font-bold leading-5 text-[#0F172A]">
            {property.title}
          </h3>
          {property.verified ? (
            <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-[#F4F1FF] px-2 py-1 text-[11px] font-bold text-[#5E2FE5]">
              <ShieldIcon className="size-3.5 fill-[#5E2FE5]" />
              Verified
            </span>
          ) : null}
        </div>
        <p className="mt-2 flex items-center gap-1.5 text-[13px] text-[#64748B]">
          <MapPinIcon className="size-4 shrink-0" />
          <span className="truncate">{property.location}</span>
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1">
          <p className="text-[15px] font-bold text-[#0F172A]">{property.price}</p>
          {property.rating ? (
            <p className="inline-flex items-center gap-1 text-[13px] font-semibold text-[#334155]">
              <StarIcon className="size-4 fill-[#F4B744] text-[#F4B744]" />
              {property.rating}
            </p>
          ) : null}
        </div>
      </div>
    </article>
  );
}
