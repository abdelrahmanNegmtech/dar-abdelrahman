import {
  ArrowRightIcon,
  CalendarIcon,
  HeadphonesIcon,
  LockIcon,
  ShieldIcon,
  SmartphoneIcon,
} from "@/components/ui";
import { BrandLogo } from "./BrandLogo";

const recoveryFeatures = [
  {
    accent: "text-[#A855F7]",
    description: "Your data is encrypted and protected.",
    icon: ShieldIcon,
    title: "Secure reset",
  },
  {
    accent: "text-[#A855F7]",
    description: "Identity verified before resetting your password.",
    icon: SmartphoneIcon,
    title: "Email verification",
  },
  {
    accent: "text-[#F4B744]",
    description: "Your active bookings are always safe.",
    icon: CalendarIcon,
    title: "Protected bookings",
  },
  {
    accent: "text-[#A855F7]",
    description: "We're here to help you anytime.",
    icon: HeadphonesIcon,
    title: "24/7 support",
  },
];

export function ForgotPasswordHero() {
  return (
    <aside className="auth-hero-panel relative z-10 hidden h-full min-h-0 w-[34.1%] min-w-[500px] overflow-hidden px-10 py-9 text-white lg:flex">
      <div className="relative z-10 flex min-h-full w-full flex-col">
        <BrandLogo inverted />

        <div className="mt-[54px] max-w-[360px]">
          <h2 className="text-[44px] font-bold leading-[1.12] tracking-normal text-white">
            Get back to
            <br />
            your DAR
            <br />
            <span className="text-[#F4B744]">account.</span>
          </h2>
          <p className="mt-5 max-w-[355px] text-[18px] leading-[1.55] text-white/92">
            Recover access securely using your verified email address.
          </p>
        </div>

        <div className="mt-8 space-y-7">
          {recoveryFeatures.map((feature) => {
            const Icon = feature.icon;

            return (
              <div className="flex max-w-[380px] items-start gap-5" key={feature.title}>
                <div className={`flex size-[46px] shrink-0 items-center justify-center rounded-xl ${feature.accent}`}>
                  <Icon className="size-[34px]" />
                </div>
                <div>
                  <h2 className="text-[16px] font-bold leading-5 text-white">
                    {feature.title}
                  </h2>
                  <p className="mt-1 text-[14px] leading-[1.45] text-white/82">
                    {feature.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <section className="mt-7 flex max-w-[300px] items-center gap-4 rounded-lg border border-white/18 bg-white/[0.06] p-4 backdrop-blur-md">
          <div className="flex size-[58px] shrink-0 items-center justify-center rounded-full border border-white/20 text-white">
            <HeadphonesIcon className="size-7" />
          </div>
          <div className="min-w-0">
            <h2 className="text-[16px] font-bold leading-6 text-white">
              Need urgent help with a booking?
            </h2>
            <a
              className="mt-1 inline-flex items-center gap-2 text-[15px] font-semibold text-[#B478FF] transition hover:text-white focus-visible:rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80"
              href="/contact"
            >
              Contact DAR support.
              <ArrowRightIcon className="size-4" />
            </a>
          </div>
        </section>

        <div className="mt-auto grid grid-cols-2 gap-6 border-t border-white/12 pt-9 text-white/84">
          <div className="flex items-center gap-4">
            <div className="flex size-[50px] shrink-0 items-center justify-center rounded-2xl border border-white/18">
              <LockIcon className="size-6" />
            </div>
            <p className="text-[13px] leading-[1.45]">
              We never ask for passwords or reset links by phone.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex size-[50px] shrink-0 items-center justify-center rounded-full border border-white/18">
              <ShieldIcon className="size-6" />
            </div>
            <p className="text-[13px] leading-[1.45]">
              Owners with active bookings can contact support for manual
              verification.
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
