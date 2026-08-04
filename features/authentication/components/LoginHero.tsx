import {
  HouseIcon,
  CreditCardIcon,
  HeadphonesIcon,
} from "@/components/ui";
import { BrandLogo } from "./BrandLogo";
import { LanguageSelector } from "./LanguageSelector";

const heroFeatures = [
  {
    description: "Every place is checked for quality and safety",
    icon: HouseIcon,
    title: "Verified properties",
  },
  {
    description: "Your payments are safe and protected.",
    icon: CreditCardIcon,
    title: "Secure payments",
  },
  {
    description: "We're here to help you anytime",
    icon: HeadphonesIcon,
    title: "24/7 support",
  },
];

export function LoginHero() {
  return (
    <aside className="auth-hero-panel relative z-10 hidden h-full min-h-0 overflow-hidden p-[42px] text-white lg:flex lg:w-[42.2%] lg:min-w-[492px] xl:p-[42px]">
      <div className="flex min-h-full w-full flex-col">
        <BrandLogo inverted />

        <div className="mt-[82px] max-w-[380px]">
          <h2 className="text-[32px] font-bold leading-[1.12] tracking-normal text-white xl:text-[34px]">
            Welcome back!
          </h2>
          <p className="mt-3 text-[26px] font-medium leading-[1.35] text-white xl:text-[28px]">
            Let&apos;s continue your journey with DAR
          </p>
          <p className="mt-7 max-w-[345px] text-[16px] leading-[1.55] text-white/90">
            Sign in to book unique stays, manage your trips, and experience
            Egypt like never before.
          </p>
        </div>

        <div className="mt-[38px] space-y-[30px]">
          {heroFeatures.map((feature) => {
            const Icon = feature.icon;

            return (
              <div className="flex max-w-[360px] items-start gap-5" key={feature.title}>
                <div className="flex size-[58px] shrink-0 items-center justify-center rounded-full bg-[#6C3DFF]/32 text-white shadow-lg backdrop-blur-md">
                  <Icon className="size-[25px]" />
                </div>
                <div>
                  <h2 className="text-[15px] font-bold leading-5 text-white">{feature.title}</h2>
                  <p className="mt-1 text-[15px] leading-[1.45] text-white/88">
                    {feature.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-auto pt-10">
          <LanguageSelector />
        </div>
      </div>
    </aside>
  );
}
