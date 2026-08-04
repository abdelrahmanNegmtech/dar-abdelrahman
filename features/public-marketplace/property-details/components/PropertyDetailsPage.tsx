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

export function PropertyDetailsPage() {
  return (
    <MarketplaceShell>
      <div className="mx-auto max-w-[1760px] px-5 py-5 sm:px-8 lg:px-11">
        <PropertyHeader />

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_430px]">
          <div className="min-w-0">
            <PropertyGallery />
            <HostSummaryBar />
            <PropertyInfoCards />
            <ReviewsSection />
            <LocationSection />
          </div>

          <aside className="hidden lg:block">
            <BookingCard />
            <SimilarStaysSection />
          </aside>
        </div>

        <div className="mt-8 lg:hidden">
          <BookingCard compact />
          <SimilarStaysSection mobile />
        </div>
      </div>

      <MobileBookingBar />
    </MarketplaceShell>
  );
}
