import Image from "next/image";
import {
  ForgotPasswordFlow,
  ForgotPasswordHero,
} from "@/features/authentication/components";

export default function ForgotPasswordPage() {
  return (
    <main className="min-h-dvh overflow-x-hidden bg-white lg:h-dvh lg:overflow-hidden" id="main-content">
      <div className="relative flex min-h-dvh w-full overflow-hidden bg-[#090B17] lg:h-full lg:min-h-0">
        <Image
          alt="Cairo Tower and Nile skyline at night"
          className="absolute inset-0 hidden size-full object-cover object-[43%_50%] brightness-[1.16] contrast-[1.32] saturate-[1.35] lg:block"
          fill
          priority
          sizes="100vw"
          src="/assets/images/backgrounds/cairo-nights.png"
        />
        <div className="absolute inset-0 hidden bg-[linear-gradient(90deg,rgba(3,8,28,0.93)_0%,rgba(13,22,67,0.66)_45%,rgba(2,6,20,0.9)_100%)] lg:block" />
        <div className="absolute inset-0 hidden bg-[#4B2CBE]/24 mix-blend-color lg:block" />

        <ForgotPasswordHero />
        <ForgotPasswordFlow />
      </div>
    </main>
  );
}
