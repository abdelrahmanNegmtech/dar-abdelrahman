import { marketplaceImages } from "../assets";
import { RecommendationCard } from "./RecommendationCard";
import { SectionHeader } from "./SectionHeader";

const recommendations = [
  {
    imagePosition: "object-[45%_55%]",
    imageSrc: marketplaceImages.studio,
    location: "Madinaty",
    price: "EGP 1,300 / night",
    rating: "4.9",
    title: "Luxury Studio",
  },
  {
    imagePosition: "object-[58%_50%]",
    imageSrc: marketplaceImages.modernApartment,
    location: "New Capital",
    price: "EGP 1,700 / night",
    rating: "4.8",
    title: "Modern Apartment",
  },
  {
    imagePosition: "object-[68%_50%]",
    imageSrc: marketplaceImages.servicedWorkspace,
    location: "Noor City",
    price: "EGP 1,050 / night",
    rating: "4.7",
    title: "Cozy Studio",
  },
  {
    imagePosition: "object-[75%_52%]",
    imageSrc: marketplaceImages.hotelRoom,
    location: "Madinaty",
    price: "EGP 1,900 / night",
    rating: "4.9",
    title: "Premium Apartment",
  },
];

export function RecommendationsSection() {
  return (
    <section className="bg-white px-5 py-10 sm:px-8 lg:px-12 xl:px-8 xl:pb-8 xl:pt-8 2xl:px-9">
      <div className="mx-auto max-w-[1500px]">
        <SectionHeader
          subtitle="Smart picks based on your preferences"
          title="AI recommendations for you"
        />

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {recommendations.map((recommendation) => (
            <RecommendationCard key={recommendation.title} {...recommendation} />
          ))}
        </div>
      </div>
    </section>
  );
}
