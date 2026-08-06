import type { PublicPropertyDetail } from "@/features/properties/data/public-property-queries";
import { MarketplaceShell } from "../../components/MarketplaceShell";
import { BookingCard } from "./BookingCard";
import { HostSummaryBar } from "./HostSummaryBar";
import { LocationSection } from "./LocationSection";
import { MobileBookingBar } from "./MobileBookingBar";
import { PropertyGallery } from "./PropertyGallery";
import { PropertyHeader } from "./PropertyHeader";
import { PropertyInfoCards } from "./PropertyInfoCards";
import { ReviewsSection } from "./ReviewsSection";
import { SimilarStaysSection } from "./SimilarStaysSection";

type PropertyDetailsPageProps = {
  property: PublicPropertyDetail;
};

export function PropertyDetailsPage({ property }: PropertyDetailsPageProps) {
  return (
    <MarketplaceShell>
      <div className="mx-auto max-w-[1760px] px-5 py-5 sm:px-8 lg:px-11">
        <PropertyHeader property={property} />

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_430px]">
          <div className="min-w-0">
            <PropertyGallery property={property} />
            <HostSummaryBar property={property} />
            <PropertyInfoCards property={property} />
            <ReviewsSection property={property} />
            <LocationSection property={property} />
          </div>

          <aside className="hidden lg:block">
            <BookingCard property={property} />
            <SimilarStaysSection property={property} />
          </aside>
        </div>

        <div className="mt-8 lg:hidden">
          <BookingCard compact property={property} />
          <SimilarStaysSection mobile property={property} />
        </div>
      </div>

      <MobileBookingBar property={property} />
    </MarketplaceShell>
  );
}
