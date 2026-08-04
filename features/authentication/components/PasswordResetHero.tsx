import {
  LockIcon,
  RefreshCwIcon,
  ShieldIcon,
} from "@/components/ui";
import { BrandLogo } from "./BrandLogo";
import { LanguageSelector } from "./LanguageSelector";

const passwordResetFeatures = [
  {
    description: "A strong password protects your account and data.",
    icon: ShieldIcon,
    title: "Strong & secure",
  },
  {
    description: "Never share your password with anyone.",
    icon: LockIcon,
    title: "Keep it private",
  },
  {
    description: "Change your password periodically for better security.",
    icon: RefreshCwIcon,
    title: "Update regularly",
  },
];

export function PasswordResetHero() {
  return (
    <aside className="auth-hero-panel relative z-10 hidden h-full min-h-0 overflow-hidden p-[42px] text-white lg:flex lg:w-[42.2%] lg:min-w-[492px] xl:p-[42px]">
      <div className="flex min-h-full w-full flex-col">
        <BrandLogo inverted />

        <div className="mt-[82px] max-w-[365px]">
          <h2 className="text-[32px] font-bold leading-[1.26] tracking-normal text-white xl:text-[34px]">
            Create a new
            <br />
            password for
            <br />
            <span className="text-[#A78BFA]">your account</span>
          </h2>
          <p className="mt-7 max-w-[345px] text-[17px] leading-[1.58] text-white/92">
            Make sure to choose a strong password that keeps your account
            secure.
          </p>
        </div>

        <div className="mt-[38px] space-y-[32px]">
          {passwordResetFeatures.map((feature) => {
            const Icon = feature.icon;

            return (
              <div className="flex max-w-[370px] items-start gap-5" key={feature.title}>
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
