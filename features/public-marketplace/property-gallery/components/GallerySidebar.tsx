import Link from "next/link";
import { Button } from "@/components/ui";
import type { PublicPropertyDetail } from "@/features/properties/data/public-property-queries";
import { GalleryHighlights } from "./GalleryHighlights";
import { PropertySummaryCard } from "./PropertySummaryCard";
import { ReportPhotoCard } from "./ReportPhotoCard";
import { RoomCoverageCard } from "./RoomCoverageCard";

type GallerySidebarProps = {
  compact?: boolean;
  onReport: () => void;
  onReserve: () => void;
  property: PublicPropertyDetail;
};

export function GallerySidebar({ compact = false, onReport, onReserve, property }: GallerySidebarProps) {
  const content = (
    <>
      <PropertySummaryCard property={property} />
      <div className="grid grid-cols-2 gap-4 py-7">
        <Link
          className="inline-flex h-12 items-center justify-center rounded-lg border border-[#C4B5FD] text-[14px] font-bold text-[#5E2FE5]"
          href={`/stays/${property.slug}`}
        >
          Back to details
        </Link>
        <Button className="h-12 rounded-lg" onClick={onReserve}>Reserve now</Button>
      </div>
      <GalleryHighlights />
      <RoomCoverageCard />
      <ReportPhotoCard onReport={onReport} />
    </>
  );

  if (compact) {
    return (
      <div className="space-y-3 md:hidden">
        {[
          ["Property summary", <PropertySummaryCard key="summary" property={property} />],
          [
            "Gallery details",
            <div key="details">
              <div className="grid grid-cols-2 gap-3 pb-5">
                <Link
                  className="inline-flex h-11 items-center justify-center rounded-lg border border-[#C4B5FD] text-[14px] font-bold text-[#5E2FE5]"
                  href={`/stays/${property.slug}`}
                >
                  Back
                </Link>
                <Button className="h-11 rounded-lg" onClick={onReserve}>Reserve</Button>
              </div>
              <GalleryHighlights />
              <RoomCoverageCard />
              <ReportPhotoCard onReport={onReport} />
            </div>,
          ],
        ].map(([title, body]) => (
          <details className="rounded-xl border border-[#E5E7EB] bg-white p-4 shadow-[0_10px_24px_rgba(15,23,42,0.04)]" key={title as string}>
            <summary className="cursor-pointer list-none text-[15px] font-bold text-[#0B1020]">{title}</summary>
            <div className="mt-5">{body}</div>
          </details>
        ))}
      </div>
    );
  }

  return <aside className="rounded-none bg-white md:rounded-xl md:border md:border-[#E5E7EB] md:p-6 md:shadow-[0_12px_30px_rgba(15,23,42,0.04)] xl:border-0 xl:p-0 xl:shadow-none">{content}</aside>;
}
