import { getFeaturedPublicProperties } from "@/features/properties/data/public-property-queries";
import { HeroSection } from "@/features/public-marketplace/components/HeroSection";
import { HostCTASection } from "@/features/public-marketplace/components/HostCTASection";
import { HowItWorksSection } from "@/features/public-marketplace/components/HowItWorksSection";
import { MarketplaceFooter } from "@/features/public-marketplace/components/MarketplaceFooter";
import { FavoritesBoundary } from "@/features/public-marketplace/favorites/FavoritesBoundary";
import { PopularDestinationsSection } from "@/features/public-marketplace/components/PopularDestinationsSection";
import { PopularStaysSection } from "@/features/public-marketplace/components/PopularStaysSection";
import { RecommendationsSection } from "@/features/public-marketplace/components/RecommendationsSection";
import { WhyBookSection } from "@/features/public-marketplace/components/WhyBookSection";

export default async function Home() {
  const featuredStays = await getFeaturedPublicProperties(4).catch(() => []);

  return (
    <FavoritesBoundary>
      <main id="main-content">
        <HeroSection />
        <RecommendationsSection />
        <WhyBookSection />
        <HowItWorksSection />
        <PopularDestinationsSection />
        <PopularStaysSection stays={featuredStays} />
        <HostCTASection />
        <MarketplaceFooter />
      </main>
    </FavoritesBoundary>
  );
}
