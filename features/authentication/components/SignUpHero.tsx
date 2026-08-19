import Link from "next/link";
import {
  CreditCardIcon,
  HeadphonesIcon,
  HouseIcon,
} from "@/components/ui";
import { BrandLogo } from "./BrandLogo";
import { LanguageSelector } from "./LanguageSelector";

const signUpFeatures = [
  {
    description: "Every property is checked for quality and safety",
    icon: HouseIcon,
    title: "Verified properties",
  },
  {
    description: "Your payments are safe and protected",
    icon: CreditCardIcon,
    title: "Secure payments",
  },
  {
    description: "We're here to help you anytime",
    icon: HeadphonesIcon,
    title: "24/7 support",
  },
];

export function SignUpHero() {
  return (
    <aside className="auth-hero-panel relative z-10 hidden h-full min-h-0 overflow-hidden p-[42px] text-white lg:flex lg:w-[42.2%] lg:min-w-[492px] xl:p-[42px]">
      <div className="flex min-h-full w-full flex-col">
        <Link
          aria-label="Go to DAR homepage"
          className="w-fit rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80"
          href="/"
        >
          <BrandLogo inverted />
        </Link>

        <div className="mt-[58px] max-w-[405px]">
          <h2 className="text-[32px] font-bold leading-[1.23] tracking-normal text-white xl:text-[34px]">
            Join DAR and discover a{" "}
            <span className="text-[#A78BFA]">better way</span> to stay
          </h2>
          <p className="mt-6 max-w-[375px] text-[17px] leading-[1.58] text-white/90">
            Create your account to book unique stays, manage your trips, and
            more.
          </p>
        </div>

        <div className="mt-[38px] space-y-[32px]">
          {signUpFeatures.map((feature) => {
            const Icon = feature.icon;

            return (
              <div className="flex max-w-[360px] items-start gap-5" key={feature.title}>
                <div className="flex size-[58px] shrink-0 items-center justify-center rounded-full bg-[#6C3DFF]/32 text-white shadow-lg backdrop-blur-md">
                  <Icon className="size-[25px]" />
                </div>
                <div>
                  <h2 className="text-[15px] font-bold leading-5 text-white">
                    {feature.title}
                  </h2>
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
