import type { PublicPropertyDetail } from "@/features/properties/data/public-property-queries";

type MobileBookingBarProps = {
  property: PublicPropertyDetail;
};

export function MobileBookingBar({ property }: MobileBookingBarProps) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[#E5E7EB] bg-white p-4 shadow-[0_-12px_30px_rgba(15,23,42,0.12)] lg:hidden">
      <div className="mx-auto flex max-w-[520px] items-center justify-between gap-4">
        <div>
          <p className="text-[17px] font-bold">{property.priceLabel}</p>
          <p className="text-[12px] text-[#64748B]">per night · 4.9 rating</p>
        </div>
        <button
          className="h-12 rounded-lg bg-[linear-gradient(180deg,#6C3DFF_0%,#5527D8_100%)] px-8 text-[15px] font-bold text-white"
          type="button"
        >
          Reserve
        </button>
      </div>
    </div>
  );
}
