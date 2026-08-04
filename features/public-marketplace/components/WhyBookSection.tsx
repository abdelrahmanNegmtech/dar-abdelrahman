import {
  CalendarIcon,
  CameraIcon,
  HeartIcon,
  ShieldIcon,
} from "@/components/ui";
import { MarketplaceFeatureCard } from "./MarketplaceFeatureCard";

const whyBookFeatures = [
  {
    description: "Carefully selected for quality",
    icon: ShieldIcon,
    title: "Handpicked stays",
  },
  {
    description: "What you see is what you get",
    icon: CameraIcon,
    title: "Real photos",
  },
  {
    description: "Book for few nights or few months",
    icon: CalendarIcon,
    title: "Flexible options",
  },
  {
    description: "Join thousands of happy guests",
    icon: HeartIcon,
    title: "Trusted by thousands",
  },
];

export function WhyBookSection() {
  return (
    <section className="bg-white px-5 pb-10 sm:px-8 lg:px-12 xl:px-8 xl:pb-9 2xl:px-9">
      <div className="mx-auto max-w-[1500px]">
        <h2 className="mb-5 text-[26px] font-bold leading-tight text-[#0F172A]">
          Why book with DAR?
        </h2>

        <div className="grid gap-0 overflow-hidden rounded-xl border border-[#E5E7EB] md:grid-cols-2 xl:grid-cols-4">
          {whyBookFeatures.map((feature) => (
            <MarketplaceFeatureCard key={feature.title} {...feature} />
          ))}
        </div>
      </div>
    </section>
  );
}
