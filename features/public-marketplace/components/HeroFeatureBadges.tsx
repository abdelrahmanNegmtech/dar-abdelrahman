import {
  CheckCircleIcon,
  CreditCardIcon,
  HeadphonesIcon,
  ShieldIcon,
} from "@/components/ui";

const featureBadges = [
  {
    description: "Quality you can trust",
    icon: CheckCircleIcon,
    title: "Verified properties",
  },
  {
    description: "Safe & protected",
    icon: CreditCardIcon,
    title: "Secure payments",
  },
  {
    description: "We're here for you",
    icon: HeadphonesIcon,
    title: "24/7 support",
  },
  {
    description: "Get the best rates",
    icon: ShieldIcon,
    title: "Best price guarantee",
  },
];

export function HeroFeatureBadges() {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {featureBadges.map((badge) => {
        const Icon = badge.icon;

        return (
          <div
            className="flex items-center gap-3 rounded-2xl border border-white/16 bg-white/10 px-4 py-4 text-white shadow-[0_14px_36px_rgba(2,6,23,0.18)] backdrop-blur-xl xl:gap-2 xl:rounded-xl xl:px-3 xl:py-3"
            key={badge.title}
          >
            <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-white/13 text-[#F4B744] xl:size-9">
              <Icon className="size-5 xl:size-4" />
            </span>
            <span>
              <span className="block text-[14px] font-bold leading-5 xl:text-[11px] xl:leading-4 2xl:text-[12px]">
                {badge.title}
              </span>
              <span className="mt-0.5 block text-[13px] text-white/72 xl:text-[10px] 2xl:text-[11px]">
                {badge.description}
              </span>
            </span>
          </div>
        );
      })}
    </div>
  );
}
