import {
  GiftIcon,
  ShieldIcon,
  ZapIcon,
} from "@/components/ui";
import { BrandLogo } from "./BrandLogo";
import { LanguageSelector } from "./LanguageSelector";

const verifyFeatures = [
  {
    description: "Your data is protected with industry-standard security.",
    icon: ShieldIcon,
    title: "Secure & trusted",
  },
  {
    description: "Verifying your email helps us secure your account",
    icon: ZapIcon,
    title: "Quick verification",
  },
  {
    description: "Get access to the best stays and exclusive deals",
    icon: GiftIcon,
    title: "Exclusive access",
  },
];

export function VerifyEmailHero() {
  return (
    <aside className="auth-hero-panel relative z-10 hidden h-full min-h-0 overflow-hidden p-[42px] text-white lg:flex lg:w-[42.2%] lg:min-w-[492px] xl:p-[42px]">
      <div className="flex min-h-full w-full flex-col">
        <BrandLogo inverted />

        <div className="mt-[82px] max-w-[365px]">
          <h2 className="text-[33px] font-bold leading-[1.28] tracking-normal text-white xl:text-[34px]">
            One step away
            <br />
            from your{" "}
            <span className="text-[#A78BFA]">journey</span>
          </h2>
          <p className="mt-7 max-w-[350px] text-[17px] leading-[1.58] text-white/92">
            We&apos;ve sent a verification link to the email address you used
            during signup.
          </p>
          <p className="mt-5 max-w-[350px] text-[17px] leading-[1.58] text-white/92">
            Please check your inbox and click the link to verify your email
            address.
          </p>
        </div>

        <div className="mt-[36px] space-y-[30px]">
          {verifyFeatures.map((feature) => {
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
                  <p className="mt-1 text-[15px] leading-[1.48] text-white/88">
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
