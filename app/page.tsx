import { HeroSection } from "@/features/public-marketplace/components/HeroSection";
import { HostCTASection } from "@/features/public-marketplace/components/HostCTASection";
import { HowItWorksSection } from "@/features/public-marketplace/components/HowItWorksSection";
import { MarketplaceFooter } from "@/features/public-marketplace/components/MarketplaceFooter";
import { PopularDestinationsSection } from "@/features/public-marketplace/components/PopularDestinationsSection";
import { PopularStaysSection } from "@/features/public-marketplace/components/PopularStaysSection";
import { RecommendationsSection } from "@/features/public-marketplace/components/RecommendationsSection";
import { WhyBookSection } from "@/features/public-marketplace/components/WhyBookSection";

export default function Home() {
  return (
    <main id="main-content">
      <HeroSection />
      <RecommendationsSection />
      <WhyBookSection />
      <HowItWorksSection />
      <PopularDestinationsSection />
      <PopularStaysSection />
      <HostCTASection />
      <MarketplaceFooter />
    </main>
  );
}
